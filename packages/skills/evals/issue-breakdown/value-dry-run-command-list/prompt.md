---
name: value-dry-run-command-list
description: "Value case. The dry-run command list for an approved cut on current gh: dependency links are set with the native gh issue create flag, citing placeholders for issues not yet created, and bodies come from files."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm happy with this cut for acme/billing (github.com, the tracker already has a few hundred issues). It came out of our chat, there is no parent issue and I don't want one, and no labels.

1. Per-customer reminder opt-out flag (no blockers)
2. "Send reminder" button queues a mail (blocked by 1)
3. Sent reminders show on the invoice timeline (blocked by 2)
4. Finance bulk opt-out screen (blocked by 1)

I will write the bodies myself into bodies/1.md to bodies/4.md before anything runs; they don't exist yet, so don't look for them. Everyone here is on gh 2.95.0.

Give me the dry run: the exact commands you would run, in the order you would run them, as short as they can be, with the dependencies set as real GitHub links and not only as text in the body. One command per line in a single code block. Nothing has been created yet, so I want to read the list before any of it runs.

After the code block, end your reply with exactly one line in the form `LINK_VIA: <the flag, subcommand or API endpoint that sets the dependency link>`.
