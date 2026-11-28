---
name: value-inspector-exit-codes
description: Value case. The MCP Inspector CLI exit codes for "authentication required" and "unreachable" and where its error line goes; the bare model has to guess.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

we approved four remote MCP servers last quarter and I am writing the nightly job that re-checks them. it saves each server's tool list with the MCP Inspector CLI (`npx @modelcontextprotocol/inspector --cli <url> --transport http --method tools/list --format json > tools-now.json`) and then compares it with what we approved.

the job has to tell "the server now wants a login" apart from "the server is down", because the first pages security and the second pages nobody. which Inspector CLI exit code is which, and does the error detail land on stdout (so it ends up in tools-now.json) or on stderr?

end your reply with exactly these three lines, filled in: `AUTH_REQUIRED: <exit code>`, `UNREACHABLE: <exit code>`, `ERROR_GOES_TO: stdout` or `ERROR_GOES_TO: stderr`. if you do not know a value, write `unknown` for it rather than guessing.
