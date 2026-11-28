---
name: modernize
description: "Plans how to get a legacy or inherited system onto a supported stack: an end-of-life runtime or framework, a major-version upgrade, a migration or rewrite, or an app that no longer installs, builds or runs its tests. Sets the order of work (feasibility spike, testability milestone, safety ladder, hazard red-team, phases with exit criteria) and settles questions about a draft upgrade plan: phase order, test and CI gates, branching between phases, upgrade or rewrite. Use for \"how do we get off Python 2 / Node 8 / AngularJS\", \"where do I start with this old codebase\", \"cut the upgrade into phases\". Read it before answering, also when the system is only described in the prompt."
---

# Modernize

Produce a phased plan to upgrade, migrate, or rewrite a legacy system. This skill plans and does not execute. Legacy systems are often hard to run at all (end-of-life runtimes, native modules that no longer compile, retired package mirrors), so the plan can't assume the old stack is alive. It measures how alive the system is first, then picks a strategy and a level of regression safety to match.

Not for sunsetting or removing an API, service or feature (`deprecation-migration`), executing the migration, or recording a single decision (`adr-writing`). Use each one if installed.

## Sunsets

For deprecating or removing an API, service or feature, moving its consumers, or retiring a component picked in step 6, use `deprecation-migration` if installed.

## Workflow

1. **Get the evidence base.** Use an existing architecture document or README the user points to. Otherwise map the system first: when the project is indexed in codebase-memory, start with `get_architecture` (default aspects are languages, packages and entry points; add `dependencies`, `routes` and `hotspots` for a migration) and follow up with `search_graph` and `trace_path`; then read the manifests, deployment files, and test setup directly. Collect the stack with versions, the main functional areas, known pain points, and how it runs and deploys. Trust the map, and open a file only to check a specific detail, such as whether a declared dependency is used.

2. **Run a time-boxed feasibility spike.** Set a hard limit (for example half a day) and ask whether the system can run even once, not whether CI can go green. Run the spike in a scratch worktree or container with a frozen-lockfile install (`npm ci`, `uv sync --frozen`, and the like) and discard it afterward, so the user's checkout stays untouched. Per component, record what you observe.
   - Do dependencies install from a committed lockfile without hand-patching?
   - Do native and build steps succeed on a currently supported toolchain?
   - Does it start?
   - Does the test runner execute, and does at least one meaningful test pass?

   Partial results are normal, especially in a monorepo where one service tests green while another can't build. When the box expires, decide with what you have, because resurrecting a system that can't be resurrected is itself a project.

3. **Locate the testability milestone per component.** This is the first phase at which a component runs on a supported runtime, installs from a lockfile without patching, builds on the current toolchain, and passes at least one meaningful test in CI. Name it explicitly for each component. Before that point, don't require an automated test gate on the component, because you would be demanding green tests from something that doesn't run yet. After it, real CI and characterization tests are worth the investment. Label every phase as before or after its component's milestone.

4. **Choose the migration strategy per component.**
   - **Freeze, then lift.** Capture the old behavior as it is, then upgrade under that net. It fits only when the old system almost runs and can be resurrected cheaply.
   - **Beachhead, then expand.** Move the thinnest end-to-end slice onto the modern stack until it builds, boots, and tests, then bring the rest across and write tests on the new stack as you go. Use this by default for a system that doesn't run, with its first phase being to reach the testability milestone with the smallest slice.

5. **Pick the highest reachable rung of the safety ladder** and name the risk that remains. Read `references/safety-ladder.md` for the rungs, the sources of safety other than tests, and how to choose an oracle. Weigh regression cost: an abandoned app with no users doesn't justify an expensive gate, and a production system with users does.

6. **Pick the least disruptive approach per component.** First remove dead code and features with no use. Then, for what remains, stop at the first approach that solves the problem.
   1. Upgrade in place. Bump the major version and fix the breakage. This is the default, and it is rejected only when no upgrade path is supported, the breakage costs more than a rewrite, or the framework is abandoned.
   2. Swap the dependency for a maintained one with the same shape.
   3. Wrap and strangle. Put a clean interface in front and replace the internals behind it, with old and new running together.
   4. Rewrite. Require an explicit reason for each, because "it's old" is not one.

   Record each choice and why. Use `adr-writing`, if installed, for decisions that need a durable record.

7. **Red-team every phase against the hazard catalog** before it is implemented. Read `references/migration-hazards.md`. For each hazard, decide whether the phase triggers it, run its detection probe against the real repo, and fold the plan action into the phase's tasks and exit criteria. Record the hazards you checked and cleared along with those that fired, since a skipped hazard looks the same as a missed one.

8. **Write the phased plan.** Read `references/plan-template.md` for the phase shape and exit criteria. Each phase is small enough to merge on its own, states its safety rung, and ends with an observable exit criterion.
   - Name the phase that stands up CI. Author the workflow in the first phase after the testability milestone. Making it a required check is a repository-settings change, so list it as an action for the user and don't perform it without their approval.
   - Merge each phase to trunk before starting the next, and cut each phase branch from trunk. Stacked branches leave trunk behind and force later phases to stack too.

## Output

Before presenting the plan, run a closing review: check the plan for gaps, ask the user about blocking decisions, then save it. Return the plan in the conversation as well. Include the spike results, the milestone and strategy per component, the target rung, the approach per component, the hazard checks, the phases, and the open decisions that need the user. Keep the plan proportionate to the system. A small service needs a few phases and a short hazard pass.

For the work itself, hand a whole approved plan to `implement-plan`. For a Postgres major upgrade, use `postgres`, if installed, for the database side.
