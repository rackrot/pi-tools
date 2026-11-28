---
name: value-rpg-modifier-order-and-damage
description: Value case. One hit in an RPG. The attack stat must stack flat modifiers before percent ones regardless of the order they were applied (75, not 73), and the damage uses the RPG reference's ratio formula with K = 100, crit 1.5x and weakness 2x (150).
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

sanity-checking the combat math for my JRPG before I write the code. one hit:

- attacker: base ATK 40. effects on them, in the order they were applied: iron sword (+12 ATK), war cry (+25% ATK), power ring (+8 ATK)
- defender: DEF 50
- the hit is a crit and the target is weak to the element

I want the smooth diminishing-returns kind of defence formula, not attack minus defence. I haven't picked any constants or multipliers yet, so use the usual starting values. leave random variance out.

keep it short and end with exactly these two lines, numbers only:

FINAL_ATK: <number>
DAMAGE: <number>
