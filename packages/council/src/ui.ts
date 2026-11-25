import {
	type ExtensionCommandContext,
	getSettingsListTheme,
} from "@earendil-works/pi-coding-agent";
import { type Component, Container, Input, type SettingItem, Text } from "@earendil-works/pi-tui";
import { configPath } from "@rackrot/pi-core/config";
import { CycleSettingsList, filterPicker } from "@rackrot/pi-core/config-ui";
import { loadConfig } from "./config.ts";
import { buildRows, type Row, readLayer, saveLayer, UNSET } from "./edit.ts";

type Scope = "global" | "project";

function modelPicker(models: string[], current: string, done: (v?: string) => void): Component {
	const items = [UNSET, ...models].map((value) => ({
		value,
		label: value === UNSET ? "unset (use the session's model)" : value,
	}));
	return filterPicker(items, done, current);
}

function textEditor(initial: string, done: (v?: string) => void): Component {
	const input = new Input({ prompt: "> " });
	input.setValue(initial);
	input.onSubmit = (v) => done(v);
	input.onEscape = () => done();
	return input;
}

/** Opens the council settings screen. Resolves when the user closes it; true when anything was saved. */
export async function openSettings(ctx: ExtensionCommandContext): Promise<boolean> {
	let dirty = false;
	const cwd = ctx.cwd;
	let scope: Scope = "global";
	const pathOf = (s: Scope) => configPath(s, cwd);
	const models = [
		...new Set(
			ctx.modelRegistry
				.getAvailable()
				.filter((m) => m.api !== "pi-virtual")
				.map((m) => `${m.provider}/${m.id}`),
		),
	].sort();

	let rows: Row[] = [];
	const rebuild = () => {
		rows = buildRows(readLayer(pathOf(scope)), loadConfig(cwd));
	};
	const toItem = (r: Row): SettingItem => ({
		id: r.id,
		label: r.label,
		description: r.description,
		currentValue: r.current,
		values: r.values,
		submenu:
			r.submenu === "model"
				? (cur, done) => modelPicker(models, cur, done)
				: r.submenu === "text"
					? (cur, done) => textEditor(cur === UNSET || cur === "name…" ? "" : cur, done)
					: undefined,
	});

	await ctx.ui.custom<void>((tui, theme, kb, done) => {
		const title = new Text("", 0, 0);
		const file = new Text("", 0, 0);
		const status = new Text("", 0, 0);
		const header = new Container();
		header.addChild(title);
		header.addChild(file);
		const tabKey = kb.getKeys("tui.input.tab")[0];
		const renderHeader = () => {
			title.setText(
				`⚙  Council · Saving to: ${scope === "global" ? "Global" : "Project"}${tabKey ? theme.fg("muted", ` · ${tabKey} to switch`) : ""}`,
			);
			file.setText(theme.fg("muted", `   ${pathOf(scope)} · pi reloads on close to apply changes`));
		};

		let list: CycleSettingsList;
		const makeList = () => {
			rebuild();
			list = new CycleSettingsList(
				rows.map(toItem),
				Math.max(5, Math.min(tui.terminal.rows - 10, rows.length)),
				getSettingsListTheme(),
				(id, next) => {
					const row = rows.find((r) => r.id === id);
					try {
						if (row) {
							saveLayer(pathOf(scope), (c) => row.apply(c, next));
							dirty = true;
						}
						status.setText("");
					} catch (e) {
						status.setText(theme.fg("error", `   ${e instanceof Error ? e.message : String(e)}`));
					}
					makeList();
					list.selectItem(id);
					renderHeader();
				},
				() => done(),
				{ enableSearch: true },
			);
		};
		makeList();
		renderHeader();

		const component: Component = {
			render: (w) => [...header.render(w), "", ...list.render(w), ...status.render(w)],
			invalidate: () => {
				header.invalidate();
				list.invalidate();
			},
			handleInput: (data) => {
				if (kb.matches(data, "tui.input.tab")) {
					scope = scope === "global" ? "project" : "global";
					makeList();
					renderHeader();
					return;
				}
				list.handleInput(data);
			},
		};
		return component;
	});
	return dirty;
}
