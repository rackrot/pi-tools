---
name: value-pr-comments-github-invoked
description: "Value case. The prompt types pi's /skill: command; without the skill the line stays literal text. A github.com remote, the code and three pasted review comments, all in the prompt (no shell, no network). The skill's contract: the fetch tool is fetch.sh, actions are fix / push back / clarify, a failure the code rules out is push back, a request with no concrete change is clarify, and the agent asks which rows to address. The scaffold builds the same repo on disk for a run with --scaffold --allow-tools Bash; the read-only guard grader only means something there."
tags: [value]
runs: 3
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill, Bash]
---

/skill:pr-comments 7

This session has no shell, so run nothing. `git remote -v` prints one remote: `origin https://github.com/acme/ledger.git`, and the working tree is on the PR's branch. I copied the review comments on PR 7 from the web page, so triage them from this text.

src/stats.py at the PR head, in full:

```python
def total(items):
    return sum(item["price"] * item["qty"] for item in items)


def average(items):
    return total(items) / len(items)
```

@alice (human) on src/stats.py line 2: total raises an error on an empty list. Please guard it.

@bob (human) on src/stats.py line 6: average divides by the length of items, so an empty list raises ZeroDivisionError. Please handle it.

@carol (human) on the whole PR: this module feels fragile, please make it better.

After the triage, end your answer with exactly these four lines and nothing after them. The first three give the action for each reviewer's comment, using the action names you triage with. The last is the one command you would run first, in a session that had a shell, to fetch this PR's review feedback yourself:

alice: <action>
bob: <action>
carol: <action>
FETCH: <command>
