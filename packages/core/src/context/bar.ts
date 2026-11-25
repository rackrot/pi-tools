import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { measure } from "./index.ts";

const KEY = "rackrot-context-bar";
const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
const sum = (xs: { tokens: number }[]) => xs.reduce((a, x) => a + x.tokens, 0);

/** Context bar above the editor: one coloured segment per group, with group percentages. */
export default function (pi: ExtensionAPI) {
	const update = (ctx: ExtensionContext) => {
		if (!ctx.hasUI) return;
		const window = ctx.getContextUsage()?.contextWindow ?? 0;
		if (!window) return ctx.ui.setWidget(KEY, undefined);

		const m = measure(pi, ctx);
		const groups = [
			{ name: "System", tokens: sum(m.base) + sum(m.ctxFiles) + sum(m.extra), color: "accent" },
			{ name: "Skills", tokens: sum(m.skills), color: "success" },
			{ name: "Tools", tokens: m.toolsTotal, color: "warning" },
			{ name: "Msgs", tokens: m.msgTotal, color: "error" },
		] as const;
		// Prefer the provider-reported total for the header; segments are estimates.
		const used = ctx.getContextUsage()?.tokens ?? m.estimated;
		const pct = (n: number) => `${((n / window) * 100).toFixed(1)}%`;

		ctx.ui.setWidget(
			KEY,
			(_tui, theme) => ({
				invalidate() {},
				render(width: number) {
					const barWidth = Math.max(10, width - 2);
					let filled = 0;
					const bar = groups
						.map((g) => {
							const cells = Math.min(
								barWidth - filled,
								g.tokens ? Math.max(1, Math.round((g.tokens / window) * barWidth)) : 0,
							);
							filled += cells;
							return theme.fg(g.color, "█".repeat(cells));
						})
						.join("");
					const free = theme.fg("dim", "░".repeat(Math.max(0, barWidth - filled)));
					const level = used / window;
					const head = theme.fg(
						level < 0.7 ? "success" : level < 0.85 ? "warning" : "error",
						`${fmt(used)}/${fmt(window)} ${pct(used)}`,
					);
					const legend = groups
						.map((g) => `${theme.fg(g.color, "■")} ${g.name} ${pct(g.tokens)}`)
						.join("  ");
					return [
						` ${bar}${free}`,
						` ${head}  ${legend}  ${theme.fg("dim", `░ Free ${pct(Math.max(0, window - used))}`)}`,
					];
				},
			}),
			{ placement: "aboveEditor" },
		);
	};

	pi.on("session_start", async (_e, ctx) => update(ctx));
	pi.on("turn_end", async (_e, ctx) => update(ctx));
	pi.on("session_compact", async (_e, ctx) => update(ctx));
	pi.on("model_select", async (_e, ctx) => update(ctx));
}
