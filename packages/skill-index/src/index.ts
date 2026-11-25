import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { type ExtensionAPI, getAgentDir } from "@earendil-works/pi-coding-agent";
import { registerConfigSection } from "@rackrot/pi-core/config-ui";
import { Type } from "typebox";
import { loadLayers, MODES, mergeLayers, modeOf } from "./config.ts";
import { SkillDb, type SkillRow } from "./db.ts";
import { indexSection, plan, type SkillInfo, skillBody } from "./plan.ts";
import {
	createEmbedder,
	createJudge,
	createReranker,
	type Embedder,
	type Judge,
	type Reranker,
} from "./providers.ts";
import { searchSkills, skillText } from "./search.ts";
import { openSettings } from "./ui.ts";

/** True when the SKILL.md frontmatter sets `disable-model-invocation: true`. */
function isDisabled(path: string): boolean {
	try {
		const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(path, "utf8"))?.[1] ?? "";
		return /^disable-model-invocation:\s*true\s*$/m.test(fm);
	} catch {
		return false;
	}
}

/**
 * Controls how much of each skill the system prompt carries, and adds `skill_search` for the rest.
 * Skills stay loaded in pi, so `/skill:name` and reading a SKILL.md path keep working.
 */
export default function (pi: ExtensionAPI) {
	/** Every skill seen this session, by name. The prompt hook sees the full set before it trims it. */
	const known = new Map<string, SkillInfo>();
	const config = (cwd: string) => mergeLayers(loadLayers(cwd));

	let db: SkillDb | undefined;
	const getDb = () => {
		db ??= new SkillDb(join(getAgentDir(), "rackrot", "skills.sqlite"));
		return db;
	};
	/** SKILL.md mtime per path at its last sync, so unchanged files are not re-read each turn. */
	const synced = new Map<string, number>();

	/** Writes new or changed skills to the database. The content hash decides what actually updates. */
	function syncSkills(cwd: string, skills: SkillInfo[]) {
		const rows = { global: [] as SkillRow[], project: [] as SkillRow[] };
		const mtimes = new Map<string, number>();
		for (const s of skills) {
			if (s.disableModelInvocation) continue;
			try {
				const mtime = statSync(s.filePath).mtimeMs;
				if (synced.get(s.filePath) === mtime) continue;
				const body = skillBody(readFileSync(s.filePath, "utf8"));
				rows[s.sourceInfo?.scope === "user" ? "global" : "project"].push({ ...s, body });
				mtimes.set(s.filePath, mtime);
			} catch {}
		}
		if (!mtimes.size) return;
		getDb().sync("global", null, rows.global);
		getDb().sync("project", cwd, rows.project);
		for (const [k, v] of mtimes) synced.set(k, v);
	}

	/** Skills pi has loaded, from its command list, for a scan before any prompt has run. */
	const loadedSkills = (): SkillInfo[] =>
		pi
			.getCommands()
			.filter((c) => c.source === "skill")
			.map((c) => ({
				name: c.name.replace(/^skill:/, ""),
				description: c.description ?? "",
				filePath: c.sourceInfo.path,
				sourceInfo: c.sourceInfo,
				disableModelInvocation: isDisabled(c.sourceInfo.path),
			}));

	/** Providers are rebuilt only when their config changes, so loaded models are kept. */
	let providers:
		| { key: string; embedder?: Embedder; reranker?: Reranker; judge?: Judge }
		| undefined;
	function providersFor(cfg: ReturnType<typeof config>) {
		const key = JSON.stringify([cfg.embedding, cfg.reranker, cfg.decision]);
		if (providers?.key !== key) {
			void providers?.judge?.close?.();
			providers = {
				key,
				embedder: createEmbedder(cfg.embedding),
				reranker: createReranker(cfg.reranker),
				judge: createJudge(cfg.decision),
			};
		}
		return providers;
	}

	let embedding: Promise<void> | undefined;
	let embedFailed = false;
	/** Embeds new or changed skills in the background; search uses BM25 alone for those until done. */
	function backfill(cwd: string, embedder: Embedder | undefined) {
		if (!embedder || embedding || embedFailed) return;
		const scope = { projectRoot: cwd };
		embedding = (async () => {
			try {
				const pending = getDb().pendingEmbeddings(scope, embedder.id);
				for (let i = 0; i < pending.length; i += 16) {
					const batch = pending.slice(i, i + 16);
					const vectors = await embedder.embed(batch.map(skillText));
					batch.forEach((s, j) => getDb().setEmbedding(s.id, embedder.id, vectors[j]));
				}
			} catch {
				embedFailed = true;
			} finally {
				embedding = undefined;
			}
		})();
	}

	pi.on("session_start", (_event, ctx) => {
		known.clear();
		synced.clear();
		embedFailed = false;
		// Scan in the background so the database and embeddings are current before the first search.
		setImmediate(() => {
			try {
				getDb().prune(existsSync);
				syncSkills(ctx.cwd, loadedSkills());
				backfill(ctx.cwd, providersFor(config(ctx.cwd)).embedder);
			} catch {}
		});
	});

	pi.on("session_shutdown", async () => {
		await providers?.judge?.close?.();
		providers = undefined;
		db?.close();
		db = undefined;
	});

	pi.on("before_agent_start", (event, ctx) => {
		const opts = event.systemPromptOptions;
		for (const s of opts.skills) known.set(s.name, s);
		syncSkills(ctx.cwd, [...known.values()]);
		backfill(ctx.cwd, providersFor(config(ctx.cwd)).embedder);
		const p = plan([...known.values()], config(ctx.cwd));
		const listed = new Set(p.listed.map((s) => s.name));
		opts.skills.splice(0, opts.skills.length, ...opts.skills.filter((s) => listed.has(s.name)));

		// With nothing unlisted there is nothing to search, so don't advertise the tool.
		const searchable = p.titles.length > 0 || p.hidden > 0;
		const at = opts.selectedTools.indexOf("skill_search");
		if (!searchable && at >= 0) opts.selectedTools.splice(at, 1);
		else if (searchable && at < 0) opts.selectedTools.push("skill_search");

		const sections = (opts.sections ??= {});
		const index = indexSection(p);
		if (index) sections.skill_index = index;
		else delete sections.skill_index;

		const bodies = p.full.flatMap((s) => {
			try {
				return [`## ${s.name} (${s.filePath})\n\n${skillBody(readFileSync(s.filePath, "utf8"))}`];
			} catch {
				return [];
			}
		});
		if (bodies.length) sections.skill_full = bodies.join("\n\n");
		else delete sections.skill_full;
	});

	pi.registerTool({
		name: "skill_search",
		label: "Skill Search",
		description:
			"Search installed skills by task description. Returns names, descriptions and SKILL.md paths.",
		promptSnippet: "Search installed skills that are not listed in the prompt",
		promptGuidelines: [
			"Before starting a task that is not trivial, call skill_search with a short description of it, then read the SKILL.md of any skill that fits and follow it.",
		],
		parameters: Type.Object({
			query: Type.String({ description: "What you need to do, in a few words" }),
			limit: Type.Optional(
				Type.Integer({ minimum: 1, maximum: 25, description: "Maximum results" }),
			),
		}),
		async execute(_id, params, _signal, _update, ctx) {
			const cfg = config(ctx.cwd);
			const limit = params.limit ?? cfg.limit;
			const pr = providersFor(cfg);
			const { skills: hits, errors } = await searchSkills(
				{
					db: getDb(),
					embedder: pr.embedder,
					reranker: pr.reranker,
					judge: pr.judge,
					threshold: cfg.decision.threshold,
				},
				{ projectRoot: ctx.cwd },
				params.query,
				limit,
			);
			const body = hits.length
				? hits
						.map((s) => {
							const d =
								s.description.length > 200 ? `${s.description.slice(0, 197)}...` : s.description;
							return `- ${s.name}: ${d}\n  ${s.filePath}`;
						})
						.join("\n")
				: `No skill matches "${params.query}". Try different words.`;
			const text = errors.length
				? `${body}\n\nWarning: search stages failed and were skipped:\n${errors.map((e) => `- ${e}`).join("\n")}`
				: body;
			return { content: [{ type: "text", text }], details: { hits: hits.length, errors } };
		},
	});

	const skillEntries = () =>
		pi
			.getCommands()
			.filter((c) => c.source === "skill")
			.map((c) => ({ name: c.name.replace(/^skill:/, ""), description: c.description ?? "" }));

	registerConfigSection({
		id: "skill-index",
		label: "Skill index",
		example: {
			skillIndex: {
				default: "title",
				limit: 5,
				skills: { "my-skill": "full", "internal-*": "hidden" },
				embedding: { provider: "onnx", model: "Xenova/bge-small-en-v1.5" },
				reranker: { provider: "onnx", model: "Xenova/bge-reranker-base" },
				decision: { enabled: false, provider: "typesafe", model: "jev-latest", threshold: 0.5 },
			},
		},
		open: (ctx) => openSettings(ctx, skillEntries()),
		summary: (ctx) => {
			const cfg = config(ctx.cwd);
			const counts = Object.fromEntries(MODES.map((m) => [m, 0]));
			for (const s of skillEntries()) counts[modeOf(s.name, cfg)]++;
			return `default ${cfg.default}; ${MODES.map((m) => `${m} ${counts[m]}`).join(", ")}; search limit ${cfg.limit}; embedding ${cfg.embedding.provider}, reranker ${cfg.reranker.provider}, decision ${cfg.decision.enabled ? cfg.decision.provider : "off"}`;
		},
	});
}
