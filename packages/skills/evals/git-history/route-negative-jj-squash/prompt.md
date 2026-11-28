---
name: route-negative-jj-squash
description: "Near miss: squashing and reordering changes in a Jujutsu repo belongs to the jj skill, which says to use jj instead of git commands; git-history must stay quiet."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

this repo is colocated jj (there's a .jj directory next to .git). I have three changes stacked on trunk: qpvuntsm "add parser", rlvkpnrz "fix parser typo", kkmpptxz "add cli flag". I want the typo fix squashed into the parser change and the result moved so the cli flag change comes first. what do I run?
