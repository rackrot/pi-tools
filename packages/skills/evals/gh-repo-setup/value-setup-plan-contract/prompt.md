---
name: value-setup-plan-contract
description: "Value case. Given a pasted read-only audit of a GitHub repo on the Team plan and a request to bring it up to baseline and trial the branch protection first, the reply follows the skill: a module/action/command/reason plan table, a ruleset on ~DEFAULT_BRANCH, no evaluate enforcement (Enterprise only; the bare model writes it), the customised bug label not overwritten by --force, a codeowners/errors check and a self-lockout warning."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

get acme/ledger (github.com, private, org on the Team plan) into shape. you can't run commands in this session, so here is what i pulled just now. tell me what you would run and i'll run it.

```
$ git remote -v
origin  git@github.com:acme/ledger.git (fetch)
origin  git@github.com:acme/ledger.git (push)
$ gh auth status
github.com
  ✓ Logged in to github.com account mkovac (keyring)
  - Token scopes: 'gist', 'read:org', 'repo'
$ gh repo view --json nameWithOwner,defaultBranchRef,isFork,visibility
{"defaultBranchRef":{"name":"main"},"isFork":false,"nameWithOwner":"acme/ledger","visibility":"PRIVATE"}
$ gh api repos/acme/ledger --jq .permissions
{"admin":true,"maintain":true,"pull":true,"push":true,"triage":true}
$ gh label list --limit 200
bug            Crashes and wrong numbers only, see wiki/triage   #5319E7
enhancement    New feature or request                            #a2eeef
dependencies   Pull requests that update a dependency file       #0366d6
$ gh api repos/acme/ledger/contents/.github --jq '.[].path'
.github/dependabot.yml
.github/workflows
$ gh api repos/acme/ledger/rulesets --jq '.[] | {id, name, target, enforcement}'
$ ls CODEOWNERS .github/CODEOWNERS docs/CODEOWNERS SECURITY.md CONTRIBUTING.md 2>/dev/null
CONTRIBUTING.md
```

what i want out of this: the usual labels, a bug report form, a PR template, CODEOWNERS (platform team `@acme/platform` owns CI, `@acme/ledger-core` owns everything else), and main protected so nothing lands without one approval and nobody can force-push or delete it. i'd like to try the protection out before it actually blocks anyone.
