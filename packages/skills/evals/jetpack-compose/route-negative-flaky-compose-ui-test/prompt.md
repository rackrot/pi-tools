---
name: route-negative-flaky-compose-ui-test
description: Near-miss negative. A flaky instrumented Compose UI test is test work (android-testing), not composable authoring, so the jetpack-compose skill should not be read.
tags: [trigger]
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

The instrumented test for our checkout screen passes on my machine but on CI it fails about one run in five: onNodeWithText("Pay now") can't find the node right after the test clicks "Continue". The test uses createAndroidComposeRule and someone put a Thread.sleep(2000) after the click, which didn't help. How do I make this test reliable?
