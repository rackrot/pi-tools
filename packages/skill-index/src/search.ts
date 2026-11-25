import type { Scope, SkillDb, Stored } from "./db.ts";
import type { Embedder, Judge, Reranker } from "./providers.ts";

const STOP = new Set([
	"a",
	"an",
	"and",
	"are",
	"as",
	"at",
	"be",
	"by",
	"for",
	"from",
	"in",
	"is",
	"it",
	"of",
	"on",
	"or",
	"that",
	"the",
	"this",
	"to",
	"use",
	"when",
	"with",
]);

/** Candidates taken from each of BM25 and vector search before fusion. */
const POOL = 50;
/** Fused candidates sent to the reranker and decision model. */
const RERANK_POOL = 20;
const RRF_K = 60;
const BODY_CHARS = 1500;

/** Words of the query as an FTS5 OR query; each word is quoted so punctuation cannot break the syntax. */
export function ftsQuery(query: string): string {
	const words = query
		.toLowerCase()
		.split(/[^\p{L}\p{N}]+/u)
		.filter((w) => w && !STOP.has(w));
	return [...new Set(words)].map((w) => `"${w}"`).join(" OR ");
}

/** Text that represents a skill to the embedder and reranker. */
export const skillText = (s: Stored) =>
	`${s.name}: ${s.description}\n${s.body.slice(0, BODY_CHARS)}`;

/** Reciprocal rank fusion of ranked lists. */
export function fuse(lists: Stored[][]): Stored[] {
	const score = new Map<number, number>();
	const byId = new Map<number, Stored>();
	for (const list of lists)
		list.forEach((s, rank) => {
			byId.set(s.id, s);
			score.set(s.id, (score.get(s.id) ?? 0) + 1 / (RRF_K + rank + 1));
		});
	return [...byId.values()].sort(
		(a, b) => (score.get(b.id) ?? 0) - (score.get(a.id) ?? 0) || a.name.localeCompare(b.name),
	);
}

export interface Pipeline {
	db: SkillDb;
	embedder?: Embedder;
	reranker?: Reranker;
	judge?: Judge;
	threshold: number;
}

export interface Result {
	skills: Stored[];
	/** Stages that failed and were skipped. */
	errors: string[];
}

/**
 * BM25 and vector search, fused, then reranked and filtered by the decision model when those
 * are configured. A failing stage is skipped so the search still answers.
 */
export async function searchSkills(
	p: Pipeline,
	scope: Scope,
	query: string,
	limit: number,
): Promise<Result> {
	const errors: string[] = [];
	const lists = [p.db.bm25(scope, ftsQuery(query), POOL)];
	if (p.embedder) {
		try {
			const [q] = await p.embedder.embed([query]);
			lists.push(p.db.nearest(scope, p.embedder.id, q, POOL));
		} catch (e) {
			errors.push(`embedding: ${(e as Error).message}`);
		}
	}
	let skills = fuse(lists).slice(0, RERANK_POOL);

	if (p.reranker && skills.length > 1) {
		try {
			const scores = await p.reranker.rerank(query, skills.map(skillText));
			skills = skills
				.map((s, i) => ({ s, score: scores[i] }))
				.sort((a, b) => b.score - a.score)
				.map((x) => x.s);
		} catch (e) {
			errors.push(`reranker: ${(e as Error).message}`);
		}
	}

	if (p.judge && skills.length) {
		try {
			const probs = await p.judge.judge(query, skills);
			skills = skills.filter((_, i) => probs[i] >= p.threshold);
		} catch (e) {
			errors.push(`decision: ${(e as Error).message}`);
		}
	}
	return { skills: skills.slice(0, limit), errors };
}
