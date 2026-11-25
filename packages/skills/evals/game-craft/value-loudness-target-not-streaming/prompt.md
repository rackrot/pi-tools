---
name: value-loudness-target-not-streaming
description: Value case. A narrative console and PC game asks for a loudness target while marketing wants to match music streaming. A bare model tends to answer -14 LUFS or -23 EBU R128; game-craft carries the platform number (about -24 LUFS plus or minus 2 for console and PC, about -18 for mobile) and rejects -14.
tags: [value]
runs: 3
max_turns: 6
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill]
---

We're finishing the mix on a narrative action game for PS5 and PC. Marketing wants the trailer and the game to sit as loud as Spotify tracks, so they asked for -14 LUFS. What integrated loudness should the shipped game mix actually measure over a play session, and what true-peak ceiling should the master use? Give me the numbers I should put in our audio spec.
