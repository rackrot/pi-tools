---
name: value-jump-gap-metrics
description: "Value case. Gap widths derived from a measured jump: required jumps at 0.7 of the maximum distance, optional skill checks at 0.95. The bare model picks its own margins."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

laying out gaps for my 2D platformer. I measured the hero: a full running jump covers 240 px horizontally at most. What is the widest gap I should put on the route every player has to take, and the widest for an optional secret that is meant as a skill check? Same-height platforms, give me pixels, not tiles.

end your reply with exactly two lines: `REQUIRED_MAX: <px>` and `OPTIONAL_MAX: <px>`, each a single whole number.
