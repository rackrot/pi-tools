---
name: route-negative-godot-android-aab
description: Near-miss negative. Producing a signed Android AAB from a Godot export preset is the godot-export skill's job; the words AAB, keystore and CI must not pull in play-publishing.
tags: [trigger]
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

My Godot 4 game exports to Android as an APK without problems, but I need an AAB now. Where in the export preset do I switch to AAB and point it at the release keystore, and how do I run that export headless on the CI runner?
