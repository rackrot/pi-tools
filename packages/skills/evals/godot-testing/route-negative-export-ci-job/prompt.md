---
name: route-negative-export-ci-job
description: "Near miss: a Godot CI job that builds and publishes release exports belongs to godot-export, not godot-testing, although the godot-testing description claims \"Godot CI\"."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I need a GitHub Actions workflow for my Godot 4 game: whenever I push a version tag it should build the Windows and Linux release builds headless and attach the zips to the GitHub release. export_presets.cfg is committed with both presets. what should the workflow look like?
