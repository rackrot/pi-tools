---
name: value-targetsdk-36-impact
description: "Value case. Four facts from the targetSdk behavior-change reference (API 35 and 36), asked as an impact sheet with fixed final lines: setInterruptionFilter no longer changes global Do Not Disturb at 35 (it becomes the app's own AutomaticZenRule), onBackPressed is not dispatched at 36, scheduleAtFixedRate replays at most one missed run at 36, elegantTextHeight is ignored at 36. The bare model answers 30 missed runs every time."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

We ship an Android podcast app that is still on targetSdk 34 and we want to go straight to 36 next sprint. I need a quick impact sheet for the team, no code changes yet. The repo is not checked out here, so the four things below are all you get:

1. A "sleep mode" feature calls NotificationManager.setInterruptionFilter(INTERRUPTION_FILTER_NONE) to silence the phone. Once we target 35 or higher, does that call still switch the device's global Do Not Disturb state, or does it only become a rule owned by our app?
2. PlayerActivity overrides onBackPressed() to collapse the player sheet. On an Android 16 device, once we target 36 and change nothing else, is that override still invoked on a back gesture?
3. A ScheduledExecutorService.scheduleAtFixedRate task with a one minute period missed 30 runs while the app was cached. Targeting 36, how many of those missed runs execute right away when the app comes back to a valid lifecycle state?
4. Our transcript TextView sets android:elegantTextHeight="false" to keep Thai lines compact. Targeting 36 on Android 16, is that attribute still honored?

Explain briefly, then finish with exactly these four lines, filled in, as the last lines of your answer:

DND_CALL: GLOBAL or APP_RULE
ONBACKPRESSED: CALLED or NOT_CALLED
MISSED_RUNS: <number>
ELEGANT_TEXT_HEIGHT: HONORED or IGNORED
