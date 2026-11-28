---
name: value-one-next-move
description: "Value case. The phase gate was met a week ago and the agent has kept adding surfaces since. The skill says: one Next move, never a menu, and when the gate is already met the move is to change phase, not to add another surface. The bare model tends to put the untested progress bar or the config refactor first."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Back after a week off and my agent just kept going on the importer. I've lost the thread. I can't reach the repo from here, so this is copied by hand from docs/plans/importer.md and it is all I have.

Phase 2 exit gate (I wrote this before I left): "importer loads the three sample tenant files with zero row loss, two CI runs in a row".

Status block, as the agent left it:
- 12 May: CI run #88 green, 3/3 sample files, 0 rows lost
- 13 May: CI run #89 green, 3/3 sample files, 0 rows lost
- 14 May: added --dry-run flag
- 15 May: added progress bar
- 16 May: added --format json|table output option
- 17 May: CI run #97 green on HEAD, 3/3 sample files, 0 rows lost; progress bar has no unit tests yet; config loader "is getting messy"

Open TODO list in the same file:
1. Add a web status page for import runs
2. Refactor the config loader
3. Write unit tests for the progress bar
4. Close Phase 2 and start Phase 3 (first run against a real tenant export; I have to ask ops for the export)
5. Add a --resume flag

Where do I pick this up? Keep it short, and finish with this as the very last line, naming the single TODO item I should start on first:

NEXT: <number>
