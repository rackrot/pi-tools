---
name: route-negative-enemy-patrol-chase
description: "Near miss: an enemy guard's patrol, chase and search decisions are NPC decision-making, which the skill hands to game-ai even though the prompt says state machine."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

My guard enemies patrol between waypoints, chase the player when they spot him, and should search the last known position for a few seconds before giving up. Right now it's one state machine and the guards keep flip-flopping between chase and search at the edge of their vision cone. Would a behaviour tree handle this better, and how do I stop the flip-flopping?
