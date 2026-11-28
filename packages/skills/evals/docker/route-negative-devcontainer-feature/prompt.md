---
name: route-negative-devcontainer-feature
description: "Near miss: Dev Container Feature install order mentions docker but belongs to the devcontainer skill."
tags: [routing]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

The docker-in-docker Feature in .devcontainer/devcontainer.json gets installed after our own Feature that needs the docker CLI, so the Codespace build fails. Fix the Feature install order.
