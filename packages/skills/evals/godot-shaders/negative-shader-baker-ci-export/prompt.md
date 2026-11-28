---
name: negative-shader-baker-ci-export
description: Near-miss negative. An export-preset and CI question that mentions the Shader Baker belongs to godot-export (godot-shaders SKILL.md line 11 hands the preset switch in CI to it), so godot-shaders must not be read.
tags: [routing, negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Our GitHub Actions job builds the Windows release of our Godot 4.5 game on ubuntu-latest with `godot --headless --export-release "Windows Desktop" build/game.exe`. I ticked Shader Baker > Enabled in that export preset last week but the PCK is the same size as before and first launch is just as slow. What do I have to change in the workflow or in export_presets.cfg so the CI build actually ships baked shaders?
