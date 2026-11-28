---
name: route-implicit-damage-regression-gate
description: "Routing, implicit. A GDScript-only project with nothing set up wants a push that breaks the damage maths to be blocked automatically; routes to godot-testing without the words test, GUT, gdUnit4 or CI."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

twice now a balance tweak to res://combat/damage_calc.gd has shipped with crits doing zero damage, and nobody noticed until a player wrote in. Godot 4.5, GDScript only, the repo is on GitHub, and there is nothing in it beyond the game itself. I want a push that breaks the damage maths to get blocked automatically instead of reaching players. what do I add to the project?

```gdscript
class_name DamageCalc
extends RefCounted

static func roll(base: int, crit_multiplier: float, is_crit: bool, armor: int) -> int:
	var raw := base * (crit_multiplier if is_crit else 1.0)
	return maxi(0, roundi(raw) - armor)
```
