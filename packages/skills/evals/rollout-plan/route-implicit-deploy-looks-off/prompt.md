---
name: route-implicit-deploy-looks-off
description: "Routing, implicit. Judging whether a deploy that is already out is healthy, and whether to back it out, routes to rollout-plan; the prompt asks for no plan and never says rollout."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

billing-api 3.2 went out to all 12 pods about 50 minutes ago. since then p95 is 240 ms where it used to sit around 180, the 5xx rate is 0.4% against roughly 0.1% last week, and memory per pod is still climbing slowly. the logs look clean. nobody wrote down beforehand what "bad" would look like, so now the team is split between leaving it and going back to 3.1. 3.2 also added a nullable column to the invoices table. what's your call, and what would you check in the next 15 minutes to be sure?
