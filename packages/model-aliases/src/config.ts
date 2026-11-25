import { configPath, readConfig } from "@rackrot/pi-core/config";
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

/** Reads `modelAliases`, `modelAliasAccounts`, `modelAliasCooldownMinutes` from the global then project rackrot config. */
export function loadConfig(cwd: string = process.cwd()): AliasConfig {
	const global = readConfig(configPath("global", cwd));
	const project = readConfig(configPath("project", cwd));
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
