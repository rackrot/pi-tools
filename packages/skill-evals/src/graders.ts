import { globToRegex } from "./cases.ts";
import type { GraderDef, Json, RunTrace, ToolCall } from "./types.ts";

/** Claude Code tool names mapped to pi's. `Skill` is synthetic: a read of a SKILL.md file. */
const TOOL_MAP: Record<string, string> = {
	Read: "read",
	Write: "write",
	Edit: "edit",
	Bash: "bash",
	Glob: "find",
	Grep: "grep",
};

export const normalizeTool = (name: string) => TOOL_MAP[name] ?? name;

/** Matches a path to a SKILL.md and returns the skill's directory name. */
export function skillNameFromPath(path: string): string | undefined {
	return /(?:^|[\\/])([^\\/]+)[\\/]SKILL\.md$/.exec(path)?.[1];
}

export function toolCall(name: string, input: unknown): ToolCall[] {
	const calls: ToolCall[] = [{ name, input, json: JSON.stringify(input) }];
	if (name === "read") {
		const path = (input as { path?: unknown } | undefined)?.path;
		const skill = typeof path === "string" ? skillNameFromPath(path) : undefined;
		if (skill) {
			const synthetic = { skill };
			calls.push({ name: "Skill", input: synthetic, json: JSON.stringify(synthetic) });
		}
	}
	return calls;
}

export interface Verdict {
	pass: boolean;
	explanation: string;
}

type Matcher = { tool: string; inputMatch?: RegExp };

function matcher(v: unknown): Matcher {
	if (typeof v === "string") return { tool: normalizeTool(v) };
	const o = v as { tool: string; input_match?: string };
	return {
		tool: normalizeTool(o.tool),
		inputMatch: o.input_match ? new RegExp(o.input_match) : undefined,
	};
}

const matching = (calls: ToolCall[], m: Matcher) =>
	calls.filter((c) => c.name === m.tool && (!m.inputMatch || m.inputMatch.test(c.json)));

/** Text a regex grader or judge reads. Returns undefined when a named file was not produced. */
export function targetText(trace: RunTrace, target: unknown): string | undefined {
	if (target === undefined || target === "last_message") return trace.lastMessage;
	if (target === "trace") return trace.trace;
	if (target === "files") return trace.files.join("\n");
	if (target && typeof target === "object" && (target as Json).source === "file")
		return trace.readFile(String((target as Json).path));
	return undefined;
}

/** Grades the free (non-model) types. `llm` is handled by the judge. */
export function gradeFree(g: GraderDef, trace: RunTrace): Verdict {
	const o = g.opts;
	switch (g.type) {
		case "tool_used": {
			const n = matching(trace.toolCalls, {
				tool: normalizeTool(String(o.tool)),
				inputMatch: o.input_match ? new RegExp(String(o.input_match)) : undefined,
			}).length;
			const min = typeof o.min === "number" ? o.min : 1;
			const max = typeof o.max === "number" ? o.max : Number.POSITIVE_INFINITY;
			return {
				pass: n >= min && n <= max,
				explanation: `${n} matching calls of ${String(o.tool)} (want ${min}..${max === Number.POSITIVE_INFINITY ? "any" : max})`,
			};
		}
		case "tool_order": {
			const b = matcher(o.before);
			const a = matcher(o.after);
			const first = (m: Matcher) =>
				trace.toolCalls.findIndex(
					(c) => c.name === m.tool && (!m.inputMatch || m.inputMatch.test(c.json)),
				);
			const ib = first(b);
			const ia = first(a);
			return {
				pass: ib >= 0 && ia >= 0 && ib < ia,
				explanation: `before at ${ib}, after at ${ia}`,
			};
		}
		case "file_exists": {
			const re = globToRegex(String(o.path));
			const found = trace.files.filter((f) => re.test(f));
			const want = o.exists !== false;
			return {
				pass: want ? found.length > 0 : found.length === 0,
				explanation: `${found.length} files match ${String(o.path)}`,
			};
		}
		case "regex": {
			const text = targetText(trace, o.target);
			if (text === undefined) return { pass: false, explanation: "target not available" };
			const flags = String(o.flags ?? "");
			const re = new RegExp(String(o.pattern), flags.includes("g") ? flags : `${flags}g`);
			const count = [...text.matchAll(re)].length;
			const match = String(o.match ?? "contains");
			if (match === "not_contains") return { pass: count === 0, explanation: `${count} matches` };
			const m = /^count:(\d+)$/.exec(match);
			if (m) return { pass: count === Number(m[1]), explanation: `${count} matches, want ${m[1]}` };
			return { pass: count > 0, explanation: `${count} matches` };
		}
		default:
			return { pass: false, explanation: `unsupported grader type "${g.type}"` };
	}
}

/** True for graders that only measure whether the skill was used, which cannot pass in the no-skill arm. */
export const isFiredIndicator = (g: GraderDef) =>
	g.type === "tool_used" && normalizeTool(String(g.opts.tool)) === "Skill" && g.arm !== "both";
