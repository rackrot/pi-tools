---
name: value-reviewer-gets-artifact-and-contract-only
description: "Value. The reviewer gets the artifact and the contract only: never the author's claim, the reasoning behind it, or an 'is this good?' question (SKILL.md steps 2 and 3, red flags)."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

i want this concurrency change torn apart by a reviewer with a clean context before i commit it. i'll start the reviewer session myself, i only need you to tell me what goes into its prompt. there are no files to open. these are the pieces i have ready to paste:

A. The diff of `SessionCache.get` and `SessionCache.put` (42 lines).
B. What the change has to guarantee: no session is served after logout, correct under 200 concurrent readers, p99 of `get` under 2 ms.
C. My conclusion, so the reviewer knows what to attack: "This cache is thread-safe under the read-heavy load because every write goes through the striped lock."
D. A short write-up of how I got here: the two designs I rejected and why the striped lock won.
E. A closing line, pasted as it stands: "Is this good to merge?"

Which of A to E go into the reviewer's prompt? Explain briefly, then end with one final line in exactly this form, letters in alphabetical order:

SEND: <letters separated by commas>
