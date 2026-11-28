import { mkdirSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import {
	type ExtensionAPI,
	getAgentDir,
	isToolCallEventType,
} from "@earendil-works/pi-coding-agent";
import { registerConfigSection } from "@rackrot/pi-core/config-ui";
import { callModel } from "@rackrot/pi-core/model-call";
import { loadConfig } from "./config.ts";
import { gitInit, isRepoRoot } from "./git.ts";
import { buildInjection } from "./inject.ts";
import { summarizeProject } from "./summary.ts";
import { createMemory, kickEmbeddings, type Memory, registerTools } from "./tools.ts";
import { type ConfiguredConfig, guardReason, initVault } from "./vault.ts";

/**
 * Long-term memory in a git-managed Obsidian vault. Without `memory.root` in the global config
 * only `/memory-init` and the config section exist and nothing else happens.
 */
export default function (pi: ExtensionAPI) {
	const configured = (cwd: string): ConfiguredConfig | undefined => {
		const cfg = loadConfig(cwd);
		return cfg.root ? (cfg as ConfiguredConfig) : undefined;
	};

	registerConfigSection({
		id: "memory",
		label: "Memory",
		fields: [
			{
				path: ["memory", "root"],
				label: "Vault root",
				description: "Git repo / Obsidian vault. Only the global config is read for this.",
				kind: "text",
			},
			{
				path: ["memory", "agentDir"],
				label: "Agent folder",
				description: "Folder under the root where the agent writes (default Agent)",
				kind: "text",
			},
			{
				path: ["memory", "projects"],
				label: "Projects folder",
				description: "Folder under the agent folder for project notes (default Projects)",
				kind: "text",
			},
			{
				path: ["memory", "project"],
				label: "Project slug",
				description: "Override the project name derived from the git remote",
				kind: "text",
			},
			{
				path: ["memory", "autoInject"],
				label: "Inject into prompt",
				description: "Add overview, open handoffs and pinned notes to the system prompt",
				kind: "boolean",
			},
			{
				path: ["memory", "commitIntervalMinutes"],
				label: "Commit interval (minutes)",
				description: "0 commits only at session end (default 5)",
				kind: "number",
			},
			{
				path: ["memory", "push"],
				label: "Push",
				description: "session pushes at session end (default)",
				kind: "enum",
				values: ["session", "never"],
			},
			{
				path: ["memory", "injectBudgetChars"],
				label: "Injection budget (chars)",
				description: "Default 12000",
				kind: "number",
			},
			{
				path: ["memory", "summary", "enabled"],
				label: "Summary worker",
				description:
					"Refresh the Overview prose at session end (needs summary.model; default true)",
				kind: "boolean",
			},
			{
				path: ["memory", "summary", "model"],
				label: "Summary model",
				description:
					"provider/model for the summary worker. Unset skips it; never the session model",
				kind: "text",
			},
			{
				path: ["memory", "summary", "minChanges"],
				label: "Summary min changes",
				description: "Notes changed since the last summary before it runs (default 3)",
				kind: "number",
			},
			{
				path: ["memory", "summary", "timeoutSeconds"],
				label: "Summary timeout (seconds)",
				description: "Default 60",
				kind: "number",
			},
		],
		example: {
			memory: {
				root: "~/Vault",
				agentDir: "Agent",
				projects: "Projects",
				autoInject: true,
				commitIntervalMinutes: 5,
				push: "session",
				injectBudgetChars: 12000,
				summary: { model: "anthropic/claude-haiku-5-5", minChanges: 3, timeoutSeconds: 60 },
				embedding: { provider: "onnx", model: "Xenova/bge-small-en-v1.5" },
			},
		},
		summary: (ctx) => {
			const cfg = loadConfig(ctx.cwd);
			return cfg.root
				? `root ${cfg.root}; agent folder ${cfg.agentDir}; push ${cfg.push}; embedding ${cfg.embedding.provider}`
				: "memory.root is not set";
		},
	});

	pi.registerCommand("memory-init", {
		description: "Prepare the memory vault: git init, .gitignore/.gitattributes, agent folder",
		handler: async (_args, ctx) => {
			const cfg = configured(ctx.cwd);
			if (!cfg)
				return ctx.ui.notify('Set "memory.root" in the global rackrot config first.', "warning");
			mkdirSync(cfg.root, { recursive: true });
			const done: string[] = [];
			if (
				!(await isRepoRoot(cfg.root)) &&
				(await ctx.ui.confirm("Memory", `${cfg.root} is not a git repo. Run git init?`))
			) {
				await gitInit(cfg.root);
				done.push("git init");
			}
			done.push(...initVault(cfg));
			ctx.ui.notify(
				done.length ? `memory: ${done.join("; ")}` : "memory: vault already set up",
				"info",
			);
		},
	});

	if (!configured(process.cwd())) return;

	let memory: Promise<Memory> | undefined;
	let notify: (m: string, level: "info" | "warning" | "error") => void = () => {};
	const get = (cwd: string) => {
		memory ??= (async () => {
			const cfg = configured(cwd);
			if (!cfg) throw new Error("memory.root is not configured");
			return createMemory(cfg, cwd, { agentDir: getAgentDir(), notify: (m, l) => notify(m, l) });
		})();
		return memory;
	};

	registerTools(pi, get);

	pi.on("session_start", (_event, ctx) => {
		notify = (m, l) => ctx.ui.notify(m, l);
		void (async () => {
			try {
				const m = await get(ctx.cwd);
				m.index.sync();
				kickEmbeddings(m);
				if (await m.sync.start()) {
					m.index.sync();
					kickEmbeddings(m);
				}
			} catch (e) {
				notify(`memory: ${(e as Error).message}`, "error");
			}
		})();
	});

	pi.on("before_agent_start", async (event, ctx) => {
		const m = await get(ctx.cwd);
		if (!m.cfg.autoInject) return;
		(event.systemPromptOptions.sections ??= {}).memory = buildInjection(m);
	});

	pi.on("tool_call", (event, ctx) => {
		const cfg = configured(ctx.cwd);
		if (!cfg || !(isToolCallEventType("write", event) || isToolCallEventType("edit", event)))
			return;
		const raw = event.input.path.replace(/^@/, "");
		const reason = guardReason(cfg, isAbsolute(raw) ? raw : resolve(ctx.cwd, raw));
		if (reason) return { block: true, reason };
	});

	/** Runs the summary worker once; never throws. */
	const summarize = async (m: Memory, ctx: ExtensionContext, force: boolean) => {
		const { model, timeoutSeconds } = m.cfg.summary;
		if (!model) return "memory.summary.model is not set";
		try {
			return await summarizeProject(
				m,
				(system, prompt) =>
					callModel(ctx, model, { system, prompt, maxTokens: 2000, timeoutSeconds }).then(
						(r) => r.text,
					),
				{ force },
			);
		} catch (e) {
			return `summary failed: ${(e as Error).message}`;
		}
	};

	pi.registerCommand("memory-summarize", {
		description:
			"Rewrite this project's Overview prose now from its notes (needs memory.summary.model)",
		handler: async (_args, ctx) => {
			const m = await get(ctx.cwd);
			ctx.ui.notify(`memory: ${await summarize(m, ctx, true)}`, "info");
		},
	});

	pi.on("session_shutdown", async (_event, ctx) => {
		const m = await memory?.catch(() => undefined);
		memory = undefined;
		if (!m) return;
		if (m.cfg.summary.enabled && m.cfg.summary.model) {
			const result = await summarize(m, ctx, false);
			if (/^(summary failed|rejected)/.test(result)) notify(`memory: ${result}`, "warning");
		}
		await m.sync.finalize();
		await m.embedding;
		m.index.close();
	});
}
