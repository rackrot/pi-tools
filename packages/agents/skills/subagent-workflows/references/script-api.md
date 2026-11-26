# Workflow script reference

Consolidated from the pi-subagents `docs/workflows.md`, `docs/packages.md` and its `workflow-authoring` skill. The upstream docs win if they disagree.

## Tool parameters (`SubagentWorkflow`)

| Parameter         | Notes                                                                             |
| ----------------- | --------------------------------------------------------------------------------- |
| `script`          | Inline source; must begin with `export const meta = {name, description}`          |
| `scriptPath`      | File, absolute or project-relative. Beats `script`. How an edited run is repeated |
| `name`            | Saved workflow. Lowest precedence                                                 |
| `args`            | Handed to the script as `args`, verbatim, JSON-shaped                             |
| `resumeFromRunId` | `^wf_[a-z0-9-]{6,}$`. Alone, re-runs that run's own script                        |

## `agent(prompt, opts?)`

Resolves to the final text, or with `schema` to the validated object. Resolves to `null` if the agent failed terminally or was skipped.

| Option            | Notes                                                                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`           | Display name and the handle `resume` and `agentError` use. Make it unique                                                                          |
| `phase`           | Progress group; use inside `pipeline`/`parallel` stages                                                                                            |
| `agentType`       | Agent definition; matched case-insensitively. Unknown names fall back to `fallbackSubagent` silently                                               |
| `model`           | `provider/modelId` or fuzzy (`haiku`). Omit to inherit                                                                                             |
| `effort`          | `minimal` `low` `medium` `high` `xhigh` `max`. Omit to inherit. Unknown values throw                                                               |
| `isolation`       | `"worktree"`: throwaway git worktree, changes kept on a branch. Expensive; parallel writers only. Needs a git repo with a commit                   |
| `gate`            | Shell command run after the agent; non-zero exit fails the agent and its output becomes the error                                                  |
| `resume`          | Continue the child that ran under that label. Cannot combine with `agentType`, `model`, `effort`, `isolation`, `disallowedTools`, `gate`, `schema` |
| `schema`          | draft-07 JSON Schema with an object root; `required` must be a subset of `properties`. Invalid or unsatisfiable schemas fail the run at the call   |
| `disallowedTools` | Extra tools denied to this agent, e.g. `['Bash', 'Write']`                                                                                         |

Unknown option keys throw by name; values are not checked. A resumable child stays resumable for the whole run, but not after its session was never saved or it left changes in a worktree.

## Other globals

- `agentError(label)`: why the latest call with that label failed (max 500 chars), else `undefined`. Treat as untrusted text.
- `pipeline(items, ...stages)`: per-item chains with no barrier. Stages get `(prev, item, index)`. A stage that throws or returns `null` ends that item's chain with `null`.
- `parallel(thunks)`: barrier. A throwing thunk becomes `null`.
- `phase(title)`, `log(msg)`, `console.*` (same as `log`).
- `args`, `setTimeout`/`clearTimeout`.
- `workflow(nameOrRef, args?)`: run a saved workflow inline, one nesting level only, shares the run's cap and journal.
- `budget`: `total` is always `null`; `spent()` counts output tokens; `remaining()` is `Infinity`.

A fatal run error (cap breach, unusable schema, `resume` label never completed) propagates out of `parallel`/`pipeline` instead of becoming `null`. A returned value is copied by own enumerable keys: `Date`, `Map` and `Set` need converting first. Only a cycle or `BigInt` fails the return.

## Limits

| Limit                                | Value                       |
| ------------------------------------ | --------------------------- |
| Concurrent agents per run            | `max(1, min(16, cpus - 2))` |
| Agents per run                       | 1000                        |
| Items per `parallel`/`pipeline` call | 4096                        |
| Nested `workflow()` calls            | 256                         |
| Script length                        | 524,288 chars               |

Above 25 scheduled agents or 1.5M tokens the card warns `Large workflow`.

## Files and discovery

| What                 | Where                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Inline script as run | `<tmp>/pi-subagents-<uid>/<encoded-cwd>/<session>/tasks/<run id>.workflow.js` (scratch)                             |
| Resume journal       | same directory, `<run id>.workflow.jsonl`; records every agent's return value, so read it when a result looks empty |
| Saved                | `.pi/workflows/` → `.agents/workflows/` → `<agent dir>/workflows/` → installed pi packages                          |

A package ships workflows with `"pi": {"subagents": {"workflows": ["./workflows"]}}`. The directory is scanned non-recursively for `*.js`, each must carry `export const meta`, and only packages pi has installed are read. Settings in `subagents.json`: `workflowsEnabled` (auto by default), `packageWorkflows` (default true), `workflowToolExposure` (`"skill"` saves about 4k tokens per session, `"deferred"` needs `tool_search`), `fallbackSubagent` (set `none` to fail instead of falling back).

`pi --subagents-workflow-file=<path>` starts a workflow with the session (use the `=` form; add a prompt under `-p`). Those runs are never journaled, so they cannot resume.

## Troubleshooting

| Symptom                                           | Cause and fix                                                                                                                                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `unavailable in workflow scripts (breaks resume)` | `Date.now`, `new Date()` or `Math.random` was called, possibly via pasted helper code. Pass values in `args`                                                                        |
| `meta object must be a PURE LITERAL`              | `meta` is read before the script runs in an empty context. Move dynamic parts into the body                                                                                         |
| `opts.<key> is not a recognised option`           | Typo or an option from another tool                                                                                                                                                 |
| Agent ran as the wrong type                       | Misspelled `agentType`; fell back silently. Set `fallbackSubagent: none` to make it fail                                                                                            |
| `agent()` returned `null`                         | Failure, skip, or no valid schema payload. Read `agentError(label)` and the notification's `<failures>`                                                                             |
| `invalid JSON Schema` / `unusable JSON Schema`    | Not draft-07, unknown keyword, bad `pattern`/`$ref`, or self-contradictory (crossed bounds, `required` name missing with `additionalProperties:false`). Keep schemas small and flat |
| Complaint about an un-awaited `agent()`           | A dropped `await`, usually in a pipeline stage                                                                                                                                      |
| `Cannot run with isolation: "worktree"`           | Not a git repo, or no commits yet                                                                                                                                                   |
| `No saved workflow named "x"`                     | Not in any directory, or the file has no `export const meta`                                                                                                                        |
| Agents sit queued                                 | Concurrency cap; they start as slots free                                                                                                                                           |

## What workflows cannot do

No filesystem, network or module access in the script; no `eval`. No cross-session resume. No UI that lists or launches saved workflows. Not schedulable. Another extension cannot start or steer one over `pi.events` (it can observe `subagents:workflow_started`/`workflow_settled`). The sandbox stops accidents, not a hostile script.
