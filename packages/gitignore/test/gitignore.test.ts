import assert from "node:assert/strict";
import { test } from "node:test";
import { validateNames } from "../src/api.ts";
import { compose, currentTemplates, nextTemplates } from "../src/file.ts";

test("compose appends a block to an unmanaged file, keeping its lines", () => {
	const out = compose("secret.txt\n", ["node"], "node_modules/", []);
	assert.match(
		out,
		/^secret\.txt\n\n# >>> pi-gitignore: node >>>\nnode_modules\/\n# <<< pi-gitignore <<<\n$/,
	);
	assert.deepEqual(currentTemplates(out), ["node"]);
});

test("re-running rewrites only the block; custom lines are deduped and kept", () => {
	let out = compose("", ["node"], "node_modules/", ["a.txt"]);
	out = compose(out, nextTemplates(["node"], ["macos"], "add"), "node_modules/\n.DS_Store", [
		"a.txt",
		"b.txt",
	]);
	assert.deepEqual(currentTemplates(out), ["node", "macos"]);
	assert.equal(out.match(/a\.txt/g)?.length, 1);
	assert.equal(out.match(/# custom/g)?.length, 1);
	assert.match(out, /b\.txt/);
	out = compose(out, nextTemplates(["node", "macos"], ["node", "macos"], "remove"), "", []);
	assert.doesNotMatch(out, /pi-gitignore/);
	assert.match(out, /a\.txt/);
});

test("unknown templates are rejected with suggestions", () => {
	assert.throws(() => validateNames(["pyth"], ["python", "node"]), /did you mean: python/);
	assert.deepEqual(validateNames(["Node"], ["node"]), ["node"]);
});
