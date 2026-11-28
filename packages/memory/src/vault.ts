import {
	appendFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	realpathSync,
	statSync,
} from "node:fs";
import { basename, isAbsolute, join, posix, relative, resolve, sep } from "node:path";
import type { MemoryConfig } from "./config.ts";
import { commitPaths, git, gitConfig, gitInit, isRepoRoot } from "./git.ts";
import { parseNote, safeName } from "./note.ts";

export type ConfiguredConfig = MemoryConfig & { root: string };

/** Directories never indexed or walked. */
const SKIP_DIRS = new Set([".obsidian", ".git", ".trash", "node_modules"]);

const GITIGNORE = [
	".obsidian/workspace*.json",
	".obsidian/graph.json",
	".obsidian/cache/",
	".trash/",
	".DS_Store",
];
const GITATTRIBUTES = ["* text=auto eol=lf", "*.md text eol=lf"];

/** True when `child` is `parent` or inside it. */
export function inside(parent: string, child: string): boolean {
	const r = relative(parent, child);
	return r === "" || (r !== ".." && !r.startsWith(`..${sep}`) && !isAbsolute(r));
}

const toPosix = (p: string) => p.split(sep).join("/");

export const agentRel = (cfg: MemoryConfig) => toPosix(cfg.agentDir);
export const archiveRel = (cfg: MemoryConfig) => posix.join(agentRel(cfg), "archive");
export const projectRel = (cfg: MemoryConfig, slug: string) =>
	posix.join(agentRel(cfg), toPosix(cfg.projects), slug);

/**
 * Resolves a vault-relative (or absolute) path to an absolute path plus its vault-relative form.
 * Reads may go anywhere under root except `.git`; writes only under the agent folder, never in
 * `archive`, `.git` or `.obsidian`. Throws otherwise.
 */
export function resolveInVault(cfg: ConfiguredConfig, path: string, write: boolean) {
	const abs = resolve(cfg.root, path);
	if (!inside(cfg.root, abs)) throw new Error(`"${path}" is outside the vault`);
	const rel = toPosix(relative(cfg.root, abs));
	if (rel === ".git" || rel.startsWith(".git/")) throw new Error("the .git folder is off limits");
	if (write) {
		if (!inside(join(cfg.root, agentRel(cfg)), abs) || rel === agentRel(cfg))
			throw new Error(`writes are only allowed under ${agentRel(cfg)}/`);
		if (rel.startsWith(`${archiveRel(cfg)}/`) || rel === archiveRel(cfg))
			throw new Error("the archive is read-only");
	}
	return { abs, rel };
}

/** Why a built-in write/edit of `abs` must be blocked, if it must. */
export function guardReason(cfg: ConfiguredConfig, abs: string): string | undefined {
	if (inside(join(cfg.root, ".git"), abs) || inside(join(cfg.root, ".obsidian"), abs))
		return "memory vault: .git and .obsidian are not for the agent to edit";
	if (inside(join(cfg.root, archiveRel(cfg)), abs))
		return "memory vault: the archive is read-only; use memory_archive to archive notes";
}

/** Vault-relative paths of every .md file under `dir` (relative to `root`), skipping tool folders. */
export function walkMarkdown(root: string, dir = ""): string[] {
	const out: string[] = [];
	const visit = (rel: string) => {
		const abs = join(root, rel);
		if (!existsSync(abs)) return;
		for (const e of readdirSync(abs, { withFileTypes: true })) {
			const child = rel ? `${rel}/${e.name}` : e.name;
			if (e.isDirectory()) {
				if (!SKIP_DIRS.has(e.name)) visit(child);
			} else if (e.isFile() && e.name.endsWith(".md")) out.push(child);
		}
	};
	visit(dir);
	return out;
}

export interface ProjectInfo {
	slug: string;
	/** Normalised remote (no credentials), when the project has an origin. */
	remote?: string;
}

