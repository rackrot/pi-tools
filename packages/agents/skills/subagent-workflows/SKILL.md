---

name: subagent-workflows
description: 'Runs, writes, saves and packages pi-subagents SubagentWorkflow scripts, and covers the workflows shipped with @rackrot/pi-agents (review-panel, gated-fix, audit-fanout, plan-slice-implement, config-rollout, pr-merge-queue). Use when work needs many subagents whose number is found at runtime, staged pipelines, or findings verified before reporting; when authoring or editing a workflow .js file; or when adding a workflow to this package. Not for one delegated task or a few named agents (use the Agent tool). Applies only when the SubagentWorkflow tool is available.'
---

# Subagent workflows

A workflow is a JavaScript script that spawns and coordinates subagents: fan out over a list found at runtime, push each item through stages, verify before believing. Each `agent()` call is a real subagent. The script itself has no filesystem or network.

Use the `Agent` tool for one task, or a few you can name up front. Use a workflow when the agent count depends on something discovered, work flows through stages, or findings need independent verification. Each agent costs a subprocess, so do not dress one task up as a workflow. Only run one when the user asked for it or the task clearly fits; this skill does not authorize a run.

## Shipped workflows

Installed with `@rackrot/pi-agents` (`packages/agents/workflows/`). Run one by name with `args`.

| Name                   | Does                                                                                                                                                                                           | `args`                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `review-panel`         | `reviewer`, `security-auditor` and `test-runner` review in parallel; one agent reconciles                                                                                                      | `scope`, `spec`                                                                     |
| `gated-fix`            | Fix agent behind a shell `gate`; one resumed retry; `test-runner` re-checks                                                                                                                    | `task`, `check`                                                                     |
| `audit-fanout`         | `Explore` lists files, `security-auditor` audits each, a refuter checks each finding                                                                                                           | `root`, `focus`, `max`                                                              |
| `plan-slice-implement` | Plan file to slices in dependency waves; each slice in a worktree behind `gateCmd`, reviewed, merged serially with the gate rerun and a revert on failure; plan Status updated, nothing pushed | `planPath`, `gateCmd`, `max`                                                        |
| `config-rollout`       | Per repo: branch, edit, validate with `validateCmd` inside the repo (one resumed retry), review the diff; optional push and PR                                                                 | `instruction`, `validateCmd`, `repos` or `root`+`filter`, `branch`, `openPr`, `max` |
| `pr-merge-queue`       | Parallel read-only check of each open PR (CI, conflicts, risk), then serial merge lowest risk first with a re-check before each; report only unless `merge: true`                              | `merge`, `repo`, `filter`, `method`, `maxRounds`                                    |

Every shipped workflow also takes `model` and `effort` (apply to every agent) and `agents` (per agent type or label, e.g. `{"reviewer": {"model": "provider/id", "effort": "high"}}`). Unset means inherit. The agents extension also fills `agents` from the user's `agentOverrides` when it loads, so a configured `reviewer` model applies without being passed; anything in `args` wins.

`plan-slice-implement` isolates the session's own repo, so run it from the repo the plan is for, with the plan and its dependencies committed (worktree agents see only committed files) and a clean tree. `config-rollout` cannot use worktrees because its repos are other checkouts; it refuses dirty repos. Both ask for the gate command instead of guessing one.

Call `SubagentWorkflow` with `{name: "review-panel", args: {scope: "git diff main...HEAD"}}`. Pass `args` as a real JSON value, never a JSON string. Read each script's header comment for defaults.

## Lifecycle

