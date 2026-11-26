#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../_repo.sh"
# Two sibling changes edit the same line; rebasing one onto the other leaves a conflict in @.
jj new -m "left: greeting" >/dev/null 2>&1
printf 'def greet(name):\n    return "hi, " + name\n' > greet.py
jj new 'description(exact:"initial\n")' -m "right: exclaim" >/dev/null 2>&1
printf 'def greet(name):\n    return "hello " + name + "!"\n' > greet.py
jj rebase -r @ -o 'description(glob:"left*")' >/dev/null 2>&1
jj log -r 'conflicts() & ::@' --no-graph -T 'change_id' | grep -q .
