---
name: value-next-step-decisions-invoked
description: "Value case. The prompt types the slash command; the request text stays on the same line, because pi expands /skill:test-run only when it is followed by a space and text, not by a bare newline. Seven moments in a test-fix session, each answered with one of six next steps. Measured on Haiku: the bare model already gets S1 to S5 right from the option list (report on a green first run, full suite after targeted reruns, stop after three attempts, fix a collection error in project code, ask on a missing dependency), so those weigh 1 each as guards. It edits the test whose expectation is wrong (S6) and reports or shelves the flaky one (S7); the skill sends both to the user, and they carry the weight (3 each)."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:test-run nothing to run yet: there is no shell in this session and there are no files to open. Before we start for real I want to know how you will act. Below are seven separate moments from sessions like this one, each independent of the others. For each, pick the one thing you do next:

- FIX: edit code or a test, then rerun the failing test
- RETRY: run the same thing again without changing anything
- FULL: run the whole suite
- ASK: stop and ask me how to proceed
- REMAINING: stop working on this failure and list it as still failing
- REPORT: report the result and stop

S1. The very first run, no arguments. It prints `scope: affected (3 test files changed vs main)`, then `41 passed`, and exits 0.
S2. The first run had two failures. You fixed both, reran just those two ids, and that rerun exits 0.
S3. `tests/test_price.py::test_rounding` fails. You have made three different fixes, each a different idea, and it failed again after each one. You have a fourth idea.
S4. The run exits 2 and no tests ran: `error: ImportError: cannot import name 'parse_rate' from 'billing.rates'`. The branch's own diff renamed that function to `parse_rates` and missed one import.
S5. The run exits 2 and no tests ran: `error: ModuleNotFoundError: No module named 'psycopg2'`. The project lists psycopg2 in requirements.txt; it is just not installed on this machine.
S6. `test_leap_year` fails: it asserts `days_in_february(2024) == 28` and the code returns 29.
S7. `test_cache_expiry` failed in the first run. You reran that one test without touching anything and it passed; a third identical run failed again.

end your reply with exactly seven lines in the form `S1: WORD`, S1 to S7 in order, each with one word from the list.
