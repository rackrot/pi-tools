import type { Verdict } from "./graders.ts";
import { targetText } from "./graders.ts";
import { runPi } from "./pi.ts";
import { TraceBuilder } from "./trace.ts";
import type { GraderDef, RunTrace } from "./types.ts";

export interface JudgeConfig {
	piBin: string;
	model?: string;
	extensions: string[];
	cwd: string;
}

const VOTES = 3;
const MAX_CHARS = 30_000;

function material(g: GraderDef, trace: RunTrace): string | undefined {
	const focus = g.opts.focus ?? g.opts.target;
	if (focus === "trace") {
		const lines = trace.trace.split("\n");
		return (lines.length > 24 ? [...lines.slice(0, 12), "...", ...lines.slice(-12)] : lines)
			.join("\n")
			.slice(0, MAX_CHARS);
	}
	return targetText(trace, focus)?.slice(0, MAX_CHARS);
}

async function oneVote(
	prompt: string,
	cfg: JudgeConfig,
): Promise<{ pass: boolean; reason: string; cost: number }> {
	const tb = new TraceBuilder();
	const args = [
		"-p",
		"--mode",
		"json",
		"--no-session",
		"--no-tools",
		"--no-extensions",
		"--no-skills",
		"--no-context-files",
		"--no-prompt-templates",
		"--no-themes",
		"--no-mcp",
		"--offline",
	];
	for (const e of cfg.extensions) args.push("-e", e);
	if (cfg.model) args.push("--model", cfg.model);
	await runPi(cfg.piBin, args, prompt, {
		cwd: cfg.cwd,
		timeoutMs: 180_000,
		onEvent: (ev) => void tb.feed(ev),
	});
	const verdicts = [...tb.lastMessage.matchAll(/VERDICT:\s*(PASS|FAIL)/gi)];
	const last = verdicts.at(-1)?.[1]?.toUpperCase();
	return {
		pass: last === "PASS",
		reason: tb.lastMessage.replace(/\s+/g, " ").slice(0, 300),
		cost: tb.costUsd,
	};
}

/** Three judge votes, majority wins. A run with no verdict line counts as a FAIL vote. */
export async function judge(
	g: GraderDef,
	trace: RunTrace,
	cfg: JudgeConfig,
): Promise<Verdict & { cost: number }> {
	const text = material(g, trace);
	if (text === undefined) return { pass: false, explanation: "target not available", cost: 0 };
	const prompt = [
		"You are grading the work of an AI agent against a rubric. Judge only what the material shows.",
		"",
		"RUBRIC:",
		g.body,
		"",
		"MATERIAL:",
		text,
		"",
		"Give a short justification, then end with exactly one line: VERDICT: PASS or VERDICT: FAIL.",
	].join("\n");
	const votes = await Promise.all(Array.from({ length: VOTES }, () => oneVote(prompt, cfg)));
	const passes = votes.filter((v) => v.pass).length;
	return {
		pass: passes >= 2,
		explanation: `${passes}/${VOTES} PASS. ${votes.find((v) => v.pass === passes < 2)?.reason ?? ""}`,
		cost: votes.reduce((n, v) => n + v.cost, 0),
	};
}
