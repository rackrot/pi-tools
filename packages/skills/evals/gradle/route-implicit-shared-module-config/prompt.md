---
name: route-implicit-shared-module-config
description: Implicit trigger. Duplicated module build setup and scattered version literals, described without naming Gradle or any of its features, should load the gradle skill.
tags: [trigger]
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

every one of our 14 modules copy-pastes the same chunk into its build.gradle.kts: Java 21, JUnit 5 setup, the same three test libraries with the version numbers typed out. Bumping mockito last week meant touching 14 files. I want that written once. I can't share the repo, so just tell me what structure to move to and what goes where.
