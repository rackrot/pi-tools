---
name: value-verdict-words
description: Value case. The slash command loads the manual skill (the bare arm sees it as plain text). Four numbered claims against one pasted config; the prompt asks for a one-word verdict per claim without naming the words. The skill fixes them as Confirmed, Wrong and Unverified; the bare model picks its own (True/False, Correct/Incorrect, Unverifiable).
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:fact-check this note from yesterday's handover. The only file it talks about is pasted below, there are no files to open.

> (1) The nightly export job starts at 02:00 UTC. (2) It writes to the `exports-prod` bucket. (3) It keeps the last 14 days of files in the bucket. (4) A run takes about four minutes.

jobs/export.yaml:

```yaml
name: nightly-export
schedule: "0 2 * * *"
timezone: UTC
target:
  bucket: exports-prod
  retention_days: 7
```

End your reply with exactly four lines, 1 to 4 in order, each in the form `<n>: <one-word verdict>`.
