---
name: route-quiet-implicit-red-after-rebase
description: "In scope but manual, implicit phrasing: a branch that went red after a rebase, with no word like run, suite or loop. Must stay quiet while the skill is a manual command; turn it into a positive trigger if the flag is dropped."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

rebased my branch onto main this morning and CI went red on the unit job, something in the pricing module by the look of it. it was green before the rebase. get it back to green before i open the PR.
