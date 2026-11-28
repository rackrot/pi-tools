---
name: route-negative-remove-one-flag
description: "Near miss: deleting one named flag that finished its rollout is the feature-flags skill's removal procedure, not a whole-codebase audit."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

`checkout-new-tax-engine` has been at 100% in every environment for a month and product signed off. rip the flag out of the order service: keep the new path, drop the old one. what are the steps so I don't leave anything behind?
