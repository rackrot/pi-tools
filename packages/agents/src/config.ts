import { join } from "node:path";
import { configPath, readConfig } from "@rackrot/pi-core/config";

export const THINKING_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh", "max"] as const;
export type ThinkingLevel = (typeof THINKING_LEVELS)[number];

/** Per-agent tuning. Every field is optional; an unset field leaves pi-subagents' own behavior. */
export interface Tuning {
	model?: string;
	thinking?: ThinkingLevel;
	maxTurns?: number;
	/** When true, the configured fields override the caller's instead of only filling unset ones. */
	lock?: boolean;
}

export type Overrides = Record<string, Tuning>;

/** Agent types are matched case-insensitively, as pi-subagents does. */
const key = (name: string) => name.toLowerCase();

/** Keeps only well-formed fields; anything else is dropped rather than passed to the Agent tool. */
export function parseOverrides(raw: unknown): Overrides {
	const out: Overrides = {};
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
	for (const [name, value] of Object.entries(raw)) {
		if (!value || typeof value !== "object") continue;
		const v = value as Record<string, unknown>;
		const t: Tuning = {};
		if (typeof v.model === "string" && v.model.trim()) t.model = v.model.trim();
		if (THINKING_LEVELS.includes(v.thinking as ThinkingLevel))
			t.thinking = v.thinking as ThinkingLevel;
		if (typeof v.maxTurns === "number" && Number.isInteger(v.maxTurns) && v.maxTurns >= 1) {
			t.maxTurns = v.maxTurns;
		}
		if (typeof v.lock === "boolean") t.lock = v.lock;
		if (Object.keys(t).length) out[key(name)] = t;
	}
	return out;
}

/** Field-by-field merge; later layers win. Layers: package defaults, global config, project config. */
export function resolveTuning(name: string, layers: Overrides[]): Tuning {
	const merged: Tuning = {};
	for (const layer of layers) Object.assign(merged, layer[key(name)]);
	return merged;
}

/** Config `lock` wins, including `false`; the agent file's frontmatter `lock` is the fallback. */
export const isLocked = (tuning: Tuning, frontmatter: boolean | undefined): boolean =>
	tuning.lock ?? frontmatter ?? false;

/**
 * Sets `model`, `thinking` and `max_turns` of an `Agent` call from `tuning`. Unlocked, fields the
 * caller set are kept; locked, the configured values overwrite them.
 */
export function applyTuning(input: Record<string, unknown>, tuning: Tuning, locked: boolean): void {
	const unset = (v: unknown) => locked || v === undefined || v === null || v === "";
	if (tuning.model && unset(input.model)) input.model = tuning.model;
	if (tuning.thinking && unset(input.thinking)) input.thinking = tuning.thinking;
	if (tuning.maxTurns && unset(input.max_turns)) input.max_turns = tuning.maxTurns;
}

/** Index of the highest layer that sets `field` for `name`, or -1. */
export function sourceLayer(name: string, field: keyof Tuning, layers: Overrides[]): number {
	for (let i = layers.length - 1; i >= 0; i--) {
		if (layers[i][key(name)]?.[field] !== undefined) return i;
	}
	return -1;
}

/** Names that have any tuning in any layer, for display. */
export function configuredNames(layers: Overrides[]): string[] {
	return [...new Set(layers.flatMap((l) => Object.keys(l)))].sort();
}

/**
 * `agentOverrides` as the `args.agents` map the shipped workflows read (`model` and `effort` per
 * agent type). Workflow `agent()` calls do not pass through the `Agent` tool hook, and a workflow
 * has no `maxTurns` or `off`, so those are left out.
 */
export function workflowAgents(
	layers: Overrides[],
): Record<string, { model?: string; effort?: string }> {
	const out: Record<string, { model?: string; effort?: string }> = {};
	for (const name of configuredNames(layers)) {
		const { model, thinking } = resolveTuning(name, layers);
		const entry = {
			...(model && { model }),
			...(thinking && thinking !== "off" && { effort: thinking }),
		};
		if (Object.keys(entry).length) out[name] = entry;
	}
	return out;
}

/** Adds configured agents under `args.agents`; anything the caller passed wins, except for `locked` agents. */
export function withConfiguredAgents(
	args: unknown,
	configured: Record<string, { model?: string; effort?: string }>,
	locked: ReadonlySet<string> = new Set(),
): unknown {
	if (!Object.keys(configured).length) return args;
	let base: unknown = args;
	if (typeof args === "string") {
		try {
			base = JSON.parse(args);
		} catch {
			return args;
		}
	}
	if (base === undefined || base === null) base = {};
	if (typeof base !== "object" || Array.isArray(base)) return args;
	const given = (base as { agents?: unknown }).agents;
	const agents = given && typeof given === "object" && !Array.isArray(given) ? given : {};
	const merged: Record<string, unknown> = { ...agents };
	const lower = new Map(Object.keys(agents).map((k) => [k.toLowerCase(), k]));
	for (const [k, entry] of Object.entries(configured)) {
		const given = lower.get(k);
		if (given === undefined) merged[k] = entry;
		else if (locked.has(k)) merged[given] = { ...(merged[given] as object), ...entry };
	}
	return { ...base, agents: merged };
}

export const SETTINGS_KEY = "agentOverrides";

/** Layers in precedence order, lowest first. */
export function loadLayers(packageDir: string, agentDir: string, cwd: string): Overrides[] {
	return [
		parseOverrides(readConfig(join(packageDir, "defaults.json"))),
		parseOverrides(readConfig(configPath("global", cwd, agentDir))[SETTINGS_KEY]),
		parseOverrides(readConfig(configPath("project", cwd, agentDir))[SETTINGS_KEY]),
	];
}
