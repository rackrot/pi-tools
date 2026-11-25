import assert from "node:assert/strict";
import { test } from "node:test";
import { search, tokenize } from "../src/search.ts";

const docs = [
	{ name: "git-commit", description: "Writes Git commits in the repository's message convention" },
	{
		name: "playwright-cli",
		description: "Drives a headless browser to inspect pages and take screenshots",
	},
	{ name: "postgres", description: "Diagnoses PostgreSQL queries, indexes and locks" },
	{ name: "pr-comments", description: "Pulls PR review comments into context and fixes them" },
];

test("tokenize splits identifiers, drops stop words, stems plurals", () => {
	assert.deepEqual(tokenize("The commits of camelCase"), ["commit", "camel", "case"]);
});

test("ranks the relevant skill first", () => {
	assert.equal(search(docs, "write a commit message", 3)[0].name, "git-commit");
	assert.equal(search(docs, "screenshot a web page", 3)[0].name, "playwright-cli");
	assert.equal(search(docs, "slow sql index", 3)[0].name, "postgres");
});

test("a name match outranks a description match", () => {
	const d = [
		{ name: "alpha", description: "mentions postgres once" },
		{ name: "postgres", description: "unrelated words here" },
	];
	assert.equal(search(d, "postgres", 2)[0].name, "postgres");
});

test("no match and empty query return nothing; limit applies", () => {
	assert.deepEqual(search(docs, "zzzz", 3), []);
	assert.deepEqual(search(docs, "the of", 3), []);
	assert.equal(search(docs, "comments commit queries browser", 2).length, 2);
});
