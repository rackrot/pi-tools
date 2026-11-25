import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { type ExtensionAPI, getAgentDir } from "@earendil-works/pi-coding-agent";
import { registerConfigSection } from "@rackrot/pi-core/config-ui";
import { configuredNames, loadLayers, resolveTuning, SETTINGS_KEY } from "./config.ts";
import { openSettings } from "./settings-ui.ts";

const PACKAGE_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Applies `agentOverrides` from the rackrot config to pi-subagents' `Agent` tool calls.
 *
 * pi-subagents treats an agent file's `model`, `thinking` and `max_turns` as authoritative over
 * the caller's, so the shipped agent files leave those fields out and this hook supplies them.
 * Settings win over whatever the orchestrator passed, matching that authority.
 *
 * Covers calls made through the `Agent` tool. Workflow `agent()` calls, scheduled spawns and
 * cross-extension RPC do not go through it.
 */
export default function (pi: ExtensionAPI) {
	pi.on("tool_call", (event, ctx) => {
		if (event.toolName !== "Agent") return;
		const input = event.input as Record<string, unknown>;
		if (typeof input.subagent_type !== "string") return;
		const tuning = resolveTuning(
			input.subagent_type,
			loadLayers(PACKAGE_DIR, getAgentDir(), ctx.cwd),
		);
		if (tuning.model) input.model = tuning.model;
		if (tuning.thinking) input.thinking = tuning.thinking;
		if (tuning.maxTurns) input.max_turns = tuning.maxTurns;
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
