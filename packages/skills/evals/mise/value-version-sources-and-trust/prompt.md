---
name: value-version-sources-and-trust
description: "Value case. Three current-mise behaviours a model answers from older releases: .nvmrc is not read unless enabled, mise use writes to .tool-versions when that is the only config in the directory, and mise run trusts the config it loads."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm writing the onboarding page for our team and want these three statements about mise right. assume a current mise release, default settings, `mise activate` in an interactive zsh, not CI. there are no files to look at, everything is in the question.

- Q1: A repo has no mise config at all, only an `.nvmrc` containing `20`. A new hire installs mise, changes nothing else and cds into the repo. Does mise pick Node 20 for that directory?
- Q2: Another repo has a `.tool-versions` (`nodejs 22.11.0`) and no `mise.toml` or other mise config in it. Someone runs `mise use node@24` in the repo root. Which file ends up holding the Node 24 request, the existing `.tool-versions` or a newly created `mise.toml`?
- Q3: Someone clones a repo whose `mise.toml` has `[env]` with `_.source = "setup.sh"`. They have never run `mise trust` there. In their terminal they type `mise run build`. Does mise refuse to load that config until they run `mise trust`, or does `mise run` go ahead and source `setup.sh`?

one or two sentences each, then end your reply with exactly three lines in this form: `Q1: YES` or `Q1: NO`; `Q2: TOOL-VERSIONS` or `Q2: MISE.TOML`; `Q3: REFUSES` or `Q3: RUNS`.
