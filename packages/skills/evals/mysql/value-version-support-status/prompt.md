---
name: value-version-support-status
description: Value case. MySQL 8.0 left regular support in April 2026 and the LTS lines are 8.4 and 9.7; the bare model answers from older training data and tends to miss 9.7 or call 8.0 supported.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we run MySQL Community 8.0.42 on our own VMs. I'm writing the infra plan for next year and before anyone touches the slow queries on that box I need two facts straight: is the 8.0 line still getting regular bugfix and security releases from Oracle, and which MySQL release lines are long-term support (LTS) right now, so we know what we could move to. no hedging in the final lines, give me your best answer.

end your reply with exactly two lines: first `8.0: SUPPORTED` or `8.0: EOL`, then `LTS: ` followed by the LTS release lines as major.minor, comma-separated, for example `LTS: 5.6, 5.7`.
