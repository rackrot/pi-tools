---
name: route-implicit-mac-players-no-files
description: Implicit trigger. A symptom report (Mac players get an empty install on Steam) with no mention of uploading, depots or publishing should still load game-publish.
tags: [trigger, routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our game went live on Steam yesterday. Windows players are happy, but everyone on a Mac says the install finishes instantly, takes 0 bytes and then there is nothing to launch. The Mac build is definitely on the partner site, I can see it there next to the Windows one. what did I miss?
