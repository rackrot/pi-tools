---
name: value-reserved-variable-names
description: 'Value case. The slash command loads the manual skill (pi expands /skill:setup-wizard inline; the bare arm sees it as plain text). SKILL.md says names must be plain identifiers and the library refuses reserved names "like PATH"; the full rule is in template.sh _check_name: first character a letter, and USER, HIST*, LC_* and others refused. The agent is told not to run the wizard, so a bad name only fails when the human runs it. The bare model treats any valid shell identifier as fine. The no-search sentence is there because runs are not sandboxed: without it the bare arm globs the home directory, finds this repo and reads the skill.'
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:setup-wizard for our app. There is no repo to read here, and do not search the disk: use only this message and the files it points you to by path. These are the seven variables the app reads from .env, and the wizard has to capture every one of them:

STRIPE_SECRET_KEY, HISTORY_API_URL, USER_POOL_ID, LC_CLIENT_SECRET, _SENTRY_DSN, PATH_PREFIX, USER

Before you write any stage: which of these names can the wizard capture and write under exactly that name, and which will its library refuse when the script runs, so that I have to rename the variable in the app first? Do not write the wizard yet.

End your reply with exactly seven lines, in the order above, in the form `STRIPE_SECRET_KEY: OK` or `STRIPE_SECRET_KEY: REFUSED`.
