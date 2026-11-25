import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { applySkillMode, mergeLayers, modeOf, parseLayer, saveSkillMode } from "../src/config.ts";
import { indexSection, plan, skillBody } from "../src/plan.ts";

test("parseLayer drops invalid values", () => {
	assert.deepEqual(parseLayer({ default: "nope", limit: 0, skills: { a: "full", b: "bad" } }), {
		skills: { a: "full" },
	});
	assert.deepEqual(parseLayer(3), {});
});

test("later layers win; skill maps merge", () => {
	const cfg = mergeLayers([
		parseLayer({ default: "hidden", skills: { a: "full", b: "title" } }),
		parseLayer({ skills: { b: "description" }, limit: 3 }),
	]);
	assert.equal(cfg.default, "hidden");
	assert.deepEqual(cfg.skills, { a: "full", b: "description" });
	assert.equal(cfg.limit, 3);
});

test("modeOf: exact beats glob, longer glob beats shorter, else default", () => {
	const cfg = mergeLayers([
		parseLayer({
			default: "title",
			skills: { "godot*": "hidden", "godot-physics": "description", "godot-x*": "full" },
		}),
	]);
	assert.equal(modeOf("godot-physics", cfg), "description");
	assert.equal(modeOf("godot-xr", cfg), "full");
	assert.equal(modeOf("godot-shaders", cfg), "hidden");
	assert.equal(modeOf("other", cfg), "title");
});

test("plan splits by mode and skips disableModelInvocation skills", () => {
	const skills = ["a", "b", "c", "d", "e"].map((name) => ({
		name,
		description: name,
		filePath: `/${name}`,
		disableModelInvocation: name === "e",
	}));
	const cfg = mergeLayers([
		parseLayer({ skills: { a: "full", b: "description", c: "title", d: "hidden", e: "full" } }),
	]);
	const p = plan(skills, cfg);
	assert.deepEqual(
		[p.full.map((s) => s.name), p.listed.map((s) => s.name), p.titles, p.hidden],
		[["a"], ["b"], ["c"], 1],
	);
	assert.match(indexSection(p), /skill_search[\s\S]*Skills by name: c\.[\s\S]*1 more/);
	assert.equal(indexSection(plan([], cfg)), "");
});

test("skillBody strips frontmatter", () => {
	assert.equal(skillBody("---\nname: x\n---\n\nBody\n"), "Body");
	assert.equal(skillBody("Body"), "Body");
});

test("applySkillMode and saveSkillMode set and clear entries", () => {
	let d = applySkillMode({ keep: 1 }, "a", "full");
	d = applySkillMode(d, "*default", "hidden");
	assert.deepEqual(d, { keep: 1, skillIndex: { skills: { a: "full" }, default: "hidden" } });
	d = applySkillMode(applySkillMode(d, "a", undefined), "*default", undefined);
	assert.deepEqual(d, { keep: 1 });
	const p = join(mkdtempSync(join(tmpdir(), "si-")), "s.json");
	writeFileSync(p, '{\n  "x": 1\n}\n');
	saveSkillMode(p, "a", "title");
	assert.equal(
		readFileSync(p, "utf8"),
		'{\n  "x": 1,\n  "skillIndex": {\n    "skills": {\n      "a": "title"\n    }\n  }\n}\n',
	);
	writeFileSync(p, "{ broken");
	assert.throws(() => saveSkillMode(p, "a", "full"));
});
