#!/usr/bin/env bash
set -euo pipefail
cat > SETUP.md <<'J'
# Setup

1. Install the CLI with `npm install -g acme-cli`.
2. Run `acme login` and paste the token from the old dashboard.
3. Run `acme init` to create `config.json`.

Updated: the token step is skipped on the new dashboard, so step 2 is only needed on self-hosted installs.

Previously `acme init` created `config.json`; it now writes `acme.yml`.

~~Requires Node 16.~~ Requires Node 20 or newer.

Configuration lives in `acme.yml`. Configuration lives in `config.json`.
J
