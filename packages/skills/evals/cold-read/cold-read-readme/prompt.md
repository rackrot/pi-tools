---
name: cold-read-readme
description: 'A "would someone new follow this README" check routes to cold-read. The README is inline because the eval workspace is empty.'
tags: [routing]
runs: 3
max_turns: 6
model: claude-sonnet-5-5
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
