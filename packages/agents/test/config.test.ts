import assert from "node:assert/strict";
import { test } from "node:test";
import {
	applyTuning,
	configuredNames,
	isLocked,
	parseOverrides,
	resolveTuning,
	withConfiguredAgents,
	workflowAgents,
} from "../src/config.ts";

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

test("workflow args get configured agents, and explicit args win", () => {
	const layers = [
		parseOverrides({
			Reviewer: { model: "haiku", thinking: "low", maxTurns: 9 },
			Plan: { thinking: "off" },
		}),
	];
	const configured = workflowAgents(layers);
	assert.deepEqual(configured, { reviewer: { model: "haiku", effort: "low" } });
	assert.deepEqual(
		withConfiguredAgents('{"scope":"x","agents":{"Reviewer":{"effort":"high"}}}', configured),
		{
			scope: "x",
			agents: { Reviewer: { effort: "high" } },
		},
	);
	assert.deepEqual(withConfiguredAgents(undefined, configured), { agents: configured });
	assert.equal(withConfiguredAgents("not json", configured), "not json");
	assert.deepEqual(withConfiguredAgents({ a: 1 }, {}), { a: 1 });
});

test("applyTuning fills unset fields and keeps what the caller passed", () => {
	const input: Record<string, unknown> = { model: "caller/model", thinking: "" };
	applyTuning(input, { model: "cfg/model", thinking: "low", maxTurns: 9 }, false);
	assert.deepEqual(input, { model: "caller/model", thinking: "low", max_turns: 9 });
});

test("applyTuning locked overwrites configured fields only", () => {
	const input: Record<string, unknown> = { model: "caller/model", max_turns: 3 };
	applyTuning(input, { model: "cfg/model", thinking: "low" }, true);
	assert.deepEqual(input, { model: "cfg/model", thinking: "low", max_turns: 3 });
});

test("lock: only booleans parse, a later layer can unlock, config beats frontmatter", () => {
	assert.deepEqual(parseOverrides({ a: { lock: "yes" }, b: { lock: false } }), {
		b: { lock: false },
	});
	const layers = [parseOverrides({ r: { lock: true } }), parseOverrides({ r: { lock: false } })];
	assert.equal(resolveTuning("r", layers).lock, false);
	assert.equal(isLocked(resolveTuning("r", layers), true), false);
	assert.equal(isLocked({}, true), true);
	assert.equal(isLocked({}, undefined), false);
});

test("workflow args: locked agents' settings override the caller's entry", () => {
	const configured = { reviewer: { model: "m", effort: "low" } };
	assert.deepEqual(
		withConfiguredAgents(
			{ agents: { Reviewer: { model: "x", effort: "high", extra: 1 } } },
			configured,
			new Set(["reviewer"]),
		),
		{ agents: { Reviewer: { model: "m", effort: "low", extra: 1 } } },
	);
});
