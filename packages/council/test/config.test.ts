import assert from "node:assert/strict";
import { test } from "node:test";
import { parseChain, parseConfig, parseRef } from "../src/config.ts";
import { embedFiles } from "../src/files.ts";
import { splitModel } from "../src/run.ts";

test("parseRef needs provider/model and keeps valid thinking", () => {
	assert.deepEqual(parseRef("a/b"), { model: "a/b", thinking: undefined });
	assert.deepEqual(parseRef({ model: "a/b", thinking: "high" }), {
		model: "a/b",
		thinking: "high",
	});
	assert.equal(parseRef("nomodel"), undefined);
	assert.equal(parseRef({ model: "a/b", thinking: "ultra" })?.thinking, undefined);
});

test("parseChain accepts one ref or an array, inheriting thinking", () => {
	assert.equal(parseChain("a/b").length, 1);
	assert.deepEqual(
		parseChain(["a/b", { model: "c/d", thinking: "low" }, "bad"], "high").map((r) => r.thinking),
		["high", "low"],
	);
	assert.deepEqual(parseChain(undefined), []);
});

test("defaults: both tools enabled, nothing configured", () => {
	const c = parseConfig(undefined);
	assert.equal(c.secondOpinion.enabled, true);
	assert.equal(c.secondOpinion.default, undefined);
	assert.deepEqual(c.council.presets, {});
	assert.equal(c.council.defaultPreset, "default");
	assert.equal(c.council.synthesizer.enabled, true);
});

test("second opinion options keep useWhen and default id to the model", () => {
	const c = parseConfig({
		secondOpinion: {
			model: "a/main",
			thinking: "high",
			models: [
				{ model: "b/big", useWhen: "hard math" },
				{ id: "fast", model: "c/fast" },
				{ model: "bad" },
			],
		},
	});
	assert.deepEqual(c.secondOpinion.default, { model: "a/main", thinking: "high" });
	assert.deepEqual(
		c.secondOpinion.options.map((o) => [o.id, o.useWhen]),
		[
			["b/big", "hard math"],
			["fast", ""],
		],
	);
});

test("presets drop councillors without a valid model and empty presets", () => {
	const c = parseConfig({
		council: {
			presets: {
				default: {
					useWhen: "x",
					councillors: { a: { model: ["p/m", "q/n"], prompt: "bugs" }, b: { model: "bad" } },
				},
				empty: { councillors: { z: {} } },
			},
			synthesizer: { model: "s/m", enabled: false },
		},
	});
	assert.deepEqual(Object.keys(c.council.presets), ["default"]);
	assert.deepEqual(Object.keys(c.council.presets.default.councillors), ["a"]);
	assert.equal(c.council.presets.default.councillors.a.chain.length, 2);
	assert.equal(c.council.synthesizer.enabled, false);
});

test("splitModel keeps slashes in the id", () => {
	assert.deepEqual(splitModel("openrouter/x/y"), { provider: "openrouter", id: "x/y" });
});

test("embedFiles reports missing files and truncates", () => {
	assert.equal(embedFiles(undefined, ".", 10), "");
	assert.match(embedFiles(["nope.txt"], ".", 10), /error=/);
	assert.match(embedFiles(["package.json"], import.meta.dirname + "/..", 10), /truncated=/);
});
