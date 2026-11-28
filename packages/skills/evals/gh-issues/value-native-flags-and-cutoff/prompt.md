---
name: value-native-flags-and-cutoff
description: Value case. Issue relationships, a duplicate close and an org issue field across a new and an old gh. The answer needs the native edit flag --add-blocked-by (not gh api), the 2.94.0 cutoff below which that flag does not exist, --duplicate-of for the close, and the option name (not its id) as an issue field value. The bare model reaches for gh api everywhere, guesses the version and sends the option id.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

I need the commands for three small changes in github.com/acme/storefront, to paste into our runbook. I'll run them myself, nothing to execute here. My laptop has gh 2.102.0 and the CI runner is stuck on gh 2.90.0. Use a built-in `gh issue` flag wherever the installed gh has one, and `gh api` only where it does not.

1. Issue 124 already exists. Record that it is blocked by issue 120.
2. Close issue 131 as a duplicate of issue 120.
3. The acme org uses GitHub issue fields (the typed fields on the issue itself, not project board fields). The org field list returned `{"id": 7, "name": "Priority", "data_type": "single_select", "options": [{"id": 31, "name": "P0"}, {"id": 32, "name": "P1"}]}`. Set Priority to P1 on issue 124.

End your reply with exactly these five lines, filled in:

LAPTOP_BLOCKED: <the full command for change 1 on the laptop>
RUNNER_SAME_COMMAND: <YES or NO, does that exact command also work on the runner's gh 2.90.0>
MIN_GH: <the lowest gh version that accepts the LAPTOP_BLOCKED command, as x.y.z>
DUPLICATE_CLOSE: <the full command for change 2 on the laptop>
PRIORITY_VALUE: <the exact JSON value sent as the Priority value in change 3>
