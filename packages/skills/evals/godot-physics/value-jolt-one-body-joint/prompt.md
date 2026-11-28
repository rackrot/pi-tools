---
name: value-jolt-one-body-joint
description: "Value case. Two Jolt facts from the skill's Jolt section that Haiku guesses from memory: a one-body joint counts as node_b under Jolt (node_a under Godot Physics), and the Joints > World Node project setting restores the old convention. Fixed final lines, regex graded."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Our 3D project was created in Godot 4.3 and we just moved it to 4.6 and switched `physics/3d/physics_engine` from Godot Physics to Jolt Physics. All our doors are HingeJoint3D nodes with only one body assigned (the other node path is empty), and after the switch their angular limits are mirrored: doors that opened inward now open outward.

1. Godot Physics and Jolt disagree about which slot that lone body counts as. Which slot does Jolt treat it as?
2. I'd rather not re-author 200 doors. Which project setting under Physics > Jolt Physics 3D > Joints brings back the Godot Physics convention?

Keep the explanation short and end your reply with exactly these two lines, filled in:

LONE_BODY: <node_a or node_b>
JOINT_SETTING: <name of the setting>
