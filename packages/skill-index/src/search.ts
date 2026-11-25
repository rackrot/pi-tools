export interface Doc {
	name: string;
	description: string;
}

export interface Hit {
	name: string;
	score: number;
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

const stem = (t: string) =>
	t.length > 4 && t.endsWith("ies")
		? `${t.slice(0, -3)}y`
		: t.length > 3 && t.endsWith("s") && !t.endsWith("ss")
			? t.slice(0, -1)
			: t;

/** Lowercase words, identifier boundaries split, stop words dropped, naive singular form. */
export function tokenize(text: string): string[] {
	return text
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.toLowerCase()
		.split(/[^\p{L}\p{N}]+/u)
		.filter((w) => w && !STOP.has(w))
		.map(stem);
}

const K1 = 1.5;
const B = 0.75;
/** A skill's name is repeated so a name match outranks the same word in a description. */
const NAME_WEIGHT = 3;

/** BM25 over name and description. Returns hits with a positive score, best first. */
export function search(docs: Doc[], query: string, limit: number): Hit[] {
	const terms = [...new Set(tokenize(query))];
	if (!terms.length || !docs.length) return [];
	const tokenized = docs.map((d) => [
		...Array(NAME_WEIGHT).fill(tokenize(d.name)).flat(),
		...tokenize(d.description),
	]);
	const avg = tokenized.reduce((n, t) => n + t.length, 0) / docs.length || 1;
	const df = new Map<string, number>();
	for (const toks of tokenized) for (const t of new Set(toks)) df.set(t, (df.get(t) ?? 0) + 1);

	const hits: Hit[] = [];
	tokenized.forEach((toks, i) => {
		const tf = new Map<string, number>();
		for (const t of toks) tf.set(t, (tf.get(t) ?? 0) + 1);
		let score = 0;
		for (const term of terms) {
			const f = tf.get(term);
			if (!f) continue;
			const n = df.get(term) ?? 0;
			const idf = Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
			score += (idf * (f * (K1 + 1))) / (f + K1 * (1 - B + (B * toks.length) / avg));
		}
		if (score > 0) hits.push({ name: docs[i].name, score });
	});
	return hits.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).slice(0, limit);
}
