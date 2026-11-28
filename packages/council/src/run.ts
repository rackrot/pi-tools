import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { callModel, type ModelCallOptions, type ModelRef } from "@rackrot/pi-core/model-call";

export { splitModel } from "@rackrot/pi-core/model-call";

export type CallOptions = ModelCallOptions;

export interface CallResult {
	ref: ModelRef;
	text: string;
}

/**
 * The session's model as `provider/model`. A model alias is virtual and cannot be called directly,
 * so for one the model that produced the latest assistant reply on the branch is used instead.
 * Undefined when there is no model, or an alias has not answered yet.
 */
export function sessionModelId(
	model: { provider: string; id: string; api: string } | undefined,
	branch: readonly unknown[],
): string | undefined {
	if (!model) return undefined;
	if (model.api !== "pi-virtual") return `${model.provider}/${model.id}`;
	for (let i = branch.length - 1; i >= 0; i--) {
		const e = branch[i] as {
			type?: string;
			message?: { role?: string; provider?: string; model?: string };
		};
		if (e?.type === "message" && e.message?.role === "assistant")
			return e.message.provider && e.message.model
				? `${e.message.provider}/${e.message.model}`
				: undefined;
	}
	return undefined;
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
