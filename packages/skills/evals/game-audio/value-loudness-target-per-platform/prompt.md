---
name: value-loudness-target-per-platform
description: Value case. A mix mastered to streaming loudness (-14 LUFS) ships on console/PC and on phones. The skill carries the platform targets (about -24 LUFS console and PC, about -18 LUFS mobile and handheld) and says -14 is too hot; a bare model tends to keep -14 or answer -16 or -23.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our audio lead mastered the whole game mix to -14 LUFS integrated so it sits level with the soundtrack release on Spotify. we ship on PS5 and PC, and there is a separate phone build with its own mix pass. before I sign off the audio spec: what integrated loudness should each build measure over a play session, and can the -14 stay?

keep it short. end your reply with exactly one line in this form, one integer per target (the centre of the target, no ranges):

`CONSOLE_PC=<n> LUFS; MOBILE=<n> LUFS; KEEP_MINUS_14=<yes|no>`
