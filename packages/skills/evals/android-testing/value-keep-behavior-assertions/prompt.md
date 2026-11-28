---
name: value-keep-behavior-assertions
description: "Value case. Five planned Compose UI test checks; the skill's first rule keeps the ones on behavior and state (enabled, callback fired, node exists) and drops the ones that assert copy or a label just to see it (C2, C4). A bare model keeps at least one of the copy checks."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm adding a Compose UI test for our ProfileScreen in app/src/androidTest (createComposeRule and the ui-test dependencies are already in the module). These are the five checks I planned to write:

- C1: after a name is typed, the Save button is enabled (`assertIsEnabled`).
- C2: the Save button's label reads "Save changes" (`assertTextEquals`).
- C3: clicking Save calls `onSaveClick` once (captured callback).
- C4: the heading "Edit profile" is shown (`onNodeWithText("Edit profile").assertIsDisplayed()`).
- C5: while `state.saving` is true, the node tagged `spinner` exists and the Save button is not enabled.

Which of these should go in and which should I leave out? End your reply with one line in exactly this form, ids in ascending order, nothing after it:

KEEP: <ids separated by commas>
