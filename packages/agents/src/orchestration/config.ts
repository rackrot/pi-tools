import { configPath, editConfig, readConfig, type Scope } from "@rackrot/pi-core/config";

export const LEVELS = ["off", "lean", "delegate", "orchestrator", "strict"] as const;
export type Level = (typeof LEVELS)[number];

export const SETTINGS_KEY = "orchestration";

/** Tools `strict` must never take from the main session: they are how it delegates and asks. */
export const PROTECTED_TOOLS = ["Agent", "get_subagent_result", "steer_subagent", "ask_user"];

/** Denied in `strict` unless configured otherwise: the tools that do the work itself. */
export const DEFAULT_DENIED = ["read", "edit", "write", "bash", "grep", "find", "ls"];

export interface Orchestration {
	level: Level;
	deniedTools: string[];
}

interface Raw {
	level?: Level;
	deniedTools?: string[];
}

/** Keeps only well-formed fields; anything else is ignored. */
export function parseRaw(raw: unknown): Raw {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
	const v = raw as Record<string, unknown>;
	const out: Raw = {};
	if (LEVELS.includes(v.level as Level)) out.level = v.level as Level;
	if (Array.isArray(v.deniedTools))
		out.deniedTools = v.deniedTools.filter((t): t is string => typeof t === "string");
	return out;
}

/** Layers, lowest first (global, project); a later layer replaces a field wholesale. */
export function resolve(layers: Raw[]): Orchestration {
	const merged: Raw = Object.assign({}, ...layers);
	return {
		level: merged.level ?? "off",
		deniedTools: merged.deniedTools ?? DEFAULT_DENIED,
	};
}

export function load(agentDir: string, cwd: string): Orchestration {
	return resolve(
		(["global", "project"] as const).map((s) =>
			parseRaw(readConfig(configPath(s, cwd, agentDir))[SETTINGS_KEY]),
		),
	);
}

export function save(path: string, patch: Raw) {
	editConfig(path, (data) => ({
		...data,
		[SETTINGS_KEY]: { ...(parseRaw(data[SETTINGS_KEY]) as object), ...patch },
	}));
}

export type { Scope };
