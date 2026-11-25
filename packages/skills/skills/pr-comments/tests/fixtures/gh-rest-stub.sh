#!/bin/sh
# Stub gh for fetch.sh: GraphQL and `pr view` fail, REST endpoints answer from fixtures.
f=${FIXTURES:?}
case " $* " in
*" graphql "*) exit 1 ;;
*" pr view "*) exit 1 ;;
*/pulls/7/comments*) cat "$f/rest-comments.json" ;;
*/pulls/7/reviews*) cat "$f/rest-reviews.json" ;;
*/pulls/7*) cat "$f/rest-pr.json" ;;
*" repos/me/repo/pulls "*) echo 7 ;;
*) exit 1 ;;
esac
