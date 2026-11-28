import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { type ExtensionAPI, getAgentDir } from "@earendil-works/pi-coding-agent";
import { registerConfigSection } from "@rackrot/pi-core/config-ui";
import {
	applyTuning,
	configuredNames,
	isLocked,
	loadLayers,
	type Overrides,
	resolveTuning,
	SETTINGS_KEY,
	withConfiguredAgents,
	workflowAgents,
} from "./config.ts";
import orchestration from "./orchestration/index.ts";
import { openSettings } from "./settings-ui.ts";
import { agentFrontmatterLock } from "./store.ts";

const PACKAGE_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Agent file dirs searched for a frontmatter `lock`, project before global. Other packages' agents are not. */
const lockDirs = (agentDir: string, cwd: string) => [
	join(cwd, ".pi", "agents"),
	join(cwd, ".agents", "agents"),
	join(agentDir, "agents"),
];

/**
 * Applies `agentOverrides` from the rackrot config to pi-subagents' `Agent` tool calls.
 *
 * pi-subagents treats an agent file's `model`, `thinking` and `max_turns` as authoritative over
 * the caller's, so the shipped agent files leave those fields out and this hook supplies them.
 * Settings only fill fields the orchestrator left unset, so a caller can still pick a model for one
 * call; workflows behave the same way (`args.agents` wins over the configured values). An agent with
 * `lock: true` (config, else the agent file's frontmatter) is the exception: settings overwrite the caller's.
 *
 * Covers calls made through the `Agent` tool. Workflow `agent()` calls, scheduled spawns and
 * cross-extension RPC do not go through it; `SubagentWorkflow` calls get the settings as `args.agents`.
 */
export default function (pi: ExtensionAPI) {
	orchestration(pi);

	const agentLocked = (name: string, layers: Overrides[], cwd: string) => {
		const tuning = resolveTuning(name, layers);
		return isLocked(
			tuning,
			tuning.lock === undefined
				? agentFrontmatterLock(name, lockDirs(getAgentDir(), cwd))
				: undefined,
		);
	};

	// Workflow `agent()` calls skip the hook below, so hand the shipped workflows the same settings
	// through `args.agents`, which they read. Scripts that ignore `args.agents` are unaffected.
	pi.on("tool_call", (event, ctx) => {
		if (event.toolName !== "SubagentWorkflow") return;
		const input = event.input as Record<string, unknown>;
		const layers = loadLayers(PACKAGE_DIR, getAgentDir(), ctx.cwd);
		const configured = workflowAgents(layers);
		const locked = new Set(Object.keys(configured).filter((n) => agentLocked(n, layers, ctx.cwd)));
		const args = withConfiguredAgents(input.args, configured, locked);
		if (args !== input.args) input.args = args;
	});

	pi.on("tool_call", (event, ctx) => {
		if (event.toolName !== "Agent") return;
		const input = event.input as Record<string, unknown>;
		if (typeof input.subagent_type !== "string") return;
		const layers = loadLayers(PACKAGE_DIR, getAgentDir(), ctx.cwd);
		const tuning = resolveTuning(input.subagent_type, layers);
		applyTuning(input, tuning, agentLocked(input.subagent_type, layers, ctx.cwd));
	});

	registerConfigSection({
		id: "agents",
		label: "Subagents",
		example: {
			agentOverrides: {
				Explore: { model: "provider/model-id", thinking: "low", maxTurns: 20 },
			},
		},
		open: (ctx) => openSettings(ctx, PACKAGE_DIR),
		summary: (ctx) => {
			const layers = loadLayers(PACKAGE_DIR, getAgentDir(), ctx.cwd);
			const lines = configuredNames(layers).map(
				(n) => `${n} ${JSON.stringify(resolveTuning(n, layers))}`,
			);
			return lines.length ? lines.join("; ") : `no overrides (set "${SETTINGS_KEY}")`;
		},
	});
}
