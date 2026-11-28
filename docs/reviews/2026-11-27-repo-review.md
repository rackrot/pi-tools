# Repo review — 2026-11-27

Scope: whole repo at `96a83ab` (local `main`; `origin/main` is 3 release-only commits ahead).
All non-skill source was read (about 7,000 lines in `packages/*/src`). The 170 skills and 15
workflow scripts were checked structurally, not read line by line. No source was changed.

## Status

Fixed in the working tree after this review: H1–H5, M1–M7 and M9–M12. M8 is an accepted, documented
risk. The low items, missing features and the remaining tests in the table are open.

## Health snapshot

| Check                       | Result                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm lint` (biome)         | pass, 145 files                                                                             |
| `pnpm typecheck` (tsc)      | pass                                                                                        |
| `pnpm -r --if-present test` | pass: 118 tests in 11 packages, 0 failures                                                  |
| `pnpm audit`                | no known vulnerabilities                                                                    |
| `pnpm outdated -r`          | pi framework 1.6.0 → 1.7.0 (dev), `yaml` patch, TypeScript 5.9 → 7.0, `@types/node` 22 → 26 |
| `gitleaks detect`           | **1 finding** (synthetic AWS key in a test, see M9)                                         |
| Release state               | npm versions match `origin/main`; one release PR open (pi-agents 0.5.0)                     |
| TODO/FIXME in `src`         | none                                                                                        |

Overall: small, readable modules, pure logic separated from pi wiring, consistent config layering
through `pi-core`, and tests that target real behavior (git repos on disk, SQLite, JSONC edits).
The main risks are in three places: the jj guard is easy to bypass, model-alias failover
misclassifies errors, and the memory package trusts the project config layer and loses track of
uncommitted notes.

Severity: **H** likely to bite in normal use or weakens a safety guard, **M** real but narrower,
**L** polish. "Verified" means I reproduced it with a script; otherwise it is from reading the code.

## High

### H1. jj guard misses multi-line and compound commands (verified)

`packages/jj/src/guard.ts:70` splits on shell operators only. `shell-quote` treats a newline as
whitespace, so a second line is read as arguments of the first command.

| Command                                                                      | Verdict | Expected               |
| ---------------------------------------------------------------------------- | ------- | ---------------------- |
| `jj st\njj git push`                                                         | allow   | confirm                |
| `jj log\ngit commit -m x`                                                    | allow   | block (nudge)          |
| `if true; then git commit -m x; fi`                                          | allow   | block                  |
| `{ git status; }`, `! git diff --quiet`                                      | allow   | block                  |
| `sudo git push`, `timeout 5 git status`, `nice jj git push`, `xargs git add` | allow   | block / confirm        |
| `` echo `git push` ``, `eval 'git commit'`                                   | allow   | block                  |
| `jj describe -m '--ignore-working-copy'`                                     | block   | allow (false positive) |

Agents send multi-line bash all the time, so the `jj git push` confirmation is not dependable.
Fix: split the line on unquoted newlines before parsing, skip shell keywords (`then`, `do`, `else`,
`{`, `!`), extend `WRAPPERS` (`guard.ts:8`) with `sudo`, `nice`, `timeout`, `xargs`, and only read
flags that appear before `--` or outside `-m` values. `test/guard.test.ts` has no multi-line case.

### H2. model-aliases treats ordinary rate limits and context overflow as "out of usage" (verified)

`USAGE_LIMIT` in `packages/model-aliases/src/select.ts:6` matches:

- `429 Rate limit exceeded, retry in 2s` → true
- `Request exceeded the context window limit` → true
- `token limit exceeded for this request` → true

Each match marks the entry exhausted for the full cooldown (60 min, `index.ts:125`) and rewrites the
error into a retryable 429. A transient rate limit therefore burns the primary account for an hour,
and a context overflow is retried on the next account, where it fails the same way and exhausts
that one too. Fix: drop the bare `limit (reached|exceeded)` and `exceeded.{0,40}limit` alternatives,
or exclude `rate limit` / `context` / `token` wording first. The test covers two positives and one
negative only.

### H3. memory: the project config layer can move the agent's write area anywhere in the vault (verified)

`memory.root` is read from the global layer only, but `agentDir`, `projects` and `project` also come
from `.pi/rackrot.json` (`packages/memory/src/config.ts:95`). A checked-in project config with
`"agentDir": "Personal/Journal"` or `"agentDir": "."` passes `folder()` (`config.ts:44`), and
`resolveInVault` (`vault.ts:47`) then allows writes there. With `"."` the whole vault is writable,
including `.obsidian`. This contradicts the stated rule that writes stay under `Agent/`.
Fix: read `agentDir` and `projects` from the global layer only, and reject `.`.

### H4. memory: notes written but not committed are forgotten after a crash or a sync failure

`GitSync.dirty` (`packages/memory/src/git.ts:132`) is in memory only. If pi is killed before
`session_shutdown`, or `#fail` disables sync for the session (any git error, including a pull
conflict), those paths are never committed by later sessions: nothing re-adopts untracked or
modified files under the agent folder at start. The notes exist on disk but silently drop out of
versioning and never reach other devices. Fix: at `start()`, add the output of
`git status --porcelain -- <agentDir>` to `dirty`.

