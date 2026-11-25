import assert from "node:assert/strict";
import { test } from "node:test";
import { configuredNames, parseOverrides, resolveTuning } from "../src/config.ts";

test("parseOverrides keeps valid fields and lowercases names", () => {
	const o = parseOverrides({
		Reviewer: { model: " sonnet ", thinking: "high", maxTurns: 10 },
		bad: { thinking: "ultra", maxTurns: 0, model: "" },
		nope: 3,
	});
	assert.deepEqual(o, { reviewer: { model: "sonnet", thinking: "high", maxTurns: 10 } });
});

test("parseOverrides tolerates non-objects", () => {
	assert.deepEqual(parseOverrides(undefined), {});
	assert.deepEqual(parseOverrides([1]), {});
	assert.deepEqual(parseOverrides("x"), {});
});

test("later layers win per field, case-insensitively", () => {
	const defaults = parseOverrides({ reviewer: { thinking: "medium", maxTurns: 25 } });
	const global = parseOverrides({ reviewer: { model: "haiku" } });
	const project = parseOverrides({ Reviewer: { thinking: "high" } });
	assert.deepEqual(resolveTuning("REVIEWER", [defaults, global, project]), {
		thinking: "high",
		maxTurns: 25,
		model: "haiku",
	});
});

test("unknown agent resolves to empty tuning", () => {
	assert.deepEqual(resolveTuning("x", [parseOverrides({ y: { model: "m" } })]), {});
});

test("configuredNames is the sorted union", () => {
	const a = parseOverrides({ b: { model: "m" } });
	const b = parseOverrides({ a: { model: "m" }, b: { thinking: "low" } });
	assert.deepEqual(configuredNames([a, b]), ["a", "b"]);
});
