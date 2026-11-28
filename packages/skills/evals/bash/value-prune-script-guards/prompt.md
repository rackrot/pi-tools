---
name: value-prune-script-guards
description: Value case. A destructive deploy-hook script written from scratch; graded on guards the bare model tends to leave out (inherit_errexit, a :? guard and -- on the rm, exit 2 for usage errors).
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

need a script for our deploy hook, prune-releases.sh. it gets the releases directory and how many releases to keep (default 5), sorts the release dirs by mtime using a scratch dir for the listing, and deletes all but the newest N. target is Ubuntu 24.04, Bash 5.2 only. it deletes things on a prod box so I want it to refuse bad arguments and not do anything stupid if a step fails or a variable ends up empty.

don't write a file, there is no repo here. reply with the complete script in a single fenced bash block, nothing after it.
