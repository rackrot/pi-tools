---
name: route-implicit-close-and-blocked-by
description: "Routing, implicit. Closing one tracker entry with a note and marking another as waiting on a third, given only a codeberg.org URL, routes to forgejo-issues without the words Forgejo, fj, label or milestone."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

https://codeberg.org/acme/widgets/issues/214 was fixed by last week's deploy. close it with a short note saying so, and mark #215 as waiting on #209 so nobody picks it up early.
