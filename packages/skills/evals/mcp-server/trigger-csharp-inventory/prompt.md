---
name: trigger-csharp-inventory
description: A C# MCP server request that should load mcp-server:mcp-server.
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Write an MCP server in C# with the ModelContextProtocol SDK that exposes our inventory database as two tools (search_items, get_stock) over stdio.