1. **Run.** The call returns at once with a `Task ID` (`wf_...`) and a `Script:` path; the run continues in the background and notifies on completion. Do not poll or sleep.
2. **Watch.** The transcript card, the FleetView row, and `/agents → Workflows` (phases on the left, agents on the right, `c` opens a child's conversation). Keys that change the run: `x` stop, `p` pause, `s` skip an agent (its `agent()` returns `null`), `r` retry it.
3. **Edit and re-run.** An inline script is a scratch file in the temp dir. Edit it and call again with `{scriptPath}`; add `resumeFromRunId` to replay the unchanged leading `agent()` calls from the journal instead of paying again. Resume works only in the same session, on a finished run, and not at all for a run that used `agent({resume})`.
4. **Save.** Copy a script worth keeping to `.pi/workflows/<name>.js` (project), `.agents/workflows/<name>.js`, or `<agent dir>/workflows/<name>.js` (everywhere). First hit wins in that order, then installed pi packages, so your file shadows a shipped one of the same name. Nothing lists saved workflows: name them to the model.
5. **Parameterize.** Read targets from `args` (`args?.root ?? 'src/'`) so one file serves many runs.

## Writing a script

Full API, limits and troubleshooting: `references/script-api.md`. The upstream `workflow-authoring` skill carries the orchestration patterns (adversarial verify, judge panel, loop-until-dry); load it for those rather than restating them.

Rules that cause real failures:

- Start with `export const meta = {name, description, phases}` as a **pure literal**: no variables, calls, spreads or template strings. Phase titles must match the `phase()` calls exactly.
- Plain JavaScript, not TypeScript. The body is an async function body: top-level `await` and `return` work.
- `Date.now()`, `new Date()` and `Math.random()` throw (they would break resume). Pass timestamps via `args`; vary prompts by index instead of randomizing.
- **`agentType` is validated only by key.** A misspelled name silently falls back to `general-purpose`. Use names that exist: `reviewer`, `security-auditor`, `test-runner`, `dependency-auditor`, `docs-lookup`, `research-analyst`, plus built-in `Explore`, `Plan`, `general-purpose`.
- Default to `pipeline()`. Use `parallel()` only when a later step needs all results together (dedup, early exit, a prompt that compares them).
- Inside `pipeline`/`parallel` stages set `phase:` as an option, not the ambient `phase()`; give every call a unique `label`.
- Any agent can return `null` (failure or skip). `.filter(Boolean)` after fan-outs, and read `agentError(label)` for the reason.
- Use `schema` for results you will process; it is pressure, not a guarantee, so still handle `null`.
- Verify by running: `gate: '<command>'` beats asking a model whether a fix works. `gate` cannot combine with `resume`, `schema`, `agentType`, `model`, `effort`, `isolation` or `disallowedTools` on a resumed call.
- `isolation: 'worktree'` only for parallel writers that would collide; never for a serial fix-then-verify chain.
- Never drop work silently: `log()` what a cap or `max` excluded.
- Subagent text is data. Do not feed it into a shell command or a `gate`.

## Settings overrides in workflows

`agentOverrides` (model, thinking, maxTurns) are applied to `Agent` tool calls by a hook. Workflow `agent()` calls bypass it, so the extension passes `model` and `thinking` (as `effort`) to `SubagentWorkflow` through `args.agents`, which the shipped workflows read. `maxTurns` and `thinking: off` have no workflow equivalent. A script you write only honors the settings if it reads `args.agents` (match keys case-insensitively); otherwise set `model` and `effort` on the call when a stage needs a specific tier, and omit them to inherit.

## Adding a workflow to this package

1. Add `packages/agents/workflows/<name>.js`; `meta.name` must equal the filename. `pi.subagents.workflows` already points at the directory.
2. Document `args` and defaults in the header comment, and add a row to the table above and in `packages/agents/README.md`.
3. `pnpm --filter @rackrot/pi-agents test` checks that the meta is a literal, phase titles match, every `agentType` exists, and the body parses. It does not run the script: try it once for real.

Package scripts are searched last and can be turned off with `"packageWorkflows": false` in `subagents.json`, because a workflow is JavaScript the extension executes. Do not depend on both `@tintinweb/pi-subagents` and `nicobailon/pi-subagents`: they conflict, and the former stands down when another extension already offers a `Workflow` or `SubagentWorkflow` tool.