### H5. Lint is formatting only, and tests are not typechecked (verified)

- `biome.json:23` sets `"preset": "none"`, so no lint rules run. A probe file with `debugger`, `==`,
  `var` and `eval` produced no rule diagnostics. `tsc --noUnusedLocals` finds three unused symbols
  (`core/src/config-ui.ts:10`, `council/src/ui.ts:30`, `memory/src/tools.ts:12`).
- `tsconfig.json:3` includes only `packages/*/src`. Tests and `packages/skills/scripts/import.ts`
  are never typechecked (Node strips types without checking); `agents/test/config.test.ts:67`
  already has a TS2571 error.

Fix: enable biome's recommended rules (or at least correctness and suspicious), and add
`packages/*/test/**/*.ts` to the tsc include.

## Medium

### M1. council: `second_opinion` fails by default when the session runs on a model alias

With no `secondOpinion.model`, the tool falls back to the session model
(`packages/council/src/index.ts:28`), and `callModel` rejects `pi-virtual` models
(`packages/core/src/model-call.ts:52`). Users of `pi-model-aliases` get "is a virtual model" until
they configure a concrete model. The same applies to the synthesizer fallback. Either resolve the
alias to its current target or say so in the tool description and README.

### M2. pi-core pulls about 450 MB of ONNX runtime into every install

`@huggingface/transformers` is a hard dependency of `pi-core` (`packages/core/package.json:33`);
it brings `onnxruntime-node` (288 MB) and `onnxruntime-web` (140 MB). Seven packages depend on core,
but only skill-index and memory use retrieval. The default embedder and reranker are both `onnx`,
so the first `skill_search` also downloads models from Hugging Face with no notice and no timeout.
Options: move `retrieval.ts` to its own package, or make transformers an optional peer and default
the reranker to `none`.

### M3. memory: shutdown can block for minutes

`session_shutdown` (`packages/memory/src/index.ts:283`) runs the summary model call (60 s timeout),
then commit, pull and push, each git call with a 120 s timeout (`git.ts:23`), then waits for
embeddings. On a slow or unreachable remote, quitting pi hangs. Give finalize one overall deadline.

### M4. memory: a failed setup is cached for the whole process

`memory ??= (async …)` (`index.ts:214`) keeps a rejected promise. After one failure (bad root,
SQLite error) every tool call and every `before_agent_start` (`index.ts:241`) throws until pi
restarts. Clear `memory` on rejection.

### M5. memory: prompt injection and index sync scale with vault size

- `buildInjection` reads and YAML-parses every note under the agent folder on every turn
  (`inject.ts:36`).
- `VaultIndex.sync()` walks and stats the whole vault synchronously at session start and on every
  `memory_search` (`index-db.ts:75`), one autocommit per file. A first index of a large Obsidian
  vault blocks the event loop.

Wrap `sync()` in a transaction and build the injection from the index (pinned and open-handoff
rows) instead of the files.

### M6. memory: secret detector rejects ordinary notes (verified)

The "credential assignment" pattern (`note.ts:70`) refuses `token: ${FORGEJO_TOKEN}`,
`const token = process.env.API_TOKEN` and `the secret: use-the-vault-entry-named-x`. Notes about
configuration are a common memory topic. Skip values that are env references or contain no digits
and mixed case, or require a higher-entropy value.

### M7. memory: `pull --rebase --autostash` runs over the user's uncommitted notes

`git.ts:302` stashes and re-applies everything in the vault, including human edits. If re-applying
conflicts, git reports success for the rebase and leaves conflict markers in the user's notes;
`rebase --abort` is only run when the pull itself fails. Medium confidence, not reproduced. Check
`git status` after the pull and report unmerged paths. Related: the lock goes stale after 2 minutes
(`git.ts:91`) while one locked section can run several 120 s git calls.

### M8. Project config can redirect credentials and run commands

`.pi/rackrot.json` is merged over the global config for `forgejoMcp` (`forgejo-mcp/src/config.ts:76`)
and `modelAliasAccounts` (`model-aliases/src/config.ts:23`). A repo can set `host` to its own server
and receive the default `${FORGEJO_TOKEN}`, or set a `!command` token/api key. If pi already gates
project config behind project trust, this is covered; otherwise read `host`, `token` and account
definitions from the global layer only, as memory does for `root`.

