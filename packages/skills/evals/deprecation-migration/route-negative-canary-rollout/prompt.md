---
name: route-negative-canary-rollout
description: "Routing, near-miss negative. A canary plan with rollback thresholds for deploying a new service version belongs to rollout-plan; nothing is being retired and no consumers move, so deprecation-migration must stay quiet."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we ship checkout-service 4.0 to production on thursday. write me the plan for the deploy: how to stage the traffic, which signals to watch at each stage, and the numbers at which we roll back.
