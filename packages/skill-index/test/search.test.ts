import assert from "node:assert/strict";
import { test } from "node:test";
import { SkillDb } from "../src/db.ts";
import { searchSkills } from "../src/search.ts";

const skill = (name: string, description: string, body = "") => ({
	filePath: `/s/${name}/SKILL.md`,
	name,
	description,
	body,
});

function seed() {
	const db = new SkillDb(":memory:");
	db.sync("global", null, [
		skill("git-commit", "Writes Git commits in the repository's message convention"),
		skill("postgres", "Diagnoses queries", "Look at indexes and locks when a sql query is slow"),
	]);
	db.sync("project", "/proj-a", [skill("deploy-a", "Deploys project a with commit hooks")]);
	db.sync("project", "/proj-b", [skill("deploy-b", "Deploys project b with commit hooks")]);
	return db;
}

const names = (r: { skills: { name: string }[] }) => r.skills.map((s) => s.name).sort();

test("search only returns global skills and the current project's skills", async () => {
	const db = seed();
	const r = await searchSkills({ db, threshold: 0.5 }, { projectRoot: "/proj-a" }, "commit", 10);
	assert.deepEqual(names(r), ["deploy-a", "git-commit"]);
});

test("body text is searchable and a changed body drops its embedding", async () => {
	const db = seed();
	const scope = { projectRoot: "/x" };
	const r = await searchSkills({ db, threshold: 0.5 }, scope, "slow sql", 3);
	assert.equal(r.skills[0].name, "postgres");

	for (const s of db.pendingEmbeddings(scope, "m")) db.setEmbedding(s.id, "m", [1, 0]);
	assert.equal(db.pendingEmbeddings(scope, "m").length, 0);
	assert.equal(db.pendingEmbeddings(scope, "other").length, 2);
	db.sync("global", null, [skill("postgres", "Diagnoses queries", "changed body")]);
	assert.deepEqual(
		db.pendingEmbeddings(scope, "m").map((s) => s.name),
		["postgres"],
	);
});

test("a failing provider is skipped; the decision model filters by threshold", async () => {
	const db = seed();
	const scope = { projectRoot: "/proj-a" };
	const boom = () => Promise.reject(new Error("down"));
	const r = await searchSkills(
		{
			db,
			threshold: 0.5,
			embedder: { id: "m", embed: boom },
			reranker: { rerank: boom },
			judge: { judge: async (_q, c) => c.map((x) => (x.name === "deploy-a" ? 0.9 : 0.1)) },
		},
		scope,
		"commit",
		10,
	);
	assert.deepEqual(names(r), ["deploy-a"]);
	assert.equal(r.errors.length, 2);
});
