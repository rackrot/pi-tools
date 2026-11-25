# Subagents: fit test and authoring rules

Rules for deciding whether something should be a subagent, and how to write one for
[`@tintinweb/pi-subagents`](https://github.com/tintinweb/pi-subagents) (v0.26.x). Each rule
is short on purpose. Where a rule is a measured claim, the source is in [Sources](#sources).

## Part 1: Is a subagent the right tool?

**Default answer: no.** Start with one agent, a clear prompt, a few tools, and skills. Add a
subagent only when evidence says the single loop is failing.

### Cost model

- Multi-agent runs cost roughly 3-10x the tokens of a single agent for the same task (Anthropic
  multi-agent guidance), and about 15x a chat in Anthropic's research system.
- A fresh subagent must re-gather context the parent already has, so it can be slower than
  doing the task inline.
- Delegating the same task to the same model does **not** produce a better answer. What you get
  is parallelism, isolation, a reviewer with fresh eyes, or restricted tools.
- Each handoff is a lossy summary, and each subagent is another prompt to maintain.

### Fit test

A subagent is justified only if **at least one** is true:

| #   | Condition                                                                                                                                                                | Typical example                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| F1  | **Noisy, high-volume, low-retention output.** The subtask reads >~1k tokens of material the parent won't need again, and can return a compact result.                    | Wide codebase search, full test run, log triage, fetching and condensing docs |
| F2  | **Independent parallel work.** Pieces share no state and need little from each other.                                                                                    | Research on separate topics, audits of separate modules, per-file migrations  |
| F3  | **Unbiased review.** The reviewer must not have seen the reasoning that produced the work.                                                                               | Diff review against a spec, black-box verification                            |
| F4  | **Privilege restriction.** The task needs fewer tools than the main session, enforced by the harness rather than requested in a prompt.                                  | Read-only reviewer, read-only DB analyst                                      |
| F5  | **Measured degradation in the single loop.** Context bloat, tool-selection failures (15-20+ tools), or conflicting instructions, shown by an eval rather than suspected. | Prompt has grown contradictory rules per domain                               |
| F6  | **Cheaper model is enough.** The work is mechanical and a small model does it as well.                                                                                   | Collect importers of a module, link checking                                  |

### Disqualifiers

Do **not** make a subagent when:

- **D1: It splits by role or phase of the same work** (planner / implementer / tester /
  reviewer for one feature). These share too much context and spend more on coordination than
  on work. Split by _context boundary_, not problem type.
- **D2: It would mirror the org chart.** One subagent per team or topic leads to sprawl,
  overlapping agents and a "Frankenprompt".
- **D3: The tasks are tightly coupled or need back-and-forth.** Keep them in one agent.
- **D4: It is really domain knowledge or a procedure.** That is a **skill**.
- **D5: It is really an action, live data lookup, or fixed-shape result.** That is a **tool**.
- **D6: It is reference material needed sometimes.** That is a file in a skill, or a lookup tool.
- **D7: The task is small.** If the parent could finish in under ~5 tool calls, delegation
  costs more than it saves.
- **D8: A rule must never bend.** Use a hook, deny rule, or `tools:` restriction, not a prompt.
- **D9: Latency matters and the answer is on the critical path.** Every subagent is a nested model loop.

### Choosing the mechanism

```text
Needs steps / rules / judgment the main agent should apply itself?  -> skill
Needs an action, live data, or fixed result shape?                  -> tool
Noisy output, parallel, unbiased review, or restricted tools?       -> subagent (F1-F4)
Fixed multi-step orchestration you don't want improvised?           -> SubagentWorkflow script
Repeated chain "A then B" in most runs?                             -> merge into one agent
```

### Prove it before keeping it

1. Write a small end-to-end eval first (about 10 golden tasks is enough). Include every
   chain of agents that runs together and every rule that must not break.
2. Run each task more than once; some regressions only show in one run in two.
3. Compare with and without the subagent. Look at which tasks **flipped**, not just the score.
4. Keep the subagent only if the folded or inline version scores worse, costs more, or is slower.
5. Re-check when the model changes. As models improve, more subagents become skills and tools.

## Part 2: Writing the agent

### Principles

1. **One job per agent.** If the description needs "and" between unrelated jobs, split it or
   drop it.
2. **Description is a routing contract.** The orchestrator reads it (plus a `(Tools: ...)`
   suffix) to decide when to delegate. Write _when to use it_ and _when not to_, specific
   enough to single out this agent from every other one. Add "use proactively" only if you
   want unprompted delegation. Keep it short: all descriptions are loaded every session.
3. **Least privilege, enforced by the harness.** Set `tools:` to the minimum. A read-only
   agent should not have `edit`, `write` or write-capable `bash` at all. Prefer
   `tools:` / `disallowed_tools:` over prose rules.
4. **Return a compact, structured result.** The parent only sees the final message. Say
   exactly what to return (format, length cap, file paths with line numbers). Large artifacts
   go to disk with a path returned, not through the conversation.
5. **Scope effort inside the prompt.** Models misjudge effort. State when to stop, a turn
   budget (`max_turns`), and a search strategy (start broad, then narrow).
6. **Write verifiers adversarially.** Reviewers and verifiers take shortcuts ("early victory").
   Require concrete criteria, the full test run, negative cases, and _evidence_ (command and
   output), not "looks good". For reviewers, say what to skip (for example, style), or they
   will always find something.
7. **Delegation prompts carry the context.** A cold subagent knows nothing. The caller must
   give objective, output format, tools or sources to use, and boundaries. Say this in the
   agent description so callers know what to pass.
8. **Plain wording, no shouting.** Current models follow plainly worded lines; ALL CAPS and
   `IMPORTANT` cause over-application.
9. **Fewer agents, owned.** Every agent has an owner, a reason it exists (which F-condition),
   and an eval or example task.

### Agent file template

```markdown
---

name: reviewer
description: Reviews a diff against a spec and reports correctness gaps. Use after a feature is implemented and before commit. Not for writing code or style review. Caller must pass the spec path and the diff range.
tools: read, grep, find, bash
disallowed_tools: edit, write
model: anthropic/claude-sonnet-4-5
thinking: medium
max_turns: 25
prompt_mode: replace
skills: false
extensions: false
---

You review changes against a written spec. You cannot edit files.

Process:

1. Read the spec at the path you were given. List each requirement.
2. Inspect the diff (`git diff <range>`). Read touched files for context.
3. For each requirement, confirm it is implemented and that listed edge cases have tests.
4. Run the project's test command and include the exact command and result.

Report only issues that affect correctness. Skip style and naming.
If everything passes, say so and list what you checked.

Output format (under 300 words):

- Verdict: pass | gaps
- Gaps: `path:line` - requirement - what is missing
- Evidence: command run and its result
```

### pi-subagents tuning

**Where to put the file**

| Location                                | Use                                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `packages/<pkg>/agents/*.md` + manifest | Default. Shipped with the package that owns the agent. Lowest precedence, so users can override. |
| `.pi/agents/` in a project              | Project-specific agents, committed with that project. Highest precedence.                        |
| `~/.pi/agent/agents/`                   | Personal agents only.                                                                            |

Declare package agents (there is no convention-directory fallback, and the package must be in
`settings.json -> packages[]`):

```json
"pi": { "subagents": { "agents": ["./agents"] } }
```

`!./agents/wip.md` excludes a file. Files over 1 MB are skipped. The package-agents list is built
when the extension loads, so on the very first session in an untrusted project the model may not
see them until the next session.

**Frontmatter decisions**

| Field                                   | Guidance                                                                                                                                                                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                                  | Lowercase kebab-case. It is the `subagent_type` and the `@handle`. Must not contain `:`. Claiming a built-in name (`Explore`, `Plan`, `general-purpose`) overrides it.                                                                                  |
| `description`                           | See principle 2. This is the highest-leverage field.                                                                                                                                                                                                    |
| `tools`                                 | Minimum set. Names are validated: typos fail loudly. `none` is not zero tools if extensions load. For a true read-only agent also set `disallowed_tools`.                                                                                               |
| `extensions` / `exclude_extensions`     | Default `true` loads every extension, and with pi's built-in MCP **each subagent starts its own MCP servers**. For narrow agents use `extensions: false`, or `exclude_extensions: builtin:mcp`.                                                         |
| `isolated: true`                        | Hermetic specialist: built-ins only, no extensions or skills. Use for F4/F6 agents. Not the same as `isolation: worktree`.                                                                                                                              |
| `skills`                                | `true` inherits all parent skills (more prompt tokens). Use a comma list to preload only what the agent needs, or `false`. This is how procedure moves from the agent prompt into reusable skills.                                                      |
| `prompt_mode`                           | `replace` (default): body is the full system prompt, no AGENTS.md/CLAUDE.md. Best for small standalone specialists. `append`: parent twin that inherits project rules, for agents that must follow repo conventions (`general-purpose` works this way). |
| `inherit_context`                       | Default `false`. Leave off for F1/F3: isolation and fresh eyes are the point. Turn on only when the task truly needs the conversation, and then ask whether it should be inline instead.                                                                |
| `model`                                 | Pin a cheaper model for F6 work (`haiku`, `anthropic/claude-haiku-4-5`). Frontmatter beats caller choice. Leave unset to inherit for reasoning-heavy work.                                                                                              |
| `thinking`                              | `low` or `off` for retrieval and mechanical work; `medium`/`high` for review and planning. Clamped if unsupported.                                                                                                                                      |
| `max_turns`                             | Always set a ceiling (for example 15-30). Agents get a wrap-up warning before hard abort, which returns a partial result.                                                                                                                               |
| `run_in_background`                     | Pin `false` when the parent needs the result next. Pin `true` for long audits. Omit to follow `backgroundByDefault`.                                                                                                                                    |
| `isolation: worktree`                   | For agents that edit files in parallel with others. Changes land on a branch. `off` to refuse.                                                                                                                                                          |
| `allowed_subagents`                     | Leave unset. Nesting is a privilege boundary and multiplies cost. Max depth defaults to 2.                                                                                                                                                              |
| `memory`                                | Only for agents whose value compounds across runs (project conventions, recurring review findings). Add a line telling the agent what to record.                                                                                                        |
| `persist_session` / `output_transcript` | Defaults are fine. Turn off transcripts for agents that handle sensitive material.                                                                                                                                                                      |
| `color` / `display_name`                | Cosmetic. Give each agent a distinct color so the fleet view is readable.                                                                                                                                                                               |
| `enabled: false`                        | Disable a built-in or package agent per project.                                                                                                                                                                                                        |

**Built-ins to reuse before writing your own**

- `Explore`: read-only search. Pass thoroughness (`quick`, `medium`, `very thorough`) in the prompt.
- `Plan`: read-only architect.
- `general-purpose`: parent twin with all tools. Can nest.

If `Explore` is almost right, eject it and override (add `model:`) instead of creating a new type.

**Calling agents well (parent side)**

- Foreground (`run_in_background: false`) only when the next step depends on the result;
  otherwise background and keep working. Do not poll.
- Launch independent agents in one message so they run concurrently.
- Prefer `resume` over a fresh spawn for follow-ups, to avoid re-paying context.
- For fixed multi-stage flows use `SubagentWorkflow` with `pipeline()` (no barrier between
  stages) and `gate: "<command>"` to verify by running a command instead of asking another model.
- Verify results. A subagent's summary describes intent, not outcome. When one edits code,
  check the diff.
- Scale count to complexity: simple lookup is 1 agent; comparison is 2-4; broad research more.
  Anthropic's early systems spawned 50 subagents for trivial queries.

### Pre-merge checklist

- [ ] Names an F-condition (F1-F6) and passes every disqualifier (D1-D9).
- [ ] An eval or example task shows it beats the inline alternative.
- [ ] Description says when to use and when not to, and what the caller must pass.
- [ ] `tools` minimal; write tools denied for read-only roles; `extensions`/`skills` narrowed.
- [ ] Output format and length cap in the prompt; `max_turns` set.
- [ ] Model and thinking chosen deliberately (cheaper if mechanical).
- [ ] No nesting unless justified.
- [ ] Package declares `pi.subagents.agents`; package is listed in `settings.json`.
- [ ] Loads without warnings in `/agents` (typos in `tools:` and unknown fields warn).

## Sources

- Anthropic, [Building agents: when to fold subagents into your main agent loop](https://claude.com/resources/articles/building-agents-when-to-fold-subagents-into-your-main-agent-loop): use subagents for context bloat, parallel fresh-context work, or tool-selection conflicts; avoid org-chart subagents; divide by context; fold into skills and tools and compare on evals.
- Anthropic, [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices): when subagents pay off and what they cost; "delegating for a better answer" does not help but a fresh reviewer does; Haiku for simple jobs; restrict reviewer tools; tell reviewers what to skip; ask for evidence.
- Anthropic, [Building multi-agent systems: when and how to use them](https://claude.com/resources/articles/building-multi-agent-systems-when-and-how-to-use-them): 3-10x token overhead; context-centric decomposition; verification subagent and the early-victory problem; tool-search before splitting for many tools.
- Anthropic, [How we built our multi-agent research system](https://www.anthropic.com/research/multi-agent-research-system): about 15x tokens; delegation prompts need objective, format, tools and boundaries; scale effort to complexity; artifacts by reference; start wide then narrow.
- Anthropic, [Create custom subagents](https://code.claude.com/docs/en/sub-agents): description as routing, focused agents, limited tools, hooks as backstop, description token budget.
- `@tintinweb/pi-subagents` 0.26.3: README and `dist/package-resources.js`, `dist/custom-agents.js` (frontmatter, tool scoping, package manifest, precedence).

The cost multipliers above are Anthropic's reported figures for their own workloads, not
guarantees. The fit conditions are guidance, and the thresholds (1k tokens, 5 tool calls) are
rules of thumb.
