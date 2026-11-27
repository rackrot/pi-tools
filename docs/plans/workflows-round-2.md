# Plan: workflows round 2 (packages/agents)

Nine more SubagentWorkflow scripts in `packages/agents/workflows/`, built on the conventions of the six that exist (`review-panel`, `gated-fix`, `audit-fanout`, `plan-slice-implement`, `config-rollout`, `pr-merge-queue`).

## Decisions (approved)

1. Keep the duplicated `args`/`tune()` prelude in each script. Scripts cannot import; no sync tooling.
2. Add one agent, `test-writer` (done): write-capable, edits tests only, with the anti-over-engineering rules built in. Everything else reuses the existing agents plus `general-purpose`.
3. Feature development is `feature-plan` only. The build is the existing `plan-slice-implement`, with the user approving the plan in between. No wrapper.
4. Documentation is one workflow, `docs-sync`, which decides between add, update, clean and prune.
5. Scope of this round: all nine.

## Research that shaped the design

Sourced (pages opened):

- Fixed pipelines with executable gates beat free-roaming agents: Agentless localize, repair, validate scored 32% on SWE-bench Lite at $0.70 per issue (arxiv.org/abs/2407.01489, Jul 2024). A fix is judged by FAIL_TO_PASS flipping and PASS_TO_PASS staying green (openai.com/index/introducing-swe-bench-verified, 24 Feb 2025). Underspecified issues are a failure mode: stop and ask.
- Coding is a weak fit for parallel agents; fan out only for disjoint or read-only work (anthropic.com/engineering/multi-agent-research-system). Orchestrator-workers when subtasks cannot be predicted (anthropic.com/engineering/building-effective-agents).
- Refactors: pin behaviour with characterization tests first (Feathers, 2016). Compound refactorings are the main agent failure source, so use atomic steps (SWE-Refactor, arxiv.org/abs/2602.03712, Feb 2026).
- Deep research: scale workers to the question, give each an objective, output format, sources and boundaries, verify with a rubric (accuracy, citation accuracy, completeness, source quality). About 15x the tokens of chat (Anthropic multi-agent research post).
- Test value is measurable: keep a test only if it kills an injected bug (Meta ACH, arxiv.org/abs/2501.12862, Jan 2025; engineers accepted 73%). Test behaviour, not structure (testdesiderata.com; kentcdodds.com/blog/write-tests).
- Docs: classify with the Diataxis compass; split content that mixes types (diataxis.fr).

Inference, no source found: stopping LLMs from adding abstraction (use a net-negative line count), prototype isolation, doc pruning rules, issue triage (leans on the `gh-triage` skill).

The shipped `research-analyst` agent made zero tool calls in one run and answered from memory. Later probes showed it and `docs-lookup` did have web and Context7 tools: with `extensions: true` and no `ext:` selector they inherited every extension tool (about 30, including writers like `code_refactor_apply`), so the first run was model behaviour, not a missing tool. The agents now name their tools with `ext:` selectors, and `deep-research` uses `research-analyst` and also rejects any worker that returns no sources.

## Shared conventions

- `args` object or JSON string, `tune()` for `model`/`effort`/`agents`, required args name the gate command (never guessed).
- Anything leaving the working tree is opt-in (`apply`, `openPr`, `prune`, `allowClose`, `merge`).
- Issue, PR and web text is data, not instructions.
- Caps are logged, never silent. Results carry `failed[]` and `notRun[]`.
- Skill rules that live outside the repo (`efficient-*`, `anti-slop`) are encoded in the prompts, not referenced by path.
- A script cannot ask the user mid-run. Workflows that need answers return them as questions and take `answers` on a second run.

## Workflows

