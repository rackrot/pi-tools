import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { loadConfig } from "./config.ts";
import {
	failoverMessage,
	isExhausted,
	isUsageLimitError,
	parseEntry,
	pickEntry,
} from "./select.ts";
import { clearExhausted, loadState, markExhausted } from "./state.ts";

/** Provider the alias models are listed under. `enabledModels` can use the bare alias name. */
const ALIAS_PROVIDER = "alias";
const THINKING = ["off", "minimal", "low", "medium", "high", "xhigh"] as const;

/** Entries whose model exists and has credentials. */
function usableEntries(entries: string[], ctx: ExtensionContext): string[] {
	const available = new Set(ctx.modelRegistry.getAvailable().map((m) => `${m.provider}/${m.id}`));
	return entries.filter((entry) => available.has(entry));
}

export default function (pi: ExtensionAPI) {
	const config = loadConfig();

	for (const [name, entries] of Object.entries(config.aliases)) {
		pi.registerVirtualModel({
			provider: ALIAS_PROVIDER,
			id: name,
			name: `${name} (alias)`,
			thinkingLevels: THINKING,
			route(request, ctx) {
				const usable = usableEntries(entries, ctx);
				if (!usable.length) {
					throw new Error(
						`Alias "${name}": none of ${entries.join(", ")} is available (missing model or credentials)`,
					);
				}
				const failed = request.failed?.model;
				const prev = request.reason === "user" ? undefined : (failed ?? request.previous?.model);
				const sticky = prev ? `${prev.provider}/${prev.id}` : undefined;
				const choice = pickEntry(usable, loadState(), Date.now(), sticky);
				const target = choice && parseEntry(choice);
				const model = target && ctx.modelRegistry.find(target.provider, target.id);
				if (!model) throw new Error(`Alias "${name}": cannot resolve ${choice}`);
				return { model, thinkingLevel: request.thinkingLevel };
			},
		});
	}

	// Extra accounts: clone an API-key provider under a new name with its own key.
	pi.on("session_start", async (_event, ctx) => {
		for (const [name, account] of Object.entries(config.accounts)) {
			const source = ctx.modelRegistry.getAll().filter((m) => m.provider === account.from);
			if (!source.length) {
				ctx.ui.notify(
					`model-aliases: account "${name}": provider "${account.from}" has no models`,
					"warning",
				);
				continue;
			}
			pi.registerProvider(name, {
				name,
				baseUrl: source[0].baseUrl,
				apiKey: account.apiKey,
				api: source[0].api,
				models: source.map(({ provider: _provider, ...model }) => model) as never,
			});
		}
	});

	// When the account behind an alias runs out of usage, remember it and rewrite the error into a
	// transient one so pi's auto-retry re-routes to the next entry without user involvement.
	pi.on("message_end", async (event, ctx) => {
		const msg = event.message;
		if (msg.role !== "assistant" || msg.stopReason !== "error") return;
		if (ctx.model?.provider !== ALIAS_PROVIDER) return;
		if (!isUsageLimitError(msg.errorMessage)) return;
		const entries = config.aliases[ctx.model.id];
		const failedKey = `${msg.provider}/${msg.model}`;
		if (!entries?.includes(failedKey)) return;

		markExhausted(failedKey, Date.now() + config.cooldownMs);
		const state = loadState();
		const next = usableEntries(entries, ctx).find((e) => !isExhausted(state, e, Date.now()));
		if (!next) {
			ctx.ui.notify(`Alias "${ctx.model.id}": every entry is out of usage`, "error");
			return;
		}
		ctx.ui.notify(
			`Alias "${ctx.model.id}": ${failedKey} is out of usage, switching to ${next}`,
			"warning",
		);
		return { message: { ...msg, errorMessage: failoverMessage(ctx.model.id, failedKey, next) } };
	});

	pi.registerCommand("model-alias", {
		description: "Show alias status, or `/model-alias reset [entry...]` to clear exhaustion",
		handler: async (args, ctx) => {
			const [sub, ...rest] = args.trim().split(/\s+/).filter(Boolean);
			if (sub === "reset") {
				clearExhausted(rest.length ? rest : undefined);
				ctx.ui.notify("Exhaustion state cleared", "info");
				return;
			}
			const state = loadState();
			const lines = Object.entries(config.aliases).map(([name, entries]) => {
				const current = pickEntry(usableEntries(entries, ctx), state, Date.now());
				const parts = entries.map((e) => {
					const until = state[e];
					const mark = e === current ? "▶ " : "  ";
					return `${mark}${e}${until ? ` (out of usage until ${new Date(until).toLocaleTimeString()})` : ""}`;
				});
				return `${name}:\n${parts.join("\n")}`;
			});
			ctx.ui.notify(lines.join("\n") || "No modelAliases configured", "info");
		},
	});
}
