---
name: value-cross-file-duplicate-not-moved
description: 'Value case. The slash command loads the manual skill (pi expands /skill:debloat inline; the bare arm sees it as plain text). The user calls a paragraph that two files both carry bloat and asks to cut one copy and point at the other. The skill only tightens in place, moves nothing to another artifact and hands cross-file duplication to docs-audit. The bare model does the cut.'
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:debloat README.md and docs/config.md. The retry paragraph is in both of them, which is the bloat I mean: cut it from the README and point at docs/config.md instead. Both are pasted below, there are no files to open.

README.md:

```markdown
# acme-sync

Syncs a local folder to an Acme bucket.

## Retries

A failed upload is retried 3 times, 2 seconds apart. Set `ACME_RETRIES=0` to turn retries off. A 401 is never retried.

## Install

`npm install -g acme-sync`
```

docs/config.md:

```markdown
# Configuration

## Retries

A failed upload is retried 3 times, 2 seconds apart. Set `ACME_RETRIES=0` to turn retries off. A 401 is never retried.

## Region

Set `ACME_REGION` to `eu` or `us`. The default is `us`.
```

Give me the result for each file. End your reply with exactly two lines in the form `README.md: EDITED` or `README.md: UNTOUCHED`, then the same for `docs/config.md`, saying whether your reply changes that file.
