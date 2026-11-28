---
name: value-numbers-sheet-review
description: Value case. A tower-defence balance sheet reviewed line by line against the skill's rules (geometric wave HP of 1.1 to 1.2 against linear income is the intended shape, tunables go in data files, seeded RNG, weights need not sum to 100, cap exponentials, ratio mitigation needs no hard cap); the bare model flags the acceptable wave curve and accepts the constants in code. D2 and D5 are controls so that all-OK and all-CHANGE both lose.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

going through the balance sheet for our tower defence with RPG heroes before I hand it to the programmer. 30 waves per map. For each line tell me whether it is fine as a starting point to playtest, or has to change before it goes in.

- D1: enemy HP grows x1.15 per wave. Gold income per wave grows by a flat +20 each wave.
- D2: goblin drop table weights are nothing 60, small gold 25, potion 10, scroll 5, gem 2. That adds up to 102.
- D3: drops are rolled with the engine's default random function, unseeded.
- D4: hero XP to next level is 100 x 1.4^level. There is no level cap and no reset.
- D5: the programmer will keep all of these numbers as named constants at the top of the wave and hero classes so they are easy to find.
- D6: armour mitigation is defence / (defence + 100), so 100 defence halves damage. No hard cap on defence.

keep the notes short. end your reply with exactly one line per item in the form `D1: OK` or `D1: CHANGE`, D1 to D6 in order.
