import { configPath, editConfig, readConfig } from "@rackrot/pi-core/config";

/**
 * How much of a skill the system prompt carries.
 * - full: the SKILL.md body
 * - description: name, description and path (pi's default listing)
 * - title: name only
 * - hidden: nothing; reachable through skill_search
 */
export const MODES = ["full", "description", "title", "hidden"] as const;
export type Mode = (typeof MODES)[number];

export const SETTINGS_KEY = "skillIndex";
export const DEFAULT_MODE: Mode = "title";
export const DEFAULT_LIMIT = 5;

export interface Config {
	default: Mode;
	/** Exact names or `*` globs. */
	skills: Record<string, Mode>;
	limit: number;
}

const isMode = (v: unknown): v is Mode => MODES.includes(v as Mode);

type Json = Record<string, unknown>;

/** One config layer; invalid parts are dropped. */
export function parseLayer(raw: unknown): Partial<Config> {
	const out: Partial<Config> = {};
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
	const r = raw as Json;
	if (isMode(r.default)) out.default = r.default;
	if (typeof r.limit === "number" && Number.isInteger(r.limit) && r.limit >= 1) out.limit = r.limit;
	if (r.skills && typeof r.skills === "object" && !Array.isArray(r.skills)) {
		out.skills = {};
		for (const [k, v] of Object.entries(r.skills)) if (isMode(v)) out.skills[k] = v;
	}
	return out;
}

/** Merge layers, later wins. Skill maps merge key by key. */
export function mergeLayers(layers: Partial<Config>[]): Config {
	const cfg: Config = { default: DEFAULT_MODE, skills: {}, limit: DEFAULT_LIMIT };
	for (const l of layers) {
		if (l.default) cfg.default = l.default;
		if (l.limit) cfg.limit = l.limit;
		Object.assign(cfg.skills, l.skills);
	}
	return cfg;
}

export function loadLayers(cwd: string): Partial<Config>[] {
	return (["global", "project"] as const).map((s) =>
		parseLayer(readConfig(configPath(s, cwd))[SETTINGS_KEY]),
	);
}

const globToRegex = (g: string) =>
	new RegExp(
		`^${g
			.split("*")
			.map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
			.join(".*")}$`,
	);

/** Exact name wins, then the longest matching glob, then the default. */
export function modeOf(name: string, cfg: Config): Mode {
	const exact = cfg.skills[name];
	if (exact) return exact;
	let best: { len: number; mode: Mode } | undefined;
	for (const [pattern, mode] of Object.entries(cfg.skills)) {
		if (!pattern.includes("*") || !globToRegex(pattern).test(name)) continue;
		if (!best || pattern.length > best.len) best = { len: pattern.length, mode };
	}
	return best?.mode ?? cfg.default;
}

/** Returns a copy of config data with one skill's mode set, or cleared when `mode` is undefined. */
export function applySkillMode(
	data: Json,
	skill: string | "*default",
	mode: Mode | undefined,
): Json {
	const next: Json = { ...data };
	const block = { ...((next[SETTINGS_KEY] as Json | undefined) ?? {}) };
	if (skill === "*default") {
		if (mode) block.default = mode;
		else delete block.default;
	} else {
		const skills = { ...((block.skills as Record<string, unknown> | undefined) ?? {}) };
		if (mode) skills[skill] = mode;
		else delete skills[skill];
		if (Object.keys(skills).length) block.skills = skills;
		else delete block.skills;
	}
	if (Object.keys(block).length) next[SETTINGS_KEY] = block;
	else delete next[SETTINGS_KEY];
	return next;
}

export function saveSkillMode(path: string, skill: string | "*default", mode: Mode | undefined) {
	editConfig(path, (data) => applySkillMode(data, skill, mode));
}
