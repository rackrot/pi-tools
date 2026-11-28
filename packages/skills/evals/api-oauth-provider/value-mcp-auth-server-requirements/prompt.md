---
name: value-mcp-auth-server-requirements
description: Value case. Four fixed-answer points about opening an authorization server to MCP clients, three on requirement levels in the dated MCP authorization spec and one on the re-consent screen. Read only, no search tools, so neither arm can find the answers on disk; expected answers are in the graders.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Skill]
---

We run the OAuth authorization server for our platform and are opening it to MCP clients. I'm writing the compliance notes against the MCP authorization spec dated 2026-07-28 and need four points settled. Keep the reasoning short.

Q1. What requirement level does that spec give to the authorization server including the `iss` parameter in authorization responses? MUST, SHOULD, MAY, or NONE if the spec does not mention it.

Q2. What is the status of RFC 7591 dynamic client registration in that spec?
A: authorization servers are required to support it
B: recommended, and the preferred way for clients to register
C: optional and deprecated
D: removed from the spec

Q3. For clients that identify themselves with a Client ID Metadata Document, what requirement level does that spec give to the authorization server showing the redirect URI hostname to the user during authorization? MUST, SHOULD, MAY, or NONE if the spec does not mention it.

Q4. An app that a user already authorized comes back asking for two more scopes. What does our consent screen list?
A: every scope the app will hold afterwards, old and new together
B: only the two new scopes
C: every scope, with the two new ones marked as new

End your reply with exactly four lines in this form, Q1 to Q4 in order, and nothing after them:
Q1: <MUST, SHOULD, MAY or NONE>
Q2: <letter>
Q3: <MUST, SHOULD, MAY or NONE>
Q4: <letter>
