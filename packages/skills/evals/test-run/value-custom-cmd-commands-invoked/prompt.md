---
name: value-custom-cmd-commands-invoked
description: "Value case. The prompt types the slash command with a custom --cmd (pi expands /skill:test-run inline; the bare arm sees it as plain text). The runner has no shell, so the user asks for the three commands of the loop. The skill decides them: run_tests.py rejects --cmd, so the first run and the rerun both go through run_custom.py with the same --cmd, the printed failure id is the rerun target, and the confirmation is one --all run. The bare model answers with plain rspec commands. t4 (weight 1) checks that the script path points into the skill directory: the user runs from the project root, where a bare scripts/run_custom.py does not exist. It fails while SKILL.md prints the commands as python3 scripts/..., and should pass once the skill names its own directory."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:test-run --cmd "bundle exec rspec"

There is no shell in this session, so you cannot run anything; I run the commands myself in the project root and paste back what they print. There are no files to open. Tell me the three commands of the loop up front:

1. the first run;
2. the rerun after you have fixed a failure, for the case where the first run printed one failure block headed `### 1. spec/cart_spec.rb:42`;
3. the last run, once that rerun is green.

end your reply with exactly these three lines, each holding one complete shell command and nothing else:

FIRST: <command>
RERUN: <command>
CONFIRM: <command>
