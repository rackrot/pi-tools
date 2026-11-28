---
name: value-leave-tight-and-drifted-alone
description: Value case. The slash command loads the manual skill (pi expands /skill:debloat inline; the bare arm sees it as plain text). Three passages the user calls bloated; only A is. B is a quickstart with no padding (a pass that finds nothing bloated changes nothing; teaching prose earns its length). C contradicts itself (stale content is named and handed to v0-rewrite, not force-compressed). The bare model tends to edit all three.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:debloat these three passages from our docs have all got bloated over the years. They are pasted below, there are no files to open.

Passage A (docs/release.md):

It is important to note that, in order to deploy the service, you will basically need to make sure that you run `make release` (which is the command that builds the release), and it should also be noted that this particular command must always be run from the repository root, since running it from anywhere other than the repository root will simply not work. Additionally, please be aware that the release build generally takes about 10 minutes, so you should plan accordingly for roughly ten minutes of build time.

Passage B (docs/quickstart.md):

1. Install the CLI: `npm install -g acme-cli`. It needs Node 20 or newer.
2. Run `acme init` in the project root. It writes `acme.yml`.
3. Self-hosted only: paste your token into `acme.yml` under `auth.token`.
4. Run `acme push`. A first push prints `created 1 project`. If it prints `401` instead, the token is wrong or has expired.

Passage C (docs/limits.md):

Uploads are capped at 25 MB per file. The API rejects anything larger with a 413. Uploads are capped at 100 MB per file since the storage migration, so most video clips fit. Keep batch jobs under the 25 MB cap or they fail with a 413.

Give me the result for each passage. End your reply with exactly three lines, A to C in order, in the form `A: EDITED` or `A: UNTOUCHED`, saying whether your reply changes the wording of that passage.
