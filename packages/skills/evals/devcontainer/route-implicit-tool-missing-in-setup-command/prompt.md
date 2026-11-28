---
name: route-implicit-tool-missing-in-setup-command
description: "Implicit trigger: a setup command that cannot find a tool the terminal in the same container finds (userEnvProbe, lifecycle command forms) routes to devcontainer without naming devcontainer.json or a rule."
tags: [routing]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

When I hit "Reopen in Container" in VS Code the setup step dies with `pnpm: command not found`, but once the window is up I can open a terminal in that same container and `pnpm --version` works fine. Same thing happens to my teammate in her codespace. Why does the setup step not see pnpm, and what do I change so it does?
