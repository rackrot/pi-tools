---
name: route-implicit-users-waiting-on-fix
description: "Implicit trigger: the user never says 'release', 'changelog' or 'tag'; merged work on a github.com repo has to reach users as a new numbered version with a write-up of what changed."
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

people keep asking in the issues when the retry fix reaches them. it's been on main for two weeks (github.com/acme/parsekit, python lib, last one we put out was v2.4.1) together with a dozen other merged PRs, one of which dropped the old `parse_bytes()` alias. nothing automated here, the gh cli is set up. can you get all of that out to users as a proper new version, with the right number and a write-up of what changed?
