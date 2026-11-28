import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { callModel, type ModelCallOptions, type ModelRef } from "@rackrot/pi-core/model-call";

export { splitModel } from "@rackrot/pi-core/model-call";

export type CallOptions = ModelCallOptions;

export interface CallResult {
	ref: ModelRef;
	text: string;
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
