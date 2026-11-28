---
name: route-unfinished-work-for-next-session
description: "Routing, sibling boundary. Leaving half-finished work for a later session is a handoff note in the vault; the handoff skill is a manual command and catchup is for a returning human, so memory should be read."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I have to stop for today. the tenant-id backfill is half done: steps 1 and 2 ran against prod, 3 to 5 (reindex, drop the old column, remove the feature flag) are still open, and step 3 must not run before the nightly export at 02:00 UTC. I'll start a fresh session tomorrow and won't paste any of this again, so make sure it's there for you when we pick it up.
