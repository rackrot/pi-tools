---
name: route-feature-finish-refused
description: "A git hf feature finish that refuses with the pull-request message routes to hubflow; the prompt never says HubFlow."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

ran `git hf feature finish payments-retry` this morning and it just stopped with "Please raise a pull-request via GitHub first, or use the -f flag." the PR is already merged though, Dana merged it yesterday. is -f the right thing here or will it mess something up?
