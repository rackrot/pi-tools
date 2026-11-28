# @rackrot/pi-memory

Long-term memory for the pi agent: Markdown notes with YAML frontmatter in a git repo that doubles as an
Obsidian vault. The agent searches, reads, writes and archives notes with tools; humans edit the same files.

## Setup

### 1. Install

```bash
pi install npm:@rackrot/pi-memory
```

### 2. Choose a root

`memory.root` is the directory the agent searches and (under `<agentDir>/`) writes. Pick one of three cases.

**A new, dedicated vault.** Any empty directory, e.g. `~/Vault`. `/memory-init` creates the git repo and the agent folder. Open it in Obsidian later if you like.

**An existing Obsidian vault**, e.g. `~/Documents/Obsidian/MyVault`.

- The agent can search and read every `.md` in it (not `.obsidian`, `.git`, `.trash`, `node_modules`, or the archive).
- It writes only under `<root>/Agent/` (the `agentDir`). `.obsidian/` is never created or modified, and pi's built-in `write`/`edit` are blocked for `.git`, `.obsidian` and the archive. Shell commands are not inspected.
- In Obsidian you will see an `Agent/` folder. Its notes are normal Markdown with frontmatter and `[[links]]`, so graph view and Dataview queries work on them.
- You and the agent edit the same files. The agent only stages the paths it wrote (never `git add -A`), so your uncommitted edits are never swept into its commits. If you change a note the agent has read, its next write to it is refused until it re-reads it (the stale-write guard).

**A parent folder of several vaults**, e.g. `~/Documents/Obsidian`. This works, but `Agent/` is created at the parent, outside every vault, and the whole tree is indexed. `/memory-init` warns about this; usually it is better to point `root` at one vault.

### 3. Configure

`memory.root`, `agentDir` and `projects` are read from the **global** config only (a project config can never redirect where the agent writes); `~` is expanded. The file is `<agentDir>/rackrot/config.json` (or `.jsonc`), where `<agentDir>` is pi's agent dir (`~/.pi/agent`). Create it with `/rackrot-init` or edit it with `/rackrot-config memory`. All other keys may also go in `<cwd>/.pi/rackrot.json(c)`; the project layer wins.

```jsonc
{
	"memory": {
		"root": "~/Documents/Obsidian/MyVault", // required, global config only
		"agentDir": "Agent", // folder under root the agent writes to; global config only
		"projects": "Projects", // folder under agentDir, one subfolder per project; global config only
		"project": "my-app", // optional: override the slug derived from the git remote
		"autoInject": true, // add overview, open handoffs and pinned notes to the system prompt
		"commitIntervalMinutes": 5, // 0 = commit only at session end
		"push": "session", // "session" pushes at session end; "never" keeps it local
		"injectBudgetChars": 12000,
		"embedding": { "provider": "onnx", "model": "Xenova/bge-small-en-v1.5" }, // {"provider": "none"} = BM25 only
		"summary": {
			"model": "anthropic/claude-haiku-5-5", // no default: unset skips the summary worker
			"enabled": true,
			"minChanges": 3,
			"timeoutSeconds": 60
		}
	}
}
```

`embedding` and optional `reranker` fall back to `skillIndex.embedding` / `skillIndex.reranker`, then to the default onnx model. Without `memory.root` the package does nothing except offer `/memory-init`.

### 4. Run `/memory-init`

One command for the whole setup; safe to re-run.

1. `memory.root` unset: prints the config path and a JSON snippet, nothing else.
2. Checks the root: offers to create it if missing, rejects a file. Reports whether it is an existing Obsidian vault (only `Agent/` is written) or a parent of several vaults.
3. Warns when the root sits in iCloud (`Mobile Documents`), Dropbox, OneDrive or Google Drive, where `.git` is known to corrupt. When creating a new repo there it asks whether to keep the git data outside the folder (`git init --separate-git-dir`, stored under `<agentDir>/rackrot/memory/git/`); default is no. An existing `.git` is never moved.
4. Not a git repo: asks, then `git init -b main`. Global git config is never changed.
5. Creates `<agentDir>/` and `<agentDir>/<projects>/`, and appends missing lines to `.gitignore` and `.gitattributes` (existing lines are never rewritten).
6. Commits only `.gitignore` / `.gitattributes` as `memory: initialize agent folder` (explicit paths). Your notes are **not** committed. If git has no `user.name`/`user.email` the commit is skipped and the exact `git config` commands are printed; run `/memory-init` again afterwards.
7. Prints next steps based on the real state (no remote, remote without upstream, or sync active). Re-running on a set-up vault makes no new commit.

### 5. Add a remote and push

Optional; without a remote the agent still commits locally.

```bash
git -C "<root>" remote add origin <url>
git -C "<root>" push -u origin main
```

Create an **empty, private** repo first (Forgejo, GitHub, ...): vault notes are private data. Review `git status` and commit the notes you want in the repo yourself before the first push, since init does not. Once the branch has an upstream, the agent pushes at session end (`push: "session"`). If the root is in a synced folder, see the warning above and do not put `.git` there.

### 6. Several devices

On each device clone the repo, set `memory.root` to the clone, and run `/memory-init`. At session start the agent runs `git pull --rebase --autostash` (needs an upstream), and again at session end before pushing. On a conflict the rebase is aborted, you are notified, and auto-commit and push are disabled for that session. Resolve it by hand in the vault (`git pull --rebase`, fix, `git push`); the next session syncs again. Pushes are never forced.

### 7. Obsidian git plugin and mobile

Don't run obsidian-git's auto-commit/auto-push on the same device while the agent's commit timer is active, unless you accept that both of them commit and pull in the same repo (they serialise only on the agent's own lock). On mobile, sync through whatever you already use; the agent only needs the files and, on desktop, the git repo.

### 8. Troubleshooting

| Symptom                                           | Cause / fix                                                                                                                                  |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Nothing happens, only `/memory-init` exists       | `memory.root` is unset in the global config. Run `/memory-init` for the exact steps.                                                         |
| "is not a git repo; notes are not versioned"      | Run `/memory-init`, or `git init` yourself. Notes still work without versioning.                                                             |
| "git sync disabled for this session" after a push | Push rejected (no upstream, remote ahead, auth). Fix in the vault with `git pull --rebase` / `git push -u origin main`; restart the session. |
| First search is slow, or downloads files          | The onnx embedding model downloads on first use. Set `embedding.provider` to `none` to skip it.                                              |
| Search says it fell back to BM25                  | Embeddings failed or are off (`provider: none`); results are keyword-only. Check the embedding config and network.                           |
| `memory_write` refuses to update a note           | It was not read in this session, or the file changed since it was read. `memory_read` it again, then write.                                  |

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

The paths a session wrote are also listed in `<root>/.git/pi-memory-dirty-*.json` until they are committed. If pi
is killed, or sync was disabled, the next session commits them at start. When the pull re-applies your own
uncommitted edits and they conflict with what came in, git leaves conflict markers in those files: you are told
which files, sync stops for the session, and your edits are also kept in `git stash list`. At session end the
summary worker, final sync and embeddings get 30 seconds in total; what is left is committed by the next session.

## Limits

- Notes are never deleted; archive only moves them.
- Duplicate detection is lexical, not semantic.
- Markdown only; attachments are ignored.
- Concurrent sessions on one vault serialise on the lock but can still produce rebase conflicts.
