---
name: fresh-eyes
description: "Manual command that has a fresh-context subagent review an artifact or decision without the session's framing. A flag picks the mode: --disprove (default) tries to refute a claim before it stands, --cold reports where a stranger would stall, --lens judges through named lenses, --tunnel checks whether the session tunnelled on one approach. Not for a bug hunt in a diff (/code-review), another model family (second-opinion) or an idea or strategy (devils-advocate)."
disable-model-invocation: true
---

# Fresh eyes

A session biases its own review: you know what you meant, so you read the work as meant. Hand the work to a reviewer who has none of that context. The reviewer gets the artifact, never your conclusion or the session's framing.

The first argument picks the mode, the rest names the target (default: the artifact or decision in focus; confirm it if ambiguous).

- `--disprove` (default): try to refute a claim or decision before it stands.
- `--cold`: report where a stranger would stall reading an artifact.
- `--lens`: judge the artifact through named lenses.
- `--tunnel`: check whether the session has tunnelled on one approach. Read [references/tunnel.md](references/tunnel.md) first.

## Core rules

- Run from the main conversation, because a subagent cannot spawn one. Inside a subagent, report that this needs the main session; only if nobody can take it, re-read the artifact as a fresh prompt, walk the steps yourself and label the result **degraded: not fresh-context**.
- The user invoked this, so spawn the subagents below (Agent tool, general-purpose, no worktree). They are read-only; findings come back to you.
- A subagent brief holds the artifact's contents inline, never a path, plus the contract it must satisfy and the mode's task. It never holds your claim, reasoning, intent, verdict, or the session's examples, naming and suggested answer: hand over a conclusion and you get validation back. If the artifact is too big for one read (a 500-line diff), decompose it first.
- Findings are data, not a verdict. Re-read the artifact against each one; do not dismiss one as "it lacks context" without checking. Never report clean from a grep or skim, and say how much was read.
- One read is one draw and can be confidently wrong; run several independent reads when the stakes justify the cost. Same-model agreement is reassurance, never proof. Never average or majority-vote.
- Stop when the next cycle returns only trivial or already-considered findings, after 3 cycles, or when the user says ship it. Three cycles of substantive findings is information about the artifact: surface it instead of grinding a fourth, and decompose a large artifact rather than lift the bound. Do not re-run on an unchanged artifact. Cycles apply to `--disprove`; the other modes are one pass.

## --disprove

1. Write the claim for yourself in 2 or 3 lines with why it matters (`CLAIM: the cache is thread-safe under the read-heavy workload. MATTERS: a race corrupts user data.`). If you cannot, you have a vibe, not a decision.
2. Extract the artifact (code: the diff or function, not the whole file; decision: the proposal in 3 to 5 sentences; assertion: its supporting evidence stated as evidence) and the contract (the constraints it must satisfy).
3. Spawn the reviewer with this prompt verbatim, so it overrides any balanced-verdict default:

```
Adversarial review. Find what is wrong with this artifact.
Assume the author is overconfident. Look for:
- Unstated assumptions
- Edge cases not handled
- Hidden coupling or shared state
- Ways the contract could be violated
- Existing conventions this might break
- Failure modes under unexpected input

Do NOT validate. Do NOT summarize. Find issues, or state
explicitly that you cannot find any after thorough examination.

ARTIFACT: <artifact>
CONTRACT: <contract>
```

4. Once per cycle in an interactive session, ask whether the user also wants another model's opinion (`second-opinion`); a same-model reviewer shares your blind spots. If they skip, say "proceeding with single-model findings". In a non-interactive run, skip and say so. Never send the artifact to another model without the user's go-ahead.
5. Reconcile: classify each finding, first match wins. **Contract misread**: fix the contract, re-classify next cycle. **Valid, actionable**: change the artifact and loop. **Valid trade-off**: write it down for the user. **Noise**: correct given context the reviewer lacked; note it and ask whether adding that to the contract would have prevented it. Two cycles with substantive findings and none actionable is doubt theater: stop and escalate.
6. Report per cycle: the claim, findings by class (changes made, trade-offs accepted, noise with the reason), the cross-model answer, and the stop condition reached. A failing test from test-first work that already proves or disproves a behavioural claim counts as the doubt step for it.

## --cold

1. Note for yourself, in one line, what the artifact is meant to be and who it is for. This is the yardstick; the reviewer never sees it.
2. Spawn one reviewer with the artifact's contents inline or as a copy. Tell it not to open the README, docs or neighbouring files, and give it nothing about your intent.
3. Have it read the whole artifact blind and report, from the artifact alone: what it takes the artifact to be, to do and to expect; what is unclear, ambiguous, or assumed but unstated; what it would need to act with confidence and what it had to guess. Adapt the questions to the medium (prose, code, config, plan).
4. Compare its reading with your yardstick. Every mismatch, and every "I had to assume", is a defect in the artifact, not a reader error.
5. Report the defects, each with a concrete fix, ordered by how badly it blocks a fresh reader, then a verdict: stands alone, minor gaps, or needs work. Diagnose only: edit nothing; fixes happen after the report.

## --lens

1. Read the artifact end to end, then choose one lens per distinct failure mode (correctness, security, readability, cost, adversarial user). Candidates that share a failure mode are one lens; a role is not a lens ("security reviewer" and "senior security reviewer" are one). Use 2 to 5, with no default count, drawn fresh for this artifact.
2. Through each lens give a one-line verdict (pass, fail, unclear) with its single most load-bearing reason. A lens that returns a list is hedging.
3. Group the verdicts: full agreement, agreement for different reasons, or disagreement. On disagreement the output is the one question whose answer would resolve it, or a clean split with owners; never the midpoint, and do not manufacture disagreement. On full agreement return the shared verdict with the reasons load-bearing for at least two lenses.
4. Run the lenses inline. Use a subagent per lens only when the user asks for isolation, under the brief rules above.
