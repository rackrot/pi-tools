#!/usr/bin/env bash
# Merge main into open release-please PR branches, auto-resolving
# .release-please-manifest.json (each PR only owns its own package's version).
set -euo pipefail
M=.release-please-manifest.json
git fetch origin --quiet
branches=$(gh pr list --state open --json headRefName -q '.[].headRefName | select(startswith("release-please--"))')
for b in $branches; do
  echo "== $b"
  git checkout -q -B "sync/$b" "origin/$b"
  if git merge-base --is-ancestor origin/main HEAD; then echo "up to date"; continue; fi
  base=$(git merge-base origin/main HEAD)
  if ! git merge --no-edit origin/main >/dev/null 2>&1; then
    conflicts=$(git diff --name-only --diff-filter=U)
    if [ "$conflicts" != "$M" ]; then echo "unresolvable conflicts: $conflicts"; git merge --abort; continue; fi
    git show "$base:$M" > /tmp/m.base; git show "origin/main:$M" > /tmp/m.main; git show "origin/$b:$M" > /tmp/m.branch
    jq -n --tab --slurpfile base /tmp/m.base --slurpfile main /tmp/m.main --slurpfile br /tmp/m.branch '
      $main[0] as $m | $base[0] as $b | $br[0] as $r
      | reduce ($r|keys[]) as $k ($m; if $r[$k] != $b[$k] then .[$k]=$r[$k] else . end)' > "$M"
    git add "$M"; git commit -q --no-edit
  fi
  git push origin "HEAD:$b"
done
