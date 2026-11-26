import assert from "node:assert/strict";
import { test } from "node:test";
import { classify } from "../src/guard.ts";

test("git is blocked once per exact command, then allowed on resend", () => {
	const seen = new Set<string>();
	assert.equal(classify("git status", seen).kind, "block");
	assert.equal(classify("git   status ", seen).kind, "allow");
	assert.equal(classify("git log", seen).kind, "block");
});

test("git is found behind chains, wrappers, paths and bash -c", () => {
	for (const cmd of [
		"cd src && git commit -m x",
		"FOO=1 git add .",
		"env GIT_PAGER=cat git diff",
		"/usr/bin/git log | head",
		`bash -c 'git reset --hard'`,
	]) {
		assert.equal(classify(cmd, new Set()).kind, "block", cmd);
	}
	assert.equal(classify("echo git commit", new Set()).kind, "allow");
	assert.equal(classify("jj log -r 'description(glob:\"*git*\")'", new Set()).kind, "allow");
});

test("jj push and other hard-to-undo commands need confirmation, even after global flags", () => {
	for (const cmd of [
		"jj git push -b main",
		"jj -R /repo --color never git push",
		"jj op restore abc",
		"jj rebase -r x --ignore-immutable",
		"jj st && jj util gc",
	]) {
		assert.equal(classify(cmd, new Set()).kind, "confirm", cmd);
	}
	assert.equal(classify("jj git fetch", new Set()).kind, "allow");
	assert.equal(classify("jj describe -m 'git push notes'", new Set()).kind, "allow");
});

test("--ignore-working-copy is blocked on mutating jj commands only", () => {
	assert.equal(classify("jj --ignore-working-copy log", new Set()).kind, "allow");
	assert.equal(classify("jj op log --ignore-working-copy", new Set()).kind, "allow");
	assert.equal(classify("jj describe --ignore-working-copy -m x", new Set()).kind, "block");
});
