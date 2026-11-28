---
name: route-postgres-major-upgrade-runbook
description: "Routing, explicit. A written, executable plan for a risky infrastructure change (order of steps, checks, go/no-go, back-out point) routes to rollout-plan without the words rollout, canary or strategy."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

change window is Saturday 02:00-04:00 UTC: we take the orders database from Postgres 14 to 16 and switch the three services that use it (orders-api, billing-worker, reports) over to the new cluster. about 400 GB, managed Postgres, services run on Kubernetes, the on-call that night is one person who was not in the planning meetings. I need the document she will work from: what gets done in which order, what she checks before starting and after each step, and the point at which she stops and backs out instead of pushing on.
