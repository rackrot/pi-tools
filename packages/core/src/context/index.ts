import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { estimateTokens } from "@earendil-works/pi-coding-agent";

const tok = (s: string) => Math.ceil(s.length / 4);
const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

/** `/context`: estimated breakdown of what fills the context window (like Claude Code's /context). */
export default function (pi: ExtensionAPI) {
	pi.registerCommand("context", {
		description: "Show a breakdown of context window usage",
		handler: async (_args, ctx) => {
			const opts = ctx.getSystemPromptOptions();
			const prompt = ctx.getSystemPrompt();
			const promptTokens = tok(prompt);
			const files = (opts.contextFiles ?? []).map((f) => ({
				name: f.path,
				tokens: tok(f.content),
			}));
			const filesTotal = files.reduce((a, f) => a + f.tokens, 0);

			// Measured from the final prompt text, since extensions rewrite skills and sections per turn.
			const block = (tag: string) => {
				const m = prompt.match(new RegExp(`<${tag}>[\\s\\S]*?</${tag}>`));
				return m ? tok(m[0]) : 0;
			};
			const skillBlocks = ["available_skills", "skill_index", "skill_full"]
				.map((t) => ({ name: t, tokens: block(t) }))
				.filter((b) => b.tokens > 0);
			const skillsTotal = skillBlocks.reduce((a, b) => a + b.tokens, 0);
			const sections = Object.keys(opts.sections ?? {})
				.filter((k) => k !== "skill_index" && k !== "skill_full")
				.map((k) => ({ name: k, tokens: block(k) }))
				.filter((b) => b.tokens > 0);
			const sectionsTotal = sections.reduce((a, b) => a + b.tokens, 0);
			const baseTokens = Math.max(0, promptTokens - filesTotal - skillsTotal - sectionsTotal);

			const active = new Set(pi.getActiveTools());
			const tools = pi
				.getAllTools()
				.filter((t) => active.has(t.name))
				.map((t) => ({
					group:
						t.sourceInfo.source === "builtin"
							? "built-in"
							: t.sourceInfo.path.replace(/^.*node_modules\//, "").replace(/\/(src|dist)\/.*$/, ""),
					tokens: tok(
						JSON.stringify({ name: t.name, description: t.description, parameters: t.parameters }),
					),
				}));
			const toolsTotal = tools.reduce((a, t) => a + t.tokens, 0);
			const groups = new Map<string, { n: number; tokens: number }>();
			for (const t of tools) {
				const g = groups.get(t.group) ?? { n: 0, tokens: 0 };
				groups.set(t.group, { n: g.n + 1, tokens: g.tokens + t.tokens });
			}
			const groupRows = [...groups].sort((a, b) => b[1].tokens - a[1].tokens);

			const byRole = new Map<string, number>();
			for (const m of ctx.sessionManager.buildSessionProjection().messages) {
				const role = m.role === "toolResult" ? "tool results" : `${m.role} messages`;
				byRole.set(role, (byRole.get(role) ?? 0) + estimateTokens(m));
			}
			const msgTotal = [...byRole.values()].reduce((a, b) => a + b, 0);

			const estimated = promptTokens + toolsTotal + msgTotal;
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
				row("System prompt (base)", baseTokens),
				row("Context files", filesTotal),
				...files.map((f) => row(f.name.replace(/^.*\/(?=[^/]+\/[^/]+$)/, ""), f.tokens, "  ")),
				row("Skills", skillsTotal),
				...skillBlocks.map((b) => row(b.name, b.tokens, "  ")),
				row("Extension prompt sections", sectionsTotal),
				...sections.map((b) => row(b.name, b.tokens, "  ")),
				row(`Tools (${tools.length})`, toolsTotal),
				...groupRows.map(([g, v]) => row(`${g} (${v.n})`, v.tokens, "  ")),
				row("Messages", msgTotal),
				...[...byRole].map(([r, n]) => row(r, n, "  ")),
				...(window ? [row("Free space", Math.max(0, window - (usage?.tokens ?? estimated)))] : []),
			];
			ctx.ui.notify(lines.join("\n"), "info");
		},
	});
}
