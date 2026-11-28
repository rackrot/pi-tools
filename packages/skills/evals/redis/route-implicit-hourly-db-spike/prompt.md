---
name: route-implicit-hourly-db-spike
description: "Routing, implicit. A symptom (hourly latency spike, database CPU pegged) with category JSON kept in a Valkey node under a fixed one-hour expiry; the prompt never says cache, stampede, TTL or Redis. Routes to redis."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

every night from 03:00, and then again every hour on the dot until the morning deploy, p99 on our category listing endpoint goes from 40ms to about 6s for 20 seconds and RDS CPU pegs at 100%. the rest of the time it's fine. the listing JSON for each of the 4,000 categories lives in our valkey node, a job at 02:00 writes all of them with `SET cat:<id> <json> EX 3600`, and the 14 API pods rebuild an entry from the database whenever a GET comes back nil. the repo isn't checked out here. what is going on and what should we change?
