---
name: trigger-implicit-no-emulator
description: Implicit trigger. A test for a SharedPreferences wrapper that should run without an emulator; no error string, no library named. Routes to android-testing (Robolectric versus instrumented).
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

We have a small Kotlin class in our app, PrefsStore, that wraps SharedPreferences and does a one-time migration of old keys the first time it is opened. I want a test for that migration, but our CI has no emulator and I'd rather not add one just for this. The class needs a real Context to get at the preferences. What kind of test is this, where does it go, and what has to be at the top of the test class? There is no test for it yet, so just describe how to write it.
