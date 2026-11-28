---
name: value-keep-or-revert-decisions
description: "Value case. Loop mechanics and keep-or-revert decisions that hinge on the skill's rules: undo with git revert and never reset, logs ignored through .git/info/exclude and not .gitignore, a run killed at twice its expected time, a gain inside the baseline noise is not a gain, a small gain does not buy added complexity by default, and a crashing experiment is abandoned after the default retry cap of 2."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

You are about to run an unattended optimization loop for me on branch `experiment/parser`. What we agreed: the metric is ns/op from `make bench`, lower is better; you may edit only `src/parser/`; `make test` must stay green and no new dependencies; 20 experiments at most; you keep `results.tsv` and `run.log` in the repo root. Nothing else was discussed, so anything else is at your defaults. The baseline was measured five times: 512, 514, 516, 518, 520 ns/op. A `make bench` run takes about 40 seconds.

First, three things about how you work:

- Q1: an experiment ended up as two commits on the branch (the change, then a fix for a typo) and the number got worse. Which single git command do you run to undo that experiment?
- Q2: `results.tsv` and `run.log` must stay untracked. In which file do you list them?
- Q3: after how many seconds do you kill a `make bench` run that hangs?

Then, I am not at the keyboard. For each event below, say what you do with that experiment: KEEP it, REVERT it, or RETRY it (fix and measure again).

- E1: the experiment measures 513 ns/op, tests green, the diff is 6 lines.
- E2: the experiment fails to compile because of a missing import. It is the first failure of this experiment.
- E3: the experiment measures 505 ns/op on three runs in a row, tests green. The diff adds 180 lines of hand-unrolled loops and two generated lookup tables.
- E4: the experiment measures 471 ns/op, tests green, the diff removes 40 lines.
- E5: the experiment failed to compile, you fixed it, it then crashed in the benchmark, you fixed that, and now it crashes in the benchmark again on another trivial mistake.

end your reply with exactly these eight lines, filled in, and nothing after them:

UNDO: <the git command>
LOGIGNORE: <path of the file>
KILL_AFTER: <number of seconds>
E1: KEEP, REVERT or RETRY
E2: KEEP, REVERT or RETRY
E3: KEEP, REVERT or RETRY
E4: KEEP, REVERT or RETRY
E5: KEEP, REVERT or RETRY
