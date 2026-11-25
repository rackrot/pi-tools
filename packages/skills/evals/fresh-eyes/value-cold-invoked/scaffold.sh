#!/usr/bin/env bash
set -euo pipefail
cat > README.md <<'J'
# notes-sync

Keeps a folder of Markdown notes in sync with your team's shared notes server.

## Requirements

Python 3.11 or newer.

## Install

```
pip install notes-sync
```

## Push your notes

```
notes-sync push ~/notes
```

Every changed file under `~/notes` is uploaded. Files you delete locally are removed from the server on the next push.

## Check the result

```
notes-sync status
```

It prints `in sync` when the server has everything you have.

## Troubleshooting

If `status` prints `behind`, run `notes-sync pull ~/notes` and push again.
J
cat > config.example.toml <<'J'
# notes-sync reads ~/.config/notes-sync/config.toml; push fails without it.
server = "https://notes.example.com"
token = "paste-your-api-token-here"
J
