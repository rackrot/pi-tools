---
name: route-implicit-pre-tag-checks
description: "Routing, implicit. A maintainer about to tag a release of their own server worries about a stale tool table, bad-request handling and a public bind address, without the words review, audit or security."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

tagging 2.0 of our typescript mcp server tomorrow and i have a bad feeling about it. it grew a streamable http mode this cycle next to stdio, express with `app.listen(3000)`, bearer token checked in a middleware, and the tool table in the readme was last touched two releases ago. nobody has ever thrown a broken request at the http endpoint either. what do i need to go through before i hit publish, and how do i prove each point instead of eyeballing it?
