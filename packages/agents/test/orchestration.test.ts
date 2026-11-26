import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_DENIED, parseRaw, resolve } from "../src/orchestration/config.ts";
import { decide } from "../src/orchestration/index.ts";

const main = [
	{ name: "Agent", source: "/pkg/pi-subagents/index.ts" },
	{ name: "read", source: "builtin" },
];

test("config: later layer replaces per field, bad values ignored", () => {
	const g = parseRaw({ level: "strict", deniedTools: ["bash"] });
	const p = parseRaw({ level: "nonsense", deniedTools: "x" });
	assert.deepEqual(resolve([g, p]), { level: "strict", deniedTools: ["bash"] });
	assert.deepEqual(resolve([]), { level: "off", deniedTools: DEFAULT_DENIED });
});

test("strict denies configured tools but never the delegation tools", () => {
	const d = decide("strict", ["read", "Agent", "ask_user"], main);
	assert.deepEqual([...d.blocked], ["read"]);
	assert.ok(d.section);
});

test("non-strict levels inject guidance without blocking", () => {
	const d = decide("lean", DEFAULT_DENIED, main);
	assert.ok(d.section);
	assert.equal(d.blocked.size, 0);
});

test("off, no Agent tool, and subagent sessions get nothing", () => {
	for (const [level, tools] of [
		["off", main],
		["strict", [{ name: "read", source: "builtin" }]],
		["strict", [{ name: "Agent", source: "sdk" }]],
	] as const) {
		const d = decide(level, DEFAULT_DENIED, [...tools]);
		assert.equal(d.section, undefined);
		assert.equal(d.blocked.size, 0);
	}
});
