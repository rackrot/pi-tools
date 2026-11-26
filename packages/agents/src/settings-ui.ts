import { type ExtensionCommandContext, getAgentDir } from "@earendil-works/pi-coding-agent";
import { configPath } from "@rackrot/pi-core/config";
import { type ConfigRow, filterPicker, openConfigScreen } from "@rackrot/pi-core/config-ui";
import {
	configuredNames,
	loadLayers,
	type Overrides,
	resolveTuning,
	sourceLayer,
	THINKING_LEVELS,
	type ThinkingLevel,
} from "./config.ts";
import {
	agentsDir,
	discoverAgents,
	isAgentDisabled,
	readEnabledModels,
	type Scope,
	saveOverride,
	setAgentEnabled,
} from "./store.ts";

const INHERIT = "inherit";
const TURN_PRESETS = ["5", "10", "15", "25", "40", "60", "100"];
const SOURCES = ["package default", "global settings", "project settings"];
const SOURCE_SCOPE: Record<number, Scope | undefined> = { 1: "global", 2: "project" };

type Row = "enabled" | "model" | "thinking" | "maxTurns";
const ROW_LABEL: Record<Row, string> = {
	enabled: "enabled",
	model: "model",
	thinking: "thinking",
	maxTurns: "max turns",
};

const rowId = (row: Row, name: string) => `${row}:${name}`;
const parseId = (id: string): { row: Row; name: string } => {
	const i = id.indexOf(":");
	return { row: id.slice(0, i) as Row, name: id.slice(i + 1) };
};

/** Opens the settings screen. Resolves when the user closes it. */
export async function openSettings(
	ctx: ExtensionCommandContext,
	packageDir: string,
): Promise<void> {
	const agentDir = getAgentDir();
	const cwd = ctx.cwd;
	let scope: Scope = "global";
	let layers: Overrides[] = loadLayers(packageDir, agentDir, cwd);
	// enabledModels is only a subset; always offer every model alias too.
	const aliases = ctx.modelRegistry
		.getAvailable()
		.filter((m) => m.api === "pi-virtual")
		.map((m) => `${m.provider}/${m.id}`);
	const models = [...new Set([...readEnabledModels(agentDir, cwd), ...aliases])];

	const agentNames = () => discoverAgents(packageDir, agentDir, cwd, configuredNames(layers));

	function modelItems(current: string) {
		const list = [INHERIT, ...models];
		if (current !== INHERIT && !list.includes(current)) list.splice(1, 0, current);
		return list.map((value) => ({
			value,
			label: value === INHERIT ? "inherit (use the parent's model)" : value,
		}));
	}

	function describe(name: string, row: Row): string {
		if (row === "enabled") {
			return `Writes agents/${name}.md with enabled: false in ${scope} scope (shadows built-in and package agents). Applies to new Agent calls; the tool's type list updates next session.`;
		}
		const src = sourceLayer(name, row, layers);
		const where = src === -1 ? "not set, inherits" : `set by ${SOURCES[src]}`;
		return `${where}. Saving writes ${scope} settings; "${INHERIT}" clears the ${scope} value.`;
	}

	function value(name: string, row: Row): string {
		if (row === "enabled")
			return isAgentDisabled(agentsDir(scope, agentDir, cwd), name) ? "off" : "on";
		const v = resolveTuning(name, layers)[row];
		return v === undefined ? INHERIT : String(v);
	}

	function cycleValues(name: string, row: Row): string[] | undefined {
		if (row === "enabled") return ["on", "off"];
		if (row === "thinking") return [INHERIT, ...THINKING_LEVELS];
		if (row === "maxTurns") {
			const cur = value(name, row);
			return [
				INHERIT,
				...TURN_PRESETS,
				...(cur !== INHERIT && !TURN_PRESETS.includes(cur) ? [cur] : []),
			];
		}
		return undefined;
	}

	const buildItem = (name: string, row: Row): ConfigRow => ({
		id: rowId(row, name),
		group: name,
		label: ROW_LABEL[row],
		source: row === "enabled" ? undefined : SOURCE_SCOPE[sourceLayer(name, row, layers)],
		description: describe(name, row),
		currentValue: value(name, row),
		values: cycleValues(name, row),
		submenu:
			row === "model"
				? (current, done) => filterPicker(modelItems(current), done, current)
				: undefined,
	});

	const buildItems = () =>
		agentNames().flatMap((n) =>
			(["enabled", "model", "thinking", "maxTurns"] as Row[]).map((r) => buildItem(n, r)),
		);

	function apply(id: string, next: string) {
		const { row, name } = parseId(id);
		if (row === "enabled") {
			setAgentEnabled(agentsDir(scope, agentDir, cwd), name, next === "on");
			return;
		}
		const path = configPath(scope, cwd, agentDir);
		if (next === INHERIT) return saveOverride(path, name, row, undefined);
		if (row === "maxTurns") return saveOverride(path, name, row, Number(next));
		if (row === "thinking") return saveOverride(path, name, row, next as ThinkingLevel);
		saveOverride(path, name, row, next);
	}

	await openConfigScreen(ctx, {
		title: "Subagents",
		pathOf: (sc) => configPath(sc, cwd, agentDir),
		hint: "agent on/off writes agents/<name>.md",
		rows: (sc) => {
			scope = sc;
			layers = loadLayers(packageDir, agentDir, cwd);
			return buildItems();
		},
		apply: (sc, id, next) => {
			scope = sc;
			apply(id, next);
		},
	});
}
