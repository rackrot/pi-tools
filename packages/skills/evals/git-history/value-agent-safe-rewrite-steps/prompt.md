---
name: value-agent-safe-rewrite-steps
description: "Value case. Three steps the skill prescribes and the bare model does differently: a backup ref before a rebase, undoing a finished rebase through a rescue branch instead of moving the branch with reset, and backporting on a branch made for it instead of on the release branch. Dropped after calibration because the bare model already gets them right: ask before stashing, GIT_EDITOR=true on rebase --continue, force-with-lease pinned to branch:sha, cherry-pick -x, bisect run exit codes."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

you are operating git for me in my repo. you run every command yourself through a non-interactive shell tool, and I only answer when you ask. the branch feature/login is mine alone. for each situation tell me the one command you run.

- S1: I say "rebase feature/login onto the latest main". The working tree is clean, no other operation is in progress and you have already fetched. What is the first git command you run that is not a read-only inspection?
- S2: The rebase finished yesterday, and today the result turns out to be wrong. `git reflog` shows the tip from before the rebase was 4be1a90. Nothing has been pushed since. I say "undo that rebase". What is the one command that makes the pre-rebase commits available again?
- S3: Commit 9fceb02 on main fixes a crash. I say "backport that to release/2.4". You have fetched. What is the exact command that puts you on the branch where you will run the cherry-pick?

end your reply with exactly three lines, S1 to S3 in order, in the form `S1: <command>`. the complete command line, nothing after it.
