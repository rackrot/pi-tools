---
name: value-target-size-24px
description: Value case. Pointer targets judged against the WCAG 2.2 AA target size minimum, including the spacing, equivalent-control and user-agent exceptions; the bare model tends to fail every target under 24px.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

design spec for the orders screen, all sizes in CSS px. I need a pass or fail on each component for the WCAG 2.2 AA target size requirement.

- T1: toast close button. The visible icon is 16x16, centered inside a 24x24 clickable button.
- T2: pagination page-number links. Each is 20x20, with a 4 gap between neighbours, all in one row, nothing else nearby.
- T3: row action icons in the table. Each is 16x16, with a 4 gap between neighbours, all in one row.
- T4: the "x" remove button on each tag in the tag list. Each is 16x16 and they sit 4 apart. Every tag can also be removed with a 32x32 "Remove" button in the tag details panel on the same page.
- T5: the day cells in the calendar popup of a plain `<input type="date">`. We have not styled the popup; in the browser the cells render at about 20x20 with no gap.

end your reply with exactly one line per component in the form `T1: PASS` or `T1: FAIL`, T1 to T5 in order.
