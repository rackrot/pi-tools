---
name: value-particles-4-7-seek-and-axis-billboard
description: "Value case. Two Godot 4.7 GPUParticles3D additions listed in references/particles.md that a model does not know from memory: transform_align = TRANSFORM_ALIGN_LOCAL_BILLBOARD (with transform_align_axis) and request_particles_process() for seeking a system held at speed_scale 0."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

We just moved the project to Godot 4.7 and I was told two things we used to hack around are now built into GPUParticles3D. Can you tell me the exact names?

1. Our torch flames are tall quads. They should turn toward the camera but stay upright, so only rotate around their own Y axis. We do this in a custom draw-pass shader today. Which property on the GPUParticles3D node does it now, and what do I set it to?
2. Photo mode freezes every effect with `speed_scale = 0`. The scrub slider has to push a frozen effect forward by a given number of seconds within one frame. Which method on the node does that?

A sentence each, then end with exactly these two lines and nothing after them:

ALIGN: <property> = <constant>
SEEK: <method name>
