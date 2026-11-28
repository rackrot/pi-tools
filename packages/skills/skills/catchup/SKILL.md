---
name: catchup
description: 'Briefs a human who lost the thread of a project after time away or a long agent run: what needs them first, what changed, what new terms mean, and one next move. Use when a user says they were away, are back, lost track or no longer recognise the project, or asks what happened, where things stand, what a coined term in a plan means or where to pick up, also when they paste the log, plan or status themselves instead of pointing at a repo. Read-only. Not for handoffs or crash recovery (use handoff, handoff --recover).'
---

# Catchup

Brief a human who lost the thread, from state and not from memory. Long agent cycles coin words, rename files and make calls faster than the owner can follow, so reload their mental model before any next action is decided.

## Not for

- Writing a brief for a new agent session: use `handoff`.
- Recovering a session that died: use `handoff --recover`.

## Workflow

1. Read live state only: git log and diffs, file mtimes, plan Status blocks, task lists and notes. Never brief from conversation memory, because memory is what drifted. State the user pastes (log lines, a Status block, a CI result) counts as live state: brief from it, cite it as "your pasted log", and say once that it was not checked against the repo. Do not search outside the working directory for the project. If there is no state at all, say so and make the Next move the one command that would produce it.
2. Anchor on the human's last touch (their last message, judgment or commit). Everything after it is the delta. Everything before it stays out.
3. Write in decision order, not chronological order:
   - **Needs you**: decisions or inputs only the human can give, each self-contained enough to act on without opening another file.
   - **Changed while you were away**: outcomes, not process. "The scoring rule was replaced" beats "I ran three analysis passes".
   - **New words**: every term coined or repurposed since their last touch, one line each, with where it lives. Skip terms they used themselves.
4. Gloss each term coined or repurposed since their last touch inline at its first use, even when a New words section follows.
5. Fit it on one screen. End with a drill-down offer per section instead of expanding everything.
6. End with **Next move** whenever the user asks what to do next, what to do now or where to start; otherwise include it only when it clearly helps. It is one action, why now, and done when. Pick the cheapest move that clears the binding constraint, including the hard step being avoided. If the gate is already met, the move is to change phase or ship, not to add another surface. If no outside truth has entered lately, the move is external input, not another internal lap. Recommend it; never execute it. When the move is a manual command, name it for the user to run and do not invoke it.

## Rules

- Every claim cites a file, commit or path the human can open. No "as we discussed".
- Read-only on the project. This skill briefs; it does not fix, rename or decide.
- The ask comes first. A briefing that buries the one question needing the human is a log.
- Outcome voice, not journey voice. Narrating your own process is self-report.
- Settled items get one line or none.
- "Done" means verified done. Say which items are moved but not reconciled.
- One Next move, never a menu, and cite the state that drives the pick.

## Before finishing

1. No sentence needs pre-gap memory or an unglossed coined term to parse.
2. Each Needs you item is actionable without opening another file.
3. Every claim has a checkable source.
4. Nothing dated before the human's last touch is in the briefing.
5. It fits on a screen, with expansion offered and not delivered.
6. If the user asked what to do next, a Next move is present. Whenever one is present, there is exactly one, with a done-when a reader can observe.
