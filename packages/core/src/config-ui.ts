import { existsSync } from "node:fs";
import {
	type ExtensionAPI,
	type ExtensionCommandContext,
	getSelectListTheme,
	getSettingsListTheme,
} from "@earendil-works/pi-coding-agent";
import {
	type Component,
	fuzzyFilter,
	Input,
	Key,
	matchesKey,
	SelectList,
	type SettingItem,
	SettingsList,
	Text,
} from "@earendil-works/pi-tui";
import { configPath, editConfig, readConfig, type Scope } from "./config.ts";
import { isObject, type Json, writeTextAtomic } from "./json.ts";

/** SettingsList where left/right step through a setting's fixed values (enter still cycles forward). */
export class CycleSettingsList extends SettingsList {
	override handleInput(data: string): void {
		const dir = matchesKey(data, Key.left) ? -1 : matchesKey(data, Key.right) ? 1 : 0;
		// SettingsList keeps its state private; reach in only to find the focused item.
		const self = this as unknown as {
			submenuComponent: unknown;
			selectedIndex: number;
			getDisplayItems(): SettingItem[];
			onChange(id: string, value: string): void;
		};
		const item =
			dir && !self.submenuComponent ? self.getDisplayItems()[self.selectedIndex] : undefined;
		if (item?.values?.length && !item.submenu) {
			const i = item.values.indexOf(item.currentValue);
			item.currentValue = item.values[(i + dir + item.values.length) % item.values.length];
			self.onChange(item.id, item.currentValue);
			return;
		}
		super.handleInput(data);
	}
}

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
	/** Custom editor. Resolve true when something was saved that needs a pi reload. */
	open?: (ctx: ExtensionCommandContext) => Promise<unknown>;
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

/** One row of a config screen. `group` partitions rows; `source` is the layer the effective value comes from. */
export interface ConfigRow extends SettingItem {
	group?: string;
	source?: Scope;
}

/** What a package supplies to get the shared config screen. */
export interface ConfigScreen {
	title: string;
	pathOf(scope: Scope): string;
	/** Extra line under the file path. */
	hint?: string;
	/** Say that pi reloads when the screen closes after a save. */
	reload?: boolean;
	/** Rows for the layer being edited; called again after every change. Rows with different `group`s get a picker first. */
	rows(scope: Scope): ConfigRow[];
	/** Persist one change to `scope`'s layer. Throw to show the message in the status line. */
	apply(scope: Scope, id: string, value: string): void;
}

/**
 * The shared config screen: a scope strip (global/project), an optional group picker, and the rows of
 * one group, so only what is being edited is on screen. Resolves true when anything was saved.
 */
export async function openConfigScreen(
	ctx: ExtensionCommandContext,
	s: ConfigScreen,
): Promise<boolean> {
	let scope: Scope = "global";
	let dirty = false;
	let group: string | undefined;
	/** `scope:id` of rows saved while this screen has been open. */
	const changed = new Set<string>();
	await ctx.ui.custom<void>((tui, theme, kb, done) => {
		let rows: ConfigRow[] = [];
		let body: Component;
		let list: CycleSettingsList | undefined;
		let error = "";
		const tabKey = kb.getKeys("tui.input.tab")[0];
		const inGroup = (g: string | undefined) => rows.filter((r) => (r.group ?? "") === g);
		const isChanged = (r: ConfigRow) => changed.has(`${scope}:${r.id}`);
		const dot = (on: boolean) => (on ? theme.fg("accent", " ●") : "");
		const marker = (r: ConfigRow) =>
			r.source && r.source !== scope ? theme.fg("muted", ` ·${r.source}`) : "";

		const show = () => {
			rows = s.rows(scope);
			const groups = [...new Set(rows.map((r) => r.group ?? ""))];
			if (groups.length <= 1) group = groups[0] ?? "";
			else if (group !== undefined && !groups.includes(group)) group = undefined;
			if (group === undefined) {
				list = undefined;
				body = filterPicker(
					groups.map((g) => ({
						value: g,
						label: g + dot(inGroup(g).some(isChanged)),
						description: inGroup(g)
							.slice(0, 4)
							.map((r) => `${r.label.trim()} ${r.currentValue}`)
							.join(" · "),
					})),
					(g) => {
						if (g === undefined) return done();
						group = g;
						show();
					},
				);
				return;
			}
			const view = inGroup(group);
			list = new CycleSettingsList(
				view.map((r) => ({ ...r, label: r.label + dot(isChanged(r)) + marker(r) })),
				Math.max(5, Math.min(tui.terminal.rows - 12, view.length)),
				getSettingsListTheme(),
				(id, next) => {
					try {
						s.apply(scope, id, next);
						dirty = true;
						changed.add(`${scope}:${id}`);
						error = "";
					} catch (e) {
						error = e instanceof Error ? e.message : String(e);
					}
					show();
					list?.selectItem(id);
				},
				() => {
					if (groups.length <= 1) return done();
					group = undefined;
					show();
				},
				{ enableSearch: true },
			);
			body = list;
		};
		show();

		const strip = () => {
			const tab = (sc: Scope, name: string) =>
				sc === scope
					? theme.bold(theme.fg("accent", `[ ${name} ]`))
					: theme.fg("muted", `  ${name}  `);
			return `   Saving to ${tab("global", "Global")}${tab("project", "Project")}${tabKey ? theme.fg("muted", ` ${tabKey} switches`) : ""}`;
		};
		return {
			render: (w) => {
				const t = (text: string) => new Text(text, 0, 0).render(w);
				const crumb = group ? ` › ${group}` : "";
				return [
					...t(`⚙  ${s.title}${crumb}`),
					...t(strip()),
					...t(theme.fg("muted", `   ${s.pathOf(scope)}${s.hint ? ` · ${s.hint}` : ""}`)),
					"",
					...body.render(w),
					...(error ? t(theme.fg("error", `   ${error}`)) : []),
					...(changed.size
						? t(
								theme.fg(
									"muted",
									`   ● changed this session${s.reload ? " · pi reloads when you close" : ""}`,
								),
							)
						: []),
					...(list
						? t(theme.fg("muted", "   ←/→ cycle values · esc back"))
						: t(theme.fg("muted", "   enter open · type to filter · esc close"))),
				];
			},
			invalidate: () => body.invalidate(),
			handleInput: (data) => {
				if (kb.matches(data, "tui.input.tab")) {
					scope = scope === "global" ? "project" : "global";
					show();
					return;
				}
				body.handleInput?.(data);
			},
		} as Component;
	});
	return dirty;
}

