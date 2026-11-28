---
name: trigger-implicit-slider-dead-zone
description: Implicit trigger. A symptom report (the volume setting does nothing over most of its travel, then drops off) with no audio-mixing vocabulary should load game-audio.
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

playtesters keep saying the music setting in our options screen is broken: dragging it from 100% down to about 20% changes nothing they can hear, then the last bit goes from full to silent. the code just writes the 0 to 1 value from the control into the music channel's level. what is wrong and what should it do instead?
