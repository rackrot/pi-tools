---
name: route-negative-sprite-outline-shader
description: "Near miss: an outline and hit flash on sprites done at runtime is shader work (godot-shaders), not asset production."
tags: [routing, negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

my enemy sprites need a 1px white outline while they're targeted and a white flash when they take a hit. I don't want to redraw every sprite with an outline variant. how do I do both at runtime in Godot 4?
