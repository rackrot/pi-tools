---
name: route-negative-plain-plan-review
description: "Routing, near-miss negative. An ordinary one-pass plan review that never asks for several lenses must not load lens-review: plural lenses are opt-in. Guards the manual-only flag; fails if the skill becomes model-invocable and greedy."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

can you review this plan before I send it to the team? we move the nightly export from cron on the app box to a queue worker, retry failed chunks 3 times with backoff, and write the output to the same S3 bucket under a dated prefix. old cron job gets removed in the same deploy.
