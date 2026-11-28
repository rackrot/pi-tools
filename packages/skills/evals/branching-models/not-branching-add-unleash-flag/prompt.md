---
name: not-branching-add-unleash-flag
description: "Near miss: adding one flag with the repo's flag tool and testing both paths is the feature-flags skill's job, not the branching model's."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we already use Unleash in this service. put the new tax calculation in src/pricing/tax.ts behind a flag that is off by default, and add tests that cover both the on and the off path.
