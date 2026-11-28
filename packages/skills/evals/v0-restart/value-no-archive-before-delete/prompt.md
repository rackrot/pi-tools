---
name: value-no-archive-before-delete
description: 'Value case. The slash command loads the manual skill (pi expands /skill:v0-restart inline; the bare arm sees it as plain text). A pre-delete checklist for the old attempt. The skill says discarded code is not archived (git history holds it; no archive branch or note is required), the negative corpus is carried over, and provenance stays in local docs and out of the shipped product. The bare model approves the archive branch (6 of 6 runs on Haiku) and gets B, C and D right, so the branch grader carries half the weight and the other three are controls.'
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:v0-restart the route planner. The keep/drop split is settled and the old attempt lives on `main` in git. Before I delete the dropped code and begin the v0, this is my housekeeping checklist. Tell me for each step whether to do it or skip it. There are no files to open.

A. Create an `archive/attempt-2` branch that preserves the whole old tree, so the discarded code stays easy to find.
B. Export the old tree as `attempt-2.tar.gz` to the team drive, as a second copy in case someone needs to look something up later.
C. Copy the 30 route requests that produced wrong routes, and the failing tests that replay them, into the new tree.
D. Add a "History" section to the app's About screen saying that this is the third rebuild and what went wrong in the first two.

Give a one-line reason per step. End your reply with exactly four lines, A to D in order, in the form `A: DO` or `A: SKIP`.
