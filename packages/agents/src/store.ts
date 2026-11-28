import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	renameSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { basename, dirname, join } from "node:path";
import { editConfig, readConfig } from "@rackrot/pi-core/config";
import { SETTINGS_KEY, type Tuning } from "./config.ts";

export type Scope = "global" | "project";
export type Field = keyof Tuning;

/** Agents pi-subagents registers itself. */
export const BUILTIN_AGENTS = ["general-purpose", "Explore", "Plan"];

export const agentsDir = (scope: Scope, agentDir: string, cwd: string) =>
	scope === "global" ? join(agentDir, "agents") : join(cwd, ".pi", "agents");

type Json = Record<string, unknown>;

/** Returns a copy of `data` with one override field set, or removed when `value` is undefined. */
export function applyOverride(
	data: Json,
	name: string,
	field: Field,
	value: string | number | undefined,
): Json {
	const next: Json = { ...data };
	const all: Record<string, Record<string, unknown>> = {
		...((next[SETTINGS_KEY] as Record<string, Record<string, unknown>> | undefined) ?? {}),
	};
	const existing = Object.keys(all).find((k) => k.toLowerCase() === name.toLowerCase()) ?? name;
	const entry = { ...(all[existing] ?? {}) };
	if (value === undefined) delete entry[field];
	else entry[field] = value;
	if (Object.keys(entry).length) all[existing] = entry;
	else delete all[existing];
	if (Object.keys(all).length) next[SETTINGS_KEY] = all;
	else delete next[SETTINGS_KEY];
	return next;
}

function writeAtomic(path: string, text: string) {
	mkdirSync(dirname(path), { recursive: true });
	const tmp = `${path}.tmp-${process.pid}`;
	writeFileSync(tmp, text);
	renameSync(tmp, path);
}

export function saveOverride(
	path: string,
	name: string,
	field: Field,
	value: string | number | undefined,
) {
	editConfig(path, (data) => applyOverride(data, name, field, value));
}

/** `enabledModels` is a pi setting: project value if it is a list, else global. */
export function readEnabledModels(agentDir: string, cwd: string): string[] {
	for (const scope of ["project", "global"] as const) {
		const file =
			scope === "global" ? join(agentDir, "settings.json") : join(cwd, ".pi", "settings.json");
		const v = readConfig(file).enabledModels;
		if (Array.isArray(v)) return v.filter((m): m is string => typeof m === "string");
	}
	return [];
}

// ---- enable / disable ----
//
// pi-subagents has no setting for this. Its own /agents Disable writes a local file with
// `enabled: false`, which shadows a built-in or package agent of the same name. Same mechanism here.

const FENCE = /^---[ \t]*$/;
const ENABLED_FALSE = /^enabled:[ \t]*false[ \t]*$/;
const STUB = "---\nenabled: false\n---\n";

function frontmatterBounds(lines: string[]): { open: number; close: number } | undefined {
	if (!lines.length || !FENCE.test(lines[0].replace(/\r?\n$/, ""))) return undefined;
	const close = lines.findIndex((l, i) => i > 0 && FENCE.test(l.replace(/\r?\n$/, "")));
	return close === -1 ? undefined : { open: 0, close };
}

const splitLines = (s: string) => s.split(/(?<=\n)/);

export function isDisabledContent(content: string): boolean {
	const lines = splitLines(content);
	const b = frontmatterBounds(lines);
	return !!b && lines.slice(1, b.close).some((l) => ENABLED_FALSE.test(l.replace(/\r?\n$/, "")));
}

export function disableContent(content: string): string {
	if (isDisabledContent(content)) return content;
	const lines = splitLines(content);
	if (!frontmatterBounds(lines)) return `---\nenabled: false\n---\n${content}`;
	const eol = lines[0].endsWith("\r\n") ? "\r\n" : "\n";
	lines.splice(1, 0, `enabled: false${eol}`);
	return lines.join("");
}

