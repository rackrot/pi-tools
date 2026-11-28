---
name: route-negative-compose-ui-test
description: Routing, near-miss negative. A Kotlin test, but it needs the Android runtime (Compose UI test on an emulator), which the skill hands to android-testing. kotlin-testing must not be read.
tags: [negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Our Kotlin UI test for the checkout screen passes on my machine and fails about one time in three on the CI emulator:

```kotlin
@get:Rule val rule = createAndroidComposeRule<CheckoutActivity>()

@Test
fun placesOrder() {
    rule.onNodeWithText("Place order").performClick()
    Thread.sleep(2000)
    rule.onNodeWithText("Order confirmed").assertIsDisplayed()
}
```

It runs with connectedDebugAndroidTest. The confirmation appears after a network call. What is the right way to wait for it?
