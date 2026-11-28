---
name: route-negative-session-handoff
description: "Near miss: handing unfinished work on design tokens to whoever continues tomorrow is a work handover (the handoff skill or no skill), not a developer spec of a finished design."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm out from tomorrow and someone else continues the design token migration. write a handoff note so they know where we got to: spacing tokens are all renamed to the new scheme, colours are about half done (surface and text are finished, action and border are not), Button and Card still use raw hex values, and we decided today to keep the old names as aliases for one release.
