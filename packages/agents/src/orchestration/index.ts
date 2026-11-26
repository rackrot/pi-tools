import { type ExtensionAPI, getAgentDir } from "@earendil-works/pi-coding-agent";
import { registerConfigSection } from "@rackrot/pi-core/config-ui";
import { DEFAULT_DENIED, type Level, load, PROTECTED_TOOLS } from "./config.ts";
import { denyReason, sectionFor } from "./prompt.ts";
import { openSettings } from "./settings-ui.ts";

interface ToolRef {
	name: string;
	source: string;
}

/**
 * What a session should do at `level`. Nothing without the Agent tool, and nothing in a
 * subagent: pi-subagents hands a nested `Agent` to a child as an SDK tool, while the main
 * session's comes from the extension, so a child keeps its own tools and prompt.
 * Without an Agent to delegate to, `strict` would strand the session, so it gets no section either.
 */
export function decide(
	level: Level,
	deniedTools: string[],
	tools: ToolRef[],
): { section?: string; blocked: Set<string> } {
	const agent = tools.find((t) => t.name === "Agent");
	if (level === "off" || !agent || agent.source === "sdk") return { blocked: new Set() };
	const blocked =
		level === "strict"
			? new Set(deniedTools.filter((t) => !PROTECTED_TOOLS.includes(t)))
			: new Set<string>();
	return { section: sectionFor(level), blocked };
}

export default function (pi: ExtensionAPI) {
	let blocked = new Set<string>();

	pi.on("before_agent_start", (event, ctx) => {
		const cfg = load(getAgentDir(), ctx.cwd);
		const tools = pi.getAllTools().map((t) => ({ name: t.name, source: t.sourceInfo.source }));
		const d = decide(cfg.level, cfg.deniedTools, tools);
		blocked = d.blocked;
		const opts = event.systemPromptOptions;
		const sections = (opts.sections ??= {});
		if (d.section) sections.orchestration = d.section;
		else delete sections.orchestration;
		if (blocked.size) {
			const kept = opts.selectedTools.filter((t) => !blocked.has(t));
			opts.selectedTools.splice(0, opts.selectedTools.length, ...kept);
		}
	});

	pi.on("tool_call", (event) => {
		if (blocked.has(event.toolName)) return { block: true, reason: denyReason(event.toolName) };
	});

	registerConfigSection({
		id: "orchestration",
		label: "Orchestration",
		example: { orchestration: { level: "off", deniedTools: DEFAULT_DENIED } },
		open: (ctx) => openSettings(ctx, pi),
		summary: (ctx) => {
			const c = load(getAgentDir(), ctx.cwd);
			return c.level === "strict"
				? `${c.level}, denied: ${c.deniedTools.join(", ") || "none"}`
				: c.level;
		},
	});
}
