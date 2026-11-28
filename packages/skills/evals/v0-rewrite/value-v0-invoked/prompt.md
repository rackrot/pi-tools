---
name: value-v0-invoked
description: 'Value case. An ordinary cleanup request on a drifted SETUP.md. Edit residue goes, the contradiction the document itself settles (config.json vs acme.yml, Node 16 vs 20) is resolved, the self-hosted condition survives, and the upload cap that nothing settles is kept both ways and reported instead of picked. Two v0 rules a bare model does not apply carry most of the weight: plain-text pointers to a file and to a section become links, and a sentence hard-wrapped over three lines is unwrapped. Graders read only the text between the BEGIN and END lines, plus the final UPLOAD CAP line.'
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

SETUP.md has been through several rounds of edits. Clean it up so it reads like it was written in one go.

The file is pasted below, there is nothing to open or write, and there is no other document to check against. Reply with the full new text of the file between a line `BEGIN SETUP.md` and a line `END SETUP.md`, then any notes. End your reply with exactly one line: `UPLOAD CAP: 25 MB`, `UPLOAD CAP: 100 MB` or `UPLOAD CAP: CONFLICT`, saying what your new text states as the upload cap (CONFLICT if it does not settle on one).

# Setup

1. Install the CLI with `npm install -g acme-cli`.
2. Run `acme login` and paste the token from the old dashboard.
3. Run `acme init` to create `config.json`.

Updated: the token step is skipped on the new dashboard, so step 2 is only needed on self-hosted installs.

Previously `acme init` created `config.json`; it now writes `acme.yml`.

~~Requires Node 16.~~ Requires Node 20 or newer.

Configuration lives in `acme.yml`. Configuration lives in `config.json`.
Every key is described in docs/config-reference.md, and the
size rules that apply to `acme push` are in the Limits section
below.

## Limits

Uploads are capped at 25 MB per file. Larger files are rejected with a 413.

## FAQ

**My video will not upload.** Files up to 100 MB upload fine, so check your connection first.
