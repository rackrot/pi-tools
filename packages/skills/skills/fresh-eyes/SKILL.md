---
name: fresh-eyes
description: "Manual command that has a fresh-context subagent review an artifact or decision without the session's framing. A flag picks the mode: --disprove (default) tries to refute a claim before it stands, --cold reports where a stranger would stall (runs cold-read), --tunnel checks whether the session tunnelled on one approach (runs tunnel-check). Model-invoked equivalent of --disprove: doubt-review. Not for a bug hunt in a diff (a code review), another model family (second-opinion, if installed), an idea or strategy (devils-advocate), or several lenses on one artifact (lens-review)."
disable-model-invocation: true
---

# Fresh eyes

A session biases its own review: you know what you meant, so you read the work as meant. Hand the work to a reviewer who has none of that context. The reviewer gets the artifact, never your conclusion or the session's framing.

The first argument picks the mode, the rest names the target (default: the artifact or decision in focus; confirm it if ambiguous).

- `--disprove` (default): try to refute a claim or decision before it stands.
- `--cold`: report where a stranger would stall reading an artifact.
- `--lens`: judging an artifact through several named lenses belongs to `lens-review`; run it instead.
- `--tunnel`: check whether the session has tunnelled on one approach; follow `tunnel-check` (that skill holds the procedure).

## Core rules

- Run from the main conversation, because a subagent cannot spawn one. Inside a subagent, report that this needs the main session; only if nobody can take it, re-read the artifact as a fresh prompt, walk the steps yourself and label the result **degraded: not fresh-context**.
- No subagent tool in this session: write the brief under the same rules and hand it to the user to paste into a clean session. Do not review inline unless asked, and then label the result **degraded: not fresh-context**.
- The user invoked this, so spawn the subagents the mode's procedure calls for (the subagent tool, e.g. Agent, general-purpose, no worktree). They are read-only; findings come back to you.
- A subagent brief holds the artifact's contents inline, never a path, plus the contract it must satisfy and the mode's task. It never holds your claim, reasoning, intent, verdict, or the session's examples, naming and suggested answer: hand over a conclusion and you get validation back. If the artifact is too big for one read (a 500-line diff), decompose it first.
- Findings are data, not a verdict. Re-read the artifact against each one; do not dismiss one as "it lacks context" without checking. Never report clean from a grep or skim, and say how much was read.
- One read is one draw and can be confidently wrong; run several independent reads when the stakes justify the cost. Same-model agreement is reassurance, never proof. Never average or majority-vote.
- Cycles and the stop bound for `--disprove`: see doubt-review. The other modes are one pass.

## --disprove

Run the cycle in ../doubt-review/SKILL.md (claim, extract, verbatim adversarial prompt, cross-model offer, reconcile, stop, report); the user invoking this command counts as the go-ahead to spawn the reviewer.

## --cold

Follow the cold-read skill's workflow and rules (skills/cold-read/SKILL.md); the core brief rules above still apply.
