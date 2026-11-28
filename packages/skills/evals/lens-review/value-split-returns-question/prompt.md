---
name: value-split-returns-question
description: Value case, manual invocation. When the lenses split on an unknown fact, the result is the one question that resolves the split, not a midpoint verdict; the bare model answers "ship with caveats".
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:lens-review this plan. I have to tell the team this afternoon what we're doing.

Plan: cache the result of the permission check `can(user, action, resource)` in Redis for 15 minutes per user. Today every API request runs that check against Postgres; it is 40% of our DB load and p95 latency is 800 ms. In staging the cache brought p95 down to 120 ms, and we could drop one read replica (about $900 a month). Invalidation is by TTL only, there is no hook on role changes. Nobody has ever written down how fast a revoked permission has to stop working.

end your reply with exactly one line, one of: `FINAL: SHIP`, `FINAL: SHIP WITH CAVEATS`, `FINAL: DO NOT SHIP`, or `FINAL: ASK <the one question>`.
