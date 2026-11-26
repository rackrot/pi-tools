import {
	type ExtensionAPI,
	type ExtensionCommandContext,
	getAgentDir,
	getSettingsListTheme,
} from "@earendil-works/pi-coding-agent";
import { type Component, Container, type SettingItem, Text } from "@earendil-works/pi-tui";
import { configPath } from "@rackrot/pi-core/config";
import { CycleSettingsList } from "@rackrot/pi-core/config-ui";
import { LEVELS, type Level, load, PROTECTED_TOOLS, type Scope, save } from "./config.ts";

const LEVEL_HELP: Record<Level, string> = {
	off: "no orchestration guidance",
	lean: "delegate only bulk work, to keep context clean",
	delegate: "prefer subagents for self-contained multi-step tasks",
	orchestrator: "plan, delegate and verify; do work yourself only when clearly cheaper",
	strict: "main session only orchestrates; the tools below are denied",
};

const TOOL = "tool:";

/** Opens the orchestration screen: the level, and a deny/allow row per tool used by `strict`. */
export async function openSettings(ctx: ExtensionCommandContext, pi: ExtensionAPI): Promise<void> {
	const agentDir = getAgentDir();
	const cwd = ctx.cwd;
	let scope: Scope = "global";
	const toolNames = [...new Set(pi.getAllTools().map((t) => t.name))]
		.filter((n) => !PROTECTED_TOOLS.includes(n))
		.sort();

	const build = (): SettingItem[] => {
		const cfg = load(agentDir, cwd);
		return [
			{
				id: "level",
				label: "level",
				description: `${LEVEL_HELP[cfg.level]}. Saving writes ${scope} settings.`,
				currentValue: cfg.level,
				values: [...LEVELS],
			},
			...toolNames.map((n) => ({
				id: TOOL + n,
				label: `strict · ${n}`,
				description: `Deny ${n} to the main session at level "strict". Subagents are unaffected.`,
				currentValue: cfg.deniedTools.includes(n) ? "deny" : "allow",
				values: ["deny", "allow"],
			})),
		];
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
			const hint = tabKey ? theme.fg("muted", ` · ${tabKey} to switch`) : "";
			title.setText(
				`⚙  Orchestration · Saving to: ${scope === "global" ? "Global" : "Project"}${hint}`,
			);
			file.setText(theme.fg("muted", `   ${configPath(scope, cwd, agentDir)}`));
		};
		const refresh = () => {
			const fresh = new Map(build().map((i) => [i.id, i]));
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
					const path = configPath(scope, cwd, agentDir);
					if (id === "level") save(path, { level: next as Level });
					else {
						const name = id.slice(TOOL.length);
						const denied = new Set(load(agentDir, cwd).deniedTools);
						if (next === "deny") denied.add(name);
						else denied.delete(name);
						save(path, { deniedTools: [...denied].sort() });
					}
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
