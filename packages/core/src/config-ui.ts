import { existsSync } from "node:fs";
import {
	type ExtensionAPI,
	type ExtensionCommandContext,
	getSelectListTheme,
	getSettingsListTheme,
} from "@earendil-works/pi-coding-agent";
import {
	type Component,
	Container,
	Input,
	SelectList,
	type SettingItem,
	SettingsList,
	Text,
} from "@earendil-works/pi-tui";
import { configPath, editConfig, readConfig, type Scope } from "./config.ts";
import { isObject, type Json, writeTextAtomic } from "./json.ts";

/** A simple scalar setting at `path` inside the rackrot config. */
export interface ConfigField {
	path: string[];
	label: string;
	description?: string;
	kind: "enum" | "boolean" | "number" | "text";
	/** Choices for `enum`. */
	values?: string[];
}

/**
 * One package's part of `/rackrot-config`. Give `fields` for plain scalars (core draws the screen,
 * with global/project save target), or `open` for a custom editor. `summary` feeds `/rackrot-config show`.
 */
export interface ConfigSection {
	id: string;
	label: string;
	fields?: ConfigField[];
	open?: (ctx: ExtensionCommandContext) => Promise<void>;
	summary?: (ctx: ExtensionCommandContext) => string;
	/** Top-level config keys with their defaults and sample values; `/rackrot-init` writes it commented out. */
	example?: Json;
}

const REGISTRY = Symbol.for("@rackrot/pi-core:config-sections");
type Holder = { [REGISTRY]?: Map<string, ConfigSection> };

/** Shared through `globalThis` because pi may load each package with its own copy of this module. */
function sections(): Map<string, ConfigSection> {
	const g = globalThis as Holder;
	return (g[REGISTRY] ??= new Map());
}

export function registerConfigSection(section: ConfigSection): void {
	sections().set(section.id, section);
}

const UNSET = "inherit";

const getPath = (data: Json, path: string[]): unknown =>
	path.reduce<unknown>((o, k) => (isObject(o) ? o[k] : undefined), data);

/** Returns `data` with the value at `path` set, or removed (and emptied parents pruned) when undefined. */
function setPath(data: Json, path: string[], value: unknown): Json {
	const [head, ...rest] = path;
	const next: Json = { ...data };
	if (!rest.length) {
		if (value === undefined) delete next[head];
		else next[head] = value;
		return next;
	}
	const child = setPath(isObject(next[head]) ? next[head] : {}, rest, value);
	if (Object.keys(child).length) next[head] = child;
	else delete next[head];
	return next;
}

const show = (v: unknown) => (v === undefined ? UNSET : String(v));

function parseValue(f: ConfigField, raw: string): unknown {
	if (raw === UNSET || raw === "") return undefined;
	if (f.kind === "boolean") return raw === "true";
	if (f.kind === "number") {
		const n = Number(raw);
		if (!Number.isFinite(n)) throw new Error(`${f.label}: "${raw}" is not a number`);
		return n;
	}
	return raw;
}

function textEditor(initial: string, done: (v?: string) => void): Component {
	const input = new Input({ prompt: "> " });
	input.setValue(initial);
	input.onSubmit = (v) => done(v);
	input.onEscape = () => done();
	return input;
}

/** Opens the field screen for one section. Resolves true when anything was saved. */
async function openFields(ctx: ExtensionCommandContext, s: ConfigSection): Promise<boolean> {
	const fields = s.fields ?? [];
	let scope: Scope = "global";
	let dirty = false;
	const cwd = ctx.cwd;
	const layer = (sc: Scope) => readConfig(configPath(sc, cwd));

	const build = (): SettingItem[] => {
		const here = layer(scope);
		const global = layer("global");
		const project = layer("project");
		return fields.map((f) => {
			const eff = getPath(project, f.path) ?? getPath(global, f.path);
			const values = f.kind === "boolean" ? ["true", "false"] : f.values;
			return {
				id: f.path.join("."),
				label: f.label,
				description:
					`${f.description ?? ""} Effective: ${show(eff)}. "${UNSET}" clears the ${scope} value (project wins over global).`.trim(),
				currentValue: show(getPath(here, f.path)),
				values: values ? [UNSET, ...values] : undefined,
				submenu: values ? undefined : (cur, done) => textEditor(cur === UNSET ? "" : cur, done),
			};
		});
	};

	await ctx.ui.custom<void>((tui, theme, kb, done) => {
		const items = build();
		const title = new Text("", 0, 0);
		const file = new Text("", 0, 0);
		const status = new Text("", 0, 0);
		const header = new Container();
		header.addChild(title);
		header.addChild(file);
		const tabKey = kb.getKeys("tui.input.tab")[0];
		const renderHeader = () => {
			title.setText(
				`⚙  ${s.label} · Saving to: ${scope === "global" ? "Global" : "Project"}${tabKey ? theme.fg("muted", ` · ${tabKey} to switch`) : ""}`,
			);
			file.setText(theme.fg("muted", `   ${configPath(scope, cwd)}`));
		};
		const refresh = () => {
			const fresh = new Map(build().map((i) => [i.id, i]));
			for (const item of items) {
				const n = fresh.get(item.id);
				if (n) Object.assign(item, { currentValue: n.currentValue, description: n.description });
			}
			renderHeader();
			list.invalidate();
		};
		const list = new SettingsList(
			items,
			Math.min(Math.max(5, tui.terminal.rows - 10), Math.max(items.length, 1)),
			getSettingsListTheme(),
			(id, next) => {
				const f = fields.find((x) => x.path.join(".") === id);
				try {
					if (!f) return;
					const v = parseValue(f, next);
					editConfig(configPath(scope, cwd), (d) => setPath(d, f.path, v));
					dirty = true;
					status.setText("");
				} catch (e) {
					status.setText(theme.fg("error", `   ${e instanceof Error ? e.message : String(e)}`));
				}
				refresh();
			},
			() => done(),
			{ enableSearch: true },
		);
		renderHeader();
		return {
			render: (w) => [...header.render(w), "", ...list.render(w), ...status.render(w)],
			invalidate: () => {
				header.invalidate();
				list.invalidate();
			},
			handleInput: (data) => {
				if (kb.matches(data, "tui.input.tab")) {
					scope = scope === "global" ? "project" : "global";
					refresh();
					return;
				}
				list.handleInput(data);
			},
		} as Component;
	});
	return dirty;
}

