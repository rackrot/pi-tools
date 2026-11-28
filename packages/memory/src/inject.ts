import { readFileSync, statSync } from "node:fs";
import { join, posix } from "node:path";
import { type ParsedNote, parseNote } from "./note.ts";
import { splitIndex } from "./overview.ts";
import type { Memory } from "./tools.ts";
import { agentRel, archiveRel, projectRel, walkMarkdown } from "./vault.ts";

const HINT =
	"Long-term memory is available (memory_search, memory_read, memory_write, memory_archive, memory_sync). Search before writing, read before updating, never store secrets.";
const OVERVIEW_CHARS = 3000;
const PINNED_CHARS = 1500;

const title = (path: string) => posix.basename(path, ".md");

/** Parsed notes by absolute path, reused while the file's mtime is unchanged: the injection is rebuilt every turn. */
const parsed = new Map<string, { mtime: number; note: ParsedNote }>();

function readNote(abs: string): ParsedNote {
	const mtime = statSync(abs).mtimeMs;
	const hit = parsed.get(abs);
	if (hit?.mtime === mtime) return hit.note;
	const note = parseNote(readFileSync(abs, "utf8"));
	parsed.set(abs, { mtime, note });
	return note;
}

/**
 * The text added to the system prompt: a tool hint, the project Overview, open handoffs and
 * pinned notes, cut to `injectBudgetChars`. Rebuilt every turn, so it survives compaction.
 */
export function buildInjection(m: Memory): string {
	const { cfg } = m;
	const mine = `${projectRel(cfg, m.project.slug)}/`;
	const projects = `${posix.join(agentRel(cfg), cfg.projects)}/`;
	let left = cfg.injectBudgetChars - HINT.length;
	const parts = [HINT];
	const add = (text: string, cap: number) => {
		const t =
			text.length > Math.min(cap, left)
				? `${text.slice(0, Math.max(0, Math.min(cap, left) - 3))}...`
				: text;
		if (left <= 0 || !t.trim()) return;
		parts.push(t);
		left -= t.length;
	};

	const read = (rel: string) => readNote(join(cfg.root, rel));
	const notes = walkMarkdown(cfg.root, agentRel(cfg))
		.filter(
			(p) =>
				!p.startsWith(`${archiveRel(cfg)}/`) && (p.startsWith(mine) || !p.startsWith(projects)),
		)
		.map((path) => ({ path, ...read(path) }));

	const overview = notes.find((n) => n.path === `${mine}Overview.md`);
	if (overview) {
		// Prose first, index last, so the cap cuts the index first. A bare stub is not worth the tokens.
		const { prose, index } = splitIndex(overview.body);
		if (prose.replace(/^#.*$/gm, "").trim() || index.includes("- [["))
			add(
				`## Project overview (${overview.path})\n${prose}${index ? `\n\n${index}` : ""}`,
				OVERVIEW_CHARS,
			);
	}

	const handoffs = notes.filter(
		(n) => n.path.startsWith(`${mine}Handoffs/`) && n.fm.status === "open",
	);
	if (handoffs.length)
		add(
			`## Open handoffs\n${handoffs.map((n) => `- ${title(n.path)} (${n.path})`).join("\n")}`,
			left,
		);

	for (const n of notes.filter((x) => x.fm.pin === true && x.path !== overview?.path))
		add(`## Pinned: ${title(n.path)} (${n.path})\n${n.body.trim()}`, PINNED_CHARS);
	return parts.join("\n\n");
}
