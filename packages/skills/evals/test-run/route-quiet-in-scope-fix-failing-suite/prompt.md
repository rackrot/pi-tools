---
name: route-quiet-in-scope-fix-failing-suite
description: "In scope but manual: run the suite and fix what fails is exactly the skill's job, said without its name. test-run has disable-model-invocation (it runs project code), so it must not load on its own. This fails if the flag is dropped without the case being turned into a positive trigger."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

run the tests for this repo and fix whatever fails. i only want to see the failures, not the whole wall of output, and don't go round in circles on one test forever.
