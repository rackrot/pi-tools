---
name: route-negative-backlog-triage
description: "Near miss: sorting a whole backlog of untouched GitHub issues (what needs attention, duplicates, needs-info, close) is gh-triage's job, not single-issue editing."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Nobody has looked at the issue tracker of github.com/acme/storefront since the summer and there are around 60 open issues. Go through the backlog and tell me which ones need attention first, which are duplicates or were already rejected, which need more info from the reporter, and which we can close.
