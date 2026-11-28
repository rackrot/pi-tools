---
name: negative-flag-file
description: Hard negative. Editing a GO Feature Flag flag file (rollout, targeting) belongs to goff-flags, not goff.
tags: [routing]
max_turns: 5
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill]
---

in flags/checkout.goff.yaml the `checkout-v2` flag is at 10% for everyone. i want pro-plan users on it at 50%, and everyone else ramping from 10% to 100% between dec 1 and dec 8. can you rewrite the flag and make sure the file is valid?
