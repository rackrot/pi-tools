import { configPath, editConfig, readConfig } from "@rackrot/pi-core/config";
import {
	DEFAULT_EMBEDDING,
	DEFAULT_RERANKER,
	type ModelProviderConfig,
} from "@rackrot/pi-core/retrieval";

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
export const DEFAULT_DECISION: DecisionConfig = {
	enabled: false,
	provider: "typesafe",
	model: "jev-latest",
	threshold: 0.5,
};

/**
 * Optional relevance filter: a System One model answers one yes/no (noul) question per candidate.
 * `typesafe` calls any endpoint that serves `/v1/systemone`; `laya` runs @receptron/laya locally.
 */
export interface DecisionConfig {
	enabled: boolean;
	provider: "typesafe" | "laya";
	baseUrl?: string;
	model: string;
	apiKeyEnv?: string;
	/** Candidates whose noul probability is below this are dropped. */
	threshold: number;
}

export interface Config {
	default: Mode;
	/** Exact names or `*` globs. */
	skills: Record<string, Mode>;
	limit: number;
	embedding: ModelProviderConfig;
	reranker: ModelProviderConfig;
	decision: DecisionConfig;
}

const isMode = (v: unknown): v is Mode => MODES.includes(v as Mode);

type Json = Record<string, unknown>;

const isObj = (v: unknown): v is Json => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

/** Copies the valid fields of a provider block. */
function parseProvider(raw: unknown, providers: readonly string[]): Json {
	const out: Json = {};
	if (!isObj(raw)) return out;
	if (providers.includes(raw.provider as string)) out.provider = raw.provider;
	for (const k of ["model", "baseUrl", "apiKeyEnv"]) if (str(raw[k])) out[k] = raw[k];
	if (typeof raw.enabled === "boolean") out.enabled = raw.enabled;
	if (typeof raw.threshold === "number" && raw.threshold >= 0 && raw.threshold <= 1)
		out.threshold = raw.threshold;
	return out;
}

/** One config layer: every field optional, provider blocks partial. */
export interface LayerConfig {
	default?: Mode;
	skills?: Record<string, Mode>;
	limit?: number;
	embedding?: Partial<ModelProviderConfig>;
	reranker?: Partial<ModelProviderConfig>;
	decision?: Partial<DecisionConfig>;
}

/** One config layer; invalid parts are dropped. */
export function parseLayer(raw: unknown): LayerConfig {
	const out: LayerConfig = {};
	if (!isObj(raw)) return out;
	const r = raw;
	for (const [k, providers] of [
		["embedding", ["onnx", "http", "none"]],
		["reranker", ["onnx", "http", "none"]],
		["decision", ["typesafe", "laya"]],
	] as const) {
		const block = parseProvider(r[k], providers);
		if (Object.keys(block).length) out[k] = block as never;
	}
	if (isMode(r.default)) out.default = r.default;
	if (typeof r.limit === "number" && Number.isInteger(r.limit) && r.limit >= 1) out.limit = r.limit;
	if (r.skills && typeof r.skills === "object" && !Array.isArray(r.skills)) {
		out.skills = {};
		for (const [k, v] of Object.entries(r.skills)) if (isMode(v)) out.skills[k] = v;
	}
	return out;
}

/** Merge layers, later wins. Skill maps merge key by key. */
export function mergeLayers(layers: LayerConfig[]): Config {
	const cfg: Config = {
		default: DEFAULT_MODE,
		skills: {},
		limit: DEFAULT_LIMIT,
		embedding: { ...DEFAULT_EMBEDDING },
		reranker: { ...DEFAULT_RERANKER },
		decision: { ...DEFAULT_DECISION },
	};
	for (const l of layers) {
		if (l.default) cfg.default = l.default;
		if (l.limit) cfg.limit = l.limit;
		Object.assign(cfg.skills, l.skills);
		for (const k of ["embedding", "reranker", "decision"] as const) Object.assign(cfg[k], l[k]);
	}
	return cfg;
}

export function loadLayers(cwd: string): LayerConfig[] {
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
