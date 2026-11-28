import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { codebaseMemoryEnabled } from "../src/codebase-memory/index.ts";
import { configPath, editConfig, readConfig, readConfigStrict } from "../src/config.ts";

const dir = () => mkdtempSync(join(tmpdir(), "pi-core-"));

test("editConfig keeps comments and untouched keys; refuses malformed files", () => {
	const p = join(dir(), "config.jsonc");
	writeFileSync(p, '{\n  // keep me\n  "a": 1,\n  "b": { "x": 1 }\n}\n');
	editConfig(p, (d) => ({ ...d, b: { x: 2 } }));
	assert.equal(
		readFileSync(p, "utf8"),
		'{\n  // keep me\n  "a": 1,\n  "b": {\n    "x": 2\n  }\n}\n',
	);
	writeFileSync(p, "{ broken");
	assert.throws(() => readConfigStrict(p));
	assert.throws(() => editConfig(p, (d) => d));
	assert.deepEqual(readConfig(p), {});
});

test("configPath prefers an existing .jsonc, else defaults to .json", () => {
	const agent = dir();
	assert.equal(configPath("global", "/x", agent), join(agent, "rackrot", "config.json"));
	assert.equal(configPath("project", "/nonexistent", agent), "/nonexistent/.pi/rackrot.json");
});

test("codebase-memory indexing is on unless the highest layer that sets it says false", () => {
	assert.equal(codebaseMemoryEnabled([undefined, undefined]), true);
	assert.equal(codebaseMemoryEnabled([{ enabled: false }, undefined]), false);
	assert.equal(codebaseMemoryEnabled([{ enabled: false }, { enabled: true }]), true);
});
