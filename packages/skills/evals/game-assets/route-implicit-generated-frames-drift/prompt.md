---
name: route-implicit-generated-frames-drift
description: "Routing, implicit. Generated animation frames whose character changes between frames and whose feet do not stay on one line is a game-art consistency and anchoring problem; the prompt says neither asset, sprite, pipeline nor art direction."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm using an image model to make the attack animation for the knight in my 2D action game. every frame it gives me has a slightly different helmet, the sword keeps changing length, and when I play the frames back his feet jump up and down. what am I doing wrong?
