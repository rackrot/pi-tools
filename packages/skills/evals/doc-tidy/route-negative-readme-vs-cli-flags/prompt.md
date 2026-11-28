---
name: route-negative-readme-vs-cli-flags
description: "Near miss: a README that documents flags the CLI no longer has is docs-vs-code drift, which doc-tidy puts out of scope and hands to docs-audit. doc-tidy must not load (it is manual as well)."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

The README still documents `--dry-run` and `--force`, and I am fairly sure the CLI dropped both two releases ago. Go through the usage section, check each flag against what the CLI accepts today and tidy the doc up so it matches.
