---
name: route-quiet-in-scope-branch-scan
description: "In scope but manual: a direct request to run the secret, SAST and dependency scanners over the branch's changes and lockfiles. security-scan has disable-model-invocation, so it must not load on its own; this fails if that flag is dropped, and the case should then be turned into a positive trigger (min 1)."
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

before I open the PR for feature/sso-login: run the secret scanner, semgrep and the dependency vuln checks over what this branch changed against main plus the lockfiles, weed out the false positives, and give me one ranked list so I can pick what to fix.
