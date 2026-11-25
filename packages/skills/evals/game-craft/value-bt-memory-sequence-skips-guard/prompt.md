---
name: value-bt-memory-sequence-skips-guard
description: Value case. A memory Sequence under a reactive Selector resumes at its RUNNING action and never re-ticks its guard, so the guard keeps chasing after sight is lost. A bare model tends to blame the condition or add a timer; the fix is a reactive sequence or a conditional abort.
tags: [value]
runs: 3
max_turns: 6
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill]
---

My guard AI is a behavior tree that I tick at 10 Hz. When the player breaks line of sight behind a wall the guard still runs all the way to the player's old position and attacks thin air, instead of falling back to patrol. I logged `CanSeeTarget` and it does return FAILURE when the player is hidden, so the condition itself is right.

```text
ReactiveSelector
├── Sequence                      # our normal "remember the running child" Sequence
│   ├── Condition: CanSeeTarget
│   ├── Action: MoveTo(target_pos)   # returns RUNNING until it arrives
│   └── Action: Attack
└── Action: Patrol(route)
```

What is going wrong, and what is the smallest change that makes the guard give up the chase when sight is lost?
