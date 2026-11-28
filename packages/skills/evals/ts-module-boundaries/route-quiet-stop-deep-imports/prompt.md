---
name: route-quiet-stop-deep-imports
description: "In scope but manual: an explicit request for a CI check that stops imports into another package's internal files. ts-module-boundaries has disable-model-invocation, so it must not load on its own; this fails if that flag is dropped without the case being turned into a positive trigger."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Our TypeScript monorepo keeps getting imports like `../../billing/lib/tax/rate` from other packages and from the app. I want CI to fail when anything reaches past a package's index file. Set that up.
