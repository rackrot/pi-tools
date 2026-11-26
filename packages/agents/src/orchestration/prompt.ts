import type { Level } from "./config.ts";

const TEMPLATE = `When you delegate with Agent, the child has none of your context, so make the prompt self-contained:
- Goal and why it matters.
- Expected output: what to return and in what shape (findings with file:line, a diff summary, pass/fail).
- Context the child lacks: relevant files, decisions already made, constraints.
- Boundaries: what to touch and what not to touch.
Independent tasks go out in parallel, in the background. Do not repeat work you delegated. Summaries describe intent, not outcome: check diffs and test results before reporting done.`;

const ROLE: Record<Exclude<Level, "off">, string> = {
	lean: `Use subagents to keep this session's context clean. Delegate work that produces bulk you would not need again: broad searches, reading many files, long logs, test and build output, web research. Do small, targeted work (one known file, a short edit) yourself; describing it would cost more than doing it.`,
	delegate: `Prefer subagents for any self-contained, multi-step task: investigation, implementation, review, test runs. Do trivial work yourself (a known file, a one-line change) and do the final integration and verification yourself.`,
	orchestrator: `You are an orchestrator. Plan, delegate, and verify; subagents do the investigation and the implementation. Do the work yourself only when delegating would clearly cost more than doing it, and then only for something small. Keep your context for the plan, the decisions and the results.`,
	strict: `You are only an orchestrator. File-reading, editing and shell tools are not available to you, so every investigation and change goes through a subagent. Break the task down, delegate each piece, verify what comes back by delegating a check, and report to the user.`,
};

/** The prompt section for a level. */
export const sectionFor = (level: Exclude<Level, "off">) => `${ROLE[level]}\n\n${TEMPLATE}`;

/** Why a denied tool call was refused in `strict`. */
export const denyReason = (tool: string) =>
	`${tool} is not available in this session (orchestration level "strict"). Delegate it with the Agent tool.`;
