---
name: route-negative-release-review-own-server
description: Near miss. Reviewing the source of an MCP server the user wrote, before publishing it, belongs to mcp-server-review, not to mcp-server-audit.
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I wrote an MCP server in TypeScript for our billing API (src/server.ts, Streamable HTTP, bearer tokens). I want to publish it to npm on Friday. Go through the code and tell me what has to be fixed before release: auth, session handling, input schemas, anything that could run code.
