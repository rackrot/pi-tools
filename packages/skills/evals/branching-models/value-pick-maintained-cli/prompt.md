---
name: value-pick-maintained-cli
description: Value case. A team with two different git-flow CLIs (brew 0.4.1 and apt AVH 1.12.3) wants one that is still maintained. The skill says git-flow-next is the only maintained CLI and has no apt package; a bare model recommends gitflow-avh from apt. Graded by regex on two fixed final lines.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

half the team is on macs where `brew install git-flow` gave them a `git flow version` of 0.4.1, the other half is on Ubuntu where `apt install git-flow` gave "1.12.3 (AVH Edition)". the two behave differently and it bit us on the last release. I want everyone on the same git flow CLI, and it has to be one that still gets bug fixes. the repo was initialised years ago, so every clone has a [gitflow] section with branch.master, branch.develop and prefix.* keys. there is no repo in this session to look at, so tell me which CLI to standardise on and what the switch involves.

End your reply with exactly these two lines, one value each, nothing after them:

STANDARDISE_ON: <name of the CLI project>
UBUNTU_INSTALL: <apt or other>   (can the Ubuntu half install that CLI with apt)
