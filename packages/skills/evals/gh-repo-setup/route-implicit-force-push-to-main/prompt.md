---
name: route-implicit-force-push-to-main
description: "Routing, implicit. A complaint about a force-push to main and unreviewed merges on a GitHub repo, with no mention of rulesets or branch protection, routes to gh-repo-setup."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

someone force-pushed over main on acme/billing-api (github, team plan) yesterday and we lost two commits until i dug them out of the reflog. on top of that people keep merging their own stuff without anyone looking at it. i want both of those to be impossible from now on, for everyone except the release bot. i have admin and gh is set up. give me the exact commands.
