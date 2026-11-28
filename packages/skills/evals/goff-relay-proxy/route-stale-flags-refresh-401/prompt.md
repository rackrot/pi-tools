---
name: route-stale-flags-refresh-401
description: "Routing, explicit. A running relay proxy with an s3 retriever serves an old flag value and the forced reload returns 401; this is proxy operation (pollingInterval, admin key, admin refresh), not flag authoring or SDK code."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we run the go-feature-flag relay proxy on ECS and it pulls flags from an s3 bucket. I changed `checkout-v2` in the bucket about 20 minutes ago and the proxy still hands out the old value. I tried to force it to reload with curl and got a 401, even though the same X-API-Key works fine for evaluations. what's going on and what do I need to change?