/** Opens the field screen for one section. Resolves true when anything was saved. */
function openFields(ctx: ExtensionCommandContext, s: ConfigSection): Promise<boolean> {
	const fields = s.fields ?? [];
	const cwd = ctx.cwd;
	const layer = (sc: Scope) => readConfig(configPath(sc, cwd));
	return openConfigScreen(ctx, {
		title: s.label,
		pathOf: (sc) => configPath(sc, cwd),
		rows: (scope) => {
			const here = layer(scope);
			const global = layer("global");
			const project = layer("project");
			return fields.map((f) => {
				const inProject = getPath(project, f.path) !== undefined;
				const eff = inProject ? getPath(project, f.path) : getPath(global, f.path);
				const values = f.kind === "boolean" ? ["true", "false"] : f.values;
				return {
					id: f.path.join("."),
					label: f.label,
					description:
						`${f.description ?? ""} Effective: ${show(eff)}. "${UNSET}" clears the ${scope} value (project wins over global).`.trim(),
					currentValue: show(getPath(here, f.path)),
					values: values ? [UNSET, ...values] : undefined,
					submenu: values ? undefined : (cur, done) => textEditor(cur === UNSET ? "" : cur, done),
					source: inProject ? "project" : eff !== undefined ? "global" : undefined,
				};
			});
		},
		apply: (scope, id, next) => {
			const f = fields.find((x) => x.path.join(".") === id);
			if (f) {
				const v = parseValue(f, next);
				editConfig(configPath(scope, cwd), (d) => setPath(d, f.path, v));
			}
		},
	});
}

/** Opens one section. Resolves true when it saved something that needs a reload. */
async function openSection(ctx: ExtensionCommandContext, s: ConfigSection): Promise<boolean> {
	if (s.open) return (await s.open(ctx)) === true;
	return s.fields ? openFields(ctx, s) : false;
}

/** Fuzzy-filterable list: type to narrow (any order, substring or scattered), arrows to move, enter to pick, escape to cancel. */
export function filterPicker(
	items: { value: string; label: string; description?: string }[],
	done: (v?: string) => void,
	current?: string,
): Component {
	const input = new Input({ prompt: "filter: " });
	const build = (shown: typeof items) => {
		const list = new SelectList(
			shown,
			Math.max(1, Math.min(shown.length, 12)),
			getSelectListTheme(),
		);
		list.onSelect = (i) => done(i.value);
		list.onCancel = () => done();
		return list;
	};
	let list = build(items);
	list.setSelectedIndex(
		Math.max(
			0,
			items.findIndex((i) => i.value === current),
		),
	);
	return {
		render: (w) => [...input.render(w), ...list.render(w)],
		invalidate: () => list.invalidate(),
		handleInput: (data) => {
			list.handleInput(data);
			const before = input.getValue();
			input.handleInput(data);
			const q = input.getValue();
			// Rebuild only when the text changed, so arrow keys keep their selection.
			if (q !== before) list = build(q ? fuzzyFilter(items, q, (i) => i.label) : items);
		},
	} as Component;
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
			const named = all.find((s) => s.id === arg);
			if (arg && !named) {
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
			// Escape in a section returns to the picker; escape in the picker (or a named section) exits.
			let changed = false;
			let section = named;
			do {
				if (!named) {
					const id = await ctx.ui.custom<string | undefined>((_tui, _theme, _kb, done) =>
						filterPicker(
							all.map((x) => ({
								value: x.id,
								label: x.label,
								description: x.summary?.(ctx),
							})),
							done,
						),
					);
					section = all.find((x) => x.id === id);
				}
				if (section && (await openSection(ctx, section))) changed = true;
			} while (!named && section);
			if (changed) await ctx.reload();
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
