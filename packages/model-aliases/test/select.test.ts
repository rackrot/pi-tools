import assert from "node:assert/strict";
import { test } from "node:test";
import { failoverMessage, isUsageLimitError, parseEntry, pickEntry } from "../src/select.ts";

const E = ["a/m", "b/m", "c/m"];

test("picks first usable entry", () => {
	assert.equal(pickEntry(E, {}, 100), "a/m");
	assert.equal(pickEntry(E, { "a/m": 200 }, 100), "b/m");
	assert.equal(pickEntry(E, { "a/m": 50 }, 100), "a/m"); // expired
});

test("sticky entry is kept while usable", () => {
	assert.equal(pickEntry(E, {}, 100, "b/m"), "b/m");
	assert.equal(pickEntry(E, { "b/m": 200 }, 100, "b/m"), "a/m");
});

test("all exhausted picks soonest recovery", () => {
	assert.equal(pickEntry(E, { "a/m": 300, "b/m": 200, "c/m": 400 }, 100), "b/m");
});

test("usage-limit detection", () => {
	assert.ok(isUsageLimitError("429 You have reached your usage limit"));
	assert.ok(isUsageLimitError('{"error":"insufficient_quota"}'));
	assert.ok(!isUsageLimitError("503 overloaded"));
	assert.ok(!isUsageLimitError(undefined));
	assert.ok(isUsageLimitError("Weekly limit reached, resets Monday"));
});

test("rate limits and context overflow are not usage limits", () => {
	for (const m of [
		"429 Rate limit exceeded, retry in 2s",
		"Request exceeded the context window limit",
		"token limit exceeded for this request",
		"Quota exceeded for quota metric 'Generate requests' and limit 'requests per minute'",
	]) {
		assert.ok(!isUsageLimitError(m), m);
	}
});

test("failover message is retryable and not a quota error", async () => {
	const { isRetryableAssistantError } = await import("@earendil-works/pi-ai");
	const errorMessage = failoverMessage("sonnet", "a/m", "b/m");
	assert.ok(isRetryableAssistantError({ stopReason: "error", errorMessage } as never));
});

test("parseEntry keeps slashes in model id", () => {
	assert.deepEqual(parseEntry("command-code/deepseek/x"), {
		provider: "command-code",
		id: "deepseek/x",
	});
	assert.equal(parseEntry("nope"), undefined);
});
