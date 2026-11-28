---
name: value-avh-finish-quirks
description: Value case. What the apt git-flow CLI (gitflow-avh 1.12.3) does on default config. The skill says AVH fast-forwards a one-commit feature despite --no-ff, merges the tag (not the release branch) into develop, allows one open release at a time and has been archived since 2023; a bare model answers with Driessen's article. Graded by regex on four fixed final lines.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm writing the wiki page on how our branching commands shape history. the build box is Debian, git-flow came from `apt install git-flow`, and `git flow version` prints "1.12.3 (AVH Edition)". nobody has set any gitflow.* options beyond what `git flow init -d` wrote. there is no repo in this session to try it on, so tell me what this CLI does.

End your reply with exactly these four lines, one value each, nothing after them:

ONE_COMMIT_FEATURE: <merge-commit or fast-forward>   (what develop gets from `git flow feature finish typo-fix` when the feature has exactly one commit and develop has not moved)
DEVELOP_GETS: <release-branch or tag or main>   (what `git flow release finish 2.4.0` merges into develop)
SECOND_RELEASE: <allowed or refused>   (`git flow release start 2.5.0` while release/2.4.0 is still open)
CLI_STATUS: <maintained or archived>   (state of the upstream project of this CLI today)
