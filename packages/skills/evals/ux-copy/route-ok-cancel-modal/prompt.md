---
name: route-ok-cancel-modal
description: "Trigger: a downgrade modal whose title and two buttons confuse users; the user wants better words for them. No skill name, no 'copy' or 'microcopy'."
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

people keep downgrading their plan by accident. the modal that comes up when you pick the cheaper plan has the title "Are you sure?" and the two buttons are "OK" and "Cancel", nothing else. what would you put in there instead? title, one line of body, both buttons.
