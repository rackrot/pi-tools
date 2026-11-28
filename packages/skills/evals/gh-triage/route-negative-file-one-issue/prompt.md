---
name: route-negative-file-one-issue
description: "Near miss: filing one new GitHub issue with a label and a milestone is single-issue mechanics (gh-issues), not triage of existing items."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

File a GitHub issue in acme/storefront for the flaky checkout test (tests/e2e/checkout.spec.ts times out about one run in five on CI), label it bug and put it in the v2.4 milestone.
