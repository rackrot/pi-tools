---
name: value-audit-fix-order
description: "Value case. Six README problems to put in fix order; the skill's default is status, install path, claim check, differentiation, badge row, full restructure. The bare model tends to lead with the broken install or the restructure."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm finishing an audit of the README of our Node library (github.com/acme/retryq) for the maintainers. These are the six things it failed on. The last part of the audit report is the fix list, and I need it in the right order: they only get an hour here and there for this. Nothing is forcing the timing: no launch coming up, and nobody has complained that they couldn't find something further down the page.

- badges: there are 9 badges under the title, including "PRs welcome" and "made with love". Should be 3.
- status: nothing says the project is still beta and the API changes between minor versions.
- install: the install section doesn't mention that it needs Node 20 or newer.
- restructure: the sections are in a poor order overall (background and history come before usage), the whole page needs reordering.
- why: there's no paragraph on why you'd pick this over p-retry.
- claims: it says "handles 10k jobs per second" with no benchmark in the repo, and documents a `--watch` flag that the argument parser doesn't have.

End your reply with exactly this line, filled in, and nothing after it. Use these six words: badges, status, install, restructure, why, claims.

ORDER: <the six words, comma-separated, first to fix first>
