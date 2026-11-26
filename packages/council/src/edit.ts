import { editConfig, readConfig } from "@rackrot/pi-core/config";
import { type Config, parseChain, THINKING } from "./config.ts";

export type Obj = Record<string, unknown>;

export const UNSET = "unset";
const NONE = "(none)";

/** One editable line in the settings screen. `apply` mutates the raw `council` object of one settings file. */
export interface Row {
	id: string;
	/** Screen partition the row is shown under. */
	group: string;
	label: string;
	description: string;
	current: string;
	values?: string[];
	/** Opens a model picker (`model`) or a text input (`text`) instead of cycling. */
	submenu?: "model" | "text";
	apply(council: Obj, value: string): void;
}

const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);

function child(o: Obj, key: string): Obj {
	if (!isObj(o[key])) o[key] = {};
	return o[key] as Obj;
}

function put(o: Obj, key: string, v: unknown) {
	if (v === undefined) delete o[key];
	else o[key] = v;
}

/** Sets or clears the first model of a `model` field that may be a string, object or fallback chain. */
export function setFirstModel(o: Obj, key: string, value: string) {
	const raw = o[key];
	if (value === UNSET || value === NONE) {
		if (Array.isArray(raw) && raw.length > 1) raw.shift();
		else delete o[key];
		return;
	}
	const swap = (e: unknown) => (isObj(e) ? { ...e, model: value } : value);
	if (Array.isArray(raw)) raw[0] = swap(raw[0]);
	else o[key] = swap(raw);
}

const firstModel = (raw: unknown) => parseChain(raw)[0]?.model;

function cycleValues(current: string, base: string[]): string[] {
	return current === UNSET || base.includes(current) ? base : [...base, current];
}

const TIMEOUTS = ["60", "120", "300", "600", "900"];
const TOKENS = ["2000", "4000", "8000", "16000", "32000"];

