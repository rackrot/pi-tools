# @rackrot/pi-skill-evals

Runs claude-plugins style skill evals (`prompt.md` + `graders/`) against pi, so the suites carried over
from claude-plugins keep working. Every run is a real model call on your account.

```bash
cd packages/skill-evals
node src/cli.ts ../skills/evals --skills-dir ../skills/skills --list          # free: load and list cases
node src/cli.ts ../skills/evals --skills-dir ../skills/skills \
  --skill doubt-review --runs 1 --ablation none \
  --model alias/claude-haiku -e ../model-aliases/src/index.ts                 # routing check
node src/cli.ts ../skills/evals --skills-dir ../skills/skills \
  --case 'ux-copy/*' --runs 1 --scaffold --allow-tools Write,Edit \
  --model alias/claude-sonnet -e ../model-aliases/src/index.ts                # outcome, with and without the skill
```

`-e` loads an extension into every run; use it for whatever provides your model (here, the alias
provider). `pi-skill-eval --help` lists every option.

## What a run does

- Fresh temp workspace, `pi -p --mode json --no-session --no-extensions --no-skills --no-context-files`.
- **with** arm: only the case's skills are loaded (`--skill <dir>`); **without** arm: none. `--ablation none` runs only the with arm.
- `--all-skills` loads every skill in every run, so routing has competition.
- `--listing title|hidden` loads the skill-index extension with that default mode, to test how well a skill is found when the prompt carries less of it. `description` is pi's default.
- Tools: `read` always, plus `find`/`ls` for Glob and `grep` for Grep. `Bash`, `Write` and `Edit` run only with `--allow-tools`.
- A case stops with an error at `max_turns` assistant turns or `timeout_seconds`.

## Compatibility with claude plugin eval

Same case layout, grader types (`tool_used`, `tool_order`, `regex`, `file_exists`, `llm`), weights, `arm`,
`target`/`focus`, scoring (weighted fraction of graders, mean over runs), `WITH / W/OUT / Δ` table, threshold and
exit codes (0 pass, 1 below threshold, 2 partial, 130 interrupted).

- **Skill fired.** pi has no Skill tool. A `read` of any `<name>/SKILL.md` is recorded as an extra call `Skill` with input `{"skill":"<name>"}`, so the existing `input_match` patterns work unchanged. Tool names map `Read→read`, `Glob→find`, `Grep→grep`, `Bash→bash`, `Write→write`, `Edit→edit`. Inputs differ (pi uses `path`, not `file_path`), so an `input_match` on a Read path may need editing.
- **Suites.** Cases under `evals/<skill>/<case>/`; cross-skill cases under `evals/_suites/` need a `plugins:` list (directory basenames name the skills).
- **Judge.** `llm` graders take three votes from `pi --no-tools` and the majority wins. Use `--judge-model` to pin a stronger judge than the agent.
- The case's `model:` (a Claude Code id) is ignored; `--model` decides.

## Not carried over

- No `baseline` grader, MCP mocks, `history_file`, `add_dirs` or `env`; a case using them reports an unsupported grader or runs without that context.
- No HTML report or cost estimate beyond provider usage; output is the table, `aggregate-result.json` and one raw event log per run under `results/`.
- **No sandbox.** With `--allow-tools Bash`, commands run as you in the temp workspace. Read a case's `scaffold.sh` and graders before passing `--scaffold` or `--allow-tools`.
- Runs are not isolated from your pi agent directory: auth and model settings are read from `~/.pi/agent`.

## Reading results

A positive trigger case scoring 0 means the model did not read the skill. A case scoring the same with and
without the skill (`Δ` near 0) means the skill added nothing for that task; `--ablation none` suits routing
cases, where the no-skill arm means nothing.
