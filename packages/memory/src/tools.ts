import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
	createEmbedder,
	createReranker,
	type Embedder,
	ftsQuery,
	type Reranker,
} from "@rackrot/pi-core/retrieval";
import { Type } from "typebox";
import type { MemoryConfig } from "./config.ts";
import { GitSync, type SyncOptions } from "./git.ts";
import { embedPending, searchNotes, VaultIndex } from "./index-db.ts";
import {
	DUPLICATE_THRESHOLD,
	findSecret,
	hashText,
	type NoteType,
	parseNote,
	safeName,
	serializeNote,
	similarity,
	TYPES,
} from "./note.ts";
import { emptyIndex, refreshIndex } from "./overview.ts";
import {
	agentRel,
	archiveRel,
	type ConfiguredConfig,
	type ProjectInfo,
	projectRel,
	resolveInVault,
	resolveProject,
} from "./vault.ts";

export type Scope = "project" | "global";
export type SearchScope = Scope | "vault" | "all";

/** Everything a session needs: config, the vault index, git sync and the stale-write ledger. */
export interface Memory {
	cfg: ConfiguredConfig;
	project: ProjectInfo;
	index: VaultIndex;
	sync: GitSync;
	/** Content hash of each note as this session last read or wrote it. */
	hashes: Map<string, string>;
	embedder?: Embedder;
	reranker?: Reranker;
	embedError?: string;
	embedding?: Promise<void>;
}

export async function createMemory(
	cfg: ConfiguredConfig,
	cwd: string,
	opts: { agentDir: string; notify: SyncOptions["notify"] },
): Promise<Memory> {
	return {
		cfg,
		project: await resolveProject(cfg, cwd),
		index: new VaultIndex(join(opts.agentDir, "rackrot", "memory", "index.db"), cfg.root),
		sync: await GitSync.open(cfg.root, {
			notify: opts.notify,
			commitIntervalMinutes: cfg.commitIntervalMinutes,
			push: cfg.push === "session",
		}),
		hashes: new Map(),
		embedder: createEmbedder(cfg.embedding),
		reranker: cfg.reranker && createReranker(cfg.reranker),
	};
}

/** Embeds new or changed notes in the background; search is BM25-only for them until done. */
export function kickEmbeddings(m: Memory) {
	if (!m.embedder || m.embedding) return;
	const embedder = m.embedder;
	m.embedError = undefined;
	m.embedding = embedPending(m.index, embedder)
		.catch((e) => {
			m.embedError = (e as Error).message;
		})
		.finally(() => {
			m.embedding = undefined;
		});
}

const isArchived = (m: Memory, path: string) => path.startsWith(`${archiveRel(m.cfg)}/`);

function accepts(m: Memory, scope: SearchScope): (path: string) => boolean {
	const agent = `${agentRel(m.cfg)}/`;
	const projects = `${posix.join(agentRel(m.cfg), m.cfg.projects)}/`;
	const mine = `${projectRel(m.cfg, m.project.slug)}/`;
	const inScope = (p: string) =>
		scope === "all" ||
		(scope === "project" && p.startsWith(mine)) ||
		(scope === "global" && p.startsWith(agent) && !p.startsWith(projects)) ||
		(scope === "vault" && !p.startsWith(agent));
	return (p) => !isArchived(m, p) && inScope(p);
}

function snippet(body: string, query: string): string {
	const text = body.replace(/\s+/g, " ");
	const lower = text.toLowerCase();
	const at = query
		.toLowerCase()
		.split(/[^\p{L}\p{N}]+/u)
		.map((w) => (w.length > 2 ? lower.indexOf(w) : -1))
		.find((i) => i >= 0);
	const start = Math.max(0, (at ?? 0) - 60);
	return `${start ? "..." : ""}${text.slice(start, start + 220)}`;
}

export async function memorySearch(
	m: Memory,
	p: { query: string; scope?: SearchScope; limit?: number },
): Promise<string> {
	m.index.sync();
	const { notes, errors } = await searchNotes(
		m,
		p.query,
		accepts(m, p.scope ?? "all"),
		p.limit ?? 8,
	);
	if (m.embedError) errors.push(`embedding index: ${m.embedError}`);
	const body = notes.length
		? notes.map((n) => `- ${n.title} (${n.path})\n  ${snippet(n.body, p.query)}`).join("\n")
		: `No notes match "${p.query}".`;
	return errors.length
		? `${body}\n\nSearch fell back to partial results:\n${errors.map((e) => `- ${e}`).join("\n")}`
		: body;
}

const MAX_READ = 50_000;