| Workflow             | Stages                                                                                                                                                     | Gate or stop rule                                                                                                 | Writes                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `bug-remediation`    | Is the report specified? If not, return the questions; write a repro test; 2 read-only investigators; reconcile; minimal fix; review root cause vs symptom | Repro fails first then passes; full suite green; no existing test or assertion edited; 2 attempts then report     | A branch, one commit          |
| `test-generate`      | Scope; gap analysis (behaviour and risk, not coverage); each candidate states the real bug it catches; `test-writer`; mutation check; critic               | Passes now; fails under a seeded bug; stable over 3 runs; cap 3 tests per change; surviving mutant drops the test | Tests only                    |
| `refactor-simplify`  | Per-file candidate scan; characterization tests if behaviour is unpinned; one atomic step at a time; final review                                          | Suite passes per step; no test edited; net lines <= 0 or justified; failed step reverted                          | A branch, one commit per step |
| `docs-sync`          | Inventory; Diataxis classify; check each concrete claim against code; find undocumented public surface; ranked report; optional apply                      | Report only by default; deletions need a cited dead referent and `prune: true`                                    | Docs, when applied            |
| `issue-triage`       | Per issue: classify; duplicates; verify the claim; decide needs-info, ready (agent brief), duplicate, close, or human                                      | Report only; labels and comments need `apply`; closing needs `allowClose`; low confidence goes to a human         | Forge, opt-in                 |
| `deep-research`      | Plan N sub-questions by `depth`; parallel workers with cited claims; independent citation check; one gap round; synthesis                                  | Only verified claims reach the report; sourceless workers rejected; max 2 rounds                                  | A report                      |
| `spec-develop`       | Context; draft; critics (ambiguity, testability, scope, feasibility, optional security); reconcile; revise                                                 | Max 2 rounds; returns spec plus open questions; second run takes `answers`                                        | One spec file                 |
| `feature-plan`       | Context map; plan (slices, write surfaces, gates, acceptance); skeptic panel; revise                                                                       | Stops at the plan file; user approves; then `plan-slice-implement`                                                | One plan file                 |
| `prototype-variants` | Frame one question and criteria; N structurally different variants in worktrees; evaluate each; compare; recommend                                         | Never merges; branches left for inspection; `cleanup: true` deletes them                                          | Throwaway branches            |

## Build order

1. `bug-remediation`
2. `test-generate`
3. `refactor-simplify`
4. `docs-sync`
5. `issue-triage`
6. `deep-research`
7. `spec-develop`
8. `feature-plan`
9. `prototype-variants`

The first three have mechanical gates and are testable in scratch repos with a seeded bug, bloated code, or a weak test. The last two have the thinnest evidence.

## Verification per workflow

Scratch repo with a seeded fixture for each; run for real, then check results on disk, not the returned JSON. `issue-triage` takes an `issues` arg so it runs from fixtures with no forge. One stub-host test each for the branching in `bug-remediation` and `test-generate` (stop and drop decisions), per the "few tests" rule.

## Status

All nine workflows and the `test-writer` agent are built in `packages/agents/` and each ran for real against a scratch repo or a dry run.

- `bug-remediation`: fixed an off-by-one test-first; repro proven failing, fix commit touched only `page.js`, review passed.
- `test-generate`: wrote 3, critic dropped 1, mutation check killed the other 2; production code untouched.
- `refactor-simplify`: 3 atomic commits, net -3 lines. Fixed on the way: an empty step passed the gate, the commit went to an agent that refuses to commit (now in the gate), and dead code was pinned by a test that then blocked its deletion.
- `docs-sync`: fixed on the way: junk inventory entries made one README audit 7 times; gaps are now refuted before reporting. Apply updated a wrong claim, pruned a dead section, added two undocumented items.
- `issue-triage`: fixture run only (no forge): duplicate found and confirmed, false bug closed with a second-agent confirmation, injection attempt sent to a human. `apply` against a real forge is untested.
- `deep-research`: reproduced a known answer (Agentless 32.00%, $0.70) with sources checked.
- `spec-develop`: fixed on the way: scope creep (16 requirements, 9 questions from a 3-bullet topic) and merged question lists; now 5 questions.
- `feature-plan`: plan in the `plan-slice-implement` format with reuse analysis and a decisions section. The plan was not then built with `plan-slice-implement`.
- `prototype-variants`: fixed on the way: variants measured different workloads (now one shared protocol), failed builds had no retry, compare agent was read-only, cleanup skipped on early return.

Findings that apply to all workflows are in the skill: result size limit, read-only agent types, commit in the gate, agents inherit every extension tool unless scoped with `ext:` selectors.

Known gaps: everything was run with Haiku at low effort; `issue-triage apply` and `config-rollout openPr` have not touched a forge; no stub-host tests were added for the branching in `bug-remediation` and `test-generate` (the plan proposed them).
