---
name: route-negative-handoff-spec
description: "Near miss: an approved mockup that needs a developer spec (spacing, states, breakpoints) belongs to design-handoff; nobody asked for feedback on the design."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

the invoice list mockup got signed off yesterday, no more changes to the design. engineering starts on it Monday and I need the write-up they build from: spacing and type values, every state of the row (default, hover, selected, overdue), what happens below 768px, how long a customer name can get before it truncates, and the empty and loading states. the frame is a 1280px table with columns Invoice #, Customer, Amount, Due date, Status and a kebab menu per row; rows are 56px tall with 16px horizontal padding, 14px Inter, status shown as a colored pill.
