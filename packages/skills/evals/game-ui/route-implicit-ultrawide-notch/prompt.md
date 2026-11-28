---
name: route-implicit-ultrawide-notch
description: "Implicit trigger: symptoms of a missing scaling policy and safe-area inset, without naming HUD scaling, safe areas or the skill."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Our roguelike runs on a custom C++ engine. On my 1080p monitor everything looks right, but a tester on a 21:9 monitor says the health bar and minimap sit way in from the corners with dead space around them, and on the phone build the run timer is half hidden under the camera notch. What's the right way to set this up so it doesn't break on the next device?
