---
name: route-negative-compose-test-on-device
description: "Near miss: an instrumented Compose test that fails on a physical phone mentions a device and connectedDebugAndroidTest, but fixing the test belongs to android-testing, not to adb crash triage."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

my checkout screen test is green on the emulator but on the Pixel 8 on my desk `./gradlew connectedDebugAndroidTest` fails it with "No compose hierarchies found in the app". Nothing crashes, the test just can't find the screen. What do I change in the test?
