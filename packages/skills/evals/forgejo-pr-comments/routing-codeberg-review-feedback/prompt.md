---
name: routing-codeberg-review-feedback
description: "Explicit trigger: review comments on a Codeberg PR that the user wants sorted before any edit. Fails while the skill sets disable-model-invocation: true, because pi then keeps it out of the model's skill list."
tags: [trigger]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Two reviewers left comments on my PR 14 at codeberg.org/acme/ledger. Go through what they asked for and tell me which ones are worth fixing and which I should argue against, before you change any code.
