---
name: route-implicit-prior-reason-before-refactor
description: "Routing, implicit. Starting non-trivial work where an earlier session probably recorded why something was kept; routes to memory with no mention of notes, remembering or a vault."
tags: [routing]
runs: 3
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

about to rip the session-cookie fallback out of the auth middleware. thing is, I'm fairly sure you and I went through this once already, a few weeks back in another session, and there was a reason we left it in. nothing about it in the code or the commit log, I looked. find out what that reason was before we touch anything.
