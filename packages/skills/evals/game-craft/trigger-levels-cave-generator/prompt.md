---
name: trigger-levels-cave-generator
description: "A seeded cave generator request loads game-craft."
tags: [trigger]
runs: 1
max_turns: 6
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill]
---

I want to generate cave levels for my roguelike from a seed so players can share runs. My first attempt with random noise gives lots of disconnected pockets. How should I build the generator?
