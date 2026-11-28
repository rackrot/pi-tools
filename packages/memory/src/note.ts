import { createHash } from "node:crypto";
import { parse, stringify } from "yaml";

export const TYPES = [
	"rule",
	"decision",
	"fact",
	"lesson",
	"log",
	"handoff",
	"reference",
	"overview",
] as const;
export type NoteType = (typeof TYPES)[number];

export type Frontmatter = Record<string, unknown>;

export interface ParsedNote {
	fm: Frontmatter;
	/** The raw frontmatter text, for indexing. */
	fmText: string;
	body: string;
}

const FM = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

/** Splits frontmatter from body. Human notes may have broken YAML; that reads as no frontmatter. */
export function parseNote(text: string): ParsedNote {
	const m = FM.exec(text);
	if (!m) return { fm: {}, fmText: "", body: text };
	try {
		const fm = parse(m[1]) as unknown;
		if (fm && typeof fm === "object" && !Array.isArray(fm))
			return { fm: fm as Frontmatter, fmText: m[1], body: text.slice(m[0].length) };
	} catch {}
	return { fm: {}, fmText: "", body: text };
}

export const serializeNote = (fm: Frontmatter, body: string) =>
	`---\n${stringify(fm)}---\n\n${body.trim()}\n`;

/** Sets one top-level frontmatter line in raw note text (adding frontmatter if absent), leaving every other line as written. */
export function setField(text: string, key: string, value: string | number): string {
	const line = `${key}: ${value}`;
	const m = FM.exec(text);
	if (!m) return `---\n${line}\n---\n\n${text}`;
	const re = new RegExp(`^${key}:.*$`, "m");
	const fm = re.test(m[1]) ? m[1].replace(re, line) : `${m[1]}\n${line}`;
	return `---\n${fm}\n---\n${text.slice(m[0].length)}`;
}

export const hashText = (s: string) => createHash("sha256").update(s).digest("hex");

/** A file name from a title: path separators and Obsidian-reserved characters become spaces. */
export function safeName(title: string): string {
	return title
		.replace(/[\\/:*?"<>|#^[\]\0]/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.replace(/^[.\s]+/, "")
		.slice(0, 100)
		.trim();
}

const SECRETS: [string, RegExp][] = [
	["AWS access key", /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
	["GitHub token", /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{22,})\b/],
	["private key", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
	["API key (sk-)", /\bsk-[A-Za-z0-9_-]{20,}/],
	// A value with letters and a digit; env references (`${TOKEN}`, `process.env.TOKEN`) and prose are fine.
	[
		"credential assignment",
		/(?:password|secret|token)\s*[:=]\s*["'`]?(?!\$|process\.env|os\.environ)(?=\S*\d)(?=\S*[A-Za-z])\S{12,}/i,
	],
];

/** Name of the first secret pattern the text matches, if any. */
export const findSecret = (text: string) => SECRETS.find(([, re]) => re.test(text))?.[0];

const words = (s: string) => new Set(s.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu));

/** Jaccard similarity of the word sets of two texts, 0..1. */
export function similarity(a: string, b: string): number {
	const x = words(a);
	const y = words(b);
	let both = 0;
	for (const w of x) if (y.has(w)) both++;
	return both / (x.size + y.size - both || 1);
}

/** A new note this similar (word sets of title and body) to an existing one is refused as a duplicate. */
export const DUPLICATE_THRESHOLD = 0.6;