export function memoryRead(m: Memory, path: string): string {
	const { abs, rel } = resolveInVault(
		m.cfg,
		/\.[A-Za-z0-9]+$/.test(path) ? path : `${path}.md`,
		false,
	);
	if (!existsSync(abs)) throw new Error(`No note at ${rel}`);
	const text = readFileSync(abs, "utf8");
	m.hashes.set(rel, hashText(text));
	return text.length > MAX_READ
		? `${text.slice(0, MAX_READ)}\n\n[truncated at ${MAX_READ} characters]`
		: text;
}

const SUBFOLDER: Partial<Record<NoteType, string>> = {
	decision: "Decisions",
	log: "Log",
	handoff: "Handoffs",
};

export interface WriteParams {
	title: string;
	type: NoteType;
	body: string;
	scope: Scope;
	pin?: boolean;
	status?: "open" | "done";
	links?: string[];
}

const label = (m: Memory, scope: Scope) => (scope === "project" ? m.project.slug : "global");

/** Creates the project's Overview.md (recording the remote) the first time project notes are written. */
function ensureOverview(m: Memory) {
	const rel = posix.join(projectRel(m.cfg, m.project.slug), "Overview.md");
	if (existsSync(join(m.cfg.root, rel))) return;
	const now = new Date().toISOString();
	const fm = {
		type: "overview",
		created: now,
		updated: now,
		source: "agent",
		...(m.project.remote && { remote: m.project.remote }),
	};
	mkdirSync(join(m.cfg.root, dirname(rel)), { recursive: true });
	const text = serializeNote(fm, `# ${m.project.slug}\n\n${emptyIndex()}`);
	writeFileSync(join(m.cfg.root, rel), text);
	m.hashes.set(rel, hashText(text));
	m.index.indexFile(rel);
	m.sync.mark(rel, m.project.slug);
}

export function memoryWrite(m: Memory, p: WriteParams): string {
	if (p.type === "overview" && p.scope !== "project")
		throw new Error("overview notes belong to the project scope");
	const name = p.type === "overview" ? "Overview" : safeName(p.title);
	if (!name)
		throw new Error("title is empty after removing characters that are not allowed in file names");
	const dir = p.scope === "project" ? projectRel(m.cfg, m.project.slug) : agentRel(m.cfg);
	const rel = posix.join(dir, p.scope === "project" ? (SUBFOLDER[p.type] ?? "") : "", `${name}.md`);
	const { abs } = resolveInVault(m.cfg, rel, true);

	const secret = findSecret(`${p.title}\n${p.body}`);
	if (secret)
		throw new Error(
			`Refusing to write: the note looks like it contains a secret (${secret}). Remove it and keep only where it is stored.`,
		);

	const now = new Date().toISOString();
	let fm: Record<string, unknown> = { type: p.type, created: now, updated: now, source: "agent" };
	if (existsSync(abs)) {
		const disk = readFileSync(abs, "utf8");
		const seen = m.hashes.get(rel);
		if (seen === undefined)
			throw new Error(
				`${rel} exists but was not read in this session. memory_read it first, then update it.`,
			);
		if (seen !== hashText(disk))
			throw new Error(
				`${rel} changed on disk since you read it (edited by a human?). memory_read it again, then update it.`,
			);
		fm = { ...parseNote(disk).fm, type: p.type, updated: now };
	} else {
		const twin = m.index
			.bm25(
				ftsQuery(`${p.title} ${p.body.slice(0, 200)}`),
				(x) => x.startsWith(`${posix.dirname(rel)}/`) && !isArchived(m, x),
				5,
			)
			.map((n) => ({ n, s: similarity(`${n.title} ${n.body}`, `${p.title} ${p.body}`) }))
			.filter((x) => x.s >= DUPLICATE_THRESHOLD)
			.sort((a, b) => b.s - a.s)[0];
		if (twin)
			throw new Error(
				`Not created: ${twin.n.path} is a near-duplicate (${Math.round(twin.s * 100)}% similar). memory_read it and update it with memory_write using its title, or make the new note distinct.`,
			);
	}
	if (p.pin !== undefined) fm.pin = p.pin;
	const status = p.status ?? (p.type === "handoff" && !fm.status ? "open" : undefined);
	if (status) fm.status = status;

	let body = p.body.trim();
	const missing = (p.links ?? []).filter((l) => !body.includes(`[[${l}]]`));
	if (missing.length) body += `\n\nRelated: ${missing.map((l) => `[[${l}]]`).join(" ")}`;

	if (p.scope === "project") ensureOverview(m);
	mkdirSync(dirname(abs), { recursive: true });
	const text = serializeNote(fm, body);
	writeFileSync(abs, text);
	m.hashes.set(rel, hashText(text));
	m.index.indexFile(rel);
	m.sync.mark(rel, label(m, p.scope));
	if (p.scope === "project") refreshIndex(m);
	kickEmbeddings(m);
	return `Wrote ${rel}`;
}

