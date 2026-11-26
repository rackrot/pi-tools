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

Five outcome cases in `evals/jj`: commit, split, resolve a conflict, set work aside, recover an abandoned change.

```bash
cd packages/skill-evals
PATH=$(dirname $(mise which jj)):$PATH node src/cli.ts ../jj/evals --skills-dir ../jj/skills \
  --runs 3 --scaffold --allow-tools Bash,Write,Edit            # skill vs no skill
# add `--ablation none -e ../jj/src/index.ts` to run with the extension (hint, env, guard)
```

Real model calls. The `PATH` prefix is needed because the runner gives the scaffold a throwaway `HOME`, which hides mise shims.

Last results (one model, 3 runs): the skill lifts `set-aside-work` from 0.50 to 1.00 and `commit-without-git` from 0.83 to 1.00; the other three score 1.00 either way, so they guard against regressions rather than prove the skill. With the extension all five score 1.00. The no-skill arm cannot load the extension, because it would contribute the skill itself.

> Published with `pnpm publish` so the `workspace:` dependency ranges resolve to real versions; earlier releases were not installable from npm.
