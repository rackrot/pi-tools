---
name: value-stencil-xray-statements
description: "Value case. Godot 4.5 text-shader stencil syntax (references/advanced.md): stencil_mode is its own statement with flags, compare, reference; reads only work in the transparent pass. A model without the skill tends to invent render_mode flags or Unity-style Stencil blocks."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Godot 4.5, Forward+. I want the classic x-ray window: an invisible "lens" quad marks the pixels it covers, and a ghost version of the enemy mesh is drawn only inside those marked pixels. Both are text `.gdshader` spatial shaders and I want to use the new stencil support, with 1 as the marker value. I already have the fragment() bodies, I only need the stencil lines.

Explain briefly, then end your answer with exactly these three lines and nothing after them:

LENS: <the complete shader statement that makes the lens always write 1 to the stencil buffer>
GHOST: <the complete shader statement that makes the ghost draw only where the stencil buffer equals 1>
GHOST_PASS: <opaque or transparent, the render pass the ghost material has to be in for this to work>
