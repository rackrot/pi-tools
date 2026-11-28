---
name: value-vault-note-lifecycle
description: "Value case. Five vault behaviours the bare model guesses wrong: a finished handoff is set to done (not archived), overview prose is left to the summary worker, human notes outside the agent folder are never written, an unread note cannot be updated, and missing tools mean /memory-init."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

dry run: the long-term memory tools (memory_search, memory_read, memory_write, memory_archive, memory_sync) are not connected in this session, so don't try to call them. tell me what you would do in each situation once they are.

S1. A handoff note "Finish billing migration" is open. In this session you finished the remaining steps. Which one memory tool do you call on that note now? Give the tool name, and if it is memory_write also the status value you pass.

S2. Three decisions were recorded today, so the summary text at the top of the project's Overview.md is stale. `memory.summary.model` is set in my config. You are wrapping up the session. Do you rewrite that summary text yourself now? YES or NO.

S3. memory_search with scope `vault` returned `Work/Infra.md`, which says the staging API listens on port 8080. You verified today that it is 9090. Which memory tool do you use to change that file? Give the tool name, or NONE.

S4. memory_search returned the note "Deploy uses blue-green" earlier in this session, and you only saw the snippet. You now call memory_write with the same title and scope and a corrected body. What is the result: UPDATED, REFUSED, or DUPLICATE (a second note is created)?

S5. In some later session the memory tools are missing from your tool list altogether and I say "note this down". Which command do you tell me to run?

end your reply with exactly one line per situation, S1 to S5 in order, in this form:
S1: <tool> <status if any>
S2: YES or NO
S3: <tool> or NONE
S4: UPDATED, REFUSED or DUPLICATE
S5: <command>
