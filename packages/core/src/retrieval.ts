import { join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";

/** `onnx` runs locally, `http` calls an OpenAI-style `/embeddings` or Cohere/Jina-style `/rerank` endpoint. */
export interface ModelProviderConfig {
	provider: "onnx" | "http" | "none";
	model: string;
	/** Required for `http`. */
	baseUrl?: string;
	/** Name of the environment variable holding the API key. Never store keys in config. */
	apiKeyEnv?: string;
}

export const DEFAULT_EMBEDDING: ModelProviderConfig = {
	provider: "onnx",
	model: "Xenova/bge-small-en-v1.5",
};
export const DEFAULT_RERANKER: ModelProviderConfig = {
	provider: "onnx",
	model: "Xenova/bge-reranker-base",
};

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

export const apiKey = (env?: string) => (env ? process.env[env] : undefined);

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

const RRF_K = 60;

/** Words of the query as an FTS5 OR query; each word is quoted so punctuation cannot break the syntax. */
export function ftsQuery(query: string): string {
	const words = query
		.toLowerCase()
		.split(/[^\p{L}\p{N}]+/u)
		.filter((w) => w && !STOP.has(w));
	return [...new Set(words)].map((w) => `"${w}"`).join(" OR ");
}

/** Reciprocal rank fusion of ranked lists; ties break by `tieBreak`. */
export function fuse<T extends { id: number | string }>(
	lists: T[][],
	tieBreak: (a: T, b: T) => number = () => 0,
): T[] {
	const score = new Map<T["id"], number>();
	const byId = new Map<T["id"], T>();
	for (const list of lists)
		list.forEach((s, rank) => {
			byId.set(s.id, s);
			score.set(s.id, (score.get(s.id) ?? 0) + 1 / (RRF_K + rank + 1));
		});
	return [...byId.values()].sort(
		(a, b) => (score.get(b.id) ?? 0) - (score.get(a.id) ?? 0) || tieBreak(a, b),
	);
}

export const toBlob = (v: number[]) => Buffer.from(new Float32Array(v).buffer);
export const fromBlob = (b: Uint8Array) =>
	new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4);

/** Ids of the `limit` rows whose stored vector has the highest dot product with `query`, best first. */
export function nearestIds(
	rows: { id: number; embedding: Uint8Array }[],
	query: number[],
	limit: number,
): number[] {
	const scored = rows.map((r) => {
		const v = fromBlob(r.embedding);
		let dot = 0;
		for (let i = 0; i < v.length; i++) dot += v[i] * query[i];
		return { id: r.id, dot };
	});
	scored.sort((a, b) => b.dot - a.dot);
	return scored.slice(0, limit).map((s) => s.id);
}
