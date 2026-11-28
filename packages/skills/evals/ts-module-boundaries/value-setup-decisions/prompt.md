---
name: value-setup-decisions
description: Value case. The slash command loads the manual skill (pi expands /skill:ts-module-boundaries inline; the bare arm sees it as plain text). Five decisions from the setup steps, each checked against dependency-cruiser 18.9. The skill says to stop on an unsupported TypeScript (7.0.x cruises zero modules and exits 0), to cruise the source root and not the packages folder, to ask before touching existing violations, to observe pass, fail, pass, and that the exit code is the count of error-severity violations. The bare model tends to wire it up anyway, baseline or downgrade the violations, and answer exit code 1.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:ts-module-boundaries I can't give you a shell in this session, so I'll run the commands myself afterwards. There are no files to open. Before I start, I need your decision on five points. Treat each as a separate repo.

A. Repo A has `typescript@7.0.2` and I've just installed `dependency-cruiser@18.6`. Do I go on and add the boundary check to CI now? Answer `WIRE` (go on) or `STOP` (don't add it yet).
B. Repo B has app code in `src/app` and the packages in `src/packages`. Which directory does the `lint:boundaries` script pass to `depcruise`? Answer with the path.
C. Repo C: the very first run of `lint:boundaries` reports 14 errors in code that already existed. What happens next? Answer `FIX` (you rewrite the offending imports), `RELAX` (downgrade the rules to warnings or baseline the known violations so CI is green) or `ASK` (report them and wait for my call).
D. Repo D: the first run is green. Counting that one, what is the smallest number of `lint:boundaries` runs I have to observe before the setup counts as finished? Answer with a number.
E. Repo E: a run finds 3 violations of severity `error` and 2 of severity `warn`. What is the exit code of `depcruise`? Answer with a number.

End your reply with exactly five lines, A to E in order, in the form `A: <answer>`, with nothing else on those lines.
