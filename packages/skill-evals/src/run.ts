import { spawnSync } from "node:child_process";
import {
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { gradeFree, isFiredIndicator } from "./graders.ts";
import { type JudgeConfig, judge } from "./judge.ts";
import { runPi } from "./pi.ts";
import { TraceBuilder } from "./trace.ts";
import type { Case, GraderResult, RunResult, RunTrace } from "./types.ts";

export type Listing = "description" | "title" | "hidden";

export interface RunContext {
	piBin: string;
	model?: string;
	extensions: string[];
	judge: JudgeConfig;
	/** How the skill appears in the prompt. Anything but `description` needs the skill-index extension. */
	listing: Listing;
	skillIndexPath?: string;
	/** Load every skill, not only the case's, so routing has competition. */
	allSkills: boolean;
	skillDirs: Map<string, string>;
	allowTools: Set<string>;
	scaffold: boolean;
	keepTemp: boolean;
	outDir: string;
	/** Two arms run, so skill-fired indicators are not scored. */
	twoArm: boolean;
}

/** Built-in tools a case may use, from its Claude Code tool names. Read-only ones need no flag; the rest need --allow-tools. */
export function piTools(c: Case, ctx: RunContext): string[] {
	const tools = new Set(["read"]);
	for (const t of c.allowedTools) {
		if (t === "Glob") {
			tools.add("find");
			tools.add("ls");
		}
		if (t === "Grep") tools.add("grep");
		if (t === "Bash" && ctx.allowTools.has("Bash")) tools.add("bash");
		if (t === "Write" && ctx.allowTools.has("Write")) tools.add("write");
		if (t === "Edit" && ctx.allowTools.has("Edit")) tools.add("edit");
	}
	if (ctx.listing !== "description") tools.add("skill_search");
	return [...tools];
}

function snapshot(root: string): Map<string, number> {
	const out = new Map<string, number>();
	const walk = (dir: string) => {
		for (const e of readdirSync(dir)) {
			if (e === ".git" || e === ".pi") continue;
			const p = join(dir, e);
			const st = statSync(p);
			if (st.isDirectory()) walk(p);
			else out.set(relative(root, p), st.mtimeMs);
		}
	};
	walk(root);
	return out;
}

export async function runOnce(
	c: Case,
	arm: "with" | "without",
	index: number,
	ctx: RunContext,
): Promise<RunResult> {
	const started = Date.now();
	const ws = mkdtempSync(join(tmpdir(), "pi-skill-eval-"));
	const log = join(ctx.outDir, "runs", c.id, `${arm}-${index}.jsonl`);
	mkdirSync(dirname(log), { recursive: true });
	const result: RunResult = { arm, score: 0, graders: [], costUsd: 0, durationMs: 0, log };
	try {
		if (ctx.scaffold && c.scaffoldScript) {
			const r = spawnSync("bash", [join(c.dir, c.scaffoldScript)], {
				cwd: ws,
				timeout: 120_000,
				env: { PATH: process.env.PATH ?? "", HOME: ws },
			});
			if (r.status !== 0) {
				result.error = `scaffold failed: ${String(r.stderr).slice(0, 200)}`;
				return result;
			}
		}
		const before = snapshot(ws);

		const args = [
			"-p",
			"--mode",
			"json",
			"--no-session",
			"--no-extensions",
			"--no-skills",
			"--no-context-files",
			"--no-prompt-templates",
			"--no-themes",
			"--no-mcp",
			"--offline",
		];
		if (ctx.model) args.push("--model", ctx.model);
		args.push("--tools", piTools(c, ctx).join(","));
		for (const e of ctx.extensions) args.push("-e", e);
		if (c.appendSystemPrompt) args.push("--append-system-prompt", c.appendSystemPrompt);
		if (arm === "with") {
			const names = ctx.allSkills ? [...ctx.skillDirs.keys()] : c.skills;
			for (const name of names) {
				const dir = ctx.skillDirs.get(name);
				if (!dir) {
					result.error = `skill "${name}" not found`;
					return result;
				}
				args.push("--skill", dir);
			}
			if (ctx.listing !== "description") {
				if (!ctx.skillIndexPath) {
					result.error =
						"listing title/hidden needs --skill-index <path to skill-index/src/index.ts>";
					return result;
				}
				args.push("-e", ctx.skillIndexPath, "--approve");
				mkdirSync(join(ws, ".pi"), { recursive: true });
				writeFileSync(
					join(ws, ".pi", "rackrot.json"),
					JSON.stringify({ skillIndex: { default: ctx.listing } }),
				);
			}
		}

		const tb = new TraceBuilder();
		const events: string[] = [];
		const res = await runPi(ctx.piBin, args, c.prompt, {
			cwd: ws,
			timeoutMs: c.timeoutSeconds * 1000,
			onEvent: (ev) => {
				if (ev.type !== "message_update") events.push(JSON.stringify(ev));
				tb.feed(ev);
				return tb.turns > c.maxTurns;
			},
		});
		writeFileSync(log, `${events.join("\n")}\n`);
		result.costUsd = tb.costUsd;
		if (res.timedOut) result.error = `timeout after ${c.timeoutSeconds}s`;
		else if (res.killed) result.error = `max_turns (${c.maxTurns}) exceeded`;
		else if (res.code !== 0 && !tb.turns)
			result.error = `pi exited ${res.code}: ${res.stderr.replace(/\s+/g, " ").slice(0, 200)}`;

		const after = snapshot(ws);
		const files = [...after].filter(([p, m]) => before.get(p) !== m).map(([p]) => p);
		const trace: RunTrace = {
			lastMessage: tb.lastMessage,
			toolCalls: tb.toolCalls,
			trace: tb.trace,
			files,
			readFile: (p) => {
				try {
					return readFileSync(join(ws, p), "utf8");
				} catch {
					return undefined;
				}
			},
		};

		// Skill-fired graders and with-only graders are not scored when two arms run, unless that leaves nothing to score.
		const excluded = (g: (typeof c.graders)[number]) =>
			ctx.twoArm && (isFiredIndicator(g) || g.arm === "with-only");
		const allExcluded = c.graders.every(excluded);
		const graded: GraderResult[] = [];
		for (const g of c.graders) {
			const skip = arm === "without" && (isFiredIndicator(g) || g.arm === "with-only");
			if (skip) continue;
			const scored = allExcluded || !excluded(g);
			let verdict: { pass: boolean; explanation: string };
			if (g.type === "llm") {
				const j = await judge(g, trace, ctx.judge);
				result.costUsd += j.cost;
				verdict = j;
			} else verdict = gradeFree(g, trace);
			graded.push({
				name: g.name,
				pass: verdict.pass,
				scored,
				weight: g.weight,
				explanation: verdict.explanation,
			});
		}
		result.graders = graded;
		const counted = graded.filter((g) => g.scored);
		const total = counted.reduce((n, g) => n + g.weight, 0);
		result.score = total ? counted.reduce((n, g) => n + (g.pass ? g.weight : 0), 0) / total : 0;
		return result;
	} finally {
		result.durationMs = Date.now() - started;
		if (!ctx.keepTemp) rmSync(ws, { recursive: true, force: true });
	}
}
