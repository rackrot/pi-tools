---

name: memory
description: "Keeps long-term notes in the memory vault with memory_search, memory_read, memory_write, memory_archive and memory_sync. Use when starting non-trivial work (search for prior decisions), after making a decision or finishing a piece of work, when handing work over, or when the user says \"remember\", \"note this\" or asks what was decided before."
---

# Memory

Notes live in a git-backed Obsidian vault. Humans edit the same files, so treat every note as shared.

## Rules

- Search before you write (`memory_search`); update an existing note instead of adding a near-copy.
- Read before you update (`memory_read`). A write to a note you have not read, or that a human changed since, is refused.
- One idea per note, titled so it can be found: "Deploy uses blue-green", not "Notes 3".
- Write when a decision is made or a piece of work is done, not only at the end of the session.
- Don't repeat what the repo already records (code, commit messages, README). Note the why, the surprise, the constraint.
- Never store secrets, tokens or credentials; write where they are kept instead. Writes that look like secrets are refused.
- Date facts that go stale ("as of 2025-03, the API limit is 100/min").
- Link related notes with `[[Note title]]`.

## Note types

- `rule`: how to work here. Pin it (`pin: true`) only if every session needs it.
- `decision`: what was chosen, the alternatives, the reason. Goes in `Decisions/`.
- `fact`, `lesson`, `reference`: things learned, mistakes to avoid, pointers.
- `log`: what happened in a session. Goes in `Log/`.
- `handoff`: unfinished work for the next session; `status: open` until done, then set it to `done`.
- `overview`: one per project (`Overview.md`), a short orientation. Update it, don't add more. The note index between the `<!-- memory:index:* -->` markers is automatic, and when `memory.summary.model` is configured a background worker also refreshes the prose above it at session end. Don't hand-maintain that prose unless asked; if you do write it, `memory_read` first, then `memory_write` type `overview` with the marker block kept as is.

## Scope

`project` notes belong to the current repo; `global` notes apply to every project. Notes outside the agent folder are the user's: search and read them (`scope: vault`), never write there. Retire notes with `memory_archive`; nothing is deleted.

## Setup

If memory tools are missing or the vault is not a git repo, tell the user to run `/memory-init`; setup is described in the package README.
