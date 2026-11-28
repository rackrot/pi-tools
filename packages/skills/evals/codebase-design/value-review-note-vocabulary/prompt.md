---
name: value-review-note-vocabulary
description: Value case. A two-line finding written for architecture notes must use the skill's glossary (shallow or deep module, seam) and none of the substitutes it bans (component, service, boundary, API, unit); the bare model reaches for the banned words.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

write the finding for our architecture notes on the code below. Exactly two lines at the very end of your reply, nothing after them:

`Problem: <one sentence>`
`Solution: <one sentence>`

Do not put any class or file name in those two lines; describe them in general terms.

What we have, in `src/reports/`:

- `ReportFacade.generate(req)`: 12 lines, checks `req` is not null and calls `ReportCoordinator.run(req)`.
- `ReportCoordinator.run(req)`: 18 lines, calls `ReportLoader.load(req.id)`, then `ReportFormatter.format(data, req.format)`, then `ReportStore.save(out)`.
- `ReportLoader.load(id)`: 15 lines, one SQL query.
- `ReportFormatter.format(data, format)`: 30 lines, a switch over csv and pdf.
- `ReportStore.save(out)`: 10 lines, one S3 put.

Each of the five has its own test file that mocks its neighbours. The controllers import all five, and three controllers repeat the load, format, save sequence by hand instead of going through `ReportFacade`.
