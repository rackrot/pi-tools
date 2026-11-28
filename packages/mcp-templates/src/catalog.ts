import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Json } from "@rackrot/pi-core/json";
import { isObject } from "@rackrot/pi-core/json";

export type Source = "builtin" | "global" | "project";

export interface Template {
	id: string;
	description: string;
	tags: string[];
	/** A pi mcp.json server entry. */
	entry: Json;
	requires?: string[];
	/** Env var names the entry references as `${NAME}`. */
	secrets?: string[];
	auth?: "oauth" | "env" | "none";
	source?: string;
	defaultScope?: "project" | "global";
}

export type LoadedTemplate = Template & { origin: Source };

export const NAME_RE = /^[A-Za-z0-9_-]+$/;
export const EXPOSURES = ["codemode", "deferred", "direct", "hidden"];

const strings = (v: unknown): v is string[] =>
	Array.isArray(v) && v.every((x) => typeof x === "string");

/** `${NAME}` references anywhere in a JSON value. */
export function envRefs(value: unknown): string[] {
	return [
		...new Set(
			[...JSON.stringify(value).matchAll(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g)].map((m) => m[1]),
		),
	];
}

/** Returns the problems with a raw template; empty when it is valid. */
export function validateTemplate(raw: unknown): string[] {
	if (!isObject(raw)) return ["not an object"];
	const errs: string[] = [];
	const { id, description, tags, entry, requires, secrets, auth, defaultScope } = raw;
	if (typeof id !== "string" || !NAME_RE.test(id)) errs.push("id must be letters, digits, _ or -");
	if (typeof description !== "string" || !description) errs.push("description is required");
	if (!strings(tags)) errs.push("tags must be a string array");
	if (requires !== undefined && !strings(requires)) errs.push("requires must be a string array");
	if (secrets !== undefined && !strings(secrets)) errs.push("secrets must be a string array");
	if (auth !== undefined && !["oauth", "env", "none"].includes(auth as string))
		errs.push("auth must be oauth, env or none");
	if (defaultScope !== undefined && !["project", "global"].includes(defaultScope as string))
		errs.push("defaultScope must be project or global");
	if (!isObject(entry)) return [...errs, "entry must be an object"];
	if (Number("command" in entry) + Number("url" in entry) !== 1)
		errs.push("entry needs exactly one of command or url");
	if ("command" in entry && typeof entry.command !== "string")
		errs.push("entry.command must be a string");
	if ("url" in entry && typeof entry.url !== "string") errs.push("entry.url must be a string");
	if (entry.type === "sse") errs.push("legacy SSE is not supported by pi");
	if (entry.args !== undefined && !strings(entry.args))
		errs.push("entry.args must be a string array");
	for (const k of ["env", "headers"]) {
		const m = entry[k];
		if (m !== undefined && !(isObject(m) && Object.values(m).every((v) => typeof v === "string")))
			errs.push(`entry.${k} must map names to strings`);
	}
	if (entry.exposure !== undefined && !EXPOSURES.includes(entry.exposure as string))
		errs.push(`entry.exposure must be one of ${EXPOSURES.join(", ")}`);
	if (!errs.length) {
		const declared = (secrets as string[] | undefined) ?? [];
		const missing = envRefs(entry).filter((r) => !declared.includes(r));
		if (missing.length) errs.push(`entry references undeclared secrets: ${missing.join(", ")}`);
	}
	return errs;
}

export const builtinFile = new URL("../data/templates.json", import.meta.url);

export interface UserTemplateDirs {
	global: string;
	project: string;
}

export function templateDirs(cwd: string, agentDir: string): UserTemplateDirs {
	return {
		global: join(agentDir, "rackrot", "mcp-templates"),
		project: join(cwd, ".pi", "mcp-templates"),
	};
}

function readFileTemplates(
	path: string,
	origin: Source,
	out: LoadedTemplate[],
	problems: string[],
) {
	let data: unknown;
	try {
		data = JSON.parse(readFileSync(path, "utf8"));
	} catch (e) {
		problems.push(`${path}: ${(e as Error).message}`);
		return;
	}
	for (const [i, raw] of (Array.isArray(data) ? data : [data]).entries()) {
		const errs = validateTemplate(raw);
		if (errs.length)
			problems.push(`${path}${Array.isArray(data) ? `[${i}]` : ""}: ${errs.join("; ")}`);
		else out.push({ ...(raw as Template), origin });
	}
}

/** Builtin < global user < project user; a later source replaces an earlier template with the same id. */
export function loadCatalog(
	cwd: string,
	agentDir: string,
): { templates: LoadedTemplate[]; problems: string[] } {
	const dirs = templateDirs(cwd, agentDir);
	const all: LoadedTemplate[] = [];
	const problems: string[] = [];
	readFileTemplates(builtinFile.pathname, "builtin", all, problems);
	for (const origin of ["global", "project"] as const) {
		const dir = dirs[origin];
		if (!existsSync(dir)) continue;
		for (const f of readdirSync(dir)
			.filter((f) => f.endsWith(".json"))
			.sort())
			readFileTemplates(join(dir, f), origin, all, problems);
	}
	const byId = new Map(all.map((t) => [t.id, t]));
	return { templates: [...byId.values()].sort((a, b) => a.id.localeCompare(b.id)), problems };
}
