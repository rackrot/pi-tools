import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { AgentMessage } from "@earendil-works/pi-agent-core";
import {
	BINDING_ENTRY_TYPE,
	fingerprintPrefix,
	isAnthropicRequest,
	newestAssistantTimestamp,
	parseAnthropicPayload,
	readBindingState,
	reportsPrefixMismatch,
	stripPayloadThinking,
	stripStaleThinking,
} from "../src/thinking-binding/binding.ts";

const system = [{ type: "text", text: "You are Pi." }];
const tools = [{ name: "exec", description: "Run code", input_schema: { type: "object" } }];
const thinkingTurn = {
	role: "assistant",
	content: [
		{ type: "thinking", thinking: "plan", signature: "sig" },
		{ type: "text", text: "ok" },
		{ type: "tool_use", id: "t1", name: "exec", input: {} },
	],
};

type Block =
	| { type: "thinking"; thinking: string; thinkingSignature: string }
	| { type: "text"; text: string };

function assistant(timestamp: number, ...content: Block[]): AgentMessage {
	return {
		role: "assistant",
		content,
		api: "anthropic-messages",
		provider: "anthropic",
		model: "claude",
		usage: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			totalTokens: 0,
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
		},
		stopReason: "stop",
		timestamp,
	} as AgentMessage;
}
const thinking = (text: string) => ({
	type: "thinking" as const,
	thinking: text,
	thinkingSignature: "sig",
});
const text = (value: string) => ({ type: "text" as const, text: value });

describe("fingerprintPrefix", () => {
	test("depends on system and tools, not on messages", () => {
		const a = fingerprintPrefix({ system, tools, messages: [] });
		const b = fingerprintPrefix({ system, tools, messages: [{ role: "user", content: "hi" }] });
		assert.equal(a, b);
	});

	test("changes when a tool description changes", () => {
		const a = fingerprintPrefix({ system, tools, messages: [] });
		const b = fingerprintPrefix({
			system,
			tools: [{ ...tools[0], description: "Run JavaScript" }],
			messages: [],
		});
		assert.notEqual(a, b);
	});
});

describe("parseAnthropicPayload", () => {
	test("accepts Anthropic message bodies and rejects other shapes", () => {
		assert.notEqual(parseAnthropicPayload({ system, tools, messages: [thinkingTurn] }), undefined);
		assert.equal(parseAnthropicPayload({ input: [], instructions: "codex" }), undefined);
		assert.equal(
			parseAnthropicPayload({ messages: [{ role: "user", content: [{ text: "no type" }] }] }),
			undefined,
		);
	});
});

describe("stripPayloadThinking", () => {
	test("removes thinking and redacted thinking but keeps text and tool use", () => {
		const payload = {
			system,
			tools,
			messages: [
				{ role: "user", content: "hi" },
				thinkingTurn,
				{
					role: "assistant",
					content: [
						{ type: "redacted_thinking", data: "x" },
						{ type: "text", text: "later" },
					],
				},
			],
		};
		assert.deepEqual(stripPayloadThinking(payload).messages, [
			{ role: "user", content: "hi" },
			{
				role: "assistant",
				content: [
					{ type: "text", text: "ok" },
					{ type: "tool_use", id: "t1", name: "exec", input: {} },
				],
			},
			{ role: "assistant", content: [{ type: "text", text: "later" }] },
		]);
	});

	test("leaves a thinking-only message intact rather than emptying it", () => {
		const only = {
			role: "assistant",
			content: [{ type: "thinking", thinking: "x", signature: "s" }],
		};
		assert.deepEqual(stripPayloadThinking({ messages: [only] }).messages, [only]);
	});
});

describe("stripStaleThinking", () => {
	const history = [
		assistant(100, thinking("old"), text("a")),
		{ role: "user", content: "next", timestamp: 150 } as AgentMessage,
		assistant(200, thinking("boundary"), text("b")),
		assistant(300, thinking("fresh"), text("c")),
	];

	test("removes thinking at or before the cutoff and keeps newer reasoning", () => {
		const next = stripStaleThinking(history, 200);
		assert.deepEqual(
			next?.map((m) => (m.role === "assistant" ? m.content.map((block) => block.type) : m.role)),
			[["text"], "user", ["text"], ["thinking", "text"]],
		);
	});

	test("returns undefined when nothing is stale", () => {
		assert.equal(stripStaleThinking(history, 50), undefined);
	});

	test("newestAssistantTimestamp ignores non-assistant messages", () => {
		assert.equal(newestAssistantTimestamp(history), 300);
		assert.equal(newestAssistantTimestamp([history[1]!]), undefined);
	});
});

describe("reportsPrefixMismatch", () => {
	const dropped = (reason: string) => ({
		...assistant(1, text("x")),
		diagnostics: [
			{
				type: "anthropic_input_transformations",
				timestamp: 1,
				details: {
					transformations: [{ type: "thinking_dropped", path: "messages.3.content.0", reason }],
				},
			},
		],
	});

	test("only prefix drops count", () => {
		assert.equal(reportsPrefixMismatch(dropped("prefix_binding_mismatch")), true);
		assert.equal(reportsPrefixMismatch(dropped("model_binding_mismatch")), false);
		assert.equal(reportsPrefixMismatch(assistant(1, text("x"))), false);
	});
});

describe("readBindingState", () => {
	test("returns the newest valid entry on the branch", () => {
		const branch = [
			{ type: "custom", customType: BINDING_ENTRY_TYPE, data: { version: 1, fingerprint: "a" } },
			{ type: "message" },
			{
				type: "custom",
				customType: BINDING_ENTRY_TYPE,
				data: { version: 1, fingerprint: "b", staleThrough: 5 },
			},
		];
		assert.deepEqual(readBindingState(branch), { version: 1, fingerprint: "b", staleThrough: 5 });
		assert.equal(readBindingState([{ type: "custom", customType: "other", data: {} }]), undefined);
	});
});

describe("isAnthropicRequest", () => {
	const reply = (api: string) => ({ type: "message", message: { role: "assistant", api } });
	test("a model alias counts as Anthropic when its latest response was", () => {
		assert.equal(isAnthropicRequest({ api: "pi-virtual" }, [reply("anthropic-messages")]), true);
		assert.equal(isAnthropicRequest({ api: "pi-virtual" }, [reply("openai-completions")]), false);
		assert.equal(isAnthropicRequest({ api: "anthropic-messages" }, []), true);
	});
});
