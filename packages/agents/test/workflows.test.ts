import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { BUILTIN_AGENTS } from "../src/store.ts";

const root = join(import.meta.dirname, "..");
const dir = join(root, "workflows");
const known = new Set(
	[...BUILTIN_AGENTS, ...readdirSync(join(root, "agents")).map((f) => basename(f, ".md"))].map(
		(n) => n.toLowerCase(),
	),
);
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;

for (const file of readdirSync(dir).filter((f) => f.endsWith(".js"))) {
	test(`workflows/${file} is a loadable workflow that only uses agents we ship`, () => {
		const src = readFileSync(join(dir, file), "utf8");
		// pi-subagents evaluates meta in an empty context, so a non-literal throws here too.
		const literal = src.match(/export const meta = (\{[\s\S]*?\n\})/)?.[1];
		assert.ok(literal, "missing `export const meta = {...}`");
		const meta = runInNewContext(`(${literal})`);
		assert.equal(meta.name, basename(file, ".js"));
		assert.ok(meta.description);

		const titles = new Set<string>(meta.phases.map((p: { title: string }) => p.title));
		for (const [, t] of src.matchAll(/phase\('([^']+)'\)/g)) assert.ok(titles.has(t), `phase ${t}`);

		// An unknown agentType silently falls back to general-purpose at run time.
		for (const [, a] of src.matchAll(/agentType: '([^']+)'/g)) {
			assert.ok(known.has(a.toLowerCase()), `unknown agentType ${a}`);
		}

		// Syntax only: the body is an async function body, never run here.
		new AsyncFunction(
			"args",
			"agent",
			"agentError",
			"parallel",
			"pipeline",
			"phase",
			"log",
			src.replace("export const meta", "const meta"),
		);
	});
}
