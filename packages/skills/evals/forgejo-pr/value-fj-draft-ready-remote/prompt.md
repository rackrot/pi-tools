---
name: value-fj-draft-ready-remote
description: Value case. Exact fj command lines for a draft PR (no --draft flag, WIP title prefix), marking it ready (fj pr edit <n> title), and picking a remote (-R goes right after pr); the bare model guesses gh-style flags.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I work on a project hosted on codeberg.org and use the fj CLI, already logged in. Don't run anything, I paste the commands myself. I only need the exact command lines.

Situation A: my clone has one remote, `origin`. Branch `fix/retry-backoff` is already pushed with upstream tracking set, the base branch is `main`, and the PR text is in `/tmp/pr-body.md`. I want the PR opened as a draft, titled "Fix retry backoff overflow".

Situation B: that PR got number 57. CI is green and I've read it through myself, so now I want it out of draft and ready for review.

Situation C: in a different clone I have two remotes, `origin` (my fork) and `upstream` (the project). PR 12 lives on `upstream`. I want one command that blocks until that PR's CI checks have finished and then shows the result.

End your reply with exactly three lines, each one a single fj command with nothing else after the colon:

A: <command>
B: <command>
C: <command>
