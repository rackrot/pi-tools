import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { parseConfig } from "../src/config.ts";
import { buildRows, type Obj, readLayer, saveLayer, setFirstModel, UNSET } from "../src/edit.ts";
import {
	councilActive,
	councilDescription,
	secondOpinionActive,
	secondOpinionDescription,
} from "../src/usage.ts";

const apply = (layer: Obj, id: string, value: string) => {
	const row = buildRows(layer, parseConfig(layer)).find((r) => r.id === id);
	assert.ok(row, id);
	row.apply(layer, value);
};

test("setFirstModel keeps chain fallbacks and object fields", () => {
	const o: Obj = { model: ["a/x", "b/y"] };
	setFirstModel(o, "model", "c/z");
	assert.deepEqual(o.model, ["c/z", "b/y"]);
	setFirstModel(o, "model", UNSET);
	assert.deepEqual(o.model, ["b/y"]);
	setFirstModel(o, "model", UNSET);
	assert.equal(o.model, undefined);
	const p: Obj = { model: { model: "a/x", thinking: "low" } };
	setFirstModel(p, "model", "c/z");
	assert.deepEqual(p.model, { model: "c/z", thinking: "low" });
});

test("rows write and clear values", () => {
	const layer: Obj = {};
	apply(layer, "so.model", "a/main");
	apply(layer, "so.thinking", "high");
	apply(layer, "so.timeout", "120");
	apply(layer, "so.enabled", "off");
	assert.deepEqual(layer.secondOpinion, {
		model: "a/main",
		thinking: "high",
		timeoutSeconds: 120,
		enabled: false,
	});
	apply(layer, "so.thinking", UNSET);
	assert.equal((layer.secondOpinion as Obj).thinking, undefined);
});

test("options can be added, edited and removed", () => {
	const layer: Obj = {};
	apply(layer, "so.add", "b/big");
	apply(layer, "so.opt.0.useWhen", "hard math");
	apply(layer, "so.opt.0.id", "big");
	assert.deepEqual((layer.secondOpinion as Obj).models, [
		{ model: "b/big", useWhen: "hard math", id: "big" },
	]);
	apply(layer, "so.opt.0.remove", "remove");
	assert.deepEqual((layer.secondOpinion as Obj).models, []);
});

test("presets and councillors can be added, edited and removed", () => {
	const layer: Obj = {};
	apply(layer, "co.addPreset", "review");
	apply(layer, "pr.review.add", "p/model-a");
	apply(layer, "pr.review.add", "q/model-a");
	const c = parseConfig(layer).council;
	assert.deepEqual(Object.keys(c.presets.review.councillors), ["model-a", "model-a-2"]);
	apply(layer, "pr.review.model-a.prompt", "focus on bugs");
	apply(layer, "pr.review.model-a-2.remove", "remove");
	apply(layer, "pr.review.useWhen", "big changes");
	const p = parseConfig(layer).council.presets.review;
	assert.deepEqual(Object.keys(p.councillors), ["model-a"]);
	assert.equal(p.councillors["model-a"].prompt, "focus on bugs");
	assert.equal(p.useWhen, "big changes");
	apply(layer, "pr.review.remove", "remove");
	assert.deepEqual((layer.council as Obj).presets, {});
});

test("saveLayer keeps other settings and the file's indent", () => {
	const path = join(mkdtempSync(join(tmpdir(), "council-")), "settings.json");
	writeFileSync(path, '{\n  "theme": "dark"\n}\n');
	saveLayer(path, (c) => {
		(c.secondOpinion = {}) as unknown;
		(c.secondOpinion as Obj).model = "a/b";
	});
	assert.match(readFileSync(path, "utf8"), /^\{\n {2}"theme": "dark",/);
	assert.deepEqual(readLayer(path), { secondOpinion: { model: "a/b" } });
	assert.deepEqual(readLayer(join(tmpdir(), "does-not-exist.json")), {});
});

test("tool descriptions carry options and presets", () => {
	const cfg = parseConfig({
		secondOpinion: {
			model: "a/main",
			models: [{ id: "big", model: "b/big", useWhen: "hard math" }],
		},
		council: { presets: { default: { useWhen: "reviews", councillors: { x: { model: "p/m" } } } } },
	});
	const so = secondOpinionDescription(cfg);
	assert.match(so, /Default model: a\/main/);
	assert.match(so, /- big \(b\/big\): hard math/);
	assert.match(councilDescription(cfg), /- default \(default\): x - reviews/);
	assert.equal(secondOpinionActive(parseConfig({ secondOpinion: { enabled: false } })), false);
	assert.equal(councilActive(parseConfig({})), false);
	assert.equal(councilActive(cfg), true);
});
