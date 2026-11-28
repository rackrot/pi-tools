# @rackrot/pi-memory

Long-term memory for the pi agent: Markdown notes with YAML frontmatter in a git repo that doubles as an
Obsidian vault. The agent searches, reads, writes and archives notes with tools; humans edit the same files.

```bash
pi install npm:@rackrot/pi-memory
```

## Setup

Add to the **global** rackrot config (`<agentDir>/rackrot/config.json(c)`). `memory.root` is read from the global
layer only, so a project config can never redirect where the agent writes. Other keys may also be set in
`<cwd>/.pi/rackrot.json(c)`.

```json
{
	"memory": {
		"root": "~/Vault",
		"agentDir": "Agent",
		"projects": "Projects",
		"autoInject": true,
		"commitIntervalMinutes": 5,
		"push": "session",
		"injectBudgetChars": 12000,
		"summary": { "model": "anthropic/claude-haiku-5-5", "minChanges": 3, "timeoutSeconds": 60 },
		"embedding": { "provider": "onnx", "model": "Xenova/bge-small-en-v1.5" }
	}
}
```

`project` overrides the project slug. `embedding` and optional `reranker` fall back to `skillIndex.embedding` and
`skillIndex.reranker`, then to the default onnx model; `{"provider": "none"}` turns vectors off (BM25 only).
`/rackrot-config memory` edits the scalars. Without `memory.root` the package does nothing except offer `/memory-init`.

Run `/memory-init` once: it offers `git init` when the root is not a repo, appends missing lines (never rewriting
existing ones) to `.gitignore` and `.gitattributes`, and creates the agent folder.

## Layout

```
<root>/<agentDir>/                      global agent notes
<root>/<agentDir>/archive/              archived notes (read-only)
<root>/<agentDir>/<projects>/<slug>/    Overview.md, Decisions/, Log/, Handoffs/
```

The slug is the repo name from the `origin` remote, else the git top-level folder, else the cwd folder. Overview.md
records the remote; if a different remote already owns that slug, `<org>-<repo>` is used. Local paths are never
stored, so project notes work across machines. Notes have `type`, `created`, `updated`, `source`, and optionally
`pin`, `status` (handoffs) and `confidence`.

## Tools

`memory_search` (project, global, vault or all; BM25 plus vectors, optional reranker), `memory_read`, `memory_write`,
`memory_archive`, `memory_sync`. `memory_write`:

- refuses to create a note whose title and body are at least 60% word-similar (Jaccard) to an existing one in the same folder;
- refuses to update a note that was not read in this session, or whose file changed since it was read;
- refuses bodies that look like secrets (AWS keys, GitHub tokens, private keys, `sk-` keys, `password|secret|token = ...`);
- only writes under `<agentDir>/`.

Search indexes every `.md` under the root (not `.obsidian`, `.git`, `.trash`, `node_modules`, or the archive) in an
SQLite database at `<agentDir of pi>/rackrot/memory/index.db`, outside the vault. Embeddings are built in the
background; if they fail, search falls back to BM25 and says so.

Each project's `Overview.md` ends with an auto-generated note index between `<!-- memory:index:start -->` and `<!-- memory:index:end -->` (Decisions, Log newest first, Handoffs, other; summary from frontmatter `summary` or the first body line). It is rebuilt without an LLM after every project `memory_write` and `memory_archive` (which also bumps the frontmatter counter `summary-changes`), and nothing outside the markers is touched.

## Summary worker

The prose above the markers is kept up to date by a one-shot, tool-less model call (`callModel` from `@rackrot/pi-core/model-call`, the same mechanism as pi-council). At session end, before the final commit, if the project has at least `summary.minChanges` (default 3) note writes/archives since the last summary, the worker sends the current prose, the note list and the bodies of notes changed since `summarized` (1500 chars each, 12000 total) and replaces the prose, keeping the marker block and frontmatter, resetting `summary-changes` and setting `summarized`. Output is dropped if empty, over ~3000 characters, containing the markers, or matching the secret scan; it is also skipped when a human edited `Overview.md` since the session last saw it or while the call ran. Any failure (timeout, auth, model) is reported and never blocks the final commit or push. A lone Overview commit reads `refresh summary`.

Config under `memory.summary` (either layer): `model` (`provider/id` or `{model, thinking}`; **no default** — unset skips the worker, and the session's own model is never used, to avoid surprise cost), `enabled` (default true), `minChanges` (3), `timeoutSeconds` (60). `/memory-summarize` runs it now for the current project, ignoring `minChanges` and `enabled`. At most one call per project per session.

With `autoInject`, each turn's system prompt gets the project Overview (skipped while it has no prose and no notes; the index is cut first when over budget), open handoffs and pinned notes, cut to
`injectBudgetChars`. Compaction is not touched; because the section is rebuilt every turn it survives it.

## Git

All git runs through `git -C <root>` without a shell. Only the files the agent wrote are staged (`git add -- <paths>`,
never `-A`), so your uncommitted work in the vault is never swept into agent commits. Commits are
`memory(<slug|global>): add X; update Y; archive Z`, made every `commitIntervalMinutes` (0 = only at session end). At session start and end:
`pull --rebase --autostash`; at the end, push when `push` is `session`. Never force. A pull conflict aborts the
rebase, notifies you and disables auto-commit and push for the session; a push failure does the same. Git work is
serialised with `<root>/.git/pi-memory.lock`. A root that is not a git repo still works, without versioning.

## Existing Obsidian vault

Point `root` at it. The agent can search and read all of it but writes only under `<agentDir>/`; `.obsidian/` is never
created or modified, and pi's built-in `write`/`edit` are blocked for `.git`, `.obsidian` and the archive.
Shell commands and `apply_patch` are not inspected.

## Limits

- Notes are never deleted; archive only moves them.
- Duplicate detection is lexical, not semantic.
- Markdown only; attachments are ignored.
- Concurrent sessions on one vault serialise on the lock but can still produce rebase conflicts.
