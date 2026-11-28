import { mkdirSync } from "node:fs";
import { basename, isAbsolute, join, resolve } from "node:path";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import {
	type ExtensionAPI,
	getAgentDir,
	isToolCallEventType,
} from "@earendil-works/pi-coding-agent";
import { configPath } from "@rackrot/pi-core/config";
import { registerConfigSection } from "@rackrot/pi-core/config-ui";
import { callModel } from "@rackrot/pi-core/model-call";
import { missingModels } from "@rackrot/pi-core/retrieval";
import { loadConfig } from "./config.ts";
import { isRepoRoot } from "./git.ts";
import { buildInjection } from "./inject.ts";
import { summarizeProject } from "./summary.ts";
import { createMemory, kickEmbeddings, type Memory, registerTools } from "./tools.ts";
import { type ConfiguredConfig, guardReason, inspectRoot, nextSteps, setupVault } from "./vault.ts";

/** Longest the summary worker, final git sync and embeddings may hold up quitting pi. */
const SHUTDOWN_MS = 30_000;

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
				description:
					"Folder under the root where the agent writes (default Agent). Global config only.",
				kind: "text",
			},
			{
				path: ["memory", "projects"],
				label: "Projects folder",
				description:
					"Folder under the agent folder for project notes (default Projects). Global config only.",
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
		description:
			"Set up the memory vault: check the root, git init, agent folder, ignore lines, initial commit, next steps",
		handler: async (_args, ctx) => {
			const say = (lines: string[], level: "info" | "warning" | "error" = "info") =>
				ctx.ui.notify(lines.join("\n"), level);
			const cfg = configured(ctx.cwd);
			if (!cfg)
				return say(
					[
						"memory.root is not set. Add it to the global config (do not guess a location):",
						`  ${configPath("global", ctx.cwd)}`,
						'  { "memory": { "root": "~/Documents/Obsidian" } }',
						"Create the file with /rackrot-init or edit it with /rackrot-config memory, then run /memory-init again.",
					],
					"warning",
				);

			let info = inspectRoot(cfg.root);
			if (info.exists && !info.isDir) return say([`${cfg.root} is not a directory.`], "error");
			if (!info.exists) {
				if (!(await ctx.ui.confirm("Memory", `${cfg.root} does not exist. Create it?`))) return;
				mkdirSync(cfg.root, { recursive: true });
				info = inspectRoot(cfg.root);
			}
			const notes: string[] = [];
			if (info.obsidian)
				notes.push(
					`${cfg.root} is an existing Obsidian vault; only ${cfg.agentDir}/ will be written.`,
				);
			else if (info.childVaults.length)
				notes.push(
					`${cfg.root} has no .obsidian but contains vaults (${info.childVaults.join(", ")}). ${cfg.agentDir}/ will be created at the root, outside any of them. Consider pointing memory.root at one vault.`,
				);
			if (notes.length) say(notes, "warning");

			let init = false;
			let separateGitDir: string | undefined;
			if (!(await isRepoRoot(cfg.root))) {
				init = await ctx.ui.confirm(
					"Memory",
					`${cfg.root} is not a git repo. Run git init -b main?`,
				);
				if (init && info.cloud) {
					say(
						[
							`${cfg.root} looks like a ${info.cloud} folder. A .git directory inside synced folders is known to corrupt.`,
						],
						"warning",
					);
					if (
						await ctx.ui.confirm(
							"Memory",
							`Keep the git data outside the synced folder (git init --separate-git-dir)? Recommended for ${info.cloud}.`,
						)
					)
						separateGitDir = join(
							getAgentDir(),
							"rackrot",
							"memory",
							"git",
							`${basename(cfg.root)}.git`,
						);
				}
			} else if (info.cloud)
				say(
					[
						`${cfg.root} is inside a ${info.cloud} folder and already has .git. Syncing .git is known to corrupt; consider git init --separate-git-dir (an existing .git is not moved here).`,
					],
					"warning",
				);

			const { done, todo } = await setupVault(cfg, { init, separateGitDir });
			say([done.length ? `Done: ${done.join("; ")}` : "Vault already set up; nothing to change."]);
			if (todo.length) say(todo, "warning");
			say(await nextSteps(cfg));
		},
	});

	if (!configured(process.cwd())) return;

	let memory: Promise<Memory> | undefined;
	let notify: (m: string, level: "info" | "warning" | "error") => void = () => {};
	const get = (cwd: string) => {
		if (memory) return memory;
		const opening = (async () => {
			const cfg = configured(cwd);
			if (!cfg) throw new Error("memory.root is not configured");
			return createMemory(cfg, cwd, { agentDir: getAgentDir(), notify: (m, l) => notify(m, l) });
		})();
		// A failed setup is not kept, so the next call tries again instead of failing until restart.
		opening.catch(() => {
			if (memory === opening) memory = undefined;
		});
		memory = opening;
		return memory;
	};

	registerTools(pi, get);

	pi.on("session_start", (_event, ctx) => {
		notify = (m, l) => ctx.ui.notify(m, l);
		void (async () => {
			try {
				const m = await get(ctx.cwd);
				const missing = missingModels([m.cfg.embedding, m.cfg.reranker]);
				if (missing.length)
					notify(
						`memory: ${missing.join(", ")} will be downloaded from Hugging Face on first use (once)`,
						"info",
					);
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
		const work = (async () => {
			if (m.cfg.summary.enabled && m.cfg.summary.model) {
				const result = await summarize(m, ctx, false);
				if (/^(summary failed|rejected)/.test(result)) notify(`memory: ${result}`, "warning");
			}
			await m.sync.finalize();
			await m.embedding;
		})().then(
			() => true,
			() => true,
		);
		// Quitting must not hang on a slow model or remote; what is left is committed by the next session.
		let timer: NodeJS.Timeout | undefined;
		const deadline = new Promise<boolean>((resolve) => {
			timer = setTimeout(() => resolve(false), SHUTDOWN_MS);
		});
		if (!(await Promise.race([work, deadline])))
			notify(
				`memory: sync did not finish within ${SHUTDOWN_MS / 1000}s; the next session commits what is left`,
				"warning",
			);
		clearTimeout(timer);
		m.index.close();
	});
}
