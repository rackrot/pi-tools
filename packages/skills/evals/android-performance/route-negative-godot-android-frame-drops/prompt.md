---
name: route-negative-godot-android-frame-drops
description: "Near miss: frame drops in a Godot game running on an Android phone are a game frame-budget problem (game-performance), not Macrobenchmark, Baseline Profile or APK size work."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

the Android export of my Godot 4 game runs fine on desktop but on my Pixel 6 it drops to around 40 fps whenever a wave of enemies spawns, and there's a visible hitch each time. how do I work out what is eating the frame on the phone and get it back to a steady 60?
