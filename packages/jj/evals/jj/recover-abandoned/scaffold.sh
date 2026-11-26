#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../_repo.sh"
for x in a b c; do
  printf 'feature %s\n' "$x" > "$x.txt"
  JJ_EDITOR=false jj commit -m "add $x" >/dev/null 2>&1
done
# The user's mistake: abandon the middle change.
jj abandon 'description(glob:"add b*")' >/dev/null 2>&1
