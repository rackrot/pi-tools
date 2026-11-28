---
name: route-codegen-step-runs-once
description: Implicit trigger. A local_resource that never re-runs and a remote-context refusal, with the word Tilt never used, fires tilt.
tags: [routing]
runs: 1
max_turns: 5
allowed_tools: [Read, Glob, Grep, Skill]
---

two things broke in our dev loop after i moved it from kind to the shared staging cluster. first, the startup now stops with something like "Stop! staging-east might be production" and nothing deploys. second, i added `local_resource('proto-gen', 'buf generate')` so the generated Go code stays fresh, but it ran once at startup and never again when i edit files under `proto/`. what do i change for each?
