import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { ModelRef } from "./config.ts";

export interface CallOptions {
	system: string;
	prompt: string;
	maxTokens?: number;
	timeoutSeconds: number;
	signal?: AbortSignal;
}

export interface CallResult {
	ref: ModelRef;
	text: string;
}

/** Splits `provider/model`; the model id may itself contain slashes. */
export function splitModel(model: string): { provider: string; id: string } {
	const i = model.indexOf("/");
	return { provider: model.slice(0, i), id: model.slice(i + 1) };
}

/** One tool-less completion. Throws with a readable message on any failure. */
export async function callModel(
	ctx: ExtensionContext,
	ref: ModelRef,
	o: CallOptions,
): Promise<CallResult> {
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

/** Tries each ref in order; the error lists every failure. */
export async function callChain(
	ctx: ExtensionContext,
	chain: ModelRef[],
	o: CallOptions,
): Promise<CallResult> {
	const errors: string[] = [];
	for (const ref of chain) {
		try {
			return await callModel(ctx, ref, o);
		} catch (e) {
			if (o.signal?.aborted) throw e;
			errors.push(`${ref.model}: ${(e as Error).message}`);
		}
	}
	throw new Error(errors.join("; ") || "no model configured");
}
