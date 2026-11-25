import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { readJson, readJsonStrict, writeJsonAtomic } from "../src/json.ts";

const dir = () => mkdtempSync(join(tmpdir(), "pi-core-"));

test("readJson tolerates missing, malformed and non-object files", () => {
	const d = dir();
	assert.deepEqual(readJson(join(d, "none.json")), {});
	writeFileSync(join(d, "bad.json"), "{");
	assert.deepEqual(readJson(join(d, "bad.json")), {});
	writeFileSync(join(d, "arr.json"), "[1]");
	assert.deepEqual(readJson(join(d, "arr.json")), {});
});

test("readJsonStrict throws on malformed content and detects indent", () => {
	const d = dir();
	writeFileSync(join(d, "bad.json"), "{");
	assert.throws(() => readJsonStrict(join(d, "bad.json")));
	writeFileSync(join(d, "a.json"), '{\n  "a": 1\n}');
	assert.equal(readJsonStrict(join(d, "a.json")).indent, "  ");
	assert.equal(readJsonStrict(join(d, "none.json")).indent, "\t");
});

test("writeJsonAtomic creates parents and round-trips", () => {
	const d = dir();
	const p = join(d, "x", "y.json");
	writeJsonAtomic(p, { a: 1 });
	assert.deepEqual(readJson(p), { a: 1 });
	assert.ok(readFileSync(p, "utf8").endsWith("\n"));
});
