---
name: route-negative-review-feedback
description: "Near miss: working through review comments on an already open PR is pr-comments territory (the skill body excludes it), so gh-pr should not be read."
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Two reviewers left comments on my pull request 214 at github.com/acme/gateway. Go through what they asked for and tell me which ones are worth fixing and which I should push back on.
