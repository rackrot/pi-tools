---
name: negative-slow-asset-build-script
description: "Near miss. A slow offline asset-processing script in a game repo is slow non-game code (a build tool), not a frame-rate problem, so game-performance should stay closed."
tags: [routing, negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

The Python script that packs our game's sprite sheets and writes the atlas JSON used to finish in 20 seconds and now takes over four minutes on every build. Nothing about the game itself changed, we just have more sprites. How do I find out which part of the script is eating the time?
