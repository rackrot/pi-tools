---
name: trigger-compose-effect
description: A debounced search effect that fires a request per typed letter should load the jetpack-compose skill. Worded as the symptom, without the description's "restarts on every keystroke" phrase.
tags: [trigger]
model: claude-sonnet-5-5
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

In our Compose search screen a request goes out for every single letter the user types, and the `delay(300)` I put in front of the API call never seems to get to the end. The call sits in a `LaunchedEffect(query)` and `query` is a `remember { mutableStateOf("") }` in the same composable. What's the right way to fix it?
