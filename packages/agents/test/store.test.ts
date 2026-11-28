import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
	agentFrontmatterLock,
	applyOverride,
	disableContent,
	discoverAgents,
	enableContent,
	isAgentDisabled,
	isDisabledContent,
	saveOverride,
	setAgentEnabled,
} from "../src/store.ts";

test("applyOverride sets, reuses existing key case, and prunes empties", () => {
	let d = applyOverride({ other: 1 }, "Reviewer", "model", "m");
	assert.deepEqual(d, { other: 1, agentOverrides: { Reviewer: { model: "m" } } });
	d = applyOverride(d, "reviewer", "thinking", "high");
	assert.deepEqual(d.agentOverrides, { Reviewer: { model: "m", thinking: "high" } });
	d = applyOverride(d, "reviewer", "model", undefined);
	d = applyOverride(d, "reviewer", "thinking", undefined);
	assert.deepEqual(d, { other: 1 });
});

test("applyOverride keeps an existing lock key when editing other fields", () => {
	const d = applyOverride({ agentOverrides: { r: { lock: true } } }, "R", "model", "m");
	assert.deepEqual(d.agentOverrides, { r: { lock: true, model: "m" } });
});

test("agentFrontmatterLock reads the fenced key, by stem or name, project before global", () => {
	const root = mkdtempSync(join(tmpdir(), "agents-"));
	const [proj, glob] = [join(root, "p"), join(root, "g")];
	for (const d of [proj, glob]) mkdirSync(d);
	writeFileSync(join(glob, "reviewer.md"), "---\nlock: false\n---\n");
	writeFileSync(join(proj, "x.md"), "---\nname: Reviewer\nlock: true\n---\n");
	writeFileSync(join(glob, "body.md"), "---\ndescription: d\n---\nlock: true\n");
	assert.equal(agentFrontmatterLock("reviewer", [proj, glob]), true);
	assert.equal(agentFrontmatterLock("reviewer", [glob]), false);
	assert.equal(agentFrontmatterLock("body", [proj, glob]), undefined);
	assert.equal(agentFrontmatterLock("none", [join(root, "missing")]), undefined);
});

test("saveOverride keeps other keys and indentation; refuses unparseable files", () => {
	const dir = mkdtempSync(join(tmpdir(), "agents-"));
	const p = join(dir, "rackrot.json");
	writeFileSync(p, '{\n  "a": 1\n}\n');
	saveOverride(p, "x", "maxTurns", 5);
	assert.equal(
		readFileSync(p, "utf8"),
		'{\n  "a": 1,\n  "agentOverrides": {\n    "x": {\n      "maxTurns": 5\n    }\n  }\n}\n',
	);
	writeFileSync(p, "{ broken");
	assert.throws(() => saveOverride(p, "x", "maxTurns", 5));
	assert.equal(readFileSync(p, "utf8"), "{ broken");
});

test("disable/enable content edits", () => {
	const src = "---\nname: a\ndescription: d\n---\nbody\n";
	const off = disableContent(src);
	assert.ok(isDisabledContent(off));
	assert.equal(disableContent(off), off);
	const back = enableContent(off);
	assert.equal(back.content, src);
	assert.equal(back.remove, false);
	assert.equal(enableContent("---\nenabled: false\n---\n").remove, true);
	assert.ok(isDisabledContent(disableContent("plain body\n")));
});

test("setAgentEnabled writes a stub, then removes it", () => {
	const dir = mkdtempSync(join(tmpdir(), "agents-"));
	const agents = join(dir, "agents");
	setAgentEnabled(agents, "Explore", false);
	assert.ok(isAgentDisabled(agents, "Explore"));
	setAgentEnabled(agents, "Explore", true);
	assert.equal(isAgentDisabled(agents, "Explore"), false);
	assert.throws(() => readFileSync(join(agents, "Explore.md")));
});

test("setAgentEnabled keeps a user-authored file", () => {
	const dir = mkdtempSync(join(tmpdir(), "agents-"));
	const f = join(dir, "mine.md");
	writeFileSync(f, "---\nname: mine\ndescription: d\n---\nbody\n");
	setAgentEnabled(dir, "mine", false);
	assert.ok(isAgentDisabled(dir, "mine"));
	setAgentEnabled(dir, "mine", true);
	assert.equal(readFileSync(f, "utf8"), "---\nname: mine\ndescription: d\n---\nbody\n");
});

test("discoverAgents merges sources case-insensitively", () => {
	const root = mkdtempSync(join(tmpdir(), "agents-"));
	const pkg = join(root, "pkg");
	mkdirSync(join(pkg, "agents"), { recursive: true });
	writeFileSync(join(pkg, "agents", "x.md"), "---\nname: reviewer\n---\n");
	const names = discoverAgents(pkg, join(root, "g"), join(root, "p"), ["explore", "extra"]);
	assert.deepEqual(names, ["Explore", "extra", "general-purpose", "Plan", "reviewer"]);
});
