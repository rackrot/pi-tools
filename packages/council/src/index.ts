import { type ExtensionAPI, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import { registerConfigSection } from "@rackrot/pi-core/config-ui";
import { Type } from "typebox";
import { loadConfig, type ModelRef } from "./config.ts";
import { embedFiles } from "./files.ts";
import {
	COUNCILLOR_SYSTEM,
	SECOND_OPINION_SYSTEM,
	SYNTHESIZER_SYSTEM,
	userPrompt,
	withExtra,
} from "./prompts.ts";
import { callChain } from "./run.ts";
import { openSettings } from "./ui.ts";
import {
	councilActive,
	councilDescription,
	secondOpinionActive,
	secondOpinionDescription,
} from "./usage.ts";

const text = (t: string, details: Record<string, unknown> = {}) => ({
	content: [{ type: "text" as const, text: t }],
	details,
});

/** The session's current model as a fallback when no model is configured. */
function sessionModel(ctx: ExtensionContext): ModelRef[] {
	return ctx.model ? [{ model: `${ctx.model.provider}/${ctx.model.id}` }] : [];
}

const FILES_DESC =
	"Paths (relative to cwd) of files to include verbatim. Prefer this over pasting code.";
const CONTEXT_DESC =
	"Everything the reviewer needs: goal, constraints, what you tried, relevant findings. The reviewer sees nothing else from this session.";

export default function (pi: ExtensionAPI) {
	const config = loadConfig();

	registerConfigSection({
		id: "council",
		label: "Council & second opinion",
		example: {
			council: {
				secondOpinion: {
					enabled: true,
					model: "provider/model-id",
					thinking: "high",
					models: [{ id: "big", model: "provider/big-model", useWhen: "hard design problems" }],
					timeoutSeconds: 300,
				},
				council: {
					enabled: true,
					defaultPreset: "default",
					presets: {
						default: {
							useWhen: "important decisions",
							councillors: {
								skeptic: {
									model: ["provider/model-a", "provider/fallback"],
									thinking: "medium",
									prompt: "Look for flaws.",
								},
							},
						},
					},
					synthesizer: { enabled: true, model: "provider/model-id" },
					timeoutSeconds: 300,
				},
			},
		},
		open: async (ctx) => {
			if (await openSettings(ctx)) await ctx.reload();
		},
		summary: (ctx) => {
			const cfg = loadConfig(ctx.cwd);
			return `second_opinion ${cfg.secondOpinion.enabled ? "on" : "off"}, default ${cfg.secondOpinion.default?.model ?? "session model"}, ${cfg.secondOpinion.options.length} options; council ${cfg.council.enabled ? "on" : "off"}, presets ${Object.keys(cfg.council.presets).join(", ") || "none"}`;
		},
	});

	if (secondOpinionActive(config))
		pi.registerTool({
			name: "second_opinion",
			label: "Second Opinion",
			description: secondOpinionDescription(config),
			promptSnippet: "Get a second opinion from another model",
			promptGuidelines: [
				"Use second_opinion before committing to a non-trivial design or when unsure; give it full context since it sees nothing else.",
			],
			parameters: Type.Object({
				question: Type.String({
					description: "What you want a second opinion on, stated precisely.",
				}),
				context: Type.Optional(Type.String({ description: CONTEXT_DESC })),
				files: Type.Optional(Type.Array(Type.String(), { description: FILES_DESC })),
				model: Type.Optional(
					Type.String({
						description: "Option id or model from this tool's description. Omit for the default.",
					}),
				),
			}),
			async execute(_id, params, signal, _update, ctx) {
				const fresh = loadConfig(ctx.cwd);
				const s = fresh.secondOpinion;
				let chain: ModelRef[];
				if (params.model) {
					const pick = s.options.find((o) => o.id === params.model || o.model === params.model);
					if (!pick) {
						const ids = s.options.map((o) => o.id).join(", ") || "(none configured)";
						throw new Error(`Unknown model "${params.model}". Options: ${ids}`);
					}
					chain = [pick];
				} else {
					chain = s.default ? [s.default] : sessionModel(ctx);
				}
				const files = embedFiles(params.files, ctx.cwd, fresh.maxFileBytes);
				const r = await callChain(ctx, chain, {
					system: withExtra(SECOND_OPINION_SYSTEM, s.systemPrompt),
					prompt: userPrompt(params.question, params.context, files),
					maxTokens: s.maxTokens,
					timeoutSeconds: s.timeoutSeconds,
					signal,
				});
				return text(`Second opinion from ${r.ref.model}:\n\n${r.text}`, { model: r.ref.model });
			},
		});

	if (councilActive(config))
		pi.registerTool({
			name: "council",
			label: "Council",
			description: councilDescription(config),
			promptSnippet: "Have a council of models review a plan or change and report issues and gaps",
			promptGuidelines: [
				"Use council only for high-stakes or hard-to-reverse decisions and large reviews; prefer second_opinion otherwise.",
			],
			parameters: Type.Object({
				question: Type.String({ description: "What the council should review or decide." }),
				context: Type.Optional(Type.String({ description: CONTEXT_DESC })),
				files: Type.Optional(Type.Array(Type.String(), { description: FILES_DESC })),
				preset: Type.Optional(Type.String({ description: "Preset name. Omit for the default." })),
			}),
			async execute(_id, params, signal, update, ctx) {
				const fresh = loadConfig(ctx.cwd);
				const c = fresh.council;
				const name = params.preset ?? c.defaultPreset;
				const preset = c.presets[name];
				if (!preset) {
					throw new Error(
						`Unknown preset "${name}". Presets: ${Object.keys(c.presets).join(", ")}`,
					);
				}
				const prompt = userPrompt(
					params.question,
					params.context,
					embedFiles(params.files, ctx.cwd, fresh.maxFileBytes),
				);
				const names = Object.keys(preset.councillors);
				update?.(text(`Council "${name}": asking ${names.join(", ")}...`));

				const settled = await Promise.allSettled(
					names.map((n) => {
						const cl = preset.councillors[n];
						return callChain(ctx, cl.chain, {
							system: withExtra(withExtra(COUNCILLOR_SYSTEM, c.councillorPrompt), cl.prompt),
							prompt,
							maxTokens: c.maxTokens,
							timeoutSeconds: c.timeoutSeconds,
							signal,
						});
					}),
				);
				const answers = settled.map((s, i) => ({
					name: names[i],
					model: s.status === "fulfilled" ? s.value.ref.model : undefined,
					text: s.status === "fulfilled" ? s.value.text : undefined,
					error: s.status === "rejected" ? (s.reason as Error).message : undefined,
				}));
				const ok = answers.filter((a) => a.text);
				if (!ok.length) {
					throw new Error(
						`All councillors failed:\n${answers.map((a) => `- ${a.name}: ${a.error}`).join("\n")}`,
					);
				}
				const failed = answers.filter((a) => !a.text);
				const failNote = failed.length
					? `\n\nFailed councillors:\n${failed.map((a) => `- ${a.name}: ${a.error}`).join("\n")}`
					: "";
				const raw = ok.map((a) => `## ${a.name} (${a.model})\n\n${a.text}`).join("\n\n");
				const details = {
					preset: name,
					councillors: answers.map((a) => ({ name: a.name, model: a.model, error: a.error })),
				};

				if (!c.synthesizer.enabled || ok.length === 1) {
					return text(`Council "${name}" (unsynthesized):\n\n${raw}${failNote}`, details);
				}
				update?.(text(`Council "${name}": synthesizing ${ok.length} answers...`));
				const synthChain = c.synthesizer.chain.length ? c.synthesizer.chain : sessionModel(ctx);
				try {
					const synth = await callChain(ctx, synthChain, {
						system: withExtra(SYNTHESIZER_SYSTEM, c.synthesizer.prompt),
						prompt: `${prompt}\n\n<councillor_answers>\n${raw}\n</councillor_answers>`,
						maxTokens: c.maxTokens,
						timeoutSeconds: c.timeoutSeconds,
						signal,
					});
					return text(
						`Council "${name}" synthesis (by ${synth.ref.model}; councillors: ${ok.map((a) => a.name).join(", ")}):\n\n${synth.text}${failNote}`,
						details,
					);
				} catch (e) {
					return text(
						`Council "${name}": synthesizer failed (${(e as Error).message}); raw councillor answers follow.\n\n${raw}${failNote}`,
						details,
					);
				}
			},
		});
}
