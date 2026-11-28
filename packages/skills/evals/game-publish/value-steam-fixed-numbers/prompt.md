---
name: value-steam-fixed-numbers
description: Value case. Valve's fixed waits and limits for a first Steam release (21-day app fee wait, launch discount cap and length, 95 % discount ceiling, Next Fest demo review deadlines); the bare model tends to answer 30 days, 90 % and guessed deadlines.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we're a two-person studio and this will be our first game on Steam. I'm filling in the release plan and need the hard numbers from Valve's current rules, not rules of thumb. No explanation needed beyond a sentence each.

1. We pay the Steam app fee on day 0. How many days must pass before Valve lets us release this game?
2. What is the biggest launch discount we can set, in percent?
3. What is the longest a launch discount can run, in days?
4. Later on, what is the deepest discount Steam allows on any sale, in percent?
5. We want the demo in Steam Next Fest. How many weeks before the fest starts must the demo be submitted for review, at the latest, to be live when the fest opens?
6. And how many weeks before the fest must it be submitted if we want it playable for the Press Preview?

end your reply with exactly these six lines, each with a single whole number and nothing else after the colon:

FEE_WAIT_DAYS: <n>
LAUNCH_DISCOUNT_MAX_PCT: <n>
LAUNCH_DISCOUNT_MAX_DAYS: <n>
ANY_DISCOUNT_MAX_PCT: <n>
FEST_DEMO_REVIEW_WEEKS: <n>
PRESS_PREVIEW_DEMO_REVIEW_WEEKS: <n>
