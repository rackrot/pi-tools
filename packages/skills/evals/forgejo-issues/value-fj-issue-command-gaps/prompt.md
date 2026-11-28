---
name: value-fj-issue-command-gaps
description: "Value case. Five facts about fj 0.7.0 issue commands that differ from gh habits: no label flag on create, no reopen, depend add direction, no JSON output, close -w. The bare model guesses gh-style answers."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm writing a shell script for issue housekeeping on our Codeberg repo acme/widgets with fj 0.7.0. fj only, no API calls and no browser. You can't run fj from here, so don't try; answer from what you know and I'll test it on my side. Before I start I need five things settled:

1. Can `fj issue create` set labels in the same command?
2. Is there an `fj issue reopen` subcommand?
3. Issue 123 must not start until issue 120 is done. What is the full fj command that records this on 123?
4. Can `fj issue search` print JSON?
5. Which flag on `fj issue close` leaves a comment before closing?

Explain as much as you like, but end your reply with exactly these five lines and nothing after them:

Q1: YES or NO
Q2: YES or NO
Q3: the full command
Q4: YES or NO
Q5: the flag, or NONE
