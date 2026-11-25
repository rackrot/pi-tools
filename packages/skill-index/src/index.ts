import { readFileSync } from "node:fs";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerConfigSection } from "@rackrot/pi-core/config-ui";
import { Type } from "typebox";
import { loadLayers, MODES, mergeLayers, modeOf } from "./config.ts";
import { indexSection, plan, type SkillInfo, skillBody } from "./plan.ts";
import { search } from "./search.ts";
import { openSettings } from "./ui.ts";

/**
 * Controls how much of each skill the system prompt carries, and adds `skill_search` for the rest.
 * Skills stay loaded in pi, so `/skill:name` and reading a SKILL.md path keep working.
 */
export default function (pi: ExtensionAPI) {
	/** Every skill seen this session, by name. The prompt hook sees the full set before it trims it. */
	const known = new Map<string, SkillInfo>();
	const config = (cwd: string) => mergeLayers(loadLayers(cwd));

	pi.on("session_start", () => known.clear());

	pi.on("before_agent_start", (event, ctx) => {
		const opts = event.systemPromptOptions;
		for (const s of opts.skills) known.set(s.name, s);
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
			const limit = params.limit ?? config(ctx.cwd).limit;
			const skills = [...known.values()].filter((s) => !s.disableModelInvocation);
			const byName = new Map(skills.map((s) => [s.name, s]));
			const hits = search(skills, params.query, limit);
			const text = hits.length
				? hits
						.map((h) => {
							const s = byName.get(h.name) as SkillInfo;
							const d =
								s.description.length > 200 ? `${s.description.slice(0, 197)}...` : s.description;
							return `- ${s.name}: ${d}\n  ${s.filePath}`;
						})
						.join("\n")
				: `No skill matches "${params.query}". Try different words.`;
			return { content: [{ type: "text", text }], details: { hits: hits.length } };
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
			},
		},
		open: (ctx) => openSettings(ctx, skillEntries()),
		summary: (ctx) => {
			const cfg = config(ctx.cwd);
			const counts = Object.fromEntries(MODES.map((m) => [m, 0]));
			for (const s of skillEntries()) counts[modeOf(s.name, cfg)]++;
			return `default ${cfg.default}; ${MODES.map((m) => `${m} ${counts[m]}`).join(", ")}; search limit ${cfg.limit}`;
		},
	});
}
