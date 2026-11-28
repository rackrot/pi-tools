---
name: route-quiet-in-scope-prove-it
description: "In scope but manual: the user doubts a fact from an earlier answer and asks for its source. fact-check has disable-model-invocation, so it must not load on its own; this fails if that flag is dropped without the case being turned into a positive trigger."
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Earlier you said our CI image is pinned to Node 18 and that Node 18 went out of support in April 2025, which is why you want me to bump it this week. Where did you get that date from? I'm not sure either half of that is right and I don't want to open the PR on a guess.
