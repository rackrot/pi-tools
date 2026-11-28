---
name: trigger-godot-editor-tools-4
description: "Hard negative: a @tool Node2D that redraws in the editor and shows a configuration warning belongs to godot; godot-editor-tools must stay quiet."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Godot 4.5: make my @tool Node2D redraw its radius circle in the editor whenever I change the radius export, and show a configuration warning when target is unset.
