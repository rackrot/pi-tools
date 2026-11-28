---
name: value-gdunit4-exit-codes
description: "Value case. Maps the process exit status of gdUnit4's command line runner to what happened (100 failures, 101 warnings only, 103 headless refused, 104 Godot version unsupported, 105 script errors). The bare model tends to know at most 100 and guesses the rest; 104 and 105 are only in references/gdunit4.md, so they also show whether the reference is read."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our nightly job runs the game's gdUnit4 suites (gdUnit4 6.2, Godot 4.6) on five self-hosted runners. each one runs `./addons/gdUnit4/runtest.sh -a res://test -c`, or the equivalent direct Godot command on the box without a display. the log upload broke last night, so all I have per runner is the exit status of that command (the game repo is not checked out on the machine you are running on):

- R1: 101
- R2: 103
- R3: 100
- R4: 105
- R5: 104

what happened on each runner?

end your reply with exactly one line per runner, R1 to R5 in order, in the form `R1: LABEL`, where LABEL is one of: ALL_PASSED, TEST_FAILURES, WARNINGS_ONLY, HEADLESS_REFUSED, GODOT_VERSION_UNSUPPORTED, SCRIPT_ERRORS, TIMEOUT, CRASHED, UNKNOWN.
