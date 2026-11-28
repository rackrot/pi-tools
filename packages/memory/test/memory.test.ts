import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { loadConfig } from "../src/config.ts";
import { GitSync } from "../src/git.ts";
import { INDEX_END, INDEX_START } from "../src/overview.ts";
import { summarizeProject } from "../src/summary.ts";
import {
	createMemory,
	memoryArchive,
	memoryRead,
	memorySearch,
	memoryWrite,
	type WriteParams,
} from "../src/tools.ts";
import { type ConfiguredConfig, nextSteps, setupVault } from "../src/vault.ts";

const sh = (cwd: string, ...args: string[]) =>
	execFileSync("git", ["-C", cwd, ...args], { encoding: "utf8" });
const tmp = () => mkdtempSync(join(tmpdir(), "pi-memory-"));

function repo(dir: string, remote?: string) {
	mkdirSync(dir, { recursive: true });
	sh(dir, "init", "-q", "-b", "main");
	sh(dir, "config", "user.email", "t@example.com");
	sh(dir, "config", "user.name", "t");
	if (remote) sh(dir, "remote", "add", "origin", remote);
}

/** A vault in a fresh git repo with the embedder switched off, configured through real config files. */
async function setup() {
	const base = tmp();
	const root = join(base, "vault");
	const agentDir = join(base, "agent");
	repo(root);
	writeFileSync(join(root, "human.md"), "# mine\n");
	sh(root, "add", "human.md");
	sh(root, "commit", "-qm", "init");
	mkdirSync(join(agentDir, "rackrot"), { recursive: true });
	writeFileSync(
		join(agentDir, "rackrot", "config.json"),
		JSON.stringify({ memory: { root, embedding: { provider: "none" } } }),
	);
	const cfg = loadConfig(base, agentDir) as ConfiguredConfig;
	const notes: string[] = [];
	const m = await createMemory(cfg, base, { agentDir, notify: (msg) => notes.push(msg) });
	return { m, root, notes, base };
}

const note = (over: Partial<WriteParams> = {}): WriteParams => ({
	title: "Deploy uses blue green",
	type: "decision",
	body: "We deploy with a blue green switch behind the load balancer.",
	scope: "global",
	...over,
});

test("write indexes the note and commits only the paths it wrote", async () => {
	const { m, root } = await setup();
	writeFileSync(join(root, "human.md"), "# mine, edited in Obsidian\n");
	writeFileSync(join(root, "draft.md"), "untracked human file\n");

	memoryWrite(m, note());
	assert.match(
		await memorySearch(m, { query: "blue green deploy", scope: "global" }),
		/Agent\/Deploy uses blue green\.md/,
	);

	await m.sync.commit();
	assert.equal(
		sh(root, "show", "--name-only", "--format=%s", "HEAD").trim(),
		"memory(global): add Deploy uses blue green\n\nAgent/Deploy uses blue green.md",
	);
	const status = sh(root, "status", "--porcelain");
	assert.match(status, /M human\.md/);
	assert.match(status, /\?\? draft\.md/);
});

test("stale-write guard and vault boundaries", async () => {
	const { m, root } = await setup();
	memoryWrite(m, note());
	const file = join(root, "Agent", "Deploy uses blue green.md");

	memoryWrite(m, note({ body: "Updated after our own write." }));
	writeFileSync(file, `${readFileSync(file, "utf8")}\nhuman addition\n`);
	assert.throws(() => memoryWrite(m, note({ body: "overwrite" })), /changed on disk/);
	memoryRead(m, "Agent/Deploy uses blue green.md");
	memoryWrite(m, note({ body: "merged with the human addition" }));

	m.hashes.clear();
	assert.throws(() => memoryWrite(m, note()), /not read in this session/);

	assert.throws(() => memoryRead(m, "../outside.md"), /outside the vault/);
	assert.throws(() => memoryRead(m, ".git/config"), /off limits/);
	// A title cannot climb out of the agent folder: separators are flattened into the file name.
	memoryWrite(m, note({ title: "../../escape", body: "different words entirely here" }));
	assert.ok(existsSync(join(root, "Agent", "escape.md")));
	assert.ok(!existsSync(join(root, "..", "escape.md")));
});

