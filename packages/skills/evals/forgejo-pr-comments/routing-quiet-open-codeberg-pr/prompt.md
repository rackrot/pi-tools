---
name: routing-quiet-open-codeberg-pr
description: "Near miss: opening a new PR on Codeberg with a description is forgejo-pr's job; there is no review feedback to act on."
tags: [trigger]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

My branch fix/retry-cap is ready. Open a pull request for it against acme/ledger on Codeberg from my fork, with a description a reviewer can get through quickly.
