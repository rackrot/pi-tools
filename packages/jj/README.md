# @rackrot/pi-jj

Native [Jujutsu](https://www.jj-vcs.dev/latest/) support for pi. Needs `jj` 0.30+ on `PATH`; without it the package does nothing.

In a directory with a `.jj` ancestor:

- **Skill `jj`** is contributed (it is not loaded in git-only repos).
- **System prompt** gets a short hint to use jj instead of git and never open an editor.
- **Bash calls** run with `JJ_EDITOR=false GIT_TERMINAL_PROMPT=0` so a missing `-m` fails instead of hanging.

- **Git nudge:** the first time a `git` command is sent (also behind `&&`, `env`, `bash -c`), it is blocked with a reminder to use jj. Sending the identical command again lets it through. State resets each session.
- **Confirmations:** `jj git push`, `op restore`, `op abandon`, `util gc`, `workspace forget` and `--ignore-immutable` ask the user first (blocked when there is no UI). `--ignore-working-copy` on a mutating jj command is blocked.

- **Footer status:** `<change-id> [bookmarks] [⚠conflict]` for `@`, refreshed on session start, turn end and after bash calls that mention jj or git. It reads with `--ignore-working-copy` (no snapshot, no operation), so edits since the last jj command are not shown yet.

## Evals

```bash
cd packages/skill-evals
PATH=$(dirname $(mise which jj)):$PATH node src/cli.ts ../jj/evals --skills-dir ../jj/skills \
  --runs 1 --ablation none --scaffold --allow-tools Bash -e ../jj/src/index.ts
```

Real model calls. The `PATH` prefix is needed because the runner gives the scaffold a throwaway `HOME`, which hides mise shims.
