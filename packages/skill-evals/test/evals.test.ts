import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { globToRegex, loadCases } from "../src/cases.ts";
import { gradeFree, isFiredIndicator, skillNameFromPath, toolCall } from "../src/graders.ts";
import { buildCaseResult, formatTable, summary } from "../src/report.ts";
import { TraceBuilder } from "../src/trace.ts";
import type { Case, GraderDef, RunResult, RunTrace } from "../src/types.ts";

const here = dirname(fileURLToPath(import.meta.url));
const skillsPkg = join(here, "../../skills");

const grader = (
	type: string,
	opts: Record<string, unknown>,
	extra: Partial<GraderDef> = {},
): GraderDef => ({ name: "g", type, weight: 1, opts, body: "", ...extra });

function trace(calls: [string, unknown][], lastMessage = "", files: string[] = []): RunTrace {
	return {
		lastMessage,
		toolCalls: calls.flatMap(([n, i]) => toolCall(n, i)),
		trace: "",
		files,
		readFile: () => undefined,
	};
}

test("reading a SKILL.md also records a synthetic Skill call the CC idiom matches", () => {
	assert.equal(skillNameFromPath("/a/b/changelog-entry/SKILL.md"), "changelog-entry");
	assert.equal(skillNameFromPath("/a/b/changelog-entry/references/x.md"), undefined);
	const t = trace([["read", { path: "/x/skills/changelog-entry/SKILL.md" }]]);
	const g = grader("tool_used", {
		tool: "Skill",
		input_match: '"skill"\\s*:\\s*"(?:[\\w-]+:)?changelog-entry"',
	});
	assert.equal(gradeFree(g, t).pass, true);
	assert.equal(
		gradeFree(
			grader("tool_used", {
				tool: "Skill",
				input_match: '"skill"\\s*:\\s*"other"',
				min: 0,
				max: 0,
			}),
			t,
		).pass,
		true,
	);
	assert.equal(gradeFree(grader("tool_used", { tool: "Skill" }), trace([])).pass, false);
	assert.equal(isFiredIndicator(g), true);
	assert.equal(isFiredIndicator({ ...g, arm: "both" }), false);
});

test("tool_used maps Claude Code tool names and counts", () => {
	const t = trace([
		["read", { path: "a" }],
		["read", { path: "b" }],
		["grep", { pattern: "x" }],
	]);
	assert.equal(gradeFree(grader("tool_used", { tool: "Read", min: 2, max: 2 }), t).pass, true);
	assert.equal(
		gradeFree(grader("tool_used", { tool: "Grep", input_match: "pattern" }), t).pass,
		true,
	);
	assert.equal(gradeFree(grader("tool_used", { tool: "Bash", min: 0, max: 0 }), t).pass, true);
});

test("tool_order needs both and the right order", () => {
	const t = trace([
		["grep", {}],
		["read", {}],
	]);
	assert.equal(gradeFree(grader("tool_order", { before: "Grep", after: "Read" }), t).pass, true);
	assert.equal(gradeFree(grader("tool_order", { before: "Read", after: "Grep" }), t).pass, false);
	assert.equal(gradeFree(grader("tool_order", { before: "Grep", after: "Write" }), t).pass, false);
});

test("regex targets and match modes", () => {
	const t: RunTrace = {
		...trace([], "Hello world hello"),
		readFile: (p) => (p === "out.md" ? "## Title" : undefined),
	};
	assert.equal(
		gradeFree(grader("regex", { pattern: "hello", flags: "i", match: "count:2" }), t).pass,
		true,
	);
	assert.equal(gradeFree(grader("regex", { pattern: "bye", match: "not_contains" }), t).pass, true);
	assert.equal(
		gradeFree(
			grader("regex", { pattern: "^## Title", target: { source: "file", path: "out.md" } }),
			t,
		).pass,
		true,
	);
	assert.equal(
		gradeFree(grader("regex", { pattern: "x", target: { source: "file", path: "missing" } }), t)
			.pass,
		false,
	);
});

