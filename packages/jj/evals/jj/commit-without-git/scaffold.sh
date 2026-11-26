#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../_repo.sh"
printf 'def greet(name):\n    return f"hello {name}!"\n' > greet.py
