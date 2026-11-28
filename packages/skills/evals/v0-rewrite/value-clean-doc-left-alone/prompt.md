---
name: value-clean-doc-left-alone
description: 'Value case. Rule "a pass that finds nothing worth improving changes nothing": the runbook is already a clean v0 (no edit notes, no contradictions, one line per paragraph, no plain-text pointers), so the right answer is zero edits. A bare model asked to clean up tends to reword or restructure something.'
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

This runbook has been through a lot of hands this quarter, so give it a cleanup pass so it reads like it was written in one go. The file is pasted below, there is nothing to open or write. Reply with the text the file should have, then end your reply with exactly one line in the form `EDITS: <n>`, where n is the number of places where your text differs from mine.

# Rotating the API signing key

The signing key lives in the `api-signing` secret and is rotated every 90 days.

## Steps

1. Generate a new key with `keytool gen --type ed25519`.
2. Add it to the `api-signing` secret as `next`.
3. Deploy the API. It accepts signatures from both `current` and `next`.
4. Promote `next` to `current` with `keytool promote`.
5. Deploy again to drop the old key.

## If a deploy fails

Roll back with `deploy rollback api`. The old key stays valid until step 5, so a rollback before then needs no key changes.
