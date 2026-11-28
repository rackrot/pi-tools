import { type Embedder, ftsQuery, fuse, type Reranker } from "@rackrot/pi-core/retrieval";
import type { Scope, SkillDb, Stored } from "./db.ts";
import type { Judge } from "./providers.ts";

/** Candidates taken from each of BM25 and vector search before fusion. */
const POOL = 50;
/** Fused candidates sent to the reranker and decision model. */
const RERANK_POOL = 20;
const BODY_CHARS = 1500;

/** Text that represents a skill to the embedder and reranker. */
export const skillText = (s: Stored) =>
	`${s.name}: ${s.description}\n${s.body.slice(0, BODY_CHARS)}`;

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
	let skills = fuse(lists, (a, b) => a.name.localeCompare(b.name)).slice(0, RERANK_POOL);

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
