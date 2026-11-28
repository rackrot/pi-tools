---
name: value-result-note-contract
description: "Value case. A baseline profile benchmark (None against Partial) written up for a PR. Measures the skill's reporting rules, not benchmark knowledge: the note must carry a Not measured line and must account for whether R8 ran, which the skill says goes with every result and the prompt leaves out. The bare model writes a tidy summary of the numbers it was given and mentions neither."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I added a baseline profile for our startup path and ran the startup macrobenchmark without and with it. write the short results note I can paste into the PR description.

- CompilationMode.None: timeToInitialDisplayMs min 588, median 612, max 671
- CompilationMode.Partial: timeToInitialDisplayMs min 540, median 561, max 598
- Pixel 6, same phone for both, benchmark build type, cold start, 10 iterations each
