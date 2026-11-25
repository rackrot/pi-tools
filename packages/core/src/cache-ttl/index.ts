import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export type CacheTtl = "5m" | "1h";

export const CACHE_TTL_ENTRY_TYPE = "@rackrot/pi-core:cache-ttl";
const STATUS_KEY = "rackrot-cache-ttl";
const ENV = "PI_CACHE_RETENTION";

/** The last TTL chosen on the branch; `undefined` when the user never chose one. */
export function readCacheTtl(branch: readonly unknown[]): CacheTtl | undefined {
	for (let i = branch.length - 1; i >= 0; i--) {
		const e = branch[i] as { type?: string; customType?: string; data?: { ttl?: unknown } };
		if (e?.type === "custom" && e.customType === CACHE_TTL_ENTRY_TYPE)
			return e.data?.ttl === "1h" ? "1h" : e.data?.ttl === "5m" ? "5m" : undefined;
	}
	return undefined;
}

/**
 * Anthropic prompt-cache TTL, 1h by default. Drives pi's own `PI_CACHE_RETENTION` switch, which pi-ai
 * honors only for models that support long retention. 1h writes cost 2x base input instead of 1.25x.
 *
 * Subagents run in this process and read the same variable, so they follow it unless subagents set their
 * own retention: set `cacheRetention: "short"` in `subagents.json` to keep them on 5m.
 * `/cache-ttl [5m|1h]` changes it for the session (no argument toggles) and is stored in the session.
 * Inspired by mackenney/pi-cache-ttl-config.
 */
export default function cacheTtl(pi: ExtensionAPI): void {
	// A user-set variable wins; a subagent loading this extension never overrides the main session's choice.
	process.env[ENV] ??= "long";
	const current = (): CacheTtl => (process.env[ENV] === "long" ? "1h" : "5m");
	const apply = (ctx: {
		hasUI: boolean;
		ui: { setStatus(k: string, v: string | undefined): void };
	}) => {
		if (ctx.hasUI) ctx.ui.setStatus(STATUS_KEY, current() === "1h" ? "cache:1h" : undefined);
	};

	pi.on("session_start", (_event, ctx) => {
		const saved = readCacheTtl(ctx.sessionManager.getBranch());
		if (saved) process.env[ENV] = saved === "1h" ? "long" : "short";
		apply(ctx);
	});

	pi.registerCommand("cache-ttl", {
		description: "Anthropic prompt-cache TTL: /cache-ttl [5m|1h] (no argument toggles)",
		handler: async (args, ctx) => {
			const arg = args?.trim();
			if (arg && arg !== "5m" && arg !== "1h")
				return ctx.ui.notify(`Unknown TTL "${arg}". Use /cache-ttl [5m|1h]`, "error");
			const next = (arg as CacheTtl | undefined) ?? (current() === "5m" ? "1h" : "5m");
			process.env[ENV] = next === "1h" ? "long" : "short";
			pi.appendEntry(CACHE_TTL_ENTRY_TYPE, { ttl: next });
			apply(ctx);
			ctx.ui.notify(
				next === "1h" ? "Cache TTL: 1 hour (writes cost 2x base input)" : "Cache TTL: 5 minutes",
				"info",
			);
		},
	});
}
