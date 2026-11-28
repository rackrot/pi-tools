---
name: route-recheck-approved-tools-unchanged
description: Routing. Re-checking that an already approved server still exposes the tools that were approved (rug-pull check), phrased as a user would.
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Security signed off on the vendor's ticketing MCP server back in March and half the team has it in Cursor and Claude Code now. The vendor ships updates whenever they like. How do I set things up so we notice if what its tools say or accept is no longer what we signed off on?
