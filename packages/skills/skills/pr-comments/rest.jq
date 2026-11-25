# Rebuild the GraphQL page shape of threads.graphql from REST responses, so format.jq
# renders both. REST has no thread resolution state, so every thread is open.
# Usage: jq -n --slurpfile pr pr.json --slurpfile c comments.json --slurpfile r reviews.json -f rest.jq
# (comments.json and reviews.json hold one array per page, as `gh api --paginate` prints them.)

def author: {login: .user.login, __typename: (if .user.type == "Bot" then "Bot" else "User" end)};

($c | add // []) as $all
| {data: {repository: {pullRequest: {
    number: $pr[0].number,
    title: $pr[0].title,
    headRefName: $pr[0].head.ref,
    baseRefName: $pr[0].base.ref,
    reviewThreads: {nodes: [
      $all[] | select(.in_reply_to_id == null) | . as $root
      | [$all[] | select(.id == $root.id or .in_reply_to_id == $root.id)] as $thread
      | {
          isResolved: false,
          isOutdated: false,
          path: $root.path,
          line: $root.line,
          originalLine: $root.original_line,
          comments: {
            totalCount: ($thread | length),
            nodes: [$thread[] | {author: author, body: .body, url: .html_url, diffHunk: .diff_hunk}]
          }
        }
    ]},
    reviews: {nodes: [($r | add // [])[-50:][] | {state: .state, author: author, body: .body}]}
}}}}
