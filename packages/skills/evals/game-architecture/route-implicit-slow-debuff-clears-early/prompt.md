---
name: route-implicit-slow-debuff-clears-early
description: Implicit trigger. A buff bug report (one slow expiring clears the other, percentage bonuses combine inconsistently) is an effect and stat-modifier structure question and should load game-architecture.
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

in our action RPG two different enemies can each slow the player. when the first slow wears off the player is back at full speed, even though the second one should still be running. and the +20% speed boots and the 10% haste potion give a different total depending on which was picked up first. how should we organise this so it stops happening?
