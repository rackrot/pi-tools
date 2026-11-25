import { toolCall } from "./graders.ts";
import type { Json, ToolCall } from "./types.ts";

/** Accumulates pi `--mode json` events into what graders read. */
export class TraceBuilder {
	lastMessage = "";
	toolCalls: ToolCall[] = [];
	turns = 0;
	costUsd = 0;
	private lines: string[] = [];

	feed(event: Json): void {
		const type = event.type;
		if (type === "tool_execution_start") {
			this.toolCalls.push(...toolCall(String(event.toolName), event.args));
			return;
		}
		if (type !== "message_end") return;
		const msg = event.message as Json | undefined;
		if (!msg) return;
		if (msg.role === "assistant") {
			this.turns++;
			const usage = msg.usage as { cost?: { total?: number } } | undefined;
			this.costUsd += usage?.cost?.total ?? 0;
			const text = ((msg.content as Json[] | undefined) ?? [])
				.filter((p) => p.type === "text")
				.map((p) => String(p.text))
				.join("");
			if (text) this.lastMessage = text;
		}
		if (msg.role === "assistant" || msg.role === "toolResult" || msg.role === "user")
			this.lines.push(JSON.stringify(msg));
	}

	get trace(): string {
		return this.lines.join("\n");
	}
}
