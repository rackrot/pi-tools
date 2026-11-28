---
name: route-negative-threat-model
description: "Near miss: a design-level STRIDE threat model with trust boundaries and an attack tree belongs to threat-model, not to a scanner run over a branch diff."
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

We're adding a public webhook receiver in front of the billing service next quarter. Nothing is written yet. Map the trust boundaries, walk STRIDE over each data flow and give me an attack tree for "attacker gets a refund issued to their own card".
