---
type: llm
weight: 3
---

Facts in the artifact: README.md tells the reader to install the package, run `notes-sync push ~/notes` and then `notes-sync status`. It never says that a config file with a server URL and an API token is needed, where that file lives, or where to get the token. A newcomer following it literally has no way to point the tool at a server or authenticate, so the first push cannot succeed from the README alone.

PASS only if all of these hold:

1. The final answer names the stall: the README never says where the notes are pushed to or how to configure or authenticate (server, token, config), so the push step cannot be completed from the README.
2. It gives a concrete fix for that gap (for example add a setup step that says what to configure, where, and how to get the token), not just "needs more detail".
3. It ends with a verdict that this README needs work or has a blocking gap (the words "stands alone" must not be the verdict).
4. It presents these as findings to act on and does not claim to have edited README.md.

FAIL otherwise. A response that only notes cosmetic or generic points (no screenshots, no license section) without the missing server or token setup fails. Do not reward length.