### M9. gitleaks is configured but never run, and currently fails

`.gitleaks.toml` exists, but no workflow runs it. A scan flags the synthetic AWS key in
`packages/memory/test/memory.test.ts` (rule `aws-access-token`). Add the file to the allowlist and
run gitleaks in CI.

### M10. mcp-templates: builtin catalog path breaks on spaces and non-ASCII

`catalog.ts:120` passes `builtinFile.pathname` to `readFileSync`. URL pathnames are percent-encoded,
so an install under a path with a space reports the builtin catalog as unreadable. Use
`fileURLToPath`.

### M11. orchestration `strict` is bypassable through tools outside the deny list

`DEFAULT_DENIED` (`agents/src/orchestration/config.ts:12`) names seven built-ins. Tools that reach
the same capabilities stay available: `codemode` (calls `read`/`bash` itself), MCP tools, and
`council`/`second_opinion` `files` (reads any path, `council/src/files.ts:10`). Document `strict` as
guidance plus a default deny list, or switch it to an allow list.

### M12. core: codebase-memory indexing runs unconditionally

`core/src/codebase-memory/index.ts:13` starts the daemon and indexes `cwd` in every session,
subagent sessions included, with no opt-out and no timeout, whatever the directory is (a home
directory, a monorepo). Add a config switch and skip it in subagents.

## Low

- **L1. Three copies of atomic write.** `core/src/json.ts:34`, `agents/src/store.ts:47`,
  `model-aliases/src/state.ts:19`. The latter two can import `writeTextAtomic`. The state file also
  lives at `<agentDir>/model-aliases-state.json` instead of under `rackrot/`.
- **L2. `/cache-ttl` leaks between sessions.** `cache-ttl/index.ts:41` only applies a saved value;
  a session without one inherits the previous session's choice instead of the default.
- **L3. Malformed config is ignored silently.** `readConfig` (`core/src/config.ts:33`) returns `{}`
  on a parse error, so one stray comma disables every package's settings without a message. Notify
  once at session start.
- **L4. `CycleSettingsList` reads private `SettingsList` fields** (`core/src/config-ui.ts:28`) while
  every pi peer range is `*`. A pi-tui refactor breaks it at runtime with no version signal. Set a
  minimum peer range.
- **L5. skill-index.** Embedding failures set `embedFailed` with no message (`index.ts:112`), so
  search degrades to BM25 silently. Project rows are keyed by `cwd`, not the repo root (`index.ts:56`),
  so sessions in two subdirectories keep taking the same rows from each other. `@typesafe-ai/sdk` is
  a hard dependency for a feature that is off by default (`package.json:25`).
- **L6. model-aliases.** Project `modelAliases` replaces the global map wholesale (undocumented).
  State read-modify-write is unlocked across sessions (`state.ts:26`). Thinking levels differ from
  core's list (`off` vs `max`).
- **L7. council.** `files` has no cap on file count and embeds binary files as text. Config key is
  `council.council`.
- **L8. mcp-templates.** `saveAsTemplate` (`install.ts:83`) only detects `${ENV}` references, so a
  server with a literal bearer token is saved as a template verbatim, into the repo with
  `--scope project`. The confirm dialog shows an invalid `--exposure` before it is validated.
- **L9. memory.** `memory_read` truncates at 50,000 characters (`tools.ts:134`) but records the
  full-file hash, so an update can overwrite text the model never saw. Changing a note's `type`
  creates a second file instead of moving the first. `resolveInVault` is lexical and does not
  resolve symlinks.
- **L10. agents.** Frontmatter `lock` is not read from the package's own `agents/` directory
  (`index.ts:23`); the README says "three local dirs", so this is consistent but surprising for
  shipped agents. `blocked` in orchestration (`orchestration/index.ts:33`) is per extension
  instance; if pi-subagents ever shares the instance with children, a child's
  `before_agent_start` would clear the parent's block (low confidence).
- **L11. gitignore.** Non-atomic write; the path guard has no test.
- **L12. skill-evals.** `Case.model` is parsed (`cases.ts:127`) and never used; numeric flags are
  not validated.
- **L13. Skills.** Seven skills still tell the model to use `AskUserQuestion`, which pi does not
  have (`better-auth`, `devils-advocate`, `git-history`, `security-scan`, `test-run`, plus two
  references); pi's tool is `ask_user`. 39 of 170 skills have no eval. Five scripts with a shebang
  are not executable (`handoff/scripts/session_recover.py`, `mcp-server-audit/scripts/mcp_audit.py`,
  `test-gap-audit/scripts/coverage_map.py`, two test fixtures).
- **L14. Engines.** Only memory, skill-index and mcp-templates declare `node >=22.13`; the root and
  the other packages declare nothing, and `node --test *.ts` needs 22.18+.
