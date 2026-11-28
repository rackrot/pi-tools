---
name: route-quiet-scrap-second-attempt
description: "In scope but manual: an explicit request to throw an attempt away and plan a fresh start from what it proved. v0-restart has disable-model-invocation, so it must not load on its own; this fails if that flag is dropped without the case being turned into a positive trigger."
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

The second attempt at the CSV importer is a mess and I'm done patching it. I want to scrap it and start again from scratch, taking along only the pieces that actually held up in QA. Plan the fresh start: what comes with us, what gets left behind, and what we build first.