test("duplicates and secrets are refused", async () => {
	const { m } = await setup();
	memoryWrite(m, note());
	assert.throws(() => memoryWrite(m, note({ title: "Blue green deploys" })), /near-duplicate/);
	assert.throws(
		() =>
			memoryWrite(
				m,
				note({ title: "Cloud access", type: "fact", body: "key AKIAIOSFODNN7EXAMPLE works" }),
			),
		/secret \(AWS access key\)/,
	);
});

test("pull conflict aborts the rebase and disables sync", async () => {
	const base = tmp();
	const bare = join(base, "remote.git");
	mkdirSync(bare);
	sh(bare, "init", "-q", "--bare", "-b", "main");
	const clone = (name: string) => {
		const dir = join(base, name);
		repo(dir, bare);
		return dir;
	};
	const a = clone("a");
	writeFileSync(join(a, "Note.md"), "base\n");
	sh(a, "add", "Note.md");
	sh(a, "commit", "-qm", "base");
	sh(a, "push", "-q", "-u", "origin", "main");
	const b = clone("b");
	sh(b, "pull", "-q", "origin", "main");
	sh(b, "branch", "-q", "--set-upstream-to=origin/main", "main");

	writeFileSync(join(a, "Note.md"), "from a\n");
	sh(a, "commit", "-qam", "a");
	sh(a, "push", "-q");
	writeFileSync(join(b, "Note.md"), "from b\n");
	sh(b, "commit", "-qam", "b");
	const head = sh(b, "rev-parse", "HEAD");

	const notes: string[] = [];
	const sync = await GitSync.open(b, {
		notify: (m) => notes.push(m),
		commitIntervalMinutes: 0,
		push: true,
	});
	assert.equal(await sync.pull(), false);
	assert.ok(sync.disabled);
	assert.equal(notes.length, 1);
	assert.equal(sh(b, "rev-parse", "HEAD"), head);
	assert.ok(!existsSync(join(b, ".git", "rebase-merge")));
	assert.equal(sh(b, "status", "--porcelain").trim(), "");
	assert.match(await sync.syncNow(), /disabled/);
});

