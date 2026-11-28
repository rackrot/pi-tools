import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { basename, isAbsolute, join, posix, relative, resolve, sep } from "node:path";
import type { MemoryConfig } from "./config.ts";
import { git } from "./git.ts";
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
