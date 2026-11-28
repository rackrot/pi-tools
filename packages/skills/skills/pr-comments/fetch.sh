#!/usr/bin/env bash
# Print a GitHub PR's unresolved review threads and review summaries as compact Markdown.
# Usage: fetch.sh [PR number|URL]   (default: the current branch's PR)
# Read-only: runs only `gh pr view`, a `gh api graphql` query, and, when GraphQL fails,
# GET requests to the REST pulls endpoints.
#
# The agent runs this with the Bash tool and reads stdout, so
# anything that only means "nothing was fetched" (a non-GitHub origin, no gh,
# no PR, pasted text instead of a reference) prints a "Review feedback not fetched"
# line on stdout and exits 0, and the skill decides what to do next. Only a bad
# option exits 2.

set -euo pipefail

dir=$(cd "$(dirname "$0")" && pwd)

fail() {
  echo "error: $1" >&2
  exit 2
}

unavailable() {
  echo "Review feedback not fetched: $1"
  exit 0
}

# Fallback when GraphQL fails (it is blocked in some cloud sessions). REST has no thread
# resolution state, so every thread is listed. The reference is validated and passed to
# gh as separate argv words, never spliced into a shell string. Prints nothing and
# returns 1 when it cannot fetch.
rest_fetch() {
  local ref=${1:-} host owner repo pr remote path branch tmp out
  local name_re='^[A-Za-z0-9._-]+$'
  local -a api=(gh api)
  if [[ $ref =~ ^https://([^/]+)/([^/]+)/([^/]+)/pull/([0-9]+) ]]; then
    host=${BASH_REMATCH[1]} owner=${BASH_REMATCH[2]} repo=${BASH_REMATCH[3]} pr=${BASH_REMATCH[4]}
  else
    [[ -z $ref || $ref =~ ^[0-9]+$ ]] || return 1
    pr=$ref
    remote=$(git remote get-url origin 2>/dev/null) || return 1
    path=${remote#*://}
    host=${path#*@}
    host=${host%%[:/]*}
    path=${path#*@}
    path=${path#*[:/]}
    path=${path%.git}
    path=${path%/}
    owner=${path%%/*}
    repo=${path#*/}
  fi
  [[ $host =~ ^[A-Za-z0-9.-]+$ && $owner =~ $name_re && $repo =~ $name_re ]] || return 1
  api+=(--hostname "$host")
  if [ -z "$pr" ]; then
    branch=$(git branch --show-current 2>/dev/null) || return 1
    [ -n "$branch" ] || return 1
    pr=$("${api[@]}" --method GET "repos/$owner/$repo/pulls" -f head="$owner:$branch" -f state=open \
      --jq '.[0].number // empty') || return 1
  fi
  [[ $pr =~ ^[0-9]+$ ]] || return 1
  tmp=$(mktemp -d)
  out=$(
    "${api[@]}" "repos/$owner/$repo/pulls/$pr" >"$tmp/pr.json" &&
      "${api[@]}" --paginate "repos/$owner/$repo/pulls/$pr/comments" >"$tmp/c.json" &&
      "${api[@]}" --paginate "repos/$owner/$repo/pulls/$pr/reviews" >"$tmp/r.json" &&
      jq -n --slurpfile pr "$tmp/pr.json" --slurpfile c "$tmp/c.json" --slurpfile r "$tmp/r.json" \
        -f "$dir/rest.jq" | jq -rs -f "$dir/format.jq"
  ) || { rm -rf "$tmp"; return 1; }
  rm -rf "$tmp"
  echo "Note: GraphQL was unavailable, so this came from the REST API. Resolved and outdated state is unknown: every thread is listed as open."
  echo "$out"
}

[[ ${1:-} != -* ]] || fail "expected a PR number or URL, not an option: $1"
[ $# -le 1 ] || unavailable "the arguments are not a single PR number or URL. Use any review text the user pasted; otherwise ask for a PR number or URL."

# Host of origin, used only to tell GitHub from other forges. A URL argument names its
# own host, so origin does not matter then.
host=
if [[ ${1:-} != *://* ]]; then
  host=$(git remote get-url origin 2>/dev/null || true)
  host=${host#*://}
  host=${host#*@}
  host=${host%%[:/]*}
fi

if [ -n "$host" ] && [ "$host" != github.com ] &&
  ! { command -v gh >/dev/null && gh auth status --hostname "$host" >/dev/null 2>&1; }; then
  unavailable "origin host $host is not a GitHub host gh knows. For Forgejo, Codeberg or Gitea use /forgejo-pr-comments; with several remotes, pass the PR URL."
fi

for tool in gh jq; do
  command -v "$tool" >/dev/null || unavailable "$tool is not installed."
done

# gh pr view accepts a number, a URL, or nothing (the current branch).
url=$(gh pr view ${1:+"$1"} --json url --jq .url) || {
  rest_fetch "${1:-}" && exit 0
  unavailable "could not find the pull request (see gh's message above)."
}

# https://github.com/OWNER/REPO/pull/N
IFS=/ read -r _ _ _ owner repo _ pr <<<"$url"
[[ $pr =~ ^[0-9]+$ ]] || unavailable "unexpected PR URL: $url"

pages=$(gh api graphql --paginate -f owner="$owner" -f repo="$repo" -F pr="$pr" \
  -F query=@"$dir/threads.graphql") || {
  rest_fetch "$url" && exit 0
  unavailable "the GraphQL query and the REST fallback both failed (see gh's message above)."
}

jq -rs -f "$dir/format.jq" <<<"$pages"