test("project Overview index follows writes and archives, keeps prose, and commit says add/update", async () => {
	const { m, root } = await setup();
	const subject = () => sh(root, "log", "-1", "--format=%s").trim();
	const overview = join(root, "Agent", "Projects", m.project.slug, "Overview.md");
	const p = (over: Partial<WriteParams>) => note({ scope: "project", ...over });

	memoryWrite(m, p({ title: "Use pnpm", body: "Package manager is pnpm." }));
	await m.sync.commit();
	assert.match(subject(), /^memory\(.+\): add Use pnpm$/);
	assert.match(
		readFileSync(overview, "utf8"),
		/### Decisions\n- \[\[Use pnpm\]\] — Package manager is pnpm\./,
	);

	// The agent writes prose above the block; the next index rebuild must neither refuse nor drop it.
	const text = memoryRead(m, `Agent/Projects/${m.project.slug}/Overview.md`);
	memoryWrite(
		m,
		p({
			title: "x",
			type: "overview",
			body: `Hand-written summary.\n\n${text.slice(text.indexOf("<!--"))}`,
		}),
	);
	memoryWrite(
		m,
		p({ title: "Release flow", type: "fact", body: "Releases come from release-please." }),
	);
	memoryWrite(m, p({ title: "Use pnpm", body: "Package manager is pnpm 10." }));
	await m.sync.commit();
	let file = readFileSync(overview, "utf8");
	assert.match(file, /Hand-written summary\.\n\n<!-- memory:index:start -->/);
	assert.match(file, /### Other\n- \[\[Release flow\]\]/);
	assert.match(subject(), /add Release flow; update Use pnpm/);

	memoryArchive(m, `Agent/Projects/${m.project.slug}/Decisions/Use pnpm.md`);
	await m.sync.commit();
	file = readFileSync(overview, "utf8");
	assert.ok(!file.includes("Use pnpm"));
	assert.match(file, /Hand-written summary\./);
	assert.match(subject(), /archive Use pnpm/);
});

/** A project with `n` notes written, so Overview.md exists and counts `n` changes. */
async function projectWith(n: number) {
	const s = await setup();
	for (let i = 0; i < n; i++)
		memoryWrite(
			s.m,
			note({
				scope: "project",
				title: `Fact ${i}`,
				type: "fact",
				body: `Distinct statement number ${i} about ${["deploy pipeline releases", "database schema migrations", "frontend rendering cache"][i]}.`,
			}),
		);
	const rel = `Agent/Projects/${s.m.project.slug}/Overview.md`;
	return { ...s, rel, abs: join(s.root, rel) };
}

test("summary worker rewrites prose only, resets the counter, and rejects unsafe output", async () => {
	const { m, abs, rel } = await projectWith(3);
	const before = readFileSync(abs, "utf8");
	const block = before.slice(
		before.indexOf(INDEX_START),
		before.indexOf(INDEX_END) + INDEX_END.length,
	);
	assert.match(before, /summary-changes: 3/);
	m.sync.dirty.clear();

	for (const bad of ["Key AKIAABCDEFGHIJKLMNOP leaked", `x ${INDEX_START} y`]) {
		assert.match(await summarizeProject(m, async () => bad, { force: true }), /^rejected/);
		assert.equal(readFileSync(abs, "utf8"), before);
	}
	assert.equal(m.sync.dirty.size, 0);

	let prompt = "";
	const result = await summarizeProject(
		m,
		async (_s, p) => ((prompt = p), "# Widget\n\nA widget service. See [[Fact 0]]."),
	);
	assert.equal(result, "summary refreshed");
	assert.match(prompt, /Distinct statement number 2/);
	const after = readFileSync(abs, "utf8");
	assert.ok(after.includes(block));
	assert.match(
		after,
		/# Widget\n\nA widget service\. See \[\[Fact 0\]\]\.\n\n<!-- memory:index:start -->/,
	);
	assert.match(after, /summary-changes: 0/);
	assert.match(after, /summarized: \d{4}-/);
	assert.match(after, /type: overview/);
	assert.ok(m.sync.dirty.has(rel));
});

test("summary worker skips below minChanges and after a human edit", async () => {
	const never = async () => {
		throw new Error("model must not be called");
	};
	const few = await projectWith(2);
	assert.match(await summarizeProject(few.m, never), /^skipped: 2 change/);

	const edited = await projectWith(3);
	writeFileSync(edited.abs, `${readFileSync(edited.abs, "utf8")}\nHuman addition\n`);
	assert.match(await summarizeProject(edited.m, never), /^skipped: .*edited/);
	assert.match(readFileSync(edited.abs, "utf8"), /Human addition/);
});

test("init commits only its own files, leaves user notes untracked, and is idempotent", async () => {
	const root = join(tmp(), "Vault");
	mkdirSync(join(root, ".obsidian"), { recursive: true });
	writeFileSync(join(root, "human.md"), "# mine\n");
	writeFileSync(join(root, ".obsidian", "app.json"), "{}");
	const cfg = { root, agentDir: "Agent", projects: "Projects" } as ConfiguredConfig;
	const env = { GIT_CONFIG_GLOBAL: join(tmp(), "gitconfig") };
	Object.assign(process.env, env);
	execFileSync("git", ["config", "-f", env.GIT_CONFIG_GLOBAL, "user.name", "t"]);
	execFileSync("git", ["config", "-f", env.GIT_CONFIG_GLOBAL, "user.email", "t@example.com"]);

	const first = await setupVault(cfg, { init: true });
	assert.ok(first.done.includes("git init"));
	assert.ok(existsSync(join(root, "Agent", "Projects")));
	assert.match(readFileSync(join(root, ".gitignore"), "utf8"), /\.trash\//);
	assert.equal(sh(root, "log", "--format=%s").trim(), "memory: initialize agent folder");
	assert.deepEqual(sh(root, "ls-files").trim().split("\n").sort(), [
		".gitattributes",
		".gitignore",
	]);
	assert.match(sh(root, "status", "--porcelain"), /\?\? human\.md/);
	assert.match((await nextSteps(cfg)).join("\n"), /remote add origin/);

	await setupVault(cfg, { init: true });
	assert.equal(sh(root, "rev-list", "--count", "HEAD").trim(), "1");
	sh(root, "remote", "add", "origin", join(tmp(), "none.git"));
	assert.match((await nextSteps(cfg)).join("\n"), /push -u origin main/);
});
