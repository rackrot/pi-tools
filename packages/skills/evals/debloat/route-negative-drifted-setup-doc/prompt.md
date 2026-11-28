---
name: route-negative-drifted-setup-doc
description: "Near miss: a doc full of Update notes and struck-through lines that contradicts itself is drift, which is v0-rewrite's job, not density tightening."
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

docs/setup.md has been patched so many times it reads like a changelog: "Update:" notes, struck-through lines, and two places that disagree about which config file is used. Rewrite it so it just says what is true today.
