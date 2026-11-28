import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

export const THINKING = ["minimal", "low", "medium", "high", "xhigh", "max"] as const;
export type Thinking = (typeof THINKING)[number];

/** One model to call: `provider/model` plus optional thinking level. */
export interface ModelRef {
	model: string;
	thinking?: Thinking;
}

const isObj = (v: unknown): v is Record<string, unknown> =>
	!!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const thinking = (v: unknown) => THINKING.find((t) => t === v);

/** Accepts `"provider/model"` or `{ model, thinking? }`. */
export function parseRef(v: unknown, inherit?: Thinking): ModelRef | undefined {
	if (typeof v === "string") {
		const model = str(v);
		return model?.includes("/") ? { model, thinking: inherit } : undefined;
	}
	if (!isObj(v)) return undefined;
	const model = str(v.model ?? v.id);
	if (!model?.includes("/")) return undefined;
	return { model, thinking: thinking(v.thinking) ?? inherit };
}

/** Splits `provider/model`; the model id may itself contain slashes. */
export function splitModel(model: string): { provider: string; id: string } {
	const i = model.indexOf("/");
	return { provider: model.slice(0, i), id: model.slice(i + 1) };
}

export interface ModelCallOptions {
	system: string;
	prompt: string;
	maxTokens?: number;
	timeoutSeconds: number;
	signal?: AbortSignal;
}

/** One tool-less completion. Throws with a readable message on any failure. */
export async function callModel(
	ctx: Pick<ExtensionContext, "modelRegistry">,
	ref: ModelRef,
	o: ModelCallOptions,
): Promise<{ ref: ModelRef; text: string }> {
	const { provider, id } = splitModel(ref.model);
	const model = ctx.modelRegistry.find(provider, id);
	if (!model) throw new Error(`model ${ref.model} not found`);
	if (model.api === "pi-virtual") {
		throw new Error(`${ref.model} is a virtual model (alias); use a concrete provider/model`);
	}
	const signal = AbortSignal.any([
		AbortSignal.timeout(o.timeoutSeconds * 1000),
		...(o.signal ? [o.signal] : []),
	]);
	const msg = await ctx.modelRegistry
		.streamSimple(
			model,
			{
				systemPrompt: o.system,
				messages: [{ role: "user", content: o.prompt, timestamp: Date.now() }],
			},
			{ signal, maxTokens: o.maxTokens, reasoning: ref.thinking },
		)
		.result();
	if (msg.stopReason === "error" || msg.stopReason === "aborted") {
		throw new Error(msg.errorMessage ?? msg.stopReason);
	}
	const text = msg.content
		.flatMap((c) => (c.type === "text" ? c.text : []))
		.join("")
		.trim();
	if (!text) throw new Error("empty response");
	return { ref, text };
}