async function openSection(ctx: ExtensionCommandContext, s: ConfigSection): Promise<void> {
	if (s.open) return s.open(ctx);
	if (s.fields && (await openFields(ctx, s))) await ctx.reload();
}

function picker(items: { value: string; label: string }[], done: (v?: string) => void): Component {
	const list = new SelectList(items, Math.min(items.length, 12), getSelectListTheme());
	list.onSelect = (i) => done(i.value);
	list.onCancel = () => done();
	return list;
}

/** Registers `/rackrot-config`: pick a section (or name one as the argument), or `show` for summaries. */
export function registerConfigCommand(pi: ExtensionAPI): void {
	pi.registerCommand("rackrot-config", {
		description:
			"Edit rackrot extension config (global or project). Optional section name; `show` prints summaries.",
		handler: async (args, ctx) => {
			const all = [...sections().values()].sort((a, b) => a.label.localeCompare(b.label));
			const arg = args.trim();
			if (arg === "show" || !ctx.hasUI) {
				const lines = all.map((s) => `${s.label}: ${s.summary?.(ctx) ?? "(no summary)"}`);
				ctx.ui.notify(lines.join("\n") || "No rackrot config sections registered.", "info");
				return;
			}
			let section = all.find((s) => s.id === arg);
			if (!section) {
				if (arg) {
					ctx.ui.notify(
						`Unknown section "${arg}". Sections: ${all.map((s) => s.id).join(", ")}`,
						"warning",
					);
					return;
				}
				if (!all.length) {
					ctx.ui.notify("No rackrot config sections registered.", "info");
					return;
				}
				const id = await ctx.ui.custom<string | undefined>((_tui, _theme, _kb, done) =>
					picker(
						all.map((s) => ({ value: s.id, label: s.label })),
						done,
					),
				);
				section = all.find((s) => s.id === id);
			}
			if (section) await openSection(ctx, section);
		},
	});
}

/** Every section's example as commented-out config, so uncommenting a block (and fixing commas) enables it. */
function renderExample(all: ConfigSection[]): string {
	const out = [
		"{",
		"  // rackrot config. Everything below is an example or a default, commented out.",
		"  // Uncomment a block to use it (mind the commas). Project config (.pi/rackrot.json) overrides this file.",
	];
	for (const s of all) {
		if (!s.example) continue;
		out.push("", `  // ── ${s.label} ──`);
		for (const [key, value] of Object.entries(s.example)) {
			const body = `${JSON.stringify(key)}: ${JSON.stringify(value, null, 2)},`;
			for (const line of body.split("\n")) out.push(`  // ${line}`);
		}
	}
	out.push("}", "");
	return out.join("\n");
}

/**
 * Registers `/rackrot-init`, which writes the global config with commented examples. Skipped
 * entirely when a global config already exists.
 */
export function registerInitCommand(pi: ExtensionAPI): void {
	if (existsSync(configPath("global", process.cwd()))) return;
	pi.registerCommand("rackrot-init", {
		description: "Write the global rackrot config with defaults and examples for every setting.",
		handler: async (_args, ctx) => {
			const path = configPath("global", ctx.cwd);
			if (existsSync(path)) {
				ctx.ui.notify(`${path} already exists; not overwriting.`, "warning");
				return;
			}
			const target = path.replace(/\.json$/, ".jsonc");
			writeTextAtomic(target, renderExample([...sections().values()]));
			ctx.ui.notify(`Wrote ${target}. Edit it, or use /rackrot-config.`, "info");
		},
	});
}
