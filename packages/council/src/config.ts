import { readConfigLayers } from "@rackrot/pi-core/config";
import { type ModelRef, parseRef, THINKING, type Thinking } from "@rackrot/pi-core/model-call";

export { type ModelRef, parseRef, THINKING, type Thinking } from "@rackrot/pi-core/model-call";

export interface SecondOpinionOption extends ModelRef {
	/** Name the agent passes as `model`. Defaults to the model string. */
	id: string;
	/** When the agent should pick this model over the default. Shown in the tool description. */
	useWhen: string;
}

export interface SecondOpinionConfig {
	enabled: boolean;
	/** Default model; `undefined` falls back to the session's current model. */
	default?: ModelRef;
	options: SecondOpinionOption[];
	systemPrompt?: string;
	maxTokens?: number;
	timeoutSeconds: number;
}

export interface Councillor {
	/** Ordered fallback chain: the next entry is tried when one fails. */
	chain: ModelRef[];
	/** Role guidance appended to the councillor's system prompt. */
	prompt?: string;
}

export interface Preset {
	useWhen?: string;
	councillors: Record<string, Councillor>;
}

export interface CouncilConfig {
	enabled: boolean;
	defaultPreset: string;
	presets: Record<string, Preset>;
	synthesizer: {
		/** false: return the raw councillor answers and let the calling agent synthesize. */
		enabled: boolean;
		chain: ModelRef[];
		prompt?: string;
	};
	councillorPrompt?: string;
	maxTokens?: number;
	timeoutSeconds: number;
}

export interface Config {
	secondOpinion: SecondOpinionConfig;
	council: CouncilConfig;
	/** Per-file cap when embedding `files`. */
	maxFileBytes: number;
}

const DEFAULT_TIMEOUT = 300;
const DEFAULT_MAX_FILE_BYTES = 100_000;

const isObj = (v: unknown): v is Record<string, unknown> =>
	!!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const num = (v: unknown) => (typeof v === "number" && v > 0 ? v : undefined);
const thinking = (v: unknown) => THINKING.find((t) => t === v);

/** Accepts a ref or an array of refs (fallback chain). `thinking` applies to entries without their own. */
export function parseChain(v: unknown, inherit?: Thinking): ModelRef[] {
	const list = Array.isArray(v) ? v : v === undefined ? [] : [v];
	return list.flatMap((e) => parseRef(e, inherit) ?? []);
}

export function parseConfig(raw: unknown): Config {
	const r = isObj(raw) ? raw : {};
	const so = isObj(r.secondOpinion) ? r.secondOpinion : {};
	const co = isObj(r.council) ? r.council : {};

	const soThinking = thinking(so.thinking);
	const options: SecondOpinionOption[] = [];
	for (const o of Array.isArray(so.models) ? so.models : []) {
		const ref = parseRef(o);
		if (!ref || !isObj(o)) continue;
		options.push({ ...ref, id: str(o.id) ?? ref.model, useWhen: str(o.useWhen) ?? "" });
	}

	const presets: Record<string, Preset> = {};
	for (const [name, p] of Object.entries(isObj(co.presets) ? co.presets : {})) {
		if (!isObj(p)) continue;
		const councillors: Record<string, Councillor> = {};
		for (const [cname, c] of Object.entries(isObj(p.councillors) ? p.councillors : {})) {
			if (!isObj(c)) continue;
			const chain = parseChain(c.model, thinking(c.thinking));
			if (chain.length) councillors[cname] = { chain, prompt: str(c.prompt) };
		}
		if (Object.keys(councillors).length) presets[name] = { useWhen: str(p.useWhen), councillors };
	}
	const syn = isObj(co.synthesizer) ? co.synthesizer : {};
	const defaultPreset = str(co.defaultPreset) ?? "default";

	return {
		maxFileBytes: num(r.maxFileBytes) ?? DEFAULT_MAX_FILE_BYTES,
		secondOpinion: {
			enabled: so.enabled !== false,
			default: parseRef(so.model, soThinking),
			options,
			systemPrompt: str(so.systemPrompt),
			maxTokens: num(so.maxTokens),
			timeoutSeconds: num(so.timeoutSeconds) ?? DEFAULT_TIMEOUT,
		},
		council: {
			enabled: co.enabled !== false,
			defaultPreset,
			presets,
			synthesizer: {
				enabled: syn.enabled !== false,
				chain: parseChain(syn.model, thinking(syn.thinking)),
				prompt: str(syn.prompt),
			},
			councillorPrompt: str(co.councillorPrompt),
			maxTokens: num(co.maxTokens),
			timeoutSeconds: num(co.timeoutSeconds) ?? DEFAULT_TIMEOUT,
		},
	};
}

/** Merges the `council` config key: project over global, per top-level section. */
export function loadConfig(cwd: string = process.cwd()): Config {
	const [g, p] = readConfigLayers("council", cwd);
	const gg = isObj(g) ? g : {};
	const pp = isObj(p) ? p : {};
	const merged: Record<string, unknown> = { ...gg, ...pp };
	for (const k of ["secondOpinion", "council"]) {
		merged[k] = { ...(isObj(gg[k]) ? gg[k] : {}), ...(isObj(pp[k]) ? pp[k] : {}) };
	}
	return parseConfig(merged);
}