test("file_exists globs over created files", () => {
	const t = trace([], "", ["notes/a.md", "b.txt"]);
	assert.equal(gradeFree(grader("file_exists", { path: "notes/*.md" }), t).pass, true);
	assert.equal(gradeFree(grader("file_exists", { path: "*.py", exists: false }), t).pass, true);
	assert.equal(gradeFree(grader("file_exists", { path: "*.py" }), t).pass, false);
	assert.ok(globToRegex("a/**/b").test("a/x/y/b"));
});

test("TraceBuilder reads pi events", () => {
	const tb = new TraceBuilder();
	tb.feed({ type: "tool_execution_start", toolName: "read", args: { path: "/s/foo/SKILL.md" } });
	tb.feed({
		type: "message_end",
		message: {
			role: "assistant",
			content: [{ type: "text", text: "done" }],
			usage: { cost: { total: 0.5 } },
		},
	});
	tb.feed({ type: "message_end", message: { role: "system", content: "" } });
	assert.equal(tb.lastMessage, "done");
	assert.equal(tb.turns, 1);
	assert.equal(tb.costUsd, 0.5);
	assert.deepEqual(
		tb.toolCalls.map((c) => c.name),
		["read", "Skill"],
	);
});

test("loadCases reads prompt.md, graders and case.yaml", () => {
	const root = mkdtempSync(join(tmpdir(), "evals-"));
	const dir = join(root, "my-skill", "case-a");
	mkdirSync(join(dir, "graders"), { recursive: true });
	writeFileSync(
		join(dir, "prompt.md"),
		"---\nname: case-a\ntags: [trigger]\nruns: 2\nmax_turns: 4\nallowed_tools: [Read, Skill]\n---\nDo the thing\n",
	);
	writeFileSync(
		join(dir, "graders", "fires.md"),
		"---\ntype: tool_used\ntool: Skill\nweight: 2\n---\n",
	);
	const { cases, errors } = loadCases(root);
	assert.deepEqual(errors, []);
	assert.equal(cases.length, 1);
	assert.deepEqual(
		[
			cases[0].skills,
			cases[0].tags,
			cases[0].runs,
			cases[0].maxTurns,
			cases[0].prompt,
			cases[0].graders[0].weight,
		],
		[["my-skill"], ["trigger"], 2, 4, "Do the thing", 2],
	);
	mkdirSync(join(root, "x", "bad"), { recursive: true });
	writeFileSync(join(root, "x", "bad", "prompt.md"), "hi");
	assert.equal(loadCases(root).errors.length, 1);
});

test("scoring: delta and table", () => {
	const c = { id: "s/c", graders: [], skills: ["s"] } as unknown as Case;
	const run = (arm: "with" | "without", score: number): RunResult => ({
		arm,
		score,
		graders: [],
		costUsd: 0.1,
		durationMs: 1,
	});
	const r = buildCaseResult(c, [run("with", 1), run("with", 0.5)], [run("without", 0.25)]);
	assert.equal(r.with.score, 0.75);
	assert.equal(r.delta, 0.5);
	assert.deepEqual([summary([r], 0.7).casesPassed, summary([r], 0.8).casesPassed], [1, 0]);
	assert.match(formatTable([r]), /W\/OUT[\s\S]*s\/c\s+0\.75\s+0\.25\s+\+0\.50/);
});

test("every imported eval loads and names an imported skill", {
	skip: !existsSync(join(skillsPkg, "evals")),
}, () => {
	const { cases, errors } = loadCases(join(skillsPkg, "evals"));
	assert.deepEqual(errors, []);
	assert.ok(cases.length > 400);
	const missing = cases.flatMap((c) =>
		c.skills
			.filter((s) => !existsSync(join(skillsPkg, "skills", s, "SKILL.md")))
			.map((s) => `${c.id}: ${s}`),
	);
	assert.deepEqual(missing, []);
});
