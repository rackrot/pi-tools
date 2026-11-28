---
name: route-implicit-cryptic-toast
description: "Implicit trigger: a support-ticket complaint about a cryptic import toast. Never says copy, wording, message review or microcopy; the fix is an interface error message."
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Support gets a ticket nearly every time this toast shows up in the contacts importer: "Import failed (ERR_ROW_PARSE 0x41)". It fires when a row in the uploaded CSV has a birthday we can't read, usually 31/02 or text like "unknown". The other rows import fine. Nobody knows what to do when they see it. Fix that for me, the toast holds about 120 characters.