- **L15. Releases.** New packages release straight to 1.0.0 (memory, mcp-templates) because the
  manifest starts at 0.0.0; set `initial-version` if 0.x is intended. Workflow actions are pinned
  by major tag, not SHA. Stale local `sync/release-please--*` branches are left behind by
  `scripts/sync-release-branches.sh` when run locally.

## Design notes

- **Layering is sound.** Packages depend only on `pi-core`; gitignore, jj and skills stand alone.
  Config parsing is pure and tolerant, writes go through `editConfig`, which keeps comments.
- **Config merge semantics differ per package** with no shared rule: field-by-field (agents,
  skill-index), per-section shallow (council), whole-key replace (model-aliases, orchestration
  `deniedTools`). A short table in the core README would prevent surprises.
- **The trust model of the project layer is undefined.** Memory treats it as untrusted for `root`
  only; other packages treat it as fully trusted (H3, M8). Decide once and apply it in
  `readConfigLayers` (for example a `globalOnly` key list).
- **`pi-core` mixes "always-on behavior" with "heavy shared library"** (M2). Its README says code
  goes there only when two packages need it; retrieval meets that rule but changes the install
  cost of every other package.
- **Peer ranges are all `*`.** There is no compatibility statement against pi versions, while the
  code depends on event shapes (`before_provider_request` payloads, `systemPromptOptions.sections`,
  `registerVirtualModel`) and one private API (L4).

## Missing features worth considering

1. Council and summary worker support for model aliases (M1).
2. Memory crash recovery for uncommitted notes (H4), and a `memory_status` view of dirty paths and
   sync state.
3. A config diagnostics command (`/rackrot-config doctor`): parse errors, unknown keys, values each
   parser dropped. Every parser currently discards invalid fields silently.
4. An opt-out for codebase-memory indexing (M12).
5. Workflows have static tests only. A dry-run harness with stubbed `agent()`/`parallel()` would
   catch control-flow bugs without model calls.
6. A CI job that runs `pi-skill-eval --list` (already covered by a test) and a scheduled small eval
   sample, so skill regressions show up.

## Missing critical tests

Ranked by risk. Each is one small test in the existing `node:test` style.

| #   | Package       | Test                                                                     | Catches                              |
| --- | ------------- | ------------------------------------------------------------------------ | ------------------------------------ |
| 1   | jj            | `classify` on multi-line, `if/then`, `{ }`, `sudo`/`timeout` commands    | H1                                   |
| 2   | model-aliases | `isUsageLimitError` is false for rate-limit and context-overflow wording | H2                                   |
| 3   | memory        | project layer cannot change `agentDir`/`projects`; `.` rejected          | H3                                   |
| 4   | memory        | a note left dirty by a previous `GitSync` is committed by the next one   | H4                                   |
| 5   | memory        | `findSecret` allows env references and prose, still rejects real keys    | M6                                   |
| 6   | gitignore     | `applyUpdate` rejects `../x/.gitignore` and non-`.gitignore` paths       | L11, only write guard in the package |
| 7   | model-aliases | `loadConfig` layer merge and `markExhausted`/`loadState` expiry          | untested persistence                 |
| 8   | core          | `fuse`, `ftsQuery`, `nearestIds` in `retrieval.ts`                       | shared ranking logic, no direct test |
| 9   | council       | `callChain` falls through on timeout and stops on abort                  | fallback chain, untested             |
| 10  | mcp-templates | `saveAsTemplate` round-trip, refusal on existing file                    | untested write path                  |

Existing coverage worth keeping: memory (real git repos, conflict abort, stale-write guard, init
idempotence), agents config/store/lock precedence, council edit rows, thinking-binding, skill-index
scope isolation, the workflow static checks.

Not inspected in depth: skill content (170 skills), workflow script logic (15 files),
`core/src/context/*` rendering, settings UIs beyond reading.

## Suggested order

1. H1, H2: small fixes with tests, both guard against real money or history loss.
2. H3, H4, M4: memory safety before more users install 1.0.0.
3. H5, M9: turn on lint rules, typecheck tests, run gitleaks in CI.
4. M1, M10, L1–L3: cheap correctness fixes.
5. M2: decide where retrieval lives; it is the only change here that affects package boundaries.

## Checks run

```
pnpm lint; pnpm typecheck; pnpm -r --if-present test
pnpm audit; pnpm outdated -r
gitleaks detect --no-banner --redact
python3 packages/skills/skills/test-gap-audit/scripts/coverage_map.py --top 30
tsc --noEmit --noUnusedLocals          # 3 unused symbols
tsc --noEmit … packages/*/test/*.ts    # 1 error
node probes for H1, H2, H3, M6 (temporary scripts in /tmp, removed)
git fetch origin                        # to compare release state; nothing else touched
```
