---
name: trigger-implicit-assistant-access
description: "Implicit trigger: giving desktop AI assistants access to an internal API, with a risky write, without naming MCP."
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Support wants to use Claude Desktop and Cursor to look up customers and issue refunds in our billing system. It's a Go service with a REST API, about 30 endpoints. What do I need to build so the assistants can call it, and how do I make sure a refund can't go out twice or by accident?
