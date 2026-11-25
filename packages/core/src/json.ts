import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export type Json = Record<string, unknown>;

export const isObject = (v: unknown): v is Json =>
	!!v && typeof v === "object" && !Array.isArray(v);

/** Reads a JSON object; a missing, unreadable or non-object file yields `{}`. */
export function readJson(path: string): Json {
	if (!existsSync(path)) return {};
	try {
		const data = JSON.parse(readFileSync(path, "utf8")) as unknown;
		return isObject(data) ? data : {};
	} catch {
		return {};
	}
}

/**
 * Reads a JSON object and the indent it uses, so edits keep the file's style.
 * Unlike `readJson`, throws on malformed or non-object content so callers don't overwrite it.
 */
export function readJsonStrict(path: string): { data: Json; indent: string } {
	if (!existsSync(path)) return { data: {}, indent: "\t" };
	const text = readFileSync(path, "utf8");
	if (!text.trim()) return { data: {}, indent: "\t" };
	const data = JSON.parse(text) as unknown;
	if (!isObject(data)) throw new Error(`${path} is not a JSON object`);
	return { data, indent: /^\{\r?\n(\t| +)/.exec(text)?.[1] ?? "\t" };
}

/** Writes via a temp file and rename so concurrent readers never see a partial file. */
export function writeJsonAtomic(path: string, data: unknown, indent: string | number = "\t"): void {
	mkdirSync(dirname(path), { recursive: true });
	const tmp = `${path}.${process.pid}.tmp`;
	writeFileSync(tmp, `${JSON.stringify(data, null, indent)}\n`);
	renameSync(tmp, path);
}
