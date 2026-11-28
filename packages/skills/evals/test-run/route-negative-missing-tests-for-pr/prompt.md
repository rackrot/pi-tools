---
name: route-negative-missing-tests-for-pr
description: "Near miss: asking which tests a change still needs is a read-only gap audit (test-gap-audit), not running and fixing the suite."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

before i merge the refund-flow PR: which tests is it still missing? i don't want anything run or fixed, just a ranked list of the cases nobody covers yet.
