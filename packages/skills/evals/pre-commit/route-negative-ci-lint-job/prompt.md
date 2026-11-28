---
name: route-negative-ci-lint-job
description: Near-miss negative. A lint step failing inside a Forgejo Actions workflow is CI workflow debugging (forgejo-actions), not commit-time hook setup or repair.
tags: [routing, negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

The lint job in .forgejo/workflows/ci.yml on our Codeberg repo went red after I switched the runner label to `docker`. The step is just `run: ruff check .` and the log says `ruff: command not found`. We don't use any git hooks, ruff only runs in that workflow. Fix the workflow.
