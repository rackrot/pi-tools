---
name: route-quiet-env-var-table
description: "In scope but manual, explicit phrasing: a reference table whose rows were appended over time and need a meaningful order with no text changed. reorder has disable-model-invocation, so it must not load on its own; this fails if that flag is dropped without the case being turned into a positive trigger."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

The environment variable table in docs/configuration.md has 40-odd rows and every new variable just got added at the bottom, so the database settings are scattered between the mail and cache ones. Put the rows in an order that makes sense. Do not change a single word in any row, I only want them moved.
