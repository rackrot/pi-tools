---
name: value-glossary-file-and-entry-format
description: "Value case. Settled terms must land in a root GLOSSARY.md in the skill's entry format (bold term with colon, _Avoid_ line for rejected synonyms), and a general programming concept and a storage detail stay out. The bare model picks its own path and format and tends to include everything it is handed."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we finished the terminology session for the shop backend (one service, one repo, nothing about this is written down in the repo yet). these are my notes, everyone signed off on them:

1. Order: a request from a customer to buy specific items. people also said "purchase" and "transaction" for this, we're dropping both words.
2. Invoice: a request for payment sent to a customer after delivery. finance sometimes says "bill", we're dropping that.
3. Retry timeout: how long the payment client waits before it retries a call, 30 seconds. we use it all over the codebase.
4. Order storage: orders live in the `orders` Postgres table, partitioned by month.

write this up the way the project's domain language should be recorded. you can't write files here, so reply with the complete file contents in one fenced code block, and after the block end your reply with exactly these two lines:

FILE: <path of the file, relative to the repo root>
TERMS: <comma-separated list of the terms the file defines>
