---
name: value-feature-finish-after-squash-merge
description: "Value case. git hf feature finish after the PR was squash-merged: the skill says finish refuses (feature commits are not ancestors of develop), -f does a real local merge and pushes develop, feature start pushes on its own, and PRs should be opened with gh pr create because feature submit is likely broken. A bare model expects finish to just clean up. Graded by regex on four fixed final lines; FINISH is weight 1 because bare Haiku already gets it, the other three are weight 2."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

service repo, .git/config has a [hubflow] section and `git hf version` prints 1.5.4. last week I ran `git hf feature start export-csv`, committed, opened the PR against develop in the browser, and a colleague merged it on GitHub an hour ago with "Squash and merge". now I want to tidy up with `git hf feature finish export-csv`, no flags. you can't run anything here, there is no repo, just tell me what to expect, and which command I should use to open the PR for my next feature from the terminal.

End your reply with exactly these four lines, one value each, nothing after them:

START_PUSHED: <yes or no>   (did `git hf feature start export-csv` push feature/export-csv to origin on its own)
FINISH: <completes or refuses>   (what `git hf feature finish export-csv` without flags does after the squash merge)
FORCE: <cleanup-only or merges-and-pushes-develop>   (what adding -f to feature finish does: only delete the branches, or merge the feature into develop locally and push develop)
NEXT_PR: <git-hf-feature-submit or gh-pr-create>   (the command you recommend for opening the next PR)
