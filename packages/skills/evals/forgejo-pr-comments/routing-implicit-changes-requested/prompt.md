---
name: routing-implicit-changes-requested
description: "Implicit trigger: a self-hosted Forgejo PR URL (/pulls/<n>) with changes requested, no mention of comments, triage or Forgejo. Fails while the skill sets disable-model-invocation: true."
tags: [trigger]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

The maintainer hit "Request changes" on https://git.lindqvist.example/infra/deploy/pulls/31 last night and I have not looked at it yet. Work out what they want from me and what I actually need to do about it.
