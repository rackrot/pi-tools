# @rackrot/pi-agents

Curated [pi-subagents](https://github.com/tintinweb/pi-subagents) agents, plus settings-driven
overrides for `model`, `thinking` and `max_turns`.

## Install

```bash
pi install npm:@rackrot/pi-agents
```

Requires `@tintinweb/pi-subagents`. The package declares `pi.subagents.agents`, so the agents
appear read-only in `/agents`. Any file in `.pi/agents/` or `~/.pi/agent/agents/` with the same
name overrides them.

## Agents

| Name                 | Purpose                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| `reviewer`           | Diff review against a spec; read-only                                   |
| `test-runner`        | Runs tests/typecheck/lint, returns only failures; read-only             |
| `test-writer`        | Smallest set of tests that catch a named bug; edits tests only          |
| `docs-lookup`        | Current library docs with sources (uses `context7-pi`, `pi-web-access`) |
| `security-auditor`   | Read-only security sweep; returns findings only                         |
| `dependency-auditor` | Vets a package against our maintenance criteria                         |
| `research-analyst`   | Multi-source web research with citations (needs `pi-web-access`)        |

## Workflows

The package declares `pi.subagents.workflows`, so these [SubagentWorkflow](https://github.com/tintinweb/pi-subagents/blob/master/docs/workflows.md) scripts are available by name once installed. They use the agents above.

| Name                   | Purpose                                                                                                                      | `args`                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `review-panel`         | `reviewer`, `security-auditor` and `test-runner` in parallel, then one reconciling agent                                     | `scope`, `spec`                                           |
| `gated-fix`            | Fix behind a shell `gate`, one resumed retry, `test-runner` re-check                                                         | `task`, `check`                                           |
| `audit-fanout`         | `Explore` lists files, `security-auditor` audits each, a refuter checks every finding                                        | `root`, `focus`, `max`                                    |
| `plan-slice-implement` | Plan file to slices; parallel gated worktree writers, read-only review, serial merge, Status update                          | `planPath`, `gateCmd`, `max`                              |
| `config-rollout`       | One change across many repos: branch, edit, validate in each repo, review the diff, optional PR                              | `instruction`, `validateCmd`, `repos` or `root`, `openPr` |
| `pr-merge-queue`       | Check open PRs for CI, conflicts and risk in parallel; merge green ones lowest risk first (report only unless `merge: true`) | `merge`, `filter`, `method`                               |
| `bug-remediation`      | Test-first fix: triage, failing repro test, parallel root-cause investigators, minimal gated fix, root-cause review          | `report`, `checkCmd`, `reproCmd`                          |
| `test-generate`        | Fewest tests that catch a named bug: `test-writer`, critic, then a mutation check that drops any test that does not fail     | `scope`, `testCmd`, `max`                                 |
| `refactor-simplify`    | Atomic removal-only steps, behaviour pinned by tests, gate forbids test edits, new files and net growth, final review        | `target`, `checkCmd`, `maxSteps`                          |
| `docs-sync`            | Check every doc claim against code, refute each finding, find undocumented surface; optional apply on a branch               | `root`, `apply`, `prune`, `out`                           |
| `issue-triage`         | Verify each issue against the code, find duplicates, decide; report only unless `apply` (closing needs `allowClose`)         | `repo`, `issues`, `apply`, `allowClose`, `out`            |
| `deep-research`        | Parallel web workers with quoted sources, an independent citation check, one gap round, a report of verified claims only     | `question`, `depth`, `out`                                |
| `spec-develop`         | Draft a spec, attack it with ambiguity/testability/scope/feasibility critics, revise; open questions instead of guesses      | `topic`, `out`, `answers`, `security`                     |
| `feature-plan`         | Map reuse, plan gated slices in the `plan-slice-implement` format, skeptic panel, decisions section; stops at the plan file  | `feature`, `out`, `spec`, `gateCmd`                       |
| `prototype-variants`   | One question, one shared measurement protocol, N structurally different throwaway variants in worktrees, scored and compared | `question`, `criteria`, `variants`, `cleanup`, `out`      |

`plan-slice-implement` works in the repo of the current session (worktrees are of that repo) and needs the plan and its dependencies committed first. `config-rollout` works in separate checkouts you name. `pr-merge-queue` does not merge unless you pass `merge: true`.

Notes on the second group:

- `bug-remediation`, `test-generate` and `refactor-simplify` work on a new branch of the current checkout, serially, and need a clean tree. They never push or merge.
- `docs-sync` and `issue-triage` only report unless you opt in (`apply`, plus `prune` or `allowClose`). Issue and doc text is treated as data.
- `docs-sync`, `issue-triage`, `deep-research`, `spec-develop` and `feature-plan` write their full output to the `out` file and return a compact summary, because a workflow's result reaches the model through a size-limited notification.
- `spec-develop` and `feature-plan` cannot ask you questions mid-run. They return open questions or decisions; answer and run again (`answers`), or edit the file. `feature-plan` ends at the plan; build it with `plan-slice-implement`.
- `prototype-variants` never merges. Its worktree branches stay (`cleanup: true` deletes them); a build attempt that failed its run check can leave a `pi-agent-*` branch behind that you delete with `git branch -D`.
- `deep-research` workers and citation checkers are `research-analyst` agents: read-only, with only the web tools.

All of them also accept `model`, `effort` and `agents` (per agent type or label, e.g.
`{"reviewer": {"effort": "high"}}`) in `args`; unset means inherit.

Ask the model, e.g. "run the review-panel workflow on `git diff main...HEAD`". A file with the same name in
`.pi/workflows/` or `~/.pi/agent/workflows/` wins. `agentOverrides` reach them too: a hook on `SubagentWorkflow` calls fills `args.agents` from the
config (`model`, and `thinking` as `effort`; `maxTurns` and `off` have no workflow equivalent), and
anything you pass in `args` wins. Scripts you write yourself only see it if they read `args.agents`. The bundled `subagent-workflows` skill documents running, writing and
adding workflows.

## Overrides

Add `agentOverrides` to `~/.pi/agent/rackrot/config.json(c)` or `.pi/rackrot.json(c)`:

```json
{
	"agentOverrides": {
		"reviewer": { "model": "claude-opus", "thinking": "high" },
		"test-runner": { "model": "claude-haiku", "maxTurns": 10 },
		"Explore": { "model": "claude-haiku" }
	}
}
```

- Fields: `model` (`provider/id` or fuzzy name), `thinking` (`off` to `max`), `maxTurns` (integer >= 1).
- `lock` (boolean, default `false`): see below.
- Precedence per field, lowest first: package `defaults.json`, global settings, project settings.
- Names are case-insensitive and work for any agent type, including built-ins (`Explore`, `Plan`) and agents from other packages.
- `/rackrot-config agents` opens a settings screen (below). `/rackrot-config show` prints the effective values.

#### Locking an agent

By default settings only fill what the caller left unset. To make settings win for an agent, set `lock`:

```json
{ "agentOverrides": { "reviewer": { "model": "claude-opus", "lock": true } } }
```

or, in a custom agent file's frontmatter (`.pi/agents/`, `.agents/agents/` or `~/.pi/agent/agents/`):

```yaml
---
name: reviewer
lock: true
---
```

- A locked agent's configured `model`, `thinking` and `maxTurns` overwrite what an `Agent` call passes, and
  its `model`/`effort` overwrite the caller's `args.agents` entry in `SubagentWorkflow` calls. Fields with no configured value stay with the caller.
- Precedence: config `lock` (later layers win, so a project can set `"lock": false`) beats frontmatter `lock`; the frontmatter applies only when no config layer sets it. Project agent files beat global ones.
- Frontmatter is read only from the three local dirs above. For agents shipped by other packages, set `lock` in the config.
- pi-subagents ignores the unknown `lock` key in agent files.
- The settings screen has no `lock` row; edit the config. It preserves an existing `lock` when you change other fields.

### `/subagent-config` screen

Four rows per agent: `enabled`, `model`, `thinking`, `max turns`. Type to search, Enter or Space to
change a value, Esc to close.

- **Tab** switches the save target between global (`~/.pi/agent/rackrot/config.json`) and project
  (`.pi/rackrot.json`). Changes write immediately.
- **model** opens a picker over your `enabledModels` (project list if set, else global), plus `inherit`.
  For a model outside that list, edit `agentOverrides` in the rackrot config.
- **inherit** removes the value at the selected scope. A lower layer, such as the package default,
  may still supply one; the row's description says which layer does.
- **enabled** has no pi-subagents setting behind it. Turning an agent off writes
  `<scope>/agents/<name>.md` containing only `enabled: false`, which shadows built-in and package
  agents, the same way pi-subagents' own `/agents` Disable does. Turning it on deletes that stub, or
  removes the line from a file you wrote. The row shows the state at the selected scope only.
- Listed agents: the built-ins, this package's, files in the global, project and `.agents` agent dirs,
  and any name already in `agentOverrides`. Agents shipped by other packages appear once they have an override entry.

### How it works, and limits

pi-subagents treats an agent file's `model`, `thinking` and `max_turns` as authoritative over the
caller. The shipped files therefore leave those fields out. A `tool_call` hook fills the `Agent`
call's `model`, `thinking` and `max_turns` from settings when the orchestrator left them unset; a value the orchestrator passes wins unless the agent is locked (see Locking an agent).

The hook only sees calls made through the `Agent` tool. Workflow `agent()` calls are covered separately, by
filling `args.agents` (see Workflows). Not covered: scheduled spawns, cross-extension RPC, and possibly `@mention` starts in `direct` mode. Those run
with the agent file's own settings, which for these agents means the parent's model.

If `scopeModels` is on in pi-subagents, a model outside `enabledModels` is rejected.

> Published with `pnpm publish` so the `workspace:` dependency ranges resolve to real versions; earlier releases were not installable from npm.

## Orchestration

Injects delegation guidance into the system prompt on every turn (so compaction cannot drop it)
and, at the top level, removes tools from the main session. Set `orchestration` in the rackrot
config, or use `/rackrot-config orchestration` (Tab switches global/project):

```json
{
	"orchestration": {
		"level": "lean",
		"deniedTools": ["read", "edit", "write", "bash", "grep", "find", "ls"]
	}
}
```

| Level           | Behaviour                                                                          |
| --------------- | ---------------------------------------------------------------------------------- |
| `off` (default) | Nothing.                                                                           |
| `lean`          | Delegate only bulk work (broad searches, logs, test output) to keep context clean. |
| `delegate`      | Prefer subagents for self-contained multi-step tasks.                              |
| `orchestrator`  | Plan, delegate, verify; do work yourself only when clearly cheaper.                |
| `strict`        | Main session only orchestrates: `deniedTools` are hidden and calls are blocked.    |

`deniedTools` applies to `strict` only; `Agent`, `get_subagent_result`, `steer_subagent` and
`ask_user` are never denied. Subagent sessions and sessions without the `Agent` tool are left alone.
