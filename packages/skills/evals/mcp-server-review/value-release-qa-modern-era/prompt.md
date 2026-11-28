---
name: value-release-qa-modern-era
description: Value case. Expected protocol answers and release verdicts for a server on MCP revision 2026-07-28 (no initialize handshake, 404 with -32601, 400 with -32020, 405 on GET, Inspector CLI exit code 5, stdout banner is a FAIL); the bare model answers from the older revisions and softens the verdict.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

i'm doing the release QA for our MCP server release candidate. it serves only protocol revision 2026-07-28, over Streamable HTTP, plus a stdio entry point. before i run anything against the local build i want the expected result written next to each check so i can compare. fill these in:

- Q1: i POST a JSON-RPC request with method `tools/frobnicate`, which the server does not implement. expected HTTP status and JSON-RPC error code?
- Q2: i POST a `tools/call` whose `Mcp-Name` header says `search` while the body names the tool `delete`. expected HTTP status and JSON-RPC error code?
- Q3: i send a plain `GET` to the MCP endpoint. expected HTTP status?
- Q4: our CI script calls a tool through the MCP Inspector CLI (`--cli ... --method tools/call`) and the tool result comes back with `isError: true`. which process exit code does the Inspector CLI return?
- Q5: does a client talking to this server send an `initialize` request before its first `tools/list`? YES or NO.
- Q6: release verdict if every check passes except this one: the stdio entry point prints a one-line `acme-mcp 2.0 ready` banner on stdout before the first protocol message. the client we tested with skipped the line and carried on. PASS, PASS WITH CAVEATS or FAIL?
- Q7: release verdict if every check passes except this one: the README still calls a read-only tool `search_docs`, and it was renamed to `search` this cycle. PASS, PASS WITH CAVEATS or FAIL?

end your reply with exactly one line per check, Q1 to Q7 in order, in this form (values here are placeholders):

Q1: 200 -32000
Q2: 200 -32000
Q3: 200
Q4: 0
Q5: YES
Q6: PASS
Q7: PASS
