import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { loadCatalog, NAME_RE, type Template } from "../src/catalog.ts";
import { installTemplate } from "../src/install.ts";

const tmp = () => mkdtempSync(join(tmpdir(), "pi-mcp-templates-"));
const tpl = (id: string, description: string): Template => ({
	id,
	description,
	tags: [],
	entry: { url: "https://example.com/mcp" },
});
const put = (path: string, data: unknown) => {
	mkdirSync(join(path, ".."), { recursive: true });
	writeFileSync(path, typeof data === "string" ? data : JSON.stringify(data));
};

test("project templates override global override builtin; invalid ones are reported and skipped", () => {
	const agentDir = tmp();
	const cwd = tmp();
	put(join(agentDir, "rackrot", "mcp-templates", "a.json"), [
		tpl("context7", "global"),
		tpl("only-global", "g"),
		{ id: "broken", entry: {} },
	]);
	put(join(cwd, ".pi", "mcp-templates", "b.json"), tpl("context7", "project"));
	put(join(cwd, ".pi", "mcp-templates", "c.json"), "{ not json");
	const { templates, problems } = loadCatalog(cwd, agentDir);
	const c7 = templates.find((t) => t.id === "context7");
	assert.deepEqual([c7?.description, c7?.origin], ["project", "project"]);
	assert.equal(templates.find((t) => t.id === "only-global")?.origin, "global");
	assert.ok(templates.some((t) => t.id === "playwright" && t.origin === "builtin"));
	assert.equal(problems.length, 2);
	assert.ok(problems.some((p) => p.includes("a.json[2]")));
});

test("install merges into an existing mcp.json, refuses conflicts, and keeps secrets out of the repo", () => {
	const agentDir = tmp();
	const cwd = tmp();
	const file = join(agentDir, "mcp.json");
	put(file, { theme: "x", mcpServers: { other: { command: "foo" } } });
	const keyed = loadCatalog(cwd, agentDir).templates.find((t) => t.id === "context7-keyed");
	assert.ok(keyed);
	// secrets present -> global scope by default, even though a cwd is given
	const r = installTemplate({ template: keyed, cwd, agentDir });
	assert.equal(r.scope, "global");
	const data = JSON.parse(readFileSync(file, "utf8"));
	assert.equal(data.theme, "x");
	assert.deepEqual(data.mcpServers.other, { command: "foo" });
	assert.equal(
		data.mcpServers["context7-keyed"].headers.Authorization,
		"Bearer ${CONTEXT7_API_KEY}",
	);
	assert.throws(() => installTemplate({ template: keyed, cwd, agentDir }), /already exists/);
	installTemplate({ template: keyed, cwd, agentDir, exposure: "deferred", overwrite: true });
	assert.equal(
		JSON.parse(readFileSync(file, "utf8")).mcpServers["context7-keyed"].exposure,
		"deferred",
	);
	// no secrets -> project scope, creates .pi/
	const plain = installTemplate({ template: tpl("x", "y"), cwd, agentDir });
	assert.equal(plain.path, join(cwd, ".pi", "mcp.json"));
	assert.throws(
		() => installTemplate({ template: tpl("x", "y"), cwd, agentDir, name: "bad name" }),
		/Invalid server name/,
	);
});

test("every builtin template is valid and carries no literal secrets", () => {
	const { templates, problems } = loadCatalog(tmp(), tmp());
	assert.deepEqual(problems, []);
	assert.ok(templates.length >= 12);
	for (const t of templates) {
		assert.ok(NAME_RE.test(t.id));
		assert.ok(
			!/(sk-[A-Za-z0-9]{10,}|ghp_|github_pat_|Bearer\s+(?!\$\{)\S{12,})/.test(
				JSON.stringify(t.entry),
			),
			`${t.id} looks like it holds a literal secret`,
		);
	}
});
