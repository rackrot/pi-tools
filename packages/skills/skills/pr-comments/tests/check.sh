#!/usr/bin/env bash
# Render fixture pages through format.jq and diff against the expected Markdown.
# Each case is "<expected .md> <fixture pages...>"; pages are concatenated the
# way `gh api graphql --paginate` prints them.

set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
fixtures="$here/fixtures"
status=0

check() {
  local expected=$1
  shift
  if diff -u "$fixtures/$expected" <(cd "$fixtures" && cat "$@" | jq -rs -f "$here/../format.jq"); then
    echo "ok   $expected"
  else
    echo "FAIL $expected"
    status=1
  fi
}

check paged.md page1.json page2.json
check empty.md empty.json
check fence.md fence.json

# fetch.sh must exit 0 with a "not fetched" line when nothing could be fetched, so the
# agent reads the reason instead of an error. On a non-GitHub origin the line points at
# /forgejo-pr-comments. Stub gh (every call fails) and git (origin) on PATH.
fetch_case() {
  local label=$1 origin=$2 want_forgejo=$3 stubs out rc=0 got=false
  shift 3
  stubs=$(mktemp -d)
  printf '#!/bin/sh\nexit 1\n' >"$stubs/gh"
  printf '#!/bin/sh\necho %s\n' "$origin" >"$stubs/git"
  chmod +x "$stubs/gh" "$stubs/git"
  out=$(PATH="$stubs:$PATH" "$here/../fetch.sh" "$@" 2>/dev/null) || rc=$?
  rm -rf "$stubs"
  [[ $out == *forgejo-pr-comments* ]] && got=true
  if [ "$rc" = 0 ] && [[ $out == "Review feedback not fetched:"* ]] && [ "$got" = "$want_forgejo" ]; then
    echo "ok   fetch.sh $label"
  else
    echo "FAIL fetch.sh $label: rc=$rc out=$out"
    status=1
  fi
}
fetch_case "codeberg ssh origin" git@codeberg.org:me/repo.git true
fetch_case "codeberg https origin" https://codeberg.org/me/repo.git true
fetch_case "github origin, no PR" git@github.com:me/repo.git false
fetch_case "pasted text instead of a reference" git@github.com:me/repo.git false rename x to y

# When GraphQL fails, fetch.sh falls back to REST. The stub gh fails on GraphQL and
# `pr view` and answers the REST endpoints from fixtures; the stub git reports an origin
# and a branch. A reference that is not a number or a github URL must reach no gh call.
rest_case() {
  local label=$1 want=$2 stubs out rc=0 canary
  shift 2
  stubs=$(mktemp -d)
  canary="$stubs/pwned"
  cp "$fixtures/gh-rest-stub.sh" "$stubs/gh"
  printf '#!/bin/sh\ncase "$1" in remote) echo git@github.com:me/repo.git ;; branch) echo feature ;; esac\n' >"$stubs/git"
  chmod +x "$stubs/gh" "$stubs/git"
  out=$(cd "$stubs" && FIXTURES="$fixtures" PATH="$stubs:$PATH" "$here/../fetch.sh" "${@//CANARY/$canary}" 2>/dev/null) || rc=$?
  if [ "$rc" = 0 ] && [[ $out == "$want"* ]] && [ ! -e "$canary" ]; then
    echo "ok   fetch.sh REST fallback: $label"
  else
    echo "FAIL fetch.sh REST fallback: $label: rc=$rc out=$out"
    status=1
  fi
  rm -rf "$stubs"
}
rest_note="Note: GraphQL was unavailable"
rest_case "number" "$rest_note" 7
rest_case "url" "$rest_note" https://github.com/me/repo/pull/7
rest_case "current branch" "$rest_note" 
rest_case "shell metacharacters in a number" "Review feedback not fetched:" '7; touch CANARY'
rest_case "command substitution in a URL" "Review feedback not fetched:" 'https://github.com/me/repo$(touch CANARY)/pull/7'

# The REST rebuild renders through format.jq like a GraphQL page; threads are all open.
if diff -u "$fixtures/rest.md" <(cd "$fixtures" && jq -n --slurpfile pr rest-pr.json --slurpfile c rest-comments.json \
  --slurpfile r rest-reviews.json -f "$here/../rest.jq" | jq -rs -f "$here/../format.jq"); then
  echo "ok   rest.md"
else
  echo "FAIL rest.md"
  status=1
fi

# A bad option is still a usage error.
if (cd "$here" && ./../fetch.sh --bogus >/dev/null 2>&1); then
  echo "FAIL fetch.sh accepted an option"
  status=1
else
  echo "ok   fetch.sh rejects an option"
fi

exit "$status"
