import {
	type ExtensionAPI,
	type ExtensionCommandContext,
	getAgentDir,
} from "@earendil-works/pi-coding-agent";
import { configPath } from "@rackrot/pi-core/config";
import { type ConfigRow, openConfigScreen } from "@rackrot/pi-core/config-ui";
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
	const toolNames = [...new Set(pi.getAllTools().map((t) => t.name))]
		.filter((n) => !PROTECTED_TOOLS.includes(n))
		.sort();

	const build = (scope: Scope): ConfigRow[] => {
		const cfg = load(agentDir, cwd);
		return [
			{
				id: "level",
				group: "Level",
				label: "level",
				description: `${LEVEL_HELP[cfg.level]}. Saving writes ${scope} settings.`,
				currentValue: cfg.level,
				values: [...LEVELS],
			},
			...toolNames.map((n) => ({
				id: TOOL + n,
				group: "Tools denied at level strict",
				label: n,
				description: `Deny ${n} to the main session at level "strict". Subagents are unaffected.`,
				currentValue: cfg.deniedTools.includes(n) ? "deny" : "allow",
				values: ["deny", "allow"],
			})),
		];
	};

	await openConfigScreen(ctx, {
		title: "Orchestration",
		pathOf: (sc) => configPath(sc, cwd, agentDir),
		rows: (sc) => build(sc),
		apply: (sc, id, next) => {
			const path = configPath(sc, cwd, agentDir);
			if (id === "level") save(path, { level: next as Level });
			else {
				const name = id.slice(TOOL.length);
				const denied = new Set(load(agentDir, cwd).deniedTools);
				if (next === "deny") denied.add(name);
				else denied.delete(name);
				save(path, { deniedTools: [...denied].sort() });
			}
		},
	});
}
