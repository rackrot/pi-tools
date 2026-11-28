---
name: route-implicit-worker-stops-silently
description: Implicit trigger. A .NET worker that silently stops making progress (a hang, never named as such, no tool named) routes to dotnet-diagnostics.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our order-sync worker (.NET 8, runs under systemd on a Debian box) just stops doing anything a few times a week. the process is still there, cpu is near zero, nothing new in the logs, and a restart fixes it. what should I do the next time it happens, before I restart it, so we can finally see what it's stuck on?
