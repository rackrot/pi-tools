---
name: value-confirm-buttons-name-the-action
description: "Value case. A destructive confirmation dialog in a product with no style guide. The skill's default pattern labels both buttons with the action (\"Delete files\" / \"Keep files\") and names the action in the title; the bare model keeps \"Cancel\" as the second button."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

in the invoices table you can tick several rows and hit Delete in the toolbar. deleted invoices are gone for good, there is no trash. I need the dialog that comes up when 3 rows are ticked. we have no style guide or existing dialogs to copy from, and there is no repo in this session, so just decide.

End your reply with exactly these three lines and nothing after them:

TITLE: <dialog title>
BODY: <dialog body>
BUTTONS: <confirm button label> | <other button label>