/** Builds every row for one settings layer (`layer` is its raw `council` object); `eff` is the merged result. */
export function buildRows(layer: Obj, eff: Config): Row[] {
	const rows: Row[] = [];
	let group = "";
	const so = isObj(layer.secondOpinion) ? layer.secondOpinion : {};
	const co = isObj(layer.council) ? layer.council : {};
	const syn = isObj(co.synthesizer) ? co.synthesizer : {};

	const toggle = (
		id: string,
		label: string,
		raw: unknown,
		effective: boolean,
		set: (c: Obj, v: boolean) => void,
	) =>
		rows.push({
			id,
			group,
			label,
			description: `Effective: ${effective ? "on" : "off"}. Saving writes an explicit value to this scope.`,
			current: typeof raw === "boolean" ? (raw ? "on" : "off") : effective ? "on" : "off",
			values: ["on", "off"],
			apply: (c, v) => set(c, v === "on"),
		});

	const cycle = (
		id: string,
		label: string,
		raw: unknown,
		base: string[],
		desc: string,
		set: (c: Obj, v: string | undefined) => void,
	) => {
		const current = raw === undefined ? UNSET : String(raw);
		rows.push({
			id,
			group,
			label,
			description: `${desc} "${UNSET}" clears the value in this scope.`,
			current,
			values: cycleValues(current, [UNSET, ...base]),
			apply: (c, v) => set(c, v === UNSET ? undefined : v),
		});
	};

	const text = (
		id: string,
		label: string,
		raw: unknown,
		desc: string,
		set: (c: Obj, v: string | undefined) => void,
	) =>
		rows.push({
			id,
			group,
			label,
			description: `${desc} Empty clears the value.`,
			current:
				typeof raw === "string" && raw ? (raw.length > 40 ? `${raw.slice(0, 37)}...` : raw) : UNSET,
			submenu: "text",
			apply: (c, v) => set(c, v.trim() || undefined),
		});

	const model = (
		id: string,
		label: string,
		raw: unknown,
		desc: string,
		set: (c: Obj, v: string) => void,
	) =>
		rows.push({
			id,
			group,
			label,
			description: desc,
			current: firstModel(raw) ?? UNSET,
			submenu: "model",
			apply: (c, v) => set(c, v),
		});

	const action = (id: string, label: string, desc: string, run: (c: Obj) => void) =>
		rows.push({
			id,
			group,
			label,
			description: desc,
			current: "…",
			values: ["…", "remove"],
			apply: (c, v) => v === "remove" && run(c),
		});

	const thinking = (
		id: string,
		label: string,
		raw: unknown,
		set: (c: Obj, v: string | undefined) => void,
	) => cycle(id, label, raw, [...THINKING], "Reasoning effort; unset uses the model default.", set);

	// second_opinion
	group = "second_opinion";
	const sc = (c: Obj) => child(c, "secondOpinion");
	toggle("so.enabled", "enabled", so.enabled, eff.secondOpinion.enabled, (c, v) =>
		put(sc(c), "enabled", v),
	);
	model(
		"so.model",
		"default model",
		so.model,
		"Model used when the agent passes none. Unset uses the session's model.",
		(c, v) => setFirstModel(sc(c), "model", v),
	);
	thinking("so.thinking", "thinking", so.thinking, (c, v) => put(sc(c), "thinking", v));
	cycle("so.maxTokens", "max tokens", so.maxTokens, TOKENS, "Output cap per call.", (c, v) =>
		put(sc(c), "maxTokens", v && Number(v)),
	);
	cycle(
		"so.timeout",
		"timeout (s)",
		so.timeoutSeconds,
		TIMEOUTS,
		`Per call. Effective: ${eff.secondOpinion.timeoutSeconds}.`,
		(c, v) => put(sc(c), "timeoutSeconds", v && Number(v)),
	);
	text(
		"so.prompt",
		"extra prompt",
		so.systemPrompt,
		"Appended to the reviewer's system prompt.",
		(c, v) => put(sc(c), "systemPrompt", v),
	);
	const opts = Array.isArray(so.models) ? so.models : [];
	opts.forEach((entry, i) => {
		const e = isObj(entry) ? entry : {};
		group = `second_opinion option ${typeof e.id === "string" ? e.id : (firstModel(e) ?? i + 1)}`;
		const at = (c: Obj) => {
			const list = sc(c).models as unknown[];
			if (!isObj(list[i])) list[i] = {};
			return list[i] as Obj;
		};
		const p = `so.opt.${i}`;
		model(`${p}.model`, "model", e.model, "Model the agent can switch to.", (c, v) =>
			setFirstModel(at(c), "model", v),
		);
		text(
			`${p}.id`,
			"id",
			e.id,
			"Name the agent passes as 'model'. Defaults to the model string.",
			(c, v) => put(at(c), "id", v),
		);
		text(
			`${p}.useWhen`,
			"use when",
			e.useWhen,
			"Tells the agent when to pick this model over the default.",
			(c, v) => put(at(c), "useWhen", v),
		);
		thinking(`${p}.thinking`, "thinking", e.thinking, (c, v) => put(at(c), "thinking", v));
		action(`${p}.remove`, "remove", "Delete this option.", (c) =>
			(sc(c).models as unknown[]).splice(i, 1),
		);
	});
	group = "second_opinion";
	rows.push({
		id: "so.add",
		group,
		label: "add option",
		description: "Pick a model to add as an override option, then set its 'use when'.",
		current: "pick…",
		submenu: "model",
		apply: (c, v) => {
			const s = sc(c);
			if (!Array.isArray(s.models)) s.models = [];
			(s.models as unknown[]).push({ model: v, useWhen: "" });
		},
	});

	// council
	group = "council";
	const cc = (c: Obj) => child(c, "council");
	toggle("co.enabled", "enabled", co.enabled, eff.council.enabled, (c, v) =>
		put(cc(c), "enabled", v),
	);
	cycle(
		"co.default",
		"default preset",
		co.defaultPreset,
		Object.keys(eff.council.presets),
		`Effective: ${eff.council.defaultPreset}.`,
		(c, v) => put(cc(c), "defaultPreset", v),
	);
	cycle(
		"co.maxTokens",
		"max tokens",
		co.maxTokens,
		TOKENS,
		"Output cap per councillor and synthesizer call.",
		(c, v) => put(cc(c), "maxTokens", v && Number(v)),
	);
	cycle(
		"co.timeout",
		"timeout (s)",
		co.timeoutSeconds,
		TIMEOUTS,
		`Per call. Effective: ${eff.council.timeoutSeconds}.`,
		(c, v) => put(cc(c), "timeoutSeconds", v && Number(v)),
	);
	text(
		"co.prompt",
		"councillor prompt",
		co.councillorPrompt,
		"Appended to every councillor's system prompt.",
		(c, v) => put(cc(c), "councillorPrompt", v),
	);
	group = "council synthesizer";
	const sy = (c: Obj) => child(cc(c), "synthesizer");
	toggle("syn.enabled", "enabled", syn.enabled, eff.council.synthesizer.enabled, (c, v) =>
		put(sy(c), "enabled", v),
	);
	model("syn.model", "model", syn.model, "Unset uses the session's model.", (c, v) =>
		setFirstModel(sy(c), "model", v),
	);
	thinking("syn.thinking", "thinking", syn.thinking, (c, v) => put(sy(c), "thinking", v));
	text("syn.prompt", "prompt", syn.prompt, "Appended to the synthesizer's system prompt.", (c, v) =>
		put(sy(c), "prompt", v),
	);

	const presets = isObj(co.presets) ? co.presets : {};
	for (const [pn, praw] of Object.entries(presets)) {
		const pr = isObj(praw) ? praw : {};
		const pat = (c: Obj) => child(child(cc(c), "presets"), pn);
		group = `preset ${pn}`;
		text(
			`pr.${pn}.useWhen`,
			"use when",
			pr.useWhen,
			"Tells the agent when to pick this preset.",
			(c, v) => put(pat(c), "useWhen", v),
		);
		rows.push({
			id: `pr.${pn}.add`,
			group,
			label: "add councillor",
			description:
				"Pick a model; the councillor is named after it. Rename by editing settings.json.",
			current: "pick…",
			submenu: "model",
			apply: (c, v) => {
				const list = child(pat(c), "councillors");
				const base = v.slice(v.lastIndexOf("/") + 1);
				let name = base;
				for (let n = 2; name in list; n++) name = `${base}-${n}`;
				list[name] = { model: v };
			},
		});
		action(
			`pr.${pn}.remove`,
			"remove",
			"Delete this preset.",
			(c) => delete child(cc(c), "presets")[pn],
		);
		for (const [cn, craw] of Object.entries(isObj(pr.councillors) ? pr.councillors : {})) {
			const cr = isObj(craw) ? craw : {};
			const cat = (c: Obj) => child(child(pat(c), "councillors"), cn);
			group = `preset ${pn} / ${cn}`;
			model(
				`pr.${pn}.${cn}.model`,
				"model",
				cr.model,
				"First model of the chain; add fallbacks in settings.json.",
				(c, v) => setFirstModel(cat(c), "model", v),
			);
			thinking(`pr.${pn}.${cn}.thinking`, "thinking", cr.thinking, (c, v) =>
				put(cat(c), "thinking", v),
			);
			text(
				`pr.${pn}.${cn}.prompt`,
				"role prompt",
				cr.prompt,
				"Role guidance appended to this councillor's system prompt.",
				(c, v) => put(cat(c), "prompt", v),
			);
			action(
				`pr.${pn}.${cn}.remove`,
				"remove",
				"Delete this councillor.",
				(c) => delete child(pat(c), "councillors")[cn],
			);
		}
	}
	group = "council";
	rows.push({
		id: "co.addPreset",
		group,
		label: "add preset",
		description: "Type a name, then add councillors to it.",
		current: "name…",
		submenu: "text",
		apply: (c, v) => {
			const name = v.trim();
			if (name) child(child(cc(c), "presets"), name).councillors ??= {};
		},
	});
	return rows;
}

/** The raw `council` object of one config file; `{}` when missing or unreadable. */
export function readLayer(path: string): Obj {
	const c = readConfig(path).council;
	return isObj(c) ? c : {};
}

/** Applies `fn` to the file's `council` object and writes it back atomically, keeping other keys and comments. */
export function saveLayer(path: string, fn: (council: Obj) => void) {
	editConfig(path, (data) => {
		fn(child(data, "council"));
		return data;
	});
}
