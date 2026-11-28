---
name: value-next-vs-avh-finish-defaults
description: Value case. Moving a runbook from gitflow-avh to git-flow-next 2.1.0. The skill lists what changed (finish fast-forwards by default, -f is --force and no longer the tag message file, finish fetches by default, main is merged back into develop); a bare model answers with the AVH or Driessen behaviour. Graded by regex on four fixed final lines.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

we're moving the team off the old apt git-flow (`git flow version` prints "1.12.3 (AVH Edition)") to git-flow-next 2.1.0 and I have to update the release runbook. today it says `git flow feature finish NAME` for features and `git flow release finish -f notes.txt 2.4.0` for releases, and nobody has set any gitflow.* finish options. tell me what behaves differently once we run the same steps with git-flow-next 2.1.0 on its default config. you can't run anything here, there is no repo, just answer.

End your reply with exactly these four lines, one value each, nothing after them:

FEATURE_FINISH: <merge-commit or fast-forward>   (what develop gets when a 3-commit feature is finished and develop has not moved)
DASH_F: <message-file or force or fetch>   (what -f means on release finish in git-flow-next)
FINISH_FETCH: <off or on>   (does finish fetch from origin by default in git-flow-next)
BACK_MERGE: <release-branch or tag or main>   (what git-flow-next merges into develop at release finish)
