---
type: regex
pattern: '^[\s>*\-`]*RERUN\**\s*:\**\s*`*(?!.*run_tests\.py)(?=[^\n]*run_custom\.py)(?=[^\n]*--cmd[ =]["'']bundle exec rspec["''])[^\n]*spec/cart_spec\.rb:42'
flags: im
weight: 2
target: last_message
---
