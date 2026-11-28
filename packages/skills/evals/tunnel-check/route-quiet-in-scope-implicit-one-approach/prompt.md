---
name: route-quiet-in-scope-implicit-one-approach
description: "In scope but manual and implicit: the session has built on one approach for a while and the user only asks to keep going. tunnel-check has disable-model-invocation and says the fan-out is an opt-in spend, so it must not load on its own. This fails if the flag is dropped without the case being turned into a positive trigger."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

ok so we've been at the websocket reconnect thing all afternoon. you went with exponential backoff plus a heartbeat right at the start and since then we added jitter, a max-retries cap and now a "stale connection" timer, and the dashboard still shows frozen prices for some users after their laptop wakes from sleep. not sure if we're overthinking it but whatever, what's the next thing to add? there are no files to open.
