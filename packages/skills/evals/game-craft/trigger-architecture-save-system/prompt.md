---
name: trigger-architecture-save-system
description: "A save-system design question loads game-craft."
tags: [trigger]
runs: 1
max_turns: 6
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill]
---

We're about to ship early access and need a save system for our RPG: inventory, quest flags, player position, and we'll patch content often. How should we design it so saves don't break after updates?
