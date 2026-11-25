/**
 * Imports skills and their evals from a claude-plugins checkout.
 *
 *   node scripts/import.ts --src ~/Projects/adminhead/claude-plugins [--dry-run] [--force] [--evals-only]
 *
 * Skills already installed in ~/.agents/skills (by name or by a known renamed equivalent) and skills
 * that only make sense inside Claude Code are skipped. The rest are copied with Claude Code-only
 * frontmatter removed. Evals are copied unchanged; the harness in packages/skill-evals reads them as is.
 * Writes MIGRATION.md listing what was skipped and which imported skills still mention Claude Code.
 */
import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkg = resolve(here, "..");

const args = process.argv.slice(2);
const flag = (n: string) => args.includes(n);
const opt = (n: string) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const src = resolve(opt("--src") ?? join(homedir(), "Projects/adminhead/claude-plugins"));
const dryRun = flag("--dry-run");
const evalsOnly = flag("--evals-only");

/** Skills in ~/.agents/skills that cover the same ground under another name. */
const INSTALLED_EQUIVALENT: Record<string, string> = {
	coding: "efficient-coding",
	planning: "efficient-planning",
	"unit-testing": "efficient-testing",
	"e2e-testing": "efficient-e2e-testing",
	python: "efficient-python",
	golang: "efficient-golang",
	rust: "efficient-rust",
	typescript: "efficient-typescript",
	react: "efficient-react",
	research: "efficient-research",
	postgres: "efficient-postgres",
	"db-schema-design": "efficient-database-design",
	"web-development": "efficient-web-development",
	"web-design": "efficient-web-design",
	tanstack: "efficient-tanstack",
	javascript: "efficient-javascript",
	fastapi: "efficient-fastapi",
	"python-packaging": "efficient-python-packaging",
	"app-auth": "efficient-auth",
	chezmoi: "chezmoi-skill",
	"pass-cli": "pass-cli-skill",
	dependabot: "github-dependabot",
	"gh-actions": "github-actions",
	"agent-instructions": "manage-agents-md",
};

/** Skills that depend on Claude Code itself (its config, plugins, sessions, MCP tools, built-in commands, forked agents). */
const CLAUDE_CODE_ONLY: Record<string, string> = {
	"recommend-plugins": "installs adminhead marketplace plugins",
	"config-audit": "audits a Claude Code install",
	"agent-config-audit": "audits Claude Code configuration",
	"session-retro": "reads Claude Code session transcripts",
	"session-recover": "recovers Claude Code session transcripts",
	"plan-ledger": "needs the plan-ledger MCP tool",
	"second-opinion": "needs the consult MCP tool",
	"review-loop": "wraps Claude Code's built-in /code-review",
	"godot-mcp-setup": "configures Claude Code's .mcp.json",
	vet: "adds items to the adminhead marketplace",
	ship: "forks into the shipper agent (context: fork); redo once a shipper agent exists",
	"forgejo-ship": "forks into the forgejo-shipper agent; redo once a shipper agent exists",
};

/** Frontmatter keys that only Claude Code understands. */
const DROP_KEYS = new Set(["argument-hint", "allowed-tools", "context", "agent", "background"]);

const CC_PATTERN =
	/(mcp__|`Skill`|Skill tool|`Agent`|Agent tool|Task tool|TodoWrite|AskUserQuestion|CLAUDE\.md|\.claude\/|claude plugin|\/code-review|CLAUDE_PLUGIN|CLAUDE_SESSION|claude --|Claude Code|\$ARGUMENTS|subagent_type|SendMessage)/g;

const installedDir = join(homedir(), ".agents", "skills");
const installed = new Set(existsSync(installedDir) ? readdirSync(installedDir) : []);

const isDir = (p: string) => existsSync(p) && statSync(p).isDirectory();
const ls = (p: string) => (isDir(p) ? readdirSync(p) : []);

