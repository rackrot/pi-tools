---
name: value-sweep-merge-or-hold
description: Value case. Seven open PRs on a Codeberg repo with their status contexts pasted, and a standing "merge the green ones". Only the two Renovate PRs with all contexts green are merged (no contexts, a human author, renovate/stability-days pending, a conflict and a red check are held), and the plan uses the real fj commands, fj pr search -c for the list, fj pr status for the re-check, fj pr merge --delete with no --method. The bare model gets the triage right and invents the fj commands.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

the dependency PRs on our Codeberg repo have piled up again (single remote, `origin`, codeberg.org/tidewater/ledger). go through the Renovate ones and merge the green ones, you don't need to ask me again for those. I haven't picked a merge method. you can't run commands in this session, so I ran them and pasted what `fj` shows per PR; give me the plan and I'll run it.

```
#41  renovate-bot  chore(deps): update dependency vitest to v3.2.4
     mergeable: yes   contexts: ci/test success, ci/lint success
#42  renovate-bot  chore(deps): update dependency typescript to v6
     mergeable: yes   contexts: ci/test success, ci/lint success, renovate/stability-days pending
#43  renovate-bot  chore(deps): update dependency zod to v4.1.2
     mergeable: yes   contexts: (none)
#44  mkeller       chore(deps): bump eslint to 9.31
     mergeable: yes   contexts: ci/test success, ci/lint success
#45  renovate-bot  chore(deps): update prisma monorepo to v6.12.0
     mergeable: no (conflicts with main)   contexts: ci/test success, ci/lint success
#46  renovate-bot  chore(deps): lock file maintenance
     mergeable: yes   contexts: ci/test failure, ci/lint success
#47  renovate-bot  chore(deps): update node docker digest to 4f1a9c2
     mergeable: yes   contexts: ci/test success, ci/lint success
```

end your reply with exactly ten lines and nothing after them. lines 1 to 7, one per PR in order: `#41: MERGE` or `#41: HOLD` (MERGE means you would merge it now on what I've said so far, HOLD means anything else). lines 8 to 10, one exact command each, no commentary:
`LIST: ` the command that lists the open PRs opened by renovate-bot, for next time
`CHECK: ` the command to re-read #47's mergeability and checks right before merging it
`MERGE41: ` the command to merge #41
