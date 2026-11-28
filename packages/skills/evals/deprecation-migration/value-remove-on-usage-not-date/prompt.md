---
name: value-remove-on-usage-not-date
description: Value case. Two removals whose announced date has arrived while internal callers remain; the skill says to remove only when measured usage is zero, not because the date passed. The bare model deletes on schedule.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

my team owns two things that are on their way out. I need a decision on each, with a sentence of reasoning.

- D1: a year ago we announced that the internal library `xmlexport` would be removed on a fixed date, and we sent a reminder every month. that date is today. metrics show two internal jobs still calling it, about 40 calls a day. do we delete it today as announced (REMOVE) or not (WAIT)?
- D2: the internal endpoint `/legacy-search` was announced for removal in the engineering newsletter six months ago, with the replacement and a migration guide. the removal date was last friday. the access log shows one caller left, the data team's nightly batch; they have acknowledged every reminder and say they will get to it. do we take the endpoint out this week as announced (REMOVE) or not (WAIT)?

end your reply with exactly one line per decision in the form `D1: REMOVE`, D1 then D2.
