import { getCurrentSystemMessage } from "@earendil-works/pi-ai";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { estimateTokens } from "@earendil-works/pi-coding-agent";

const tok = (s: string) => Math.ceil(s.length / 4);
const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
const sum = (xs: { tokens: number }[]) => xs.reduce((a, x) => a + x.tokens, 0);

const SKILL_SECTIONS = ["skills", "skill_index", "skill_full"];
const BASE_SECTIONS = ["preamble", "tools", "rules", "docs", "addendum", "cwd"];

type Ctx = Pick<ExtensionContext, "sessionManager">;

/** Estimated token breakdown of what the model currently has in context. */
export function measure(pi: ExtensionAPI, ctx: Ctx) {
	const all = ctx.sessionManager.buildSessionProjection().messages;
	const system = getCurrentSystemMessage(all);
	const sections = Object.entries(system?.sections ?? {}).map(([name, text]) => ({
		name,
		tokens: tok(text ?? ""),
	}));
	const pick = (names: string[]) => sections.filter((s) => names.includes(s.name));

	const base = [
		...pick(BASE_SECTIONS),
		...(system?.content ? [{ name: "content", tokens: tok(JSON.stringify(system.content)) }] : []),
	];
	const skills = pick(SKILL_SECTIONS);
	const ctxFiles = pick(["project_context"]);
	const extra = sections.filter(
		(s) => ![...BASE_SECTIONS, ...SKILL_SECTIONS, "project_context"].includes(s.name),
	);
	const source = new Map(pi.getAllTools().map((t) => [t.name, t.sourceInfo]));
	const groups = new Map<string, { n: number; tokens: number }>();
	for (const t of system?.toolsAdded ?? []) {
		const si = source.get(t.name);
		const group =
			!si || si.source === "builtin"
				? "built-in"
				: si.path.replace(/^.*node_modules\//, "").replace(/\/(src|dist)\/.*$/, "");
		const g = groups.get(group) ?? { n: 0, tokens: 0 };
		groups.set(group, { n: g.n + 1, tokens: g.tokens + tok(JSON.stringify(t)) });
	}
	const groupRows = [...groups].sort((a, b) => b[1].tokens - a[1].tokens);
	const toolsTotal = groupRows.reduce((a, [, v]) => a + v.tokens, 0);
	const toolCount = groupRows.reduce((a, [, v]) => a + v.n, 0);

	// System messages are the prompt and tools above, so leave them out here.
	const byRole = new Map<string, number>();
	for (const m of all) {
		if (m.role === "system") continue;
		const role = m.role === "toolResult" ? "tool results" : `${m.role} messages`;
		byRole.set(role, (byRole.get(role) ?? 0) + estimateTokens(m));
	}
	const msgTotal = [...byRole.values()].reduce((a, b) => a + b, 0);

	const estimated =
		sum(sections) + sum(base.filter((b) => b.name === "content")) + toolsTotal + msgTotal;
	return {
		sections,
		base,
		skills,
		ctxFiles,
		extra,
		groupRows,
		toolsTotal,
		toolCount,
		byRole,
		msgTotal,
		estimated,
	};
}

/**
 * `/context`: estimated breakdown of what fills the context window (like Claude Code's /context).
 * The prompt and tools are read from the session's replayed system messages, i.e. what the model
 * actually has. `ctx.getSystemPrompt()` is not used: it can be rebuilt from untrimmed options.
 */
export default function (pi: ExtensionAPI) {
	pi.registerCommand("context", {
		description: "Show a breakdown of context window usage",
		handler: async (_args, ctx) => {
			const m = measure(pi, ctx);
			const files = (ctx.getSystemPromptOptions().contextFiles ?? []).map((f) => ({
				name: f.path.replace(/^.*\/(?=[^/]+\/[^/]+$)/, ""),
				tokens: tok(f.content),
			}));
			const { base, skills, ctxFiles, extra, groupRows, toolsTotal, toolCount } = m;
			const { byRole, msgTotal, estimated } = m;
			const usage = ctx.getContextUsage();
			const window = usage?.contextWindow ?? 0;
			const pct = (n: number) => (window ? ` (${((n / window) * 100).toFixed(1)}%)` : "");
			const row = (label: string, n: number, indent = "") =>
				`${indent}${label.padEnd(28 - indent.length)}${fmt(n).padStart(7)}${pct(n)}`;

			const lines = [
				`Context usage — ${ctx.model?.id ?? "unknown model"}`,
				usage?.tokens != null
					? `Reported: ${fmt(usage.tokens)} / ${fmt(window)} tokens (${usage.percent?.toFixed(1)}%)`
					: `Reported: unknown (no response yet) / ${fmt(window)} tokens`,
				`Estimated (chars/4): ${fmt(estimated)}`,
				"",
				row("System prompt (base)", sum(base)),
				row("Context files", sum(ctxFiles)),
				...files.map((f) => row(f.name, f.tokens, "  ")),
				row("Skills", sum(skills)),
				...skills.map((s) => row(s.name, s.tokens, "  ")),
				row("Extension prompt sections", sum(extra)),
				...extra.map((s) => row(s.name, s.tokens, "  ")),
				row(`Tools (${toolCount})`, toolsTotal),
				...groupRows.map(([g, v]) => row(`${g} (${v.n})`, v.tokens, "  ")),
				row("Messages", msgTotal),
				...[...byRole].map(([r, n]) => row(r, n, "  ")),
				...(window ? [row("Free space", Math.max(0, window - (usage?.tokens ?? estimated)))] : []),
			];
			ctx.ui.notify(lines.join("\n"), "info");
		},
	});
}
