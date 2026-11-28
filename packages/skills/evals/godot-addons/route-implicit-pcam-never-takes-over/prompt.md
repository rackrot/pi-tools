---
name: route-implicit-pcam-never-takes-over
description: Implicit trigger. The user names node types that only the Phantom Camera addon provides, never the addon, its folder or the word "addon".
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

godot 4.7, 2d. I put a PhantomCamera2D under my player (follow mode simple) and a second PhantomCamera2D in the boss arena with priority 10 and both fighters as targets. nothing happens when I walk into the arena: the game keeps rendering from wherever my Camera2D node sits in the level, it doesn't even follow the player. what am I missing?
