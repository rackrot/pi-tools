---
name: route-list-state-wrong-row
description: Implicit positive. Row state that moves to another row after a delete or reorder is the missing LazyColumn key problem; the prompt names the symptom, not the skill or the fix.
tags: [trigger]
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

In the order list of our Android app, when I delete an order or the list gets re-sorted, the expanded/collapsed toggle and the half-typed note end up on a different row than the one I was editing. The list is a `LazyColumn { items(orders) { OrderRow(it) } }` and each OrderRow keeps the toggle and the note text in `remember`. Why does that happen and what should I change?
