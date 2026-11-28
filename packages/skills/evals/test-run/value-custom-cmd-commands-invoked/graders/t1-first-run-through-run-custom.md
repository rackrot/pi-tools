---
type: regex
pattern: '^[\s>*\-`]*FIRST\**\s*:\**\s*`*(?!.*run_tests\.py)[^\n]*run_custom\.py[^\n]*--cmd[ =]["'']bundle exec rspec["'']'
flags: im
weight: 2
target: last_message
---