/** `git@host:org/repo.git` and `https://user:tok@host/org/repo` both become `host/org/repo`. */
export const normaliseRemote = (url: string) =>
	url
		.trim()
		.toLowerCase()
		.replace(/^[a-z+]+:\/\//, "")
		.replace(/^[^@/]*@/, "")
		.replace(/:(?!\d+\/)/, "/")
		.replace(/\/+$/, "")
		.replace(/\.git$/, "");

const out = (dir: string, args: string[]) =>
	git(dir, args).then(
		(s) => s.trim(),
		() => "",
	);

/**
 * The project slug: `memory.project`, else the origin repo name, else the git top-level folder,
 * else the cwd folder. If that slug's Overview records a different remote, falls back to `<org>-<repo>`.
 */
export async function resolveProject(cfg: ConfiguredConfig, cwd: string): Promise<ProjectInfo> {
	const raw = await out(cwd, ["remote", "get-url", "origin"]);
	const remote = raw ? normaliseRemote(raw) : undefined;
	const parts = remote?.split("/") ?? [];
	let slug =
		cfg.project ||
		parts.at(-1) ||
		basename((await out(cwd, ["rev-parse", "--show-toplevel"])) || cwd);
	slug = safeName(slug) || "project";
	if (!cfg.project && remote && parts.length >= 3) {
		const overview = join(cfg.root, projectRel(cfg, slug), "Overview.md");
		const known = existsSync(overview)
			? parseNote(readFileSync(overview, "utf8")).fm.remote
			: undefined;
		if (typeof known === "string" && normaliseRemote(known) !== remote)
			slug = safeName(`${parts.at(-2)}-${parts.at(-1)}`);
	}
	return { slug, remote };
}

/** Appends the lines that are missing from a file, never touching existing content. */
function appendMissing(file: string, lines: string[]): string[] {
	const have = existsSync(file) ? readFileSync(file, "utf8") : "";
	const present = new Set(have.split(/\r?\n/).map((l) => l.trim()));
	const add = lines.filter((l) => !present.has(l));
	if (add.length)
		appendFileSync(file, `${have && !have.endsWith("\n") ? "\n" : ""}${add.join("\n")}\n`);
	return add;
}

/** Files `initVault` may create or change at the root, committed by `setupVault`. */
const INIT_FILES = [".gitignore", ".gitattributes"];

/** Creates the agent folder skeleton and appends missing .gitignore / .gitattributes lines. */
export function initVault(cfg: ConfiguredConfig): string[] {
	const done: string[] = [];
	for (const rel of [agentRel(cfg), projectRel(cfg, "").replace(/\/$/, "")]) {
		if (!existsSync(join(cfg.root, rel))) done.push(`created ${rel}/`);
		mkdirSync(join(cfg.root, rel), { recursive: true });
	}
	for (const [file, lines] of [
		[".gitignore", GITIGNORE],
		[".gitattributes", GITATTRIBUTES],
	] as const) {
		const added = appendMissing(join(cfg.root, file), lines);
		if (added.length) done.push(`${file}: added ${added.join(", ")}`);
	}
	return done;
}

export interface RootInfo {
	exists: boolean;
	isDir: boolean;
	/** The root itself has `.obsidian/`. */
	obsidian: boolean;
	/** Subfolders that have `.obsidian/` (a parent of several vaults). */
	childVaults: string[];
	/** Name of the sync service when the real path looks like a cloud-synced folder. */
	cloud?: string;
}

const CLOUD = [
	["iCloud", /Mobile Documents|iCloud/i],
	["Dropbox", /Dropbox/i],
	["OneDrive", /OneDrive/i],
	["Google Drive", /Google ?Drive/i],
] as const;

/** What the configured root looks like, without touching it. */
export function inspectRoot(root: string): RootInfo {
	const info: RootInfo = {
		exists: existsSync(root),
		isDir: false,
		obsidian: false,
		childVaults: [],
	};
	if (!info.exists) return info;
	info.isDir = statSync(root).isDirectory();
	if (!info.isDir) return info;
	info.obsidian = existsSync(join(root, ".obsidian"));
	if (!info.obsidian)
		info.childVaults = readdirSync(root, { withFileTypes: true })
			.filter((e) => e.isDirectory() && existsSync(join(root, e.name, ".obsidian")))
			.map((e) => e.name);
	const real = realpathSync(root);
	info.cloud = CLOUD.find(([, re]) => re.test(real))?.[0];
	return info;
}

/**
 * Prepares the vault: optional `git init -b main`, agent skeleton, ignore lines, and an initial
 * commit of only the files init changed (never the user's notes, never `-A`). Safe to re-run.
 * Returns what was done, plus problems the user must fix themselves.
 */
export async function setupVault(
	cfg: ConfiguredConfig,
	opts: { init: boolean; separateGitDir?: string },
): Promise<{ done: string[]; todo: string[] }> {
	const done: string[] = [];
	const todo: string[] = [];
	mkdirSync(cfg.root, { recursive: true });
	if (opts.init && !(await isRepoRoot(cfg.root))) {
		await gitInit(cfg.root, opts.separateGitDir);
		done.push(
			opts.separateGitDir ? `git init (repository data in ${opts.separateGitDir})` : "git init",
		);
	}
	done.push(...initVault(cfg));
	if (!(await isRepoRoot(cfg.root))) return { done, todo };

	// Files init changed this run; on a repo with no commits yet also those a failed earlier run left.
	const unborn = !(await git(cfg.root, ["rev-parse", "-q", "--verify", "HEAD"]).catch(() => ""));
	const paths = INIT_FILES.filter(
		(f) => done.some((d) => d.startsWith(`${f}:`)) || (unborn && existsSync(join(cfg.root, f))),
	);
	if (
		paths.length &&
		!((await gitConfig(cfg.root, "user.name")) && (await gitConfig(cfg.root, "user.email")))
	) {
		todo.push(
			"git has no user.name/user.email, so the initial commit was skipped. Run:",
			'  git config --global user.name "Your Name"',
			'  git config --global user.email "you@example.com"',
			"then run /memory-init again.",
		);
	} else if (await commitPaths(cfg.root, paths, "memory: initialize agent folder"))
		done.push(`committed ${paths.join(", ")}`);
	return { done, todo };
}

/** "Next steps" lines for the current git state of the root. */
export async function nextSteps(cfg: ConfiguredConfig): Promise<string[]> {
	const q = JSON.stringify(cfg.root);
	if (!(await isRepoRoot(cfg.root)))
		return [
			`${cfg.root} is not a git repo: notes work but are not versioned. Run /memory-init to set it up.`,
		];
	const remotes = (await git(cfg.root, ["remote"]).catch(() => "")).split("\n").filter(Boolean);
	const branch =
		(await git(cfg.root, ["branch", "--show-current"]).catch(() => "")).trim() || "main";
	const upstream = await git(cfg.root, ["rev-parse", "--abbrev-ref", "@{u}"]).then(
		(s) => s.trim(),
		() => "",
	);
	const lines: string[] = [];
	const tail = [
		'`"push": "never"` keeps the vault local; `commitIntervalMinutes` sets the commit timer (0 = only at session end).',
	];
	if (!remotes.length) {
		lines.push(
			"No remote yet. To sync across devices or back up:",
			"  1. Create an EMPTY private repo (Forgejo, GitHub, ...). Vault notes are private data.",
			`  2. git -C ${q} remote add origin <url>`,
			`  3. git -C ${q} push -u origin ${branch}`,
			"Init does not commit your existing notes. Review `git status` and commit what you want in the repo before the first push.",
			"Until then the agent only commits locally; pushes start once an upstream exists.",
		);
	} else if (!upstream) {
		lines.push(
			`Remote "${remotes[0]}" exists but ${branch} has no upstream. Run:`,
			`  git -C ${q} push -u ${remotes[0]} ${branch}`,
			"Review `git status` first: your existing notes are not committed by init.",
		);
	} else {
		lines.push(
			`Sync is active (upstream ${upstream}): pull --rebase at session start and end; commits ${cfg.commitIntervalMinutes ? `every ${cfg.commitIntervalMinutes} min and` : "only"} at session end; ${cfg.push === "session" ? "push at session end" : "no push (push: never)"}.`,
		);
	}
	return [...lines, ...tail];
}
