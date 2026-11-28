---
name: value-starting-budget-share
description: "Value case. The skill's starting CPU budget at 60 FPS (scripts about 5 ms, physics about 3, render submission about 4, UI about 2) makes physics the target here, although scripts are the largest slice. The bare model splits the frame evenly or invents shares and usually picks scripts."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

We're getting frame drops on the worst level of our 3D platformer and I need to decide where to start. Target is 60 FPS, release build on the min-spec laptop. Dropping the resolution changes nothing, so it's the CPU. The CPU frame averages 18.1 ms there, split like this in the profiler:

- gameplay scripts: 5.2 ms
- physics: 4.9 ms
- render submission: 4.1 ms
- UI: 1.7 ms
- audio and everything else: 2.2 ms

We have no frame budget of our own yet. Give me a sensible starting budget per subsystem for 60 FPS, then tell me which one subsystem is furthest over its share and should be attacked first.

End your answer with exactly these three lines and nothing after them:

TARGET: <scripts|physics|render|ui|other>
TARGET_BUDGET_MS: <number>
SCRIPTS_BUDGET_MS: <number>
