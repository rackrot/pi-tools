import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const THINKING_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh", "max"] as const;
export type ThinkingLevel = (typeof THINKING_LEVELS)[number];

/** Per-agent tuning. Every field is optional; an unset field leaves pi-subagents' own behavior. */
export interface Tuning {
	model?: string;
	thinking?: ThinkingLevel;
	maxTurns?: number;
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
		if (Object.keys(t).length) out[key(name)] = t;
	}
	return out;
}

/** Field-by-field merge; later layers win. Layers: package defaults, global settings, project settings. */
export function resolveTuning(name: string, layers: Overrides[]): Tuning {
	const merged: Tuning = {};
	for (const layer of layers) Object.assign(merged, layer[key(name)]);
	return merged;
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

function readJson(path: string): Record<string, unknown> {
	if (!existsSync(path)) return {};
	try {
		return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
	} catch {
		return {};
	}
}

export const SETTINGS_KEY = "agentOverrides";

/** Layers in precedence order, lowest first. */
export function loadLayers(packageDir: string, agentDir: string, cwd: string): Overrides[] {
	return [
		parseOverrides(readJson(join(packageDir, "defaults.json"))),
		parseOverrides(readJson(join(agentDir, "settings.json"))[SETTINGS_KEY]),
		parseOverrides(readJson(join(cwd, ".pi", "settings.json"))[SETTINGS_KEY]),
	];
}
