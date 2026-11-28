---
name: trigger-sbt-implicit-skipped-suites
description: Implicit trigger. Green suites stop executing after project/build.properties moves to 2.0.11; the build tool is never named.
tags: [trigger]
runs: 3
max_turns: 5
allowed_tools: [Read, Glob, Grep, Skill]
---

since we bumped project/build.properties to 2.0.11 the nightly job hardly executes any of our test suites. the step still runs `"clean ; test"` like before, the log shows only the two suites I touched yesterday and then `[success] elapsed time: 1 s`. nobody changed the test config and the Scala version is the same. is something broken or is that expected now, and what do I change so the whole suite really runs every night?
