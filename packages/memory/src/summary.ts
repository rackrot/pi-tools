import { readFileSync, writeFileSync } from "node:fs";
import { join, posix } from "node:path";
import { findSecret, hashText, parseNote, setField } from "./note.ts";
import { INDEX_END, INDEX_START, splitIndex, summary } from "./overview.ts";
import type { Memory } from "./tools.ts";
import { projectRel, walkMarkdown } from "./vault.ts";

const BODY_CHARS = 1500;
const BODIES_TOTAL = 12000;
/** Target prose length; output over twice this is rejected. */
const BUDGET_CHARS = 1500;

export const SYSTEM = [
	"You maintain the prose summary at the top of a software project's Overview note, from the project's notes.",
	"Write 5-12 terse, factual lines: what the project is, current state, key decisions, open work.",
	"Keep the existing human-written statements unless newer notes contradict them.",
	"Never invent facts that are not in the notes. Never include secrets, tokens or credentials.",
	"Refer to notes with wikilinks like [[Title]]. Keep the existing first-line '# Title' heading.",
	"Reply with the new prose only: no frontmatter, no code fence, no index, no HTML comments.",
].join("\n");

/** One model call: system prompt and user prompt in, text out. */
export type Summarize = (system: string, prompt: string) => Promise<string>;

/**
 * Rewrites the prose of the project's Overview (everything outside the index markers) from its
 * notes. Returns a one-line status; throws only when `summarize` does. Skips when fewer than
 * `minChanges` writes happened since the last summary (unless `force`), or when a human edited
 * the file since this session last recorded it or while the model was running.
 */
export async function summarizeProject(
	m: Memory,
	summarize: Summarize,
	opts: { force?: boolean } = {},
): Promise<string> {
	const dir = projectRel(m.cfg, m.project.slug);
	const rel = posix.join(dir, "Overview.md");
	const abs = join(m.cfg.root, rel);
	let start: string;
	try {
		start = readFileSync(abs, "utf8");
	} catch {
		return "no Overview yet; nothing to summarize";
	}
	const seen = m.hashes.get(rel);
	if (seen !== undefined && seen !== hashText(start))
		return "skipped: Overview.md was edited since this session last saw it";
	const { fm, body } = parseNote(start);
	const changes = Number(fm["summary-changes"]) || 0;
	if (!opts.force && changes < m.cfg.summary.minChanges)
		return `skipped: ${changes} change(s) since the last summary (minChanges ${m.cfg.summary.minChanges})`;

	const since = typeof fm.summarized === "string" ? fm.summarized : "";
	const list: string[] = [];
	const changed: { updated: string; title: string; body: string }[] = [];
	for (const path of walkMarkdown(m.cfg.root, dir)) {
		if (path === rel) continue;
		const note = parseNote(readFileSync(join(m.cfg.root, path), "utf8"));
		const title = posix.basename(path, ".md");
		const updated = String(note.fm.updated ?? "");
		list.push(
			`- [[${title}]] (${note.fm.type ?? "note"}, updated ${updated || "?"}) ${summary(note.fm, note.body)}`,
		);
		if (updated > since) changed.push({ updated, title, body: note.body.trim() });
	}
	let room = BODIES_TOTAL;
	const bodies: string[] = [];
	for (const n of changed.sort((a, b) => (a.updated < b.updated ? 1 : -1))) {
		if (room <= 0) break;
		const text = n.body.slice(0, Math.min(BODY_CHARS, room));
		room -= text.length;
		bodies.push(`### [[${n.title}]]\n${text}`);
	}
	const prose = splitIndex(body).prose;
	const prompt = [
		`Current prose:\n${prose}`,
		`All notes:\n${list.join("\n") || "(none)"}`,
		`Notes changed since the last summary (${since || "never summarized"}):\n${bodies.join("\n\n") || "(none)"}`,
		`Write the new prose (at most about ${BUDGET_CHARS} characters).`,
	].join("\n\n");

	const out = (await summarize(SYSTEM, prompt)).trim();
	if (!out) return "rejected: model returned nothing";
	if (out.includes(INDEX_START) || out.includes(INDEX_END))
		return "rejected: model output contained the index markers";
	if (out.length > 2 * BUDGET_CHARS) return "rejected: model output is too long";
	const secret = findSecret(out);
	if (secret) return `rejected: model output looks like it contains a secret (${secret})`;

	const now = readFileSync(abs, "utf8");
	if (now !== start) return "skipped: Overview.md changed while summarizing";
	const index = splitIndex(body).index;
	const head = start.slice(0, start.length - body.length);
	let next = `${head}${head ? "\n" : ""}${out}${index ? `\n\n${index}` : ""}\n`;
	const stamp = new Date().toISOString();
	next = setField(next, "summary-changes", 0);
	next = setField(next, "summarized", stamp);
	next = setField(next, "updated", stamp);
	next = setField(next, "source", "agent");
	writeFileSync(abs, next);
	m.hashes.set(rel, hashText(next));
	m.index.indexFile(rel);
	m.sync.mark(rel, m.project.slug, false, true);
	return "summary refreshed";
}
