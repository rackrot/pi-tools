---
name: route-approved-settings-screen
description: "Positive trigger: an approved screen has to be written up for the developers who build it."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

the notification settings screen is approved, nothing more will change on the design side. can you write it up for the two developers who build it next sprint? what I have from the designer's file:

- one column, max width 640px, 24px between sections, 16px inside a section
- three sections: Email, Push, Quiet hours; each has a 20px semibold heading and a list of rows
- a row is a 14px label on the left, a toggle on the right, 48px tall
- Quiet hours has two time pickers (from, to) that are greyed out until its toggle is on
- a sticky "Save changes" bar slides up from the bottom once anything was changed
- colours: text #1A1A1A, toggle on #2F6FED, dividers #E5E7EB