/** Removes `enabled: false`. `remove` is true when what remains is the empty stub, so the file can go. */
export function enableContent(content: string): { content: string; remove: boolean } {
	const lines = splitLines(content);
	const b = frontmatterBounds(lines);
	if (!b) return { content, remove: false };
	const kept = lines.filter(
		(l, i) => !(i > 0 && i < b.close && ENABLED_FALSE.test(l.replace(/\r?\n$/, ""))),
	);
	const out = kept.join("");
	return { content: out, remove: out.replace(/\r\n/g, "\n").trim() === "---\n---" };
}

export function isAgentDisabled(dir: string, name: string): boolean {
	const file = join(dir, `${name}.md`);
	return existsSync(file) && isDisabledContent(readFileSync(file, "utf8"));
}

export function setAgentEnabled(dir: string, name: string, enabled: boolean) {
	const file = join(dir, `${name}.md`);
	if (!enabled) {
		writeAtomic(file, existsSync(file) ? disableContent(readFileSync(file, "utf8")) : STUB);
		return;
	}
	if (!existsSync(file)) return;
	const { content, remove } = enableContent(readFileSync(file, "utf8"));
	if (remove) unlinkSync(file);
	else writeAtomic(file, content);
}

// ---- discovery ----

const NAME_LINE = /^name:[ \t]*["']?([^"'\r\n]+?)["']?[ \t]*$/m;

function agentNamesIn(dir: string): string[] {
	if (!existsSync(dir)) return [];
	const names: string[] = [];
	for (const f of readdirSync(dir)) {
		if (!f.endsWith(".md")) continue;
		const stem = basename(f, ".md");
		let name = stem;
		try {
			const m = NAME_LINE.exec(readFileSync(join(dir, f), "utf8").slice(0, 2000));
			if (m) name = m[1];
		} catch {
			// fall back to the file stem
		}
		names.push(name);
	}
	return names;
}

const LOCK_LINE = /^lock:[ \t]*(true|false)[ \t]*$/;

/**
 * `lock: true|false` from the frontmatter of the agent file for `name` (file stem or `name:`,
 * case-insensitive), searching `dirs` in order, first match wins. Unreadable files are skipped.
 */
export function agentFrontmatterLock(name: string, dirs: string[]): boolean | undefined {
	const want = name.toLowerCase();
	for (const dir of dirs) {
		if (!existsSync(dir)) continue;
		for (const f of readdirSync(dir)) {
			if (!f.endsWith(".md")) continue;
			try {
				const lines = splitLines(readFileSync(join(dir, f), "utf8"));
				const b = frontmatterBounds(lines);
				if (!b) continue;
				const fm = lines.slice(1, b.close).map((l) => l.replace(/\r?\n$/, ""));
				const declared = NAME_LINE.exec(fm.join("\n"))?.[1];
				if ((declared ?? basename(f, ".md")).toLowerCase() !== want) continue;
				const m = fm.map((l) => LOCK_LINE.exec(l)).find(Boolean);
				return m ? m[1] === "true" : undefined;
			} catch {
				// unreadable: skip
			}
		}
	}
	return undefined;
}

/**
 * Agents worth listing: built-ins, this package's, local ones in the global, project and
 * workspace dirs, and any already named in overrides. Agents shipped by other packages appear
 * only once they have an override; add one in settings.json to list a new one.
 */
export function discoverAgents(
	packageDir: string,
	agentDir: string,
	cwd: string,
	extra: string[],
): string[] {
	const seen = new Map<string, string>();
	for (const n of [
		...BUILTIN_AGENTS,
		...agentNamesIn(join(packageDir, "agents")),
		...agentNamesIn(join(agentDir, "agents")),
		...agentNamesIn(join(cwd, ".pi", "agents")),
		...agentNamesIn(join(cwd, ".agents", "agents")),
		...extra,
	]) {
		if (!seen.has(n.toLowerCase())) seen.set(n.toLowerCase(), n);
	}
	return [...seen.values()].sort((a, b) => a.localeCompare(b));
}
