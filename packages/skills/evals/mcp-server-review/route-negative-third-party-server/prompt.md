---
name: route-negative-third-party-server
description: "Near miss: vetting somebody else's MCP server before adding it to the agent config (hidden instructions in tool descriptions, pinning them against later change) is mcp-server-audit's job, not a pre-release review of code we own."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

a teammate wants to add a community postgres MCP server from npm to our shared .mcp.json. we didn't write it and nobody here has read its code. before i approve it, how do i check that its tool descriptions don't carry hidden instructions for the agent, and how do i notice if they change after we've approved it?
