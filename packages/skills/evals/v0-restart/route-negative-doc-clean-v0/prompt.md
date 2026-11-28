---
name: route-negative-doc-clean-v0
description: "Near miss on the name: rewriting a patched document as a clean v0 is v0-rewrite's job (a document refresh), not a restart of a failed build."
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

docs/architecture.md has been patched after every review round and now reads like a pile of "Update:" notes. Start it over as a clean v0 that only says what is true today. Here it is, there is no file to open:

```
# Architecture

The API is a single Node service.

Update: the API is now two services, `gateway` and `core`.

Jobs run in-process. (Changed in review 3: jobs run on a Redis queue.)

Auth: sessions. Note, ignore this, we moved to JWT.
```
