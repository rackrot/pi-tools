import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { configPath, readConfig } from "@rackrot/pi-core/config";
import { type ConfigRow, openConfigScreen } from "@rackrot/pi-core/config-ui";
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
	const pathOf = (s: Scope) => configPath(s, cwd);

	const explicit = (s: Scope) => parseLayer(readConfig(pathOf(s))[SETTINGS_KEY]);
	const effective = () => mergeLayers([explicit("global"), explicit("project")]);

	const buildItems = (scope: Scope): ConfigRow[] => {
		const here = explicit(scope);
		const cfg = effective();
		const rows: ConfigRow[] = [
			{
				id: DEFAULT_ROW,
				group: "Default mode",
				label: "default mode",
				description: `Applies to skills with no entry. Effective: ${cfg.default}. "${UNSET}" clears the ${scope} value (falls back to ${DEFAULT_MODE}).`,
				currentValue: here.default ?? UNSET,
				values: [UNSET, ...MODES],
			},
		];
		for (const s of [...skills].sort((a, b) => a.name.localeCompare(b.name))) {
			rows.push({
				id: s.name,
				group: "Skills",
				label: s.name,
				description: `${s.description.slice(0, 160)} · effective: ${modeOf(s.name, cfg)}. Exact names only here; edit the rackrot config for globs.`,
				currentValue: here.skills?.[s.name] ?? UNSET,
				values: [UNSET, ...MODES],
			});
		}
		return rows;
	};

	await openConfigScreen(ctx, {
		title: "Skill index",
		pathOf,
		hint: "full | description | title | hidden",
		rows: buildItems,
		apply: (sc, id, next) =>
			saveSkillMode(pathOf(sc), id, next === UNSET ? undefined : (next as Mode)),
	});
}
