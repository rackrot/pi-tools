---
name: route-negative-account-service-interface
description: "Near miss: shrinking a class's public interface and placing a seam is codebase-design's job. The prompt mentions accounts and a rename, but no term's meaning is in question."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our `AccountService` class has grown to 41 public methods and every caller has to know which five to call in which order to close an account. I want to hide that behind a much smaller interface so callers can't get the order wrong, and I'm fine renaming the class while we're at it. where should the seam go and what should the new interface look like? I'll paste the method list once you tell me what you need.