/** Removes top-level frontmatter keys (and their continuation lines) in DROP_KEYS. Everything else is untouched. */
export function stripFrontmatter(text: string): string {
	const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text);
	if (!m) return text;
	const out: string[] = [];
	let dropping = false;
	for (const line of m[1].split(/\r?\n/)) {
		const key = /^([A-Za-z_-]+):/.exec(line)?.[1];
		if (key) dropping = DROP_KEYS.has(key);
		else if (!/^\s/.test(line) && line.trim()) dropping = false;
		if (!dropping) out.push(line);
	}
	return `---\n${out.join("\n")}\n---\n${text.slice(m[0].length)}`;
}

/** Rewrites Claude Code path variables and argument placeholders. */
export function rewriteBody(text: string, skill: string): string {
	return text
		.replaceAll(`\${CLAUDE_PLUGIN_ROOT}/skills/${skill}/`, "")
		.replaceAll(`\${CLAUDE_PLUGIN_ROOT}/skills/${skill}`, ".")
		.replaceAll("${CLAUDE_SKILL_DIR}/", "")
		.replaceAll("${CLAUDE_SKILL_DIR}", ".")
		.replaceAll("$ARGUMENTS", "the arguments given with the command");
}

function ccMentions(dir: string): number {
	let n = 0;
	for (const f of readdirSync(dir, { recursive: true, encoding: "utf8" })) {
		if (!/\.(md|sh|py|mjs|js|ts|json|yaml|yml)$/.test(f)) continue;
		const p = join(dir, f);
		if (statSync(p).isFile()) n += (readFileSync(p, "utf8").match(CC_PATTERN) ?? []).length;
	}
	return n;
}

interface Row {
	skill: string;
	plugin: string;
	status: "imported" | "installed" | "claude-code-only";
	note: string;
	evals: number;
	cc: number;
}

const rows: Row[] = [];
const dstSkills = join(pkg, "skills");
const dstEvals = join(pkg, "evals");
const notices: string[] = [];

if (!dryRun && !evalsOnly && existsSync(dstSkills) && !flag("--force")) {
	console.error(
		"skills/ already exists. Imported skills have been edited by hand; pass --force to overwrite them.",
	);
	process.exit(1);
}

if (!dryRun) {
	if (!evalsOnly) {
		rmSync(dstSkills, { recursive: true, force: true });
		mkdirSync(dstSkills, { recursive: true });
	}
	rmSync(dstEvals, { recursive: true, force: true });
	mkdirSync(dstEvals, { recursive: true });
}

const importedSkills = new Set<string>();

for (const plugin of ls(join(src, "plugins")).sort()) {
	const pluginDir = join(src, "plugins", plugin);
	const skillNames = ls(join(pluginDir, "skills")).filter((s) =>
		existsSync(join(pluginDir, "skills", s, "SKILL.md")),
	);
	for (const skill of skillNames) {
		const from = join(pluginDir, "skills", skill);
		const evalsFrom = join(pluginDir, "evals");
		const evalCount = ls(evalsFrom).filter(
			(c) => c !== "results" && isDir(join(evalsFrom, c)),
		).length;
		const row: Row = { skill, plugin, status: "imported", note: "", evals: evalCount, cc: 0 };
		const equivalent = INSTALLED_EQUIVALENT[skill];
		if (installed.has(skill)) {
			Object.assign(row, { status: "installed", note: `~/.agents/skills/${skill}` });
		} else if (equivalent && installed.has(equivalent)) {
			Object.assign(row, { status: "installed", note: `~/.agents/skills/${equivalent}` });
		} else if (CLAUDE_CODE_ONLY[skill]) {
			Object.assign(row, { status: "claude-code-only", note: CLAUDE_CODE_ONLY[skill] });
		}
		if (row.status === "imported") {
			const to = join(dstSkills, skill);
			if (!dryRun) {
				cpSync(from, to, { recursive: true });
				const md = join(to, "SKILL.md");
				writeFileSync(md, rewriteBody(stripFrontmatter(readFileSync(md, "utf8")), skill));
				for (const f of ["LICENSE", "NOTICE"]) {
					if (existsSync(join(pluginDir, f))) cpSync(join(pluginDir, f), join(to, f));
				}
				if (existsSync(join(pluginDir, "NOTICE")))
					notices.push(
						`## ${skill}\n\n${readFileSync(join(pluginDir, "NOTICE"), "utf8").trim()}\n`,
					);
				// Evals sit beside the plugin's skills, not inside them.
				if (evalCount) {
					const dest = join(dstEvals, skillNames.length === 1 ? skill : plugin);
					mkdirSync(dest, { recursive: true });
					for (const c of ls(evalsFrom)) {
						if (c !== "results" && isDir(join(evalsFrom, c)))
							cpSync(join(evalsFrom, c), join(dest, c), { recursive: true });
					}
				}
				row.cc = ccMentions(to);
			}
			importedSkills.add(skill);
		}
		rows.push(row);
	}
}

