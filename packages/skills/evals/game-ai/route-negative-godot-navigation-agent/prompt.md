---
name: route-negative-godot-navigation-agent
description: Near-miss negative. A Godot NavigationAgent2D and navmesh baking API problem belongs to the godot skill's navigation reference, which game-ai's own "Not for" line says.
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Godot 4.4. I painted navigation polygons on my TileMapLayer and gave the enemy scene a NavigationAgent2D, but `get_next_path_position()` just returns the enemy's own position and `is_navigation_finished()` is true right after I set `target_position` in `_ready()`. Also `avoidance_enabled` is on and the enemies still walk through each other. Which node properties and calls am I missing?
