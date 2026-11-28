---
name: route-implicit-security-tab-backlog
description: "Routing, implicit. A backlog under the GitHub Security tab that the user wants cleared routes to gh-code-security without the words triage, secret scanning, code scanning or alert decision."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I inherited acme/billing on github.com last month and the Security tab has a red badge with 43 on it that nobody has looked at in a year. From clicking around: a pile of CodeQL findings, a lot of npm advisories, and three entries saying a token was found in the repo, one of them marked active. The auditors come in two weeks and want that number explained or gone. How do I work through it with gh, what goes first, and how do I close the ones that are noise so they stay closed?
