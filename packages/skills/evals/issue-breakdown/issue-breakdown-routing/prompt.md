---
name: issue-breakdown-routing
description: "Routing, explicit. A written spec to be split into several GitHub tickets with dependencies routes to issue-breakdown."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Here's the spec we agreed on for CSV export: users pick columns, the server streams the file, large exports run as background jobs, and admins get an audit log. The repo is on github.com (acme/reports). Split this up into tickets the team can pick up separately and tell me which ones depend on which. Show me the list before you create anything.
