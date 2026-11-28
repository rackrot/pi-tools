import { mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
	type Embedder,
	ftsQuery,
	fuse,
	nearestIds,
	type Reranker,
	toBlob,
} from "@rackrot/pi-core/retrieval";
import { hashText, parseNote } from "./note.ts";
import { walkMarkdown } from "./vault.ts";

export interface NoteRow {
	id: number;
	path: string;
	title: string;
	body: string;
}

/** Candidates taken from each of BM25 and vector search before fusion and scope filtering. */
const POOL = 200;
const RERANK_POOL = 20;
const BODY_CHARS = 1500;
const BATCH = 16;

/** Text that represents a note to the embedder and reranker. */
export const noteText = (n: NoteRow) => `${n.title}\n${n.body.slice(0, BODY_CHARS)}`;

/**
 * Every markdown file of one vault with FTS5 and embeddings, keyed by vault-relative path. Lives
 * outside the vault (never in git) and is rebuilt from the files, so it is safe to delete. It
 * follows the shape of skill-index's SkillDb.
 */
export class VaultIndex {
	readonly #db: DatabaseSync;
	readonly root: string;

	constructor(path: string, root: string) {
		this.root = root;
		if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
		this.#db = new DatabaseSync(path);
		this.#db.exec(`
			PRAGMA journal_mode = WAL;
			PRAGMA busy_timeout = 5000;
			CREATE TABLE IF NOT EXISTS meta (root TEXT NOT NULL);
			CREATE TABLE IF NOT EXISTS notes (
				id INTEGER PRIMARY KEY,
				path TEXT NOT NULL UNIQUE,
				title TEXT NOT NULL,
				body TEXT NOT NULL,
				mtime_ms REAL NOT NULL,
				content_hash TEXT NOT NULL,
				embedding BLOB,
				embed_model TEXT
			);
			CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
				title, frontmatter, body, tokenize = 'porter unicode61'
			);
		`);
		// Paths are relative, so an index built for another vault is meaningless here.
		const meta = this.#db.prepare("SELECT root FROM meta").get() as { root: string } | undefined;
		if (meta?.root !== root) {
			this.#db.exec("DELETE FROM notes; DELETE FROM notes_fts; DELETE FROM meta");
			this.#db.prepare("INSERT INTO meta (root) VALUES (?)").run(root);
		}
	}

	close() {
		this.#db.close();
	}

	/** Brings the index in line with the files: new or changed (mtime, then hash) are re-read, missing are dropped. */
	sync() {
		const files = walkMarkdown(this.root);
		const seen = new Set(files);
		for (const f of files) this.indexFile(f);
		for (const r of this.#db.prepare("SELECT path FROM notes").all() as { path: string }[])
			if (!seen.has(r.path)) this.remove(r.path);
	}

	/** Indexes one file. An unchanged mtime or hash keeps the existing row and embedding. */
	indexFile(rel: string) {
		const abs = join(this.root, rel);
		const mtime = statSync(abs).mtimeMs;
		const row = this.#db
			.prepare("SELECT mtime_ms, content_hash FROM notes WHERE path = ?")
			.get(rel) as { mtime_ms: number; content_hash: string } | undefined;
		if (row?.mtime_ms === mtime) return;
		const text = readFileSync(abs, "utf8");
		const hash = hashText(text);
		if (row?.content_hash === hash) {
			this.#db.prepare("UPDATE notes SET mtime_ms = ? WHERE path = ?").run(mtime, rel);
			return;
		}
		const { fmText, body } = parseNote(text);
		const title = rel.split("/").at(-1)?.replace(/\.md$/, "") ?? rel;
		const { id } = this.#db
			.prepare(`
				INSERT INTO notes (path, title, body, mtime_ms, content_hash) VALUES (?, ?, ?, ?, ?)
				ON CONFLICT (path) DO UPDATE SET title = excluded.title, body = excluded.body,
					mtime_ms = excluded.mtime_ms, content_hash = excluded.content_hash,
					embedding = NULL, embed_model = NULL
				RETURNING id`)
			.get(rel, title, body, mtime, hash) as { id: number };
		this.#db.prepare("DELETE FROM notes_fts WHERE rowid = ?").run(id);
		this.#db
			.prepare("INSERT INTO notes_fts (rowid, title, frontmatter, body) VALUES (?, ?, ?, ?)")
			.run(id, title, fmText, body);
	}

	remove(rel: string) {
		const r = this.#db.prepare("SELECT id FROM notes WHERE path = ?").get(rel) as
			| { id: number }
			| undefined;
		if (!r) return;
		this.#db.prepare("DELETE FROM notes WHERE id = ?").run(r.id);
		this.#db.prepare("DELETE FROM notes_fts WHERE rowid = ?").run(r.id);
	}

	/** Notes whose embedding is missing or from another model. */
	pending(model: string, limit: number): NoteRow[] {
		return this.#rows(
			"SELECT * FROM notes WHERE embedding IS NULL OR embed_model IS NOT ? LIMIT ?",
			[model, limit],
		);
	}

	setEmbedding(id: number, model: string, vector: number[]) {
		this.#db
			.prepare("UPDATE notes SET embedding = ?, embed_model = ? WHERE id = ?")
			.run(toBlob(vector), model, id);
	}

	/** FTS5 BM25 over title, frontmatter and body (title weighted highest), best first. */
	bm25(query: string, accept: (path: string) => boolean, limit: number): NoteRow[] {
		if (!query) return [];
		return this.#rows(
			`SELECT n.* FROM notes_fts f JOIN notes n ON n.id = f.rowid
			 WHERE notes_fts MATCH ? ORDER BY bm25(notes_fts, 10.0, 3.0, 1.0) LIMIT ?`,
			[query, POOL],
		)
			.filter((n) => accept(n.path))
			.slice(0, limit);
	}

	/** Notes nearest to the (normalised) query vector, best first. */
	nearest(
		model: string,
		query: number[],
		accept: (path: string) => boolean,
		limit: number,
	): NoteRow[] {
		const rows = (
			this.#db
				.prepare("SELECT id, path, embedding FROM notes WHERE embed_model = ?")
				.all(model) as {
				id: number;
				path: string;
				embedding: Uint8Array;
			}[]
		).filter((r) => accept(r.path));
		return nearestIds(rows, query, limit).flatMap((id) =>
			this.#rows("SELECT * FROM notes WHERE id = ?", [id]),
		);
	}

	#rows(sql: string, params: (string | number | null)[]): NoteRow[] {
		return (this.#db.prepare(sql).all(...params) as Record<string, unknown>[]).map((r) => ({
			id: r.id as number,
			path: r.path as string,
			title: r.title as string,
			body: r.body as string,
		}));
	}
}

export interface Retrieval {
	index: VaultIndex;
	embedder?: Embedder;
	reranker?: Reranker;
}

/** Embeds every note that lacks a vector for this model. Throws on the first failure. */
export async function embedPending(index: VaultIndex, embedder: Embedder): Promise<void> {
	for (;;) {
		const batch = index.pending(embedder.id, BATCH);
		if (!batch.length) return;
		const vectors = await embedder.embed(batch.map(noteText));
		batch.forEach((n, i) => index.setEmbedding(n.id, embedder.id, vectors[i]));
	}
}

/**
 * BM25 and vector search, fused, then reranked when configured. A failing stage is skipped
 * (and reported in `errors`) so the search still answers.
 */
export async function searchNotes(
	r: Retrieval,
	query: string,
	accept: (path: string) => boolean,
	limit: number,
): Promise<{ notes: NoteRow[]; errors: string[] }> {
	const errors: string[] = [];
	const lists = [r.index.bm25(ftsQuery(query), accept, POOL)];
	if (r.embedder) {
		try {
			const [q] = await r.embedder.embed([query]);
			lists.push(r.index.nearest(r.embedder.id, q, accept, POOL));
		} catch (e) {
			errors.push(`embedding: ${(e as Error).message}`);
		}
	}
	let notes = fuse(lists, (a, b) => a.path.localeCompare(b.path)).slice(0, RERANK_POOL);
	if (r.reranker && notes.length > 1) {
		try {
			const scores = await r.reranker.rerank(query, notes.map(noteText));
			notes = notes
				.map((n, i) => ({ n, score: scores[i] }))
				.sort((a, b) => b.score - a.score)
				.map((x) => x.n);
		} catch (e) {
			errors.push(`reranker: ${(e as Error).message}`);
		}
	}
	return { notes: notes.slice(0, limit), errors };
}
