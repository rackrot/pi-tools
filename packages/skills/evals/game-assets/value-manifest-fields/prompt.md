---
name: value-manifest-fields
description: "Value case. An asset manifest drafted for a greybox game must carry what SKILL.md step 4 lists and a bare model leaves out: anchor or pivot, collision role, source and license per asset."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

my platformer is still grey boxes and I'm about to start replacing them with real art. give me the asset manifest I should track that in, as one JSON code block, with an entry for each of: player (idle, run, jump), slime enemy (idle, hit), coin pickup, grass tileset. the game is 320x180 with 16px tiles, Godot 4. fill in what you can and leave the rest empty. JSON only, no explanation.
