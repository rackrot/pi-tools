import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

/** A skill as stored: pi's listing plus its SKILL.md body. */
export interface SkillRow {
	filePath: string;
	name: string;
	description: string;
	body: string;
}

/** Where a session looks: global skills plus the skills of one project. */
export interface Scope {
	projectRoot: string;
}

export interface Stored extends SkillRow {
	id: number;
}

const hash = (s: SkillRow) =>
	createHash("sha256").update(`${s.name}\0${s.description}\0${s.body}`).digest("hex");

const toBlob = (v: number[]) => Buffer.from(new Float32Array(v).buffer);
const fromBlob = (b: Uint8Array) => new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4);

/**
 * Every skill with its body, FTS5 index and embedding. Rows are tagged `global` or
 * `project` (with the project root), and every read filters on that so a session never sees
 * another project's skills.
 */
export class SkillDb {
	readonly #db: DatabaseSync;

	constructor(path: string) {
		if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
		this.#db = new DatabaseSync(path);
		this.#db.exec(`
			PRAGMA journal_mode = WAL;
			PRAGMA busy_timeout = 5000;
			CREATE TABLE IF NOT EXISTS skills (
				id INTEGER PRIMARY KEY,
				file_path TEXT NOT NULL UNIQUE,
				name TEXT NOT NULL,
				description TEXT NOT NULL,
				body TEXT NOT NULL,
				scope TEXT NOT NULL CHECK (scope IN ('global', 'project')),
				project_root TEXT,
				content_hash TEXT NOT NULL,
				embedding BLOB,
				embed_model TEXT
			);
			CREATE VIRTUAL TABLE IF NOT EXISTS skills_fts USING fts5(
				name, description, body, tokenize = 'porter unicode61'
			);
		`);
	}

	close() {
		this.#db.close();
	}

	/**
	 * Inserts or updates skills of one scope. A changed hash clears the embedding. Rows are never
	 * removed here: a session that sees fewer skills (a subagent with a skill list) must not
	 * delete what others see. Use `prune` for that.
	 */
	sync(scope: "global" | "project", projectRoot: string | null, skills: SkillRow[]) {
		const db = this.#db;
		const root = scope === "project" ? projectRoot : null;
		const existing = db.prepare(
			"SELECT file_path, content_hash FROM skills WHERE scope = ? AND project_root IS ?",
		);
		const have = new Map(
			(existing.all(scope, root) as { file_path: string; content_hash: string }[]).map((r) => [
				r.file_path,
				r.content_hash,
			]),
		);
		const upsert = db.prepare(`
			INSERT INTO skills (file_path, name, description, body, scope, project_root, content_hash)
			VALUES (?, ?, ?, ?, ?, ?, ?)
			ON CONFLICT (file_path) DO UPDATE SET name = excluded.name, description = excluded.description,
				body = excluded.body, scope = excluded.scope, project_root = excluded.project_root,
				content_hash = excluded.content_hash, embedding = NULL, embed_model = NULL
			RETURNING id`);
		const delFts = db.prepare("DELETE FROM skills_fts WHERE rowid = ?");
		const insFts = db.prepare(
			"INSERT INTO skills_fts (rowid, name, description, body) VALUES (?, ?, ?, ?)",
		);

		db.exec("BEGIN");
		try {
			for (const s of skills) {
				const h = hash(s);
				if (have.get(s.filePath) === h) continue;
				const { id } = upsert.get(s.filePath, s.name, s.description, s.body, scope, root, h) as {
					id: number;
				};
				delFts.run(id);
				insFts.run(id, s.name, s.description, s.body);
			}
			db.exec("COMMIT");
		} catch (e) {
			db.exec("ROLLBACK");
			throw e;
		}
	}

	/** Deletes rows whose SKILL.md `exists` no longer finds. */
	prune(exists: (filePath: string) => boolean) {
		const rows = this.#db.prepare("SELECT id, file_path FROM skills").all() as {
			id: number;
			file_path: string;
		}[];
		for (const r of rows) {
			if (exists(r.file_path)) continue;
			this.#db.prepare("DELETE FROM skills WHERE id = ?").run(r.id);
			this.#db.prepare("DELETE FROM skills_fts WHERE rowid = ?").run(r.id);
		}
	}

	/** Skills visible from `scope` whose embedding is missing or from another model. */
	pendingEmbeddings(scope: Scope, model: string): Stored[] {
		return this.#rows(
			`SELECT * FROM skills WHERE ${VISIBLE} AND (embedding IS NULL OR embed_model IS NOT ?)`,
			[scope.projectRoot, model],
		);
	}

	setEmbedding(id: number, model: string, vector: number[]) {
		this.#db
			.prepare("UPDATE skills SET embedding = ?, embed_model = ? WHERE id = ?")
			.run(toBlob(vector), model, id);
	}

	/** FTS5 BM25 over name, description and body (name weighted highest), best first. */
	bm25(scope: Scope, ftsQuery: string, limit: number): Stored[] {
		if (!ftsQuery) return [];
		return this.#rows(
			`SELECT s.* FROM skills_fts f JOIN skills s ON s.id = f.rowid
			 WHERE skills_fts MATCH ? AND (s.scope = 'global' OR s.project_root = ?)
			 ORDER BY bm25(skills_fts, 10.0, 3.0, 1.0) LIMIT ?`,
			[ftsQuery, scope.projectRoot, limit],
		);
	}

	/** Cosine similarity of the query vector (assumed normalised) against stored embeddings, best first. */
	nearest(scope: Scope, model: string, query: number[], limit: number): Stored[] {
		const rows = this.#db
			.prepare(`SELECT id, embedding FROM skills WHERE ${VISIBLE} AND embed_model = ?`)
			.all(scope.projectRoot, model) as { id: number; embedding: Uint8Array }[];
		const scored = rows.map((r) => {
			const v = fromBlob(r.embedding);
			let dot = 0;
			for (let i = 0; i < v.length; i++) dot += v[i] * query[i];
			return { id: r.id, dot };
		});
		scored.sort((a, b) => b.dot - a.dot);
		return scored
			.slice(0, limit)
			.flatMap((s) => this.#rows("SELECT * FROM skills WHERE id = ?", [s.id]));
	}

	#rows(sql: string, params: (string | number | null)[]): Stored[] {
		return (this.#db.prepare(sql).all(...params) as Record<string, unknown>[]).map((r) => ({
			id: r.id as number,
			filePath: r.file_path as string,
			name: r.name as string,
			description: r.description as string,
			body: r.body as string,
		}));
	}
}

const VISIBLE = "(scope = 'global' OR project_root = ?)";
