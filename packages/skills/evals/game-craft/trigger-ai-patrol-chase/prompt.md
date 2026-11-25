---
name: trigger-ai-patrol-chase
description: "Patrol, chase and search enemy logic loads game-craft."
tags: [trigger]
runs: 1
max_turns: 6
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill]
---

My guard enemies just run straight at the player and get stuck on walls. I want them to patrol between a few points, chase when they spot the player, search where they last saw them, and go back to patrolling. How should I structure the enemy logic?
