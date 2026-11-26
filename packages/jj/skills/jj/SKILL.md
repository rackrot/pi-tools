---
name: jj
description: Works in Jujutsu (jj) repositories, covering the working-copy-as-commit model, describing, splitting and squashing changes, bookmarks, pushing, conflicts, and undo via the operation log. Use when a repository has a .jj directory, or the user mentions jj, Jujutsu, change IDs or bookmarks, instead of using git commands.
---

# Jujutsu (jj)

Written for jj 0.30 or newer, checked on 0.47. When a command here errors on an older version, run `jj help <command>`; that always matches the installed binary. Topics not covered here: `jj help -k revsets`, `jj help -k templates`, `jj help -k filesets`.

## Mental model

- **`@` is the working copy and it is a commit.** Edits to files go into `@` automatically; there is no staging area and no `git add`. Most jj commands snapshot the working copy first.
- **Change IDs are stable, commit IDs are not.** Rewriting a change keeps its change ID and gives it a new commit ID. Refer to changes by change ID (or `@`, `@-`) in follow-up commands.
- **"Committing" is naming plus moving on:** `jj describe -m "msg"` names `@`; `jj new` starts a fresh empty change on top. `jj commit -m "msg"` does both.
- **Bookmarks are not branches.** They are named pointers, they do not follow `@`, and they only move when you move them. Git branches show up as bookmarks.
- **Conflicts are data, not a stopped state.** A rebase or squash can succeed and leave a conflicted commit. Nothing is half-done.
- **Every operation is recorded.** `jj op log` lists them and any can be undone.

## Never block on an editor

The bash tool has no terminal. Always give the message and the paths up front:

- `jj describe -m "msg"`, `jj commit -m "msg"`, `jj new -m "msg"`, `jj squash -m "msg"` (or `jj squash --use-destination-message`).
- Split by path with a message: `jj split -m "msg" path1 path2`. Without paths it opens a TUI.
- Do not run `jj squash -i`, `jj split -i`, `jj diffedit` or `jj resolve` without a configured non-interactive tool; they need a terminal. Resolve conflicts by editing the files (see [conflicts](references/conflicts.md)).
- The environment sets `JJ_EDITOR=false`, so a forgotten `-m` fails fast instead of hanging; add `-m` and rerun.
- Run jj commands one after another, not in parallel.

## Everyday workflow

| Goal                                      | Command                                                                                              |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| See state                                 | `jj st`, `jj log` (default is a useful local view), `jj diff` (`-r <rev>`, `--git` for patch format) |
| Name the current change                   | `jj describe -m "msg"`                                                                               |
| Finish this change, start the next        | `jj new -m "msg"` (message optional)                                                                 |
| Commit tracked work in one step           | `jj commit -m "msg"`                                                                                 |
| Fold `@` into its parent                  | `jj squash` (`-m`, or paths to move only some files)                                                 |
| Move hunks into the right earlier commits | `jj absorb`                                                                                          |
| Split one change in two                   | `jj split -m "first part" path1 ...`                                                                 |
| Drop a change                             | `jj abandon <rev>`                                                                                   |
| Edit an earlier change                    | `jj new <rev>` then edit then `jj squash`, or `jj edit <rev>` (descendants rebase automatically)     |
| Rebase                                    | `jj rebase -b @ -o main` (`-r` for one change, `-s` for a subtree)                                   |
| Stop tracking a file                      | add it to `.gitignore`, then `jj file untrack <path>`                                                |

New files are tracked automatically, so run `jj st` before `describe` or `commit` when build output or logs may have landed in `@`.

## Bookmarks, fetch and push

- `jj bookmark create <name> -r <rev>`, `jj bookmark set <name> -r <rev>` (move, may create), `jj bookmark move --from <rev> --to <rev>`, `jj bookmark list`.
- `jj git fetch`, then `jj rebase -b @ -o <trunk-bookmark>` to update.
- `jj git push -b <bookmark>` pushes one bookmark. Pushing publishes work; a local undo cannot retract it.
- **Ask the user before** `jj git push`, `--ignore-immutable`, `jj op restore`, `jj op abandon` and `jj util gc`.
- Immutable commits (usually trunk and anything pushed to it) refuse rewrites. Rebase your work onto them instead of rewriting them.

## Mistakes and recovery

1. Read the history first: `jj op log`. A failed rewrite is not always the latest operation.
2. `jj undo` reverts the last operation. For anything older, `jj op restore <op-id>` returns the whole repo to that point. Both are recorded as new operations, so they can be undone too.
3. `jj evolog -r <change>` shows how one change got to its current content.
4. After any rewrite (rebase, squash, absorb, abandon), check for conflicts in your own stack: `jj log -r 'conflicts() & ::@'`.

## Git in a jj repo

Use jj for everything that writes. In a colocated repo (`.git` next to `.jj`) a `git commit` or `git checkout` works but muddles history (`@` ends up as a child of a commit jj didn't create, and bookmarks move). Read-only git (`git log`, `git blame`) is fine. See [git interop](references/git-interop.md) for the command mapping.
