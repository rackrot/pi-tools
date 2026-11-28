---
name: route-quiet-in-scope-implicit-long-session
description: "In scope but manual: the user wants to carry the work into a clean session without re-explaining it (the default mode), said without the word handoff. handoff has disable-model-invocation, so it must not load on its own. This fails if the flag is dropped without the case being turned into a positive trigger."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

this session has got huge and you're starting to forget things we settled an hour ago. i'm going to open a clean one after lunch and i really don't want to explain the whole queue refactor again. get me set up for that.
