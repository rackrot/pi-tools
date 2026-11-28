---
name: value-exclusion-file-and-plan-facts
description: Value case. Three facts about .github/secret_scanning.yml and plan availability that a bare model gets wrong - paths-ignore also switches off push protection, existing alerts in those paths are closed, and private repos on Team can get secret scanning.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm writing the runbook page for secret handling on our GitHub org repos (github.com) and want three facts right before it goes out:

- Q1: we list `test/fixtures/**` under `paths-ignore` in `.github/secret_scanning.yml`. Later someone commits a real key under that path and pushes. Does the push still get blocked? Answer BLOCKED or NOT-BLOCKED.
- Q2: there are six open secret scanning alerts under `test/fixtures/` today. Once that `paths-ignore` entry is on the default branch, do those six stay open or does GitHub close them? Answer OPEN or CLOSED.
- Q3: the org is on the GitHub Team plan, not Enterprise. Can we get secret scanning on its private repos without moving to Enterprise? Answer YES or NO.

end your reply with exactly three lines in the form `Q1: <answer>`, Q1 to Q3 in order.
