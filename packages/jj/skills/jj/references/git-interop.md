# Git to jj

| git                                  | jj                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `git status`                         | `jj st`                                                                  |
| `git diff`                           | `jj diff` (working copy), `jj diff -r <rev>`                             |
| `git log`                            | `jj log`, `jj log -r '::@'`                                              |
| `git add` + `git commit -m`          | nothing to add; `jj commit -m` (or `jj describe -m` then `jj new`)       |
| `git commit --amend`                 | edit files, they land in `@`; `jj describe -m` to reword                 |
| `git checkout <rev>` / `git switch`  | `jj new <rev>` (start work on top), `jj edit <rev>` (modify that change) |
| `git checkout -b x`                  | `jj new` then `jj bookmark create x`                                     |
| `git branch`                         | `jj bookmark list`                                                       |
| `git stash`                          | not needed: `jj new @-` leaves the work in the old change                |
| `git reset --hard` / `git restore .` | `jj restore` (files), `jj abandon @` (the change)                        |
| `git rebase main`                    | `jj rebase -b @ -o main`                                                 |
| `git rebase -i`                      | `jj squash`, `jj split -m ... <paths>`, `jj rebase -r`, `jj abandon`     |
| `git cherry-pick <c>`                | `jj duplicate <c> -o @`                                                  |
| `git revert <c>`                     | `jj revert -r <c> -o @`                                                  |
| `git fetch`                          | `jj git fetch`                                                           |
| `git push origin x`                  | `jj git push -b x` (ask first)                                           |
| `git reflog`                         | `jj op log`                                                              |

Colocated repos keep `.git` in sync with jj on every jj command. The reverse also works, but git commands that write there are what muddles history (see SKILL.md, Git in a jj repo). In a non-colocated jj repo `.git` is not at the repo root; a `git` command may find a different repository or none.

Verify a mapping you are unsure of with `jj help <command>` before running it.
