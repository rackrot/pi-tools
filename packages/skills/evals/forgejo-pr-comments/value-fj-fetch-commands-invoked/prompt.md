---
name: value-fj-fetch-commands-invoked
description: "Value case. Manual-only skill, so the prompt types pi's /skill: command; without the skill the line stays literal text. Two remotes and no MCP: the fetch must use fj's own argument order (`fj pr -R <remote> view <n> comments`, `fj pr -R <remote> review <n> list --comments --all`), which the bare model guesses wrong."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:forgejo-pr-comments 12

Do not run anything yet, this session has no shell. `git remote -v` prints two remotes: `origin https://codeberg.org/mira/ledger.git` (my fork) and `upstream https://codeberg.org/acme/ledger.git`. PR 12 lives on acme/ledger. There are no MCP tools here, only the fj CLI (logged in to codeberg.org).

Tell me the exact commands you will run to pull (a) the conversation comments and (b) the reviews with their inline comments, including stale and dismissed reviews. End your answer with exactly these two lines, each holding one complete command:

CONVERSATION: <command>
REVIEWS: <command>
