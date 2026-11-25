import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { parseEntry } from "./select.ts";

export interface AccountClone {
	/** Provider whose models are copied. */
	from: string;
	/** API key literal, `$ENV_VAR`, or `!command`. */
	apiKey: string;
}

export interface AliasConfig {
	aliases: Record<string, string[]>;
	accounts: Record<string, AccountClone>;
	cooldownMs: number;
}

const DEFAULT_COOLDOWN_MINUTES = 60;

function readJson(path: string): Record<string, unknown> {
	if (!existsSync(path)) return {};
	try {
		return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
	} catch {
		return {};
	}
}

/** Reads `modelAliases`, `modelAliasAccounts`, `modelAliasCooldownMinutes` from global then project settings. */
export function loadConfig(cwd: string = process.cwd()): AliasConfig {
	const global = readJson(join(getAgentDir(), "settings.json"));
	const project = readJson(join(cwd, ".pi", "settings.json"));
	const merged = { ...global, ...project };

	const aliases: Record<string, string[]> = {};
	const rawAliases = (merged.modelAliases ?? {}) as Record<string, unknown>;
	for (const [name, list] of Object.entries(rawAliases)) {
		if (!Array.isArray(list)) continue;
		const entries = list.filter((e): e is string => typeof e === "string" && !!parseEntry(e));
		if (entries.length) aliases[name] = entries;
	}

	const accounts: Record<string, AccountClone> = {};
	const rawAccounts = (merged.modelAliasAccounts ?? {}) as Record<string, Partial<AccountClone>>;
	for (const [name, acc] of Object.entries(rawAccounts)) {
		if (acc && typeof acc.from === "string" && typeof acc.apiKey === "string") {
			accounts[name] = { from: acc.from, apiKey: acc.apiKey };
		}
	}

	const minutes =
		typeof merged.modelAliasCooldownMinutes === "number"
			? merged.modelAliasCooldownMinutes
			: DEFAULT_COOLDOWN_MINUTES;
	return { aliases, accounts, cooldownMs: minutes * 60_000 };
}
