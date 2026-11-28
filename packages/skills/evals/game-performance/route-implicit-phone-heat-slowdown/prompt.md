---
name: route-implicit-phone-heat-slowdown
description: "Implicit trigger. A mobile game that slows down after a few minutes of play (thermal throttling) is a frame-rate problem, though the prompt never says FPS, stutter or performance."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our endless runner is buttery on my Pixel for the first two or three minutes of a run, then everything gets choppy and stays that way until I close the app and let the phone sit for a while. nothing new is spawning at that point, same obstacles as at the start. what's going on and how do I track it down?
