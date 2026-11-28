---
name: value-interpolated-camera-2d
description: "Value case. The manual interpolated-camera recipe is 3D only: get_global_transform_interpolated() is a Node3D method and Node2D has no equivalent, so a Camera2D stays on automatic interpolation (SKILL.md, Physics interpolation step 4). A model without the skill tends to port the 3D recipe to 2D. Fixed final lines, regex graded."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Godot 4.5, 2D platformer, physics interpolation is enabled in project settings and the player (CharacterBody2D) moves in `_physics_process`. In our 3D game we fixed camera jitter by making the camera top-level, updating it in `_process` and following the player's interpolated transform. I want to port that exact recipe to the Camera2D here.

Which method do I call on the player (a Node2D) inside `_process` to get its interpolated global transform for the current frame?

Keep it short and end your reply with exactly this line, filled in:

NODE2D_INTERPOLATED_GETTER: <the method name, or "none" if Node2D has no such method>
