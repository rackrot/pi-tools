import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, posix } from "node:path";
import { hashText, parseNote, setField } from "./note.ts";
import type { Memory } from "./tools.ts";
import { projectRel, walkMarkdown } from "./vault.ts";

export const INDEX_START = "<!-- memory:index:start -->";
export const INDEX_END = "<!-- memory:index:end -->";
const SUMMARY_CHARS = 120;
const BLOCK = new RegExp(`${INDEX_START}[\\s\\S]*?${INDEX_END}`);

/** The Overview text outside the index markers, and the index block (empty when absent). */
export function splitIndex(body: string): { prose: string; index: string } {
	const index = BLOCK.exec(body)?.[0] ?? "";
	return { prose: body.replace(BLOCK, "").trim(), index };
}

export const emptyIndex = () => `${INDEX_START}\n${INDEX_END}`;

/** Frontmatter `summary`, else the first body line that is not a heading, cut to ~120 characters. */
export function summary(fm: Record<string, unknown>, body: string): string {
	const s =
		typeof fm.summary === "string"
			? fm.summary
			: (body.split("\n").find((l) => l.trim() && !l.startsWith("#")) ?? "");
	const one = s.replace(/\s+/g, " ").trim();
	return one.length > SUMMARY_CHARS ? `${one.slice(0, SUMMARY_CHARS - 3)}...` : one;
}

function buildIndex(m: Memory): string {
	const dir = projectRel(m.cfg, m.project.slug);
	const groups: Record<string, { sort: string; line: string }[]> = {};
	for (const path of walkMarkdown(m.cfg.root, dir)) {
		const rel = path.slice(dir.length + 1);
		if (rel === "Overview.md") continue;
		const { fm, body } = parseNote(readFileSync(join(m.cfg.root, path), "utf8"));
		const name = posix.basename(path, ".md");
		const folder = rel.split("/")[0];
		const group =
			{ Decisions: "Decisions", Log: "Log", Handoffs: "Handoffs (open first)" }[folder] ?? "Other";
		const status = group.startsWith("Handoffs") && fm.status ? ` (${fm.status})` : "";
		const text = summary(fm, body);
		// Handoffs: open before done, then A-Z. Log: by creation time (reversed below). Others: A-Z.
		const sort =
			group === "Log"
				? String(fm.created ?? name)
				: group.startsWith("Handoffs")
					? `${fm.status === "open" ? 0 : 1}${name}`
					: name;
		(groups[group] ??= []).push({
			sort,
			line: `- [[${name}]]${status}${text ? ` — ${text}` : ""}`,
		});
	}
	const order = ["Decisions", "Log", "Handoffs (open first)", "Other"];
	const sections = order
		.filter((g) => groups[g])
		.map(
			(g) =>
				`### ${g}\n${groups[g]
					.sort((a, b) => (a.sort < b.sort ? -1 : a.sort > b.sort ? 1 : 0) * (g === "Log" ? -1 : 1))
					.map((x) => x.line)
					.join("\n")}`,
		);
	return sections.length
		? `${INDEX_START}\n## Notes\n${sections.join("\n")}\n${INDEX_END}`
		: emptyIndex();
}

/**
 * Rebuilds the marked note index in the project's Overview.md, leaving everything outside the
 * markers alone, and counts the write in frontmatter `summary-changes` (reset by the summary
 * worker). Called after every project write/archive.
 */
export function refreshIndex(m: Memory) {
	const rel = posix.join(projectRel(m.cfg, m.project.slug), "Overview.md");
	const abs = join(m.cfg.root, rel);
	if (!existsSync(abs)) return;
	const old = readFileSync(abs, "utf8");
	const block = buildIndex(m);
	const withBlock = BLOCK.test(old)
		? old.replace(BLOCK, () => block)
		: `${old.trimEnd()}\n\n${block}\n`;
	const changes = Number(parseNote(old).fm["summary-changes"]) || 0;
	const next = setField(withBlock, "summary-changes", changes + 1);
	writeFileSync(abs, next);
	// Keep the stale-write guard quiet for our own edit, but never mask a human's: only follow
	// the ledger when it matched the file we just replaced.
	if (m.hashes.get(rel) === hashText(old)) m.hashes.set(rel, hashText(next));
	m.index.indexFile(rel);
	m.sync.mark(rel, m.project.slug);
}
