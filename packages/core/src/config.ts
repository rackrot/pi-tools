import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { applyEdits, modify, type ParseError, parse, printParseErrorCode } from "jsonc-parser";
import { isObject, type Json, writeTextAtomic } from "./json.ts";

export type Scope = "global" | "project";

/**
 * Where rackrot packages keep their config (JSON with comments allowed):
 * global `<agentDir>/rackrot/config.json(c)`, project `<cwd>/.pi/rackrot.json(c)`.
 * An existing `.jsonc` wins over `.json`; with neither, `.json` is the path to create.
 */
export function configPath(scope: Scope, cwd: string, agentDir: string = getAgentDir()): string {
	const base =
		scope === "global" ? join(agentDir, "rackrot", "config") : join(cwd, ".pi", "rackrot");
	return [".jsonc", ".json"].map((e) => base + e).find(existsSync) ?? `${base}.json`;
}

/** Reads a JSONC object. Missing or empty is `{}`; malformed or non-object content throws so callers never overwrite it. */
export function readConfigStrict(path: string): { data: Json; text: string } {
	if (!existsSync(path)) return { data: {}, text: "" };
	const text = readFileSync(path, "utf8");
	if (!text.trim()) return { data: {}, text };
	const errors: ParseError[] = [];
	const data = parse(text, errors, { allowTrailingComma: true }) as unknown;
	if (errors.length) throw new Error(`${path}: ${printParseErrorCode(errors[0].error)}`);
	if (!isObject(data)) throw new Error(`${path} is not a JSON object`);
	return { data, text };
}

/** Like `readConfigStrict`, but unreadable files yield `{}`. */
export function readConfig(path: string): Json {
	try {
		return readConfigStrict(path).data;
	} catch {
		return {};
	}
}

/** The raw value of one top-level key from each layer (global, project); `undefined` when unset. */
export function readConfigLayers(
	key: string,
	cwd: string,
	agentDir: string = getAgentDir(),
): unknown[] {
	return (["global", "project"] as const).map((s) => readConfig(configPath(s, cwd, agentDir))[key]);
}

/**
 * Applies `fn` to a copy of the file's data and writes back only the top-level keys it changed,
 * so comments and formatting elsewhere survive.
 */
export function editConfig(path: string, fn: (data: Json) => Json): void {
	const { data, text } = readConfigStrict(path);
	const next = fn(structuredClone(data));
	const indent = /^\{\r?\n(\t| +)/.exec(text)?.[1] ?? "\t";
	const formattingOptions = {
		insertSpaces: indent !== "\t",
		tabSize: indent === "\t" ? 1 : indent.length,
		eol: "\n",
	};
	let out = text.trim() ? text : "{}";
	for (const key of new Set([...Object.keys(data), ...Object.keys(next)])) {
		if (JSON.stringify(data[key]) === JSON.stringify(next[key])) continue;
		out = applyEdits(out, modify(out, [key], next[key], { formattingOptions }));
	}
	writeTextAtomic(path, out.endsWith("\n") ? out : `${out}\n`);
}
