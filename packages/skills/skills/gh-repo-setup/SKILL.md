---
name: gh-repo-setup
description: "Audits and sets up a GitHub repository's surface with gh: branch protection through rulesets (block force-pushes and deletion of main, require PR approvals, bypass actors), label taxonomy, issue forms, PR template, CODEOWNERS, SECURITY.md and CONTRIBUTING.md, with a dry-run plan and an applied/skipped/failed report. Use when creating or tidying a repo, when asked to protect a branch, stop direct or force pushes, require reviews before merge, or add rulesets, templates or labels. GitHub only, not for Forgejo, Codeberg or Gitea."
---

# GitHub Repo Setup

Not for workflow content, Dependabot config, security features (`gh-code-security`), agent instruction files, or a Forgejo, Codeberg or Gitea repo.

## Forge gate

Run `git remote -v` first, and name the remote the work concerns rather than assuming `origin`. If it is `codeberg.org`, a host where `curl -fsS https://<host>/api/forgejo/v1/version` answers, or the repo has a `.forgejo/` directory or `.gitea/workflows`, stop and tell the user this skill is GitHub-only. No Forgejo skill covers repo setup; `forgejo-cli` covers labels and other `fj` commands. Continue only on github.com or a host `gh auth status --hostname <host>` knows.

Bring a repository's metadata and config files up to a baseline without touching code. Every module is idempotent: re-running fills gaps and reports drift, and never overwrites customized files.

Creating labels, rulesets, or settings changes shared state, and committing or pushing files does too. Show the plan first and get approval for each group of writes. Commit and push only when asked.

## Preflight

1. Run `gh auth status` and `gh repo view --json nameWithOwner,defaultBranchRef,isFork,visibility`. Name the acting account and the target repo to the user. If auth fails, stop and tell them to run `gh auth login`. Never ask for a token in chat.
2. Admin writes (rulesets, settings) need admin rights. Check with `gh api repos/{owner}/{repo} --jq .permissions`.
3. Audit what exists, read-only:

   ```bash
   gh label list --limit 200
   gh api repos/{owner}/{repo}/contents/.github --jq '.[].path'
   gh api repos/{owner}/{repo}/rulesets --jq '.[] | {id, name, target, enforcement}'
   ls CODEOWNERS .github/CODEOWNERS docs/CODEOWNERS SECURITY.md CONTRIBUTING.md 2>/dev/null
   ```

   `gh api` expands `{owner}` and `{repo}` from the current directory's repo.
4. Read the repo's own conventions first (README, CONTRIBUTING, existing templates and label names). Match them over the defaults below.

## Plan

Open the plan with one markdown table whose header row is `| module | action | exact command | reason |`, one row per module (action is create, update or skip), then wait for approval. File contents and JSON bodies go below the table; the command cell names the file it sends. Write out the exact `gh` or `gh api` command for each write, including its overwrite behavior (for example, `gh label create --force` replaces the color and description of an existing label, so list the labels it would change). Ask only what changes the plan: whether automation bots depend on specific label names, which language community files use, and who owns the code for CODEOWNERS.

## Modules

Run in this order. Skip any module the repo already satisfies.

| Module | Output | Read |
| --- | --- | --- |
| Labels | A small taxonomy upserted through the labels API | [labels](references/labels.md) |
| Issue forms | `.github/ISSUE_TEMPLATE/*.yml` plus `config.yml` | [community files](references/community-files.md) |
| PR template | `.github/PULL_REQUEST_TEMPLATE.md` | [community files](references/community-files.md) |
| Ownership and policy | `CODEOWNERS`, `SECURITY.md`, `CONTRIBUTING.md` | [community files](references/community-files.md) |
| CI | Default workflow | Out of scope: do not write workflow content here. When `.github/workflows/` exists, only add it to CODEOWNERS with the CI owners (see community files) |
| Rulesets | Branch and tag protection through the REST API | [rulesets](references/rulesets.md). Read it before any ruleset write |

Prefer rulesets to legacy branch protection. They layer, can be switched to `evaluate` or `disabled` without deleting, and can be listed and audited through one API.

Fill every placeholder (`<owner>`, `<repo>`, contact addresses) before writing a file. An unreplaced placeholder ships a broken link.

When a file exists, diff it against the proposal and ask before replacing anything the team may have customized.

## Report

After applying, re-query each module and give `module | applied/skipped/failed | note`. Report failures with the API error text, not a summary. A 403 on workflow files usually means the token lacks the `workflow` scope, and a 404 on a ruleset write usually means missing admin rights or the wrong verb (see the rulesets reference).
