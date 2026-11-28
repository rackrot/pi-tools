---
name: value-stale-thresholds
description: "Value case. Stale handling with no repo policy: issues go stale at 14 days, PRs get a ping at 7 days, a stale issue closes 30 days after the stale comment. The bare model guesses longer or different thresholds."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Housekeeping pass on github.com/acme/storefront. The repo has no stale policy of its own written down anywhere, so go with the standard defaults you would use for triage. Today is 2026-03-20. I will approve each write myself, I only need the action you propose per item.

- S1: issue #101, last activity 2026-03-10 (10 days ago), no stale label.
- S2: issue #102, last activity 2026-03-02 (18 days ago), no stale label.
- S3: PR #103 from a fork, last activity 2026-03-11 (9 days ago).
- S4: issue #104, got the stale label and the "is this still wanted" comment on 2026-02-25 (23 days ago), nothing since.
- S5: issue #105, got the stale label and the "is this still wanted" comment on 2026-02-12 (36 days ago), nothing since.
- S6: PR #106 from a fork, last activity 2026-03-16 (4 days ago).

end your reply with exactly one line per item, S1 to S6 in order, in the form `S1: ACTION`, where ACTION is one of NONE, STALE-LABEL (add the stale label and ask whether it is still wanted), PING (comment asking the author whether they are still working on it), CLOSE.
