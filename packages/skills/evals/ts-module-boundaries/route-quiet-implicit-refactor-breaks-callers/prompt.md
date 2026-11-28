---
name: route-quiet-implicit-refactor-breaks-callers
description: "In scope but manual, implicit phrasing: the symptom of missing package boundaries (an internal file move breaks other teams, plus an import cycle) with no word like boundary, deep import or dependency-cruiser. ts-module-boundaries has disable-model-invocation, so it must not load on its own; this fails if that flag is dropped without the case being turned into a positive trigger."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Every time I move a file inside src/packages/auth, three other teams' code stops compiling because they import it directly, and last week orders and inventory ended up importing each other and the bundle broke. The code is all TypeScript. I'm tired of finding this out in review. Make the tooling catch it.
