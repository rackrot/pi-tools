---
name: value-wrapper-version-target
description: "Value case. Picking the Maven version for a wrapper bump needs the skill's dated release facts (latest 3.x is 3.9.16, Maven 4 is still a release candidate with no GA); the bare model answers with an older 3.9.x from memory. Update the graders when SKILL.md line 12 changes."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

housekeeping ticket: `.mvn/wrapper/maven-wrapper.properties` still pins Maven 3.9.6 and I want to bump `distributionUrl` in one go. Two questions. What is the newest 3.x release I should put there? And a colleague wants to jump straight to Maven 4 instead, "it must be final by now": is there a GA release of Maven 4 we could pin? You can't reach the network from here, so answer from what you have, and say so if you are unsure.

Keep it short and end your reply with exactly two lines in the form `MAVEN_3: 3.x.y` and `MAVEN_4_GA: yes` or `MAVEN_4_GA: no`.
