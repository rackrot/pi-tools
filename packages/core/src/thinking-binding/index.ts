import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
	BINDING_ENTRY_TYPE,
	type BindingState,
	fingerprintPrefix,
	newestAssistantTimestamp,
	parseAnthropicPayload,
	readBindingState,
	reportsPrefixMismatch,
	stripPayloadThinking,
	stripStaleThinking,
} from "./binding.ts";

/**
 * Drops Anthropic thinking blocks that a system prompt or tool change has already invalidated,
 * so `prefix_binding_mismatch` is reported once instead of on every turn.
 *
 * Anthropic binds each thinking signature to the `system`, `tools` and earlier messages that
 * produced it. When the prefix changes (an extension edits a tool description, pi restarts into
 * an old session), every earlier block is dropped server-side on each later turn. We do the drop
 * ourselves, once, and remember the cutoff in the session. The session file keeps the originals.
 *
 * Adapted from luan/agents `pi-thinking-binding` (MIT).
 */
export default function thinkingBinding(pi: ExtensionAPI): void {
	// The assistant message timestamp predates before_provider_request, so the cutoff comes from history.
	let newestAssistant: number | undefined;
	let fingerprint: string | undefined;
	const record = (state: BindingState): void => pi.appendEntry(BINDING_ENTRY_TYPE, state);

	pi.on("context", (event, ctx) => {
		if (ctx.model?.api !== "anthropic-messages") return;
		newestAssistant = newestAssistantTimestamp(event.messages);
		const state = readBindingState(ctx.sessionManager.getBranch());
		if (state?.staleThrough === undefined) return;
		const messages = stripStaleThinking(event.messages, state.staleThrough);
		return messages ? { messages } : undefined;
	});

	pi.on("before_provider_request", (event, ctx) => {
		if (ctx.model?.api !== "anthropic-messages") return;
		const payload = parseAnthropicPayload(event.payload);
		if (!payload) return;
		fingerprint = fingerprintPrefix(payload);
		const previous = readBindingState(ctx.sessionManager.getBranch());
		if (previous?.fingerprint === fingerprint) return;
		// A changed prefix invalidates every thinking block sent so far; a first sighting invalidates nothing.
		const staleThrough = previous ? (newestAssistant ?? previous.staleThrough) : undefined;
		record({ version: 1, fingerprint, staleThrough });
		return previous && newestAssistant !== undefined ? stripPayloadThinking(payload) : undefined;
	});

	// Prefix changes the fingerprint cannot see (pre-existing breakage, rewritten message content):
	// trust Anthropic's own drop report once.
	pi.on("message_end", (event, ctx) => {
		if (
			ctx.model?.api !== "anthropic-messages" ||
			fingerprint === undefined ||
			newestAssistant === undefined
		)
			return;
		if (!reportsPrefixMismatch(event.message)) return;
		const previous = readBindingState(ctx.sessionManager.getBranch());
		if (previous?.staleThrough !== undefined && previous.staleThrough >= newestAssistant) return;
		record({ version: 1, fingerprint, staleThrough: newestAssistant });
	});
}
