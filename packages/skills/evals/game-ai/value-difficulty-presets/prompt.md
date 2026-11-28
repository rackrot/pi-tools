---
name: value-difficulty-presets
description: "Value case. Easy and Hard enemy presets taken from the SKILL.md difficulty table (reaction delay 0.6 s easy and 0.2 s hard, 1 to 2 and 3 to 4 simultaneous attackers); the bare model picks reaction delays around 1.2 s and 0.4 s."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

filling in the Easy and Hard presets for the enemy AI in my cover shooter. per preset I have two fields:

- reaction: seconds between a soldier spotting the player and firing its first shot
- attackers: how many soldiers may be attacking the player at the same moment (the rest reposition)

Easy should be the most forgiving setting that still feels like a fight, Hard the toughest that still feels fair and not like the soldiers are cheating. what should I put in? one number per field, no ranges.

end your reply with exactly these four lines, filled in:
REACTION_EASY: <seconds>
REACTION_HARD: <seconds>
ATTACKERS_EASY: <integer>
ATTACKERS_HARD: <integer>
