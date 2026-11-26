import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { atLeast, findJjRoot, parseVersion } from "../src/detect.ts";

test("findJjRoot walks up from a subdirectory and ignores plain git repos", () => {
	const root = mkdtempSync(join(tmpdir(), "jj-detect-"));
	mkdirSync(join(root, "a", "b"), { recursive: true });
	mkdirSync(join(root, ".git"));
	assert.equal(findJjRoot(join(root, "a", "b")), undefined);
	mkdirSync(join(root, ".jj"));
	assert.equal(findJjRoot(join(root, "a", "b")), root);
});

test("version gate compares numerically, not lexically", () => {
	assert.deepEqual(parseVersion("jj 0.47.1-d16ee1fc"), [0, 47, 1]);
	assert.equal(atLeast([0, 9, 0], [0, 30, 0]), false);
	assert.equal(atLeast([0, 47, 1], [0, 30, 0]), true);
});
