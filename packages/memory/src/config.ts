import { homedir } from "node:os";
import { isAbsolute, resolve } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { readConfigLayers } from "@rackrot/pi-core/config";
import { type ModelRef, parseRef } from "@rackrot/pi-core/model-call";
import {
	DEFAULT_EMBEDDING,
	DEFAULT_RERANKER,
	type ModelProviderConfig,
} from "@rackrot/pi-core/retrieval";

export interface SummaryConfig {
	enabled: boolean;
	/** No default: without a model the summary worker is skipped (never the session's model). */
	model?: ModelRef;
	/** Notes added/updated/archived since the last summary before the worker runs at shutdown. */
	minChanges: number;
	timeoutSeconds: number;
}

export interface MemoryConfig {
	/** Git repo / Obsidian vault root. Read from the global layer only. */
	root?: string;
	/** Folder under root where the agent may write. */
	agentDir: string;
	/** Folder under agentDir holding one subfolder per project. */
	projects: string;
	project?: string;
	autoInject: boolean;
	/** 0 commits only at session end. */
	commitIntervalMinutes: number;
	push: "session" | "never";
	injectBudgetChars: number;
	summary: SummaryConfig;
	embedding: ModelProviderConfig;
	reranker?: ModelProviderConfig;
}

type Json = Record<string, unknown>;
const obj = (v: unknown): Json =>
	v && typeof v === "object" && !Array.isArray(v) ? (v as Json) : {};

/** A relative folder path without `..`, trimmed of slashes; anything else is ignored. */
function folder(v: unknown): string | undefined {
	if (typeof v !== "string") return;
	const p = v.replace(/^[\\/]+|[\\/]+$/g, "");
	return p && !isAbsolute(v) && !p.split(/[\\/]/).includes("..") ? p : undefined;
}

/** Copies the valid fields of a provider block. */
function provider(raw: unknown): Partial<ModelProviderConfig> {
	const r = obj(raw);
	const out: Partial<ModelProviderConfig> = {};
	if (r.provider === "onnx" || r.provider === "http" || r.provider === "none")
		out.provider = r.provider;
	for (const k of ["model", "baseUrl", "apiKeyEnv"] as const)
		if (typeof r[k] === "string" && r[k]) out[k] = r[k];
	return out;
}

/** Later blocks win. Returns undefined when none sets anything and there is no default. */
const mergeProvider = (base: ModelProviderConfig | undefined, blocks: unknown[]) => {
	const parts = blocks.map(provider).filter((p) => Object.keys(p).length);
	if (!parts.length) return base;
	return Object.assign({}, base ?? DEFAULT_RERANKER, ...parts) as ModelProviderConfig;
};

/**
 * Reads the `memory` key of the rackrot config. `root` comes from the global layer only, so a
 * checked-in project config can never redirect where the agent writes.
 */
export function loadConfig(cwd: string, agentDir: string = getAgentDir()): MemoryConfig {
	const [g, p] = readConfigLayers("memory", cwd, agentDir).map(obj);
	const skill = readConfigLayers("skillIndex", cwd, agentDir).map(obj);
	const both = [g, p];
	const pick = <T>(f: (j: Json) => T | undefined) => both.map(f).reduce((a, b) => b ?? a);

	const root = typeof g.root === "string" && g.root ? g.root : undefined;
	const interval = pick((j) =>
		typeof j.commitIntervalMinutes === "number" && j.commitIntervalMinutes >= 0
			? j.commitIntervalMinutes
			: undefined,
	);
	const budget = pick((j) =>
		Number.isInteger(j.injectBudgetChars) && (j.injectBudgetChars as number) > 0
			? (j.injectBudgetChars as number)
			: undefined,
	);
	const sums = both.map((j) => obj(j.summary));
	const sum = <T>(f: (j: Json) => T | undefined) => sums.map(f).reduce((a, b) => b ?? a);
	const posInt = (v: unknown) =>
		Number.isInteger(v) && (v as number) > 0 ? (v as number) : undefined;
	return {
		root: root && resolve(root.replace(/^~(?=$|[\\/])/, homedir())),
		agentDir: pick((j) => folder(j.agentDir)) ?? "Agent",
		projects: pick((j) => folder(j.projects)) ?? "Projects",
		project: pick((j) => (typeof j.project === "string" && j.project ? j.project : undefined)),
		autoInject: pick((j) => (typeof j.autoInject === "boolean" ? j.autoInject : undefined)) ?? true,
		commitIntervalMinutes: interval ?? 5,
		push:
			pick((j) => (j.push === "session" || j.push === "never" ? j.push : undefined)) ?? "session",
		injectBudgetChars: budget ?? 12000,
		summary: {
			enabled: sum((j) => (typeof j.enabled === "boolean" ? j.enabled : undefined)) ?? true,
			model: sum((j) => parseRef(j.model)),
			minChanges: sum((j) => posInt(j.minChanges)) ?? 3,
			timeoutSeconds: sum((j) => posInt(j.timeoutSeconds)) ?? 60,
		},
		embedding: mergeProvider(DEFAULT_EMBEDDING, [
			...skill.map((j) => j.embedding),
			...both.map((j) => j.embedding),
		]) as ModelProviderConfig,
		reranker: mergeProvider(undefined, [
			...skill.map((j) => j.reranker),
			...both.map((j) => j.reranker),
		]),
	};
}
