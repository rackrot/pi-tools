---
name: route-negative-shellcheck-commit-hook
description: Near miss. Wiring a ShellCheck hook into .pre-commit-config.yaml and bumping hook revs is the pre-commit skill's job; no script is written or fixed, so bash must stay quiet.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

We already lint Python on commit. Add a shellcheck hook to our .pre-commit-config.yaml so it also runs on staged files at commit time, and bump the revs of the hooks that are already there. Current file:

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.4.4
    hooks:
      - id: ruff
      - id: ruff-format
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: end-of-file-fixer
      - id: check-yaml
```
