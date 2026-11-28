---
name: near-miss-add-client-config
description: "Near miss: registering a vendor-run MCP server in client config is not designing or building one, so mcp-server must stay closed."
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Add Linear's hosted MCP server to this repo's .mcp.json so everyone on the team gets it in Claude Code. The API key should come from the LINEAR_API_KEY environment variable, not be written into the file.
