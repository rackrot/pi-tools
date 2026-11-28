---
name: value-phantom-camera-setup-audit
description: Value case. Six Phantom Camera 0.11 setup choices judged as working or broken - host placement, priority setter, priority_override in exports, rotate_with_target against the Camera2D default, a null tween resource and the getter-only C# FollowMode. The bare model cannot tell the editor-only and wrapper-only traps from the fine ones.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Reviewing a teammate's camera setup before merge. Project is Godot 4.7 with addons/phantom_camera (plugin.cfg version 0.11.0.3), enabled. For each item tell me whether it does what the author expects in an exported build as written (WORKS) or not (BROKEN).

- C1: Main scene has `Camera2D` and `PhantomCameraHost` as siblings directly under `Main`. Expectation: the host drives that Camera2D.
- C2: A `PhantomCamera2D` sits inside a trigger `Area2D` far away from the Camera2D in the tree. On `body_entered` the script assigns `area_pcam.priority = 20` directly, without calling `set_priority()`. Expectation: the host switches to this shot.
- C3: The cutscene script forces its shot with `cutscene_pcam.priority_override = true` and sets it back to false when the cutscene ends. Expectation: the cutscene shot takes over for players.
- C4: The chase shot is a `PhantomCamera2D` following a spinning ship with `rotate_with_target = true`. The scene's `Camera2D` was added fresh and left at its default properties. Expectation: the view rotates with the ship.
- C5: The death-cam `PhantomCamera2D` has its `tween_resource` cleared to `null`. Expectation: a hard cut to it with no blend, and no error.
- C6: A C# script does `var pcam = GetNode<Node2D>("PlayerPCam").AsPhantomCamera2D(); pcam.FollowMode = FollowMode2D.Framed;`. Expectation: the PCam switches to framed follow.

End your reply with exactly one line per item in the form `C1: WORKS` or `C1: BROKEN`, C1 to C6 in order, nothing after them.
