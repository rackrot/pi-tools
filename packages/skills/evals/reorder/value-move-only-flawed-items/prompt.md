---
name: value-move-only-flawed-items
description: "Value case. /skill:reorder loads the manual skill (pi expands it inline; the bare arm sees plain text). A troubleshooting list in arrival order holds a typo, an entry formatted differently from the rest (lowercase start, dash instead of colon), two near-duplicate entries and an entry that looks obsolete. The skill moves items only: nothing reworded, merged or removed, so all nine entries come back verbatim. The bare model tends to fix the typo and normalize the odd entry while sorting. Graders read the text between BEGIN and END plus the final ITEMS line."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:reorder the troubleshooting list in docs/faq.md

The list is pasted below, there is nothing to open or write. It is in the order people happened to report things and it is a mess, clean it up. Reply with the full new list between a line `BEGIN faq` and a line `END faq`, then any notes. End your reply with exactly one line in the form `ITEMS: <number of entries in your list>`.

- Printer does not show up on Windows 7: install the legacy driver pack from the downloads page.
- Cannot log in after a password change: clear the saved session under Settings > Devices.
- Invoice shows the wrong VAT rate: set the billing country on the organisation, not on the user.
- Pasword reset email never arrives: check the spam folder, then ask an admin to resend it.
- Print job is stuck in the queue: restart the spooler service.
- Can't sign in after changing my password: sign out on all devices, then sign in again.
- Card was charged twice: the second charge is a hold and drops off within 5 days.
- Locked out after 5 wrong passwords: wait 15 minutes or ask an admin to unlock the account.
- printing comes out blank - the PDF renderer is off, enable it under Settings > Printing.
