---
type: regex
pattern: '^[\s>*\-`]*CONFIRM\**\s*:\**\s*`*(?!.*run_tests\.py)(?=[^\n]*run_custom\.py)(?=[^\n]*--cmd[ =]["'']bundle exec rspec["''])[^\n]*--all\b'
flags: im
weight: 2
target: last_message
---
