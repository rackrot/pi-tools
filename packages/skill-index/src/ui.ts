import {
	type ExtensionCommandContext,
	getSettingsListTheme,
} from "@earendil-works/pi-coding-agent";
import { type Component, Container, type SettingItem, Text } from "@earendil-works/pi-tui";
import { configPath, readConfig } from "@rackrot/pi-core/config";
import { CycleSettingsList } from "@rackrot/pi-core/config-ui";
import {
	DEFAULT_MODE,
	MODES,
	type Mode,
	mergeLayers,
	modeOf,
	parseLayer,
	SETTINGS_KEY,
	saveSkillMode,
} from "./config.ts";

type Scope = "global" | "project";
const DEFAULT_ROW = "*default";
const UNSET = "default";

interface Entry {
	name: string;
	description: string;
}

/** Opens the skill exposure screen. Resolves when the user closes it. */
export async function openSettings(ctx: ExtensionCommandContext, skills: Entry[]): Promise<void> {
	const cwd = ctx.cwd;
	let scope: Scope = "global";
	const pathOf = (s: Scope) => configPath(s, cwd);

	const explicit = (s: Scope) => parseLayer(readConfig(pathOf(s))[SETTINGS_KEY]);
	const effective = () => mergeLayers([explicit("global"), explicit("project")]);

	const buildItems = (): SettingItem[] => {
		const here = explicit(scope);
		const cfg = effective();
		const rows: SettingItem[] = [
			{
				id: DEFAULT_ROW,
				label: "default mode",
				description: `Applies to skills with no entry. Effective: ${cfg.default}. "${UNSET}" clears the ${scope} value (falls back to ${DEFAULT_MODE}).`,
				currentValue: here.default ?? UNSET,
				values: [UNSET, ...MODES],
			},
		];
		for (const s of [...skills].sort((a, b) => a.name.localeCompare(b.name))) {
			rows.push({
				id: s.name,
				label: s.name,
				description: `${s.description.slice(0, 160)} · effective: ${modeOf(s.name, cfg)}. Exact names only here; edit the rackrot config for globs.`,
				currentValue: here.skills?.[s.name] ?? UNSET,
				values: [UNSET, ...MODES],
			});
		}
		return rows;
	};

	await ctx.ui.custom<void>((tui, theme, kb, done) => {
		const items = buildItems();
		const title = new Text("", 0, 0);
		const file = new Text("", 0, 0);
		const status = new Text("", 0, 0);
		const header = new Container();
		header.addChild(title);
		header.addChild(file);
		const tabKey = kb.getKeys("tui.input.tab")[0];
		const renderHeader = () => {
			title.setText(
				`⚙  Skill Index · Saving to: ${scope === "global" ? "Global" : "Project"}${tabKey ? theme.fg("muted", ` · ${tabKey} to switch`) : ""}`,
			);
			file.setText(theme.fg("muted", `   ${pathOf(scope)} · full | description | title | hidden`));
		};
		const refresh = () => {
			const fresh = new Map(buildItems().map((i) => [i.id, i]));
			for (const item of items) {
				const next = fresh.get(item.id);
				if (next)
					Object.assign(item, { currentValue: next.currentValue, description: next.description });
			}
			renderHeader();
			list.invalidate();
		};
		const list = new CycleSettingsList(
			items,
			Math.min(Math.max(5, tui.terminal.rows - 10), items.length),
			getSettingsListTheme(),
			(id, next) => {
				try {
					saveSkillMode(
						pathOf(scope),
						id === DEFAULT_ROW ? "*default" : id,
						next === UNSET ? undefined : (next as Mode),
					);
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
		const component: Component = {
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
		};
		return component;
	});
}
