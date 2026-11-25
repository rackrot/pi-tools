import { join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { TypeSafeClient } from "@typesafe-ai/sdk";
import type { DecisionConfig, ModelProviderConfig } from "./config.ts";

export interface Embedder {
	/** Identifies provider and model; stored with each vector so a change re-embeds. */
	id: string;
	/** One normalised vector per text. */
	embed(texts: string[]): Promise<number[][]>;
}

export interface Reranker {
	/** One relevance score per document, higher is better. */
	rerank(query: string, docs: string[]): Promise<number[]>;
}

export interface Judge {
	/** Probability in 0..1 that each candidate is useful for the task. */
	judge(task: string, candidates: { name: string; description: string }[]): Promise<number[]>;
	close?(): Promise<void>;
}

const apiKey = (env?: string) => (env ? process.env[env] : undefined);

async function post<T>(url: string, body: unknown, key?: string): Promise<T> {
	const res = await fetch(url, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			...(key ? { authorization: `Bearer ${key}` } : {}),
		},
		body: JSON.stringify(body),
		signal: AbortSignal.timeout(30_000),
	});
	if (!res.ok) throw new Error(`${url}: ${res.status} ${await res.text().catch(() => "")}`);
	return (await res.json()) as T;
}

const join1 = (base: string, path: string) => `${base.replace(/\/+$/, "")}${path}`;

let transformers: Promise<typeof import("@huggingface/transformers")> | undefined;
/** Loads @huggingface/transformers once and points its model cache under the rackrot directory. */
function hf() {
	transformers ??= import("@huggingface/transformers").then((m) => {
		m.env.cacheDir = join(getAgentDir(), "rackrot", "models");
		return m;
	});
	return transformers;
}

export function createEmbedder(cfg: ModelProviderConfig): Embedder | undefined {
	if (cfg.provider === "none") return;
	const id = `${cfg.provider}:${cfg.model}`;
	if (cfg.provider === "http") {
		if (!cfg.baseUrl) return;
		const url = join1(cfg.baseUrl, "/embeddings");
		return {
			id,
			async embed(texts) {
				const r = await post<{ data: { index: number; embedding: number[] }[] }>(
					url,
					{ model: cfg.model, input: texts },
					apiKey(cfg.apiKeyEnv),
				);
				return r.data.sort((a, b) => a.index - b.index).map((d) => normalise(d.embedding));
			},
		};
	}
	let extractor: Promise<(t: string[], o: object) => Promise<{ tolist(): number[][] }>> | undefined;
	return {
		id,
		async embed(texts) {
			extractor ??= hf().then(
				(m) => m.pipeline("feature-extraction", cfg.model, { dtype: "q8" }) as never,
			);
			// CLS pooling suits the default bge models; it is not configurable yet.
			const out = await (await extractor)(texts, { pooling: "cls", normalize: true });
			return out.tolist();
		},
	};
}

const normalise = (v: number[]) => {
	const n = Math.hypot(...v) || 1;
	return v.map((x) => x / n);
};

export function createReranker(cfg: ModelProviderConfig): Reranker | undefined {
	if (cfg.provider === "none") return;
	if (cfg.provider === "http") {
		if (!cfg.baseUrl) return;
		const url = join1(cfg.baseUrl, "/rerank");
		return {
			async rerank(query, docs) {
				const r = await post<{ results: { index: number; relevance_score: number }[] }>(
					url,
					{ model: cfg.model, query, documents: docs, top_n: docs.length },
					apiKey(cfg.apiKeyEnv),
				);
				const scores = new Array<number>(docs.length).fill(Number.NEGATIVE_INFINITY);
				for (const x of r.results) scores[x.index] = x.relevance_score;
				return scores;
			},
		};
	}
	let loaded:
		| Promise<{
				tokenizer: (q: string[], o: object) => unknown;
				model: (i: unknown) => Promise<{ logits: { data: ArrayLike<number> } }>;
		  }>
		| undefined;
	return {
		async rerank(query, docs) {
			loaded ??= hf().then(async (m) => ({
				tokenizer: (await m.AutoTokenizer.from_pretrained(cfg.model)) as never,
				model: (await m.AutoModelForSequenceClassification.from_pretrained(cfg.model, {
					dtype: "q8",
				})) as never,
			}));
			const { tokenizer, model } = await loaded;
			const inputs = tokenizer(new Array(docs.length).fill(query), {
				text_pair: docs,
				padding: true,
				truncation: true,
				max_length: 512,
			});
			return Array.from((await model(inputs)).logits.data);
		},
	};
}

type Questions = Record<string, { type: "noul"; instructions: unknown }>;

const questions = (candidates: { name: string; description: string }[]): Questions =>
	Object.fromEntries(
		candidates.map((c, i) => [
			`c${i}`,
			{
				type: "noul" as const,
				instructions: {
					question: "Is this skill useful for completing the task in the state?",
					skill: { name: c.name, description: c.description },
				},
			},
		]),
	);

type Answers = Record<string, { noul: number }>;

const scores = (answers: Answers, n: number) =>
	Array.from({ length: n }, (_, i) => answers[`c${i}`]?.noul ?? 1);

export function createJudge(cfg: DecisionConfig): Judge | undefined {
	if (!cfg.enabled) return;
	if (cfg.provider === "typesafe") {
		const client = new TypeSafeClient({
			baseUrl: cfg.baseUrl,
			apiKey: apiKey(cfg.apiKeyEnv),
		} as ConstructorParameters<typeof TypeSafeClient>[0]);
		return {
			async judge(task, candidates) {
				const r = await client.systemOne({
					model: cfg.model,
					state: { task },
					questions: questions(candidates),
				} as never);
				return scores((r as unknown as { answers: Answers }).answers, candidates.length);
			},
		};
	}
	// @receptron/laya is an optional peer; the specifier is a variable so it is not resolved up front.
	type Laya = {
		systemOne(state: unknown, q: Questions): Promise<{ answers: Answers }>;
		close(): Promise<void>;
	};
	let laya: Promise<Laya> | undefined;
	const spec = "@receptron/laya";
	return {
		async judge(task, candidates) {
			laya ??= import(spec).then((m: { Laya: { load(): Promise<Laya> } }) => m.Laya.load());
			const r = await (await laya).systemOne({ task }, questions(candidates));
			return scores(r.answers, candidates.length);
		},
		async close() {
			await (await laya)?.close();
		},
	};
}
