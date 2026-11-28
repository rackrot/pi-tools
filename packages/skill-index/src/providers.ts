import { randomUUID } from "node:crypto";
import { apiKey } from "@rackrot/pi-core/retrieval";
import { TypeSafeClient } from "@typesafe-ai/sdk";
import type { DecisionConfig } from "./config.ts";

export interface Judge {
	/** Probability in 0..1 that each candidate is useful for the task. */
	judge(task: string, candidates: { name: string; description: string }[]): Promise<number[]>;
	close?(): Promise<void>;
}

type Questions = Record<string, { type: "noul"; instructions: unknown }>;

const questions = (candidates: { name: string; description: string }[]): Questions =>
	Object.fromEntries(
		candidates.map((c, i) => [
			`c${i}`,
			{
				type: "noul" as const,
				instructions: {
					question: "Is this skill useful for completing the task in the state?",
					skill: { name: c.name, description: c.description },
				},
			},
		]),
	);

type Answers = Record<string, { noul: number }>;

const scores = (answers: Answers | undefined, n: number) =>
	Array.from({ length: n }, (_, i) => {
		const noul = answers?.[`c${i}`]?.noul;
		if (typeof noul !== "number") throw new Error(`decision model returned no answer for c${i}`);
		return noul;
	});

export function createJudge(cfg: DecisionConfig): Judge | undefined {
	if (!cfg.enabled) return;
	if (cfg.provider === "typesafe") {
		// The SDK zstd-compresses bodies of 1 KB or more, which llama-swap can't read the model id from (404).
		const client = new TypeSafeClient({
			baseURL: cfg.baseUrl,
			// The SDK throws without a key, but self-hosted servers ignore it: use a random one unless set.
			apiKey: apiKey(cfg.apiKeyEnv) ?? process.env.TYPESAFE_API_KEY ?? randomUUID(),
			compression: false,
		});
		return {
			async judge(task, candidates) {
				const r = await client.systemOne({
					model: cfg.model,
					state: { task },
					questions: questions(candidates),
				} as never);
				return scores((r as unknown as { answers: Answers }).answers, candidates.length);
			},
		};
	}
	// @receptron/laya is an optional peer; the specifier is a variable so it is not resolved up front.
	type Laya = {
		systemOne(state: unknown, q: Questions): Promise<{ answers: Answers }>;
		close(): Promise<void>;
	};
	let laya: Promise<Laya> | undefined;
	const spec = "@receptron/laya";
	return {
		async judge(task, candidates) {
			laya ??= import(spec).then((m: { Laya: { load(): Promise<Laya> } }) => m.Laya.load());
			const r = await (await laya).systemOne({ task }, questions(candidates));
			return scores(r.answers, candidates.length);
		},
		async close() {
			await (await laya)?.close();
		},
	};
}
