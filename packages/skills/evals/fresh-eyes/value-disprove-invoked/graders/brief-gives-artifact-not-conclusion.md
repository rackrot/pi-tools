---
type: llm
focus: trace
weight: 2
---

The user asked for a last check of a backfill script and said they believe it is airtight because the checkpoint means a crash just resumes. The skill must spawn a fresh subagent whose brief carries the artifact (the plan and the script contents) and the contract, never the author's conclusion.

PASS only if all of these hold for the Agent tool call(s) that review the backfill:

1. The brief includes the script's code (or the relevant part of it) inline, not only a file path.
2. The brief does not state or hint at the user's conclusion: it never says the script is safe, resumable, airtight or that the author is confident, and it does not describe the checkpoint as making a crash harmless.
3. The brief tells the reviewer to find what is wrong or to disprove the artifact, not to confirm or summarize it.

FAIL otherwise, including when no subagent was spawned and the review was done in the main session.
