#!/usr/bin/env bash
set -euo pipefail
cat > OPERATIONS.md <<'J'
# Operations notes

It is worth noting that, as a general rule, the service listens on port 8443 by default, which is the port that you will want to use when you are configuring the load balancer, and this is important to keep in mind when you set things up.

Basically, in order to keep the disk usage of the service at a reasonable level, the service will, in the vast majority of cases, keep its logs for a period of 14 days, after which time the logs are removed, and it is important to remember that the logs are removed after 14 days.

Please also note that, as far as uploads are concerned, the maximum size of a single upload that the service is able to accept is 25 MB, and this limit, which is 25 MB, applies to every upload in all cases.

Warning: never run `reset-db` against the production database, because it drops every table and cannot be undone. It is really very important that nobody ever does this, so please do be careful about it.
J
