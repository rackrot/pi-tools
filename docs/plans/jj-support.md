# Plan: @rackrot/pi-jj — native Jujutsu support (single package)

Everything lives in `packages/jj` (skill, extension, evals). Layout follows packages/gitignore (extension) and packages/skills (skill dir).

packages/jj/
package.json pi.extensions ["./src/index.ts"], pi.skills ["./skills"]; peer deps like gitignore
skills/jj/SKILL.md + references/{revsets,templates,conflicts,git-interop}.md (single source of jj facts)
src/index.ts wiring: session_start, before_agent_start, tool_call, setStatus
src/detect.ts find `.jj` walking up from a cwd; memoised
src/guard.ts pure classifier: argv-parsed bash command -> allow | block(reason) | confirm(reason)
src/status.ts `jj log -r @ --no-graph --ignore-working-copy -T <template>` -> "change-id bookmark ⚠conflict"
evals/jj/<case>/{prompt.md,graders/} same layout as packages/skills/evals, run by packages/skill-evals
test/guard.test.ts table-driven classifier test (node --test)

## 1. Skill (SKILL.md)

Mental model (@ = working-copy commit, no index, every command snapshots, change IDs vs commit IDs, bookmarks not branches and don't follow @, first-class conflicts, immutable commits). Non-interactive rules (always -m on describe/commit/new/squash; --no-pager --color=never; never split / squash -i / resolve / diffedit without tool+fileset; sequential commands). Colocated rule (no mutating git). Workflow (jj st, diff, describe -m, new, bookmark set, git push). Check conflicts() after rewrites; jj st before describe/new (auto-tracked artifacts). Recovery: jj undo, jj op log + op restore <id>. --ignore-working-copy only for orientation reads, never right after edits. Ask user before push / --ignore-immutable / --all. Min jj version stated. Exposure: skill-index level so it is listed in jj repos.

## 2. System-prompt injection (before_agent_start)

If detect(cwd) finds .jj: append a 3-5 line section to the system prompt ("This repo uses jj. Use jj, not git, for VCS writes. Always -m, no interactive commands. See skill jj."), and ensure the jj skill stays in opts.skills. No jj repo => nothing injected, skill unlisted (token cost zero in git repos). Detection walks up from ctx.cwd (re-evaluated per turn; cheap stat walk).

## 3. Guard (tool_call on bash)

Tokenise the command (shell-quote-style, split on && || ; |), find git / jj invocations, skip global flags (-C, -R, --config...), classify subcommand:

- jj repo + mutating git (commit, add, checkout, switch, reset, stash, rebase, merge, cherry-pick, restore, clean, branch -d/-D/-m, push...) -> block with jj equivalent in reason. Read-only git (status, log, diff, show, blame, ls-files) allowed.
- jj commands that open an editor/TUI without non-interactive flags (describe/commit/new/squash without -m; split, resolve, diffedit, squash -i, config edit) -> block with the non-interactive form.
- jj git push, --ignore-immutable, op restore/abandon big ranges -> confirm via ctx.ui.confirm (block if no UI).
  Advisory seatbelt, not a security boundary (documented). Setting `jj.guard`: "block" | "warn" | "off", default block. Unparseable command => allow.

## 4. Footer/status

session_start + after each bash tool_result + turn_end: if jj repo and ctx.hasUI, ctx.ui.setStatus("jj", "<change-id-short> <bookmarks> ⚠ if conflict"); clear otherwise. Uses --ignore-working-copy so it never snapshots or adds ops. Debounced; errors swallowed to undefined (jj missing).

## 5. Evals (packages/jj/evals, run via packages/skill-evals with --skills-dir packages/jj/skills --allow-tools Bash --scaffold)

Scaffold creates a tmp colocated jj repo. Cases: (a) "commit my change" -> graders: bash called with `jj describe -m|jj commit -m`, regex NOT `git commit`; (b) split a two-file change into two changes non-interactively -> no `jj split` w/o fileset, no hang; (c) undo a bad `jj rebase` via op restore/undo; (d) push request -> asks before `jj git push`. Cases need jj installed; pin jj in mise.toml (dev only).

## 6. Tests (few)

test/guard.test.ts table: ~20 (command, isJjRepo) -> verdict rows covering colocated git mutation, read-only git allowed, chained `cd x && git commit`, `git -C`, jj describe w/o -m, push confirm. One integration check of status.ts against a real jj tmp repo, skipped if jj absent.

## Revisions after second_opinion + council (verified against jj 0.47.1 and pi 1.6.1 docs)

Verified:

- No tty: `jj split`/`squash -i`/`diffedit` (builtin TUI) exit rc=3 fast (emit terminal escape junk, no hang). `resolve` with no conflicts: rc=2. The only real hang is the description editor; `JJ_EDITOR=false` makes describe/commit/squash/split fail fast. `jj split -m msg <fileset>` and `jj commit -m` work non-interactively.
- pi: `tool_call` input is mutable -> per-call env via prefixing bash `command` with `export JJ_EDITOR=false GIT_TERMINAL_PROMPT=0;` (no process.env leak, jj repos only). `resources_discover` can return `skillPaths` conditionally -> skill is NOT in package.json `pi.skills`; it is contributed only when `.jj` is detected. `before_agent_start` `systemPromptOptions.sections` is the cache-friendly injection point. `tool_result` and `turn_end` events exist. `ctx.hasUI` gates confirm; no UI => block with reason.
  Changes to the plan:
- Drop guard rules for describe/commit/squash without -m (env var covers; squash rule misfires). Drop resolve/diffedit/-i blocking as hang-prevention; keep a short advisory message only if evals show agents wasting turns.
- Guard scope: (1) hard-block destructive git verbs only (reset --hard, checkout -- ., restore, clean, stash, rebase -i) when target repo is colocated (.jj and .git at root); other mutating git (commit/add/...) -> warn via reason in a non-blocking notify (hygiene, not loss); (2) confirm (auto-deny without UI) for `jj git push`, `--ignore-immutable`, `op restore`, `op abandon`, `util gc`, `workspace forget`. Block --ignore-working-copy on mutating jj commands. Env-prefixed/-C/cd/bash -c => resolve what we can, else allow. One setting `jj.guard`: on (default) | off. Policy lives in one table in guard.ts; skill refers to it, doesn't restate.
- Skill fixes: snapshot happens on most commands except --ignore-working-copy; `jj st` when state uncertain, not ritual; `jj op log` before undo/restore; push can't be undone locally; colocated `git commit` = hazard not loss; check `conflicts() & ::@`; no --ignore-working-copy advice, no per-command --no-pager (tty-less is auto). References: only conflicts.md + git-interop.md; point to `jj help -k <topic>` for the rest.
- Startup check: `jj --version` once; if missing/too old, skip injection, guard, status.
- Footer: session_start + one debounced refresh after `tool_result` of a bash call that mentions jj/git, plus turn_end; 2s timeout; clear on failure/shutdown; staleness documented.
- Package: `files` = src, skills, README (exclude evals, test). One scaffold helper (tmp colocated repo, isolated JJ_CONFIG + git identity) shared by test and evals; pin jj via mise in CI.
- Evals: commit-without-git, non-interactive split, conflict resolve (replaces undo-bad-rebase), push-asks (graded on bash trace; guard decision itself is covered by the unit test).

## Guard v2: block-once nudge for git (supersedes the git part of "Guard scope" above)

- In a jj repo (any `.jj` found walking up from ctx.cwd; colocation no longer matters), any bash command that invokes `git` (found by tokenising on && || ; | and skipping `env`/`command`/VAR=x prefixes) is blocked the FIRST time with: "This is a jj repo. Use jj (see skill jj) instead of git. If you really need this exact git command, send it again."
- State: per-session `Set<string>` of normalised command strings (trimmed, whitespace-collapsed). Same command again => allowed (and stays allowed). Cleared on session_start/session_shutdown. No persistence, no setting beyond `jj.guard` on|off.
- Applies to read-only git too (status/log/diff cost one retry turn). Open choice: exempt read-only verbs to save the turn; default = block all, as requested.
- Tradeoff: destructive git (reset --hard, clean) is no longer hard-blocked; the retry gate is one deliberate re-send. Acceptable because the nudge is about steering, not safety.
- Unchanged: jj-side confirms (push, --ignore-immutable, op restore/abandon, util gc, workspace forget; auto-deny without UI) and --ignore-working-copy-on-mutating block. Table test covers: first git blocked, identical repeat allowed, different git command blocked again, chained `cd x && git commit`, `env GIT_X=1 git ...`, non-jj repo untouched.

## Phasing (revised)

P1 detect + version check + env prefix + injection + skill (conditional via resources_discover) + 2 evals (commit, split).
P2 guard + table test + conflict/push evals.
P3 footer (cuttable).
