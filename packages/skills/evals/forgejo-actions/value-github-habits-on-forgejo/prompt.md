---
name: value-github-habits-on-forgejo
description: "Value case. Six GitHub Actions habits checked against what Forgejo actually does: workflow directory precedence, ignored permissions and job-level continue-on-error, default action host, automatic cancellation, the github context alias. The bare model answers from GitHub or Gitea behaviour."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

We just moved a repo from GitHub to our self-hosted Forgejo (current release, forgejo-runner, instance settings left at their defaults). Before I touch anything I want to know which of my assumptions hold. Committed on the default branch:

- `.github/workflows/ci.yml` (below)
- `.gitea/workflows/README.md`, a note a colleague left; there are no workflow files in that directory
- no `.forgejo` directory

```yaml
on: [push]
jobs:
  lint:
    runs-on: docker
    continue-on-error: true
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - run: echo "commit ${{ github.sha }}"
      - run: make lint
```

Assumptions. A1 is about the repo as it is now. Judge A2 to A6 each on its own, as statements about what Forgejo does with this file whenever it does run it, whatever you answered for A1:

- A1: With the repo exactly as described, a push makes Forgejo run `ci.yml`.
- A2: The `permissions: contents: read` block makes the job's automatic token read-only.
- A3: Because of `continue-on-error: true` on the `lint` job, a failing `make lint` will not fail the job.
- A4: `uses: actions/checkout@v4` is fetched from github.com.
- A5: If I push twice in a row to the same branch, the first run is cancelled automatically even though the file has no `concurrency:` key.
- A6: `${{ github.sha }}` still resolves to the commit SHA; I don't have to rename it for the step to work.

End your reply with exactly one line per assumption in the form `A1: TRUE` or `A1: FALSE`, A1 to A6 in order.