export function memoryArchive(m: Memory, path: string): string {
	const { abs, rel } = resolveInVault(m.cfg, /\.md$/.test(path) ? path : `${path}.md`, true);
	if (!existsSync(abs)) throw new Error(`No note at ${rel}`);
	const from = rel.slice(agentRel(m.cfg).length + 1);
	let dest = posix.join(archiveRel(m.cfg), from);
	if (existsSync(join(m.cfg.root, dest))) dest = dest.replace(/\.md$/, ` ${Date.now()}.md`);
	mkdirSync(join(m.cfg.root, dirname(dest)), { recursive: true });
	renameSync(abs, join(m.cfg.root, dest));
	m.index.remove(rel);
	m.index.indexFile(dest);
	m.hashes.delete(rel);
	const l = rel.startsWith(`${projectRel(m.cfg, m.project.slug)}/`) ? m.project.slug : "global";
	m.sync.mark(rel, l);
	m.sync.mark(dest, l, true);
	if (l === m.project.slug) refreshIndex(m);
	return `Archived ${rel} to ${dest}`;
}

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }], details: {} });

export function registerTools(pi: ExtensionAPI, get: (cwd: string) => Promise<Memory>) {
	pi.registerTool({
		name: "memory_search",
		label: "Memory Search",
		description:
			"Search long-term memory notes (project, global, human vault). Returns title, path and a snippet.",
		promptSnippet: "Search long-term memory notes",
		parameters: Type.Object({
			query: Type.String({ description: "What you are looking for" }),
			scope: Type.Optional(
				Type.Union(
					[
						Type.Literal("project"),
						Type.Literal("global"),
						Type.Literal("vault"),
						Type.Literal("all"),
					],
					{
						description: "project notes, global agent notes, vault (human notes) or all (default)",
					},
				),
			),
			limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 25 })),
		}),
		async execute(_id, params, _signal, _update, ctx) {
			return text(await memorySearch(await get(ctx.cwd), params));
		},
	});
	pi.registerTool({
		name: "memory_read",
		label: "Memory Read",
		description: "Read a memory note by vault-relative path. Required before updating that note.",
		parameters: Type.Object({
			path: Type.String({ description: "Vault-relative path from memory_search" }),
		}),
		async execute(_id, params, _signal, _update, ctx) {
			return text(memoryRead(await get(ctx.cwd), params.path));
		},
	});
	pi.registerTool({
		name: "memory_write",
		label: "Memory Write",
		description:
			"Create or update a memory note (same title and scope updates it; read it first). Refuses near-duplicates and secrets.",
		promptSnippet: "Write or update long-term memory notes",
		parameters: Type.Object({
			title: Type.String({ description: "Note title; becomes the file name" }),
			type: Type.Union(
				TYPES.map((t) => Type.Literal(t)),
				{ description: "Kind of note" },
			),
			body: Type.String({ description: "Markdown body; link related notes with [[wikilinks]]" }),
			scope: Type.Union([Type.Literal("project"), Type.Literal("global")]),
			pin: Type.Optional(Type.Boolean({ description: "Inject into every session" })),
			status: Type.Optional(
				Type.Union([Type.Literal("open"), Type.Literal("done")], { description: "For handoffs" }),
			),
			links: Type.Optional(Type.Array(Type.String(), { description: "Titles of related notes" })),
		}),
		async execute(_id, params, _signal, _update, ctx) {
			return text(memoryWrite(await get(ctx.cwd), params as WriteParams));
		},
	});
	pi.registerTool({
		name: "memory_archive",
		label: "Memory Archive",
		description: "Move an agent note to the archive (notes are never deleted).",
		parameters: Type.Object({
			path: Type.String({ description: "Vault-relative path under the agent folder" }),
		}),
		async execute(_id, params, _signal, _update, ctx) {
			return text(memoryArchive(await get(ctx.cwd), params.path));
		},
	});
	pi.registerTool({
		name: "memory_sync",
		label: "Memory Sync",
		description: "Commit written notes, pull --rebase and push the vault now.",
		parameters: Type.Object({}),
		async execute(_id, _params, _signal, _update, ctx) {
			const m = await get(ctx.cwd);
			const result = await m.sync.syncNow();
			m.index.sync();
			return text(result);
		},
	});
}
