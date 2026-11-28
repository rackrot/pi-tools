---
name: route-negative-cold-read-readme
description: "A 'would someone new follow this README' read routes to cold-read, not readme."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Before I publish this README, would someone new to the project be able to follow it? Read it as a stranger would.

```
# notes-sync

Sync your notes folder to the team server.

## Quick start

    npm i -g notes-sync
    notes-sync push ~/notes
    notes-sync status

Conflicts are resolved the same way as in the old tool.
```
