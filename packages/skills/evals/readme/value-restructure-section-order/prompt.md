---
name: value-restructure-section-order
description: "Value case. Reordering a library README. The skill's funnel order puts 'why this' and usage above install (SKILL.md Restructure step 1, templates.md Library). A bare model keeps the conventional install-first order. Graded on install coming after both; the relative order of why and usage is not graded because SKILL.md and templates.md can be read either way."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm reordering the README of our Python library on GitHub (github.com/acme/tzparse, MIT, published on PyPI). The content of each section is fine, I only want the order right. These are the sections it has today, in today's order, after the title and one-line description:

- Installation
- Contributing (one line pointing at CONTRIBUTING.md) and License
- API overview (the four main functions, links to the full reference)
- Why tzparse instead of dateutil
- Usage (a 10-line example with its output)

Tell me the order they should be in.

End your reply with exactly this line, filled in, and nothing after it. Use these section words: install, contributing, api, why, usage.

ORDER: <the five words, comma-separated, first to last>