// Cross-plugin suites: keep those whose skills were all imported.
const suites: string[] = [];
for (const suite of ls(join(src, "evals"))) {
	const evalsDir = join(src, "evals", suite, "evals");
	if (!isDir(evalsDir)) continue;
	const cases = ls(evalsDir).filter((c) => c !== "results" && isDir(join(evalsDir, c)));
	if (!cases.length) continue;
	const needed = new Set<string>();
	for (const c of cases) {
		const p = join(evalsDir, c, "prompt.md");
		if (!existsSync(p)) continue;
		const line = /^plugins:\s*(.*)$/m.exec(readFileSync(p, "utf8"));
		for (const m of line?.[1].matchAll(/plugins\/([\w-]+)/g) ?? []) needed.add(m[1]);
	}
	const missing = [...needed].filter((n) => !importedSkills.has(n));
	if (missing.length) {
		suites.push(`- ${suite}: not imported (needs ${missing.join(", ")})`);
		continue;
	}
	if (!dryRun) {
		const dest = join(dstEvals, "_suites", suite);
		mkdirSync(dest, { recursive: true });
		for (const c of cases) cpSync(join(evalsDir, c), join(dest, c), { recursive: true });
		if (isDir(join(src, "evals", suite, "fixtures")))
			cpSync(join(src, "evals", suite, "fixtures"), join(dest, "fixtures"), { recursive: true });
	}
	suites.push(`- ${suite}: imported ${cases.length} cases`);
}

const count = (s: Row["status"]) => rows.filter((r) => r.status === s).length;
const report = [
	"# Import report",
	"",
	`Generated by \`scripts/import.ts\` from ${basename(src)}.`,
	"",
	`- imported: ${count("imported")} skills, ${rows.filter((r) => r.status === "imported").reduce((n, r) => n + r.evals, 0)} eval cases`,
	`- skipped, already installed: ${count("installed")}`,
	`- skipped, Claude Code only: ${count("claude-code-only")}`,
	"",
	"## Cross-plugin eval suites",
	"",
	...suites,
	"",
	"## Skipped",
	"",
	...rows
		.filter((r) => r.status !== "imported")
		.map((r) => `- ${r.skill} (${r.status}): ${r.note}`),
	"",
	"## Imported skills that still mention Claude Code",
	"",
	"Count of matches for Claude Code tool names, paths and placeholders. Review and edit by hand; rerunning the import overwrites edits.",
	"",
	...rows
		.filter((r) => r.status === "imported" && r.cc > 0)
		.sort((a, b) => b.cc - a.cc)
		.map((r) => `- ${r.skill}: ${r.cc}`),
	"",
].join("\n");

console.log(report);
if (!dryRun && !evalsOnly) {
	writeFileSync(join(pkg, "MIGRATION.md"), report);
	writeFileSync(
		join(pkg, "NOTICE"),
		`Third-party material in the imported skills. Each skill directory also carries its own LICENSE and NOTICE.\n\n${notices.join("\n")}`,
	);
}
