---
name: value-inventory-design-review
description: Value case. An item registry that scans the data folder at startup must be rejected (references/patterns.md, build the registry from an explicit list, because exported builds rename or pack asset files); two sound decisions are controls against answering CHANGE everywhere. The bare model accepts the folder scan.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

inventory design for our survival game, fixed array of 24 slots. review each decision before I build it.

- N1: item definitions are data files with a string id. at startup the item registry finds them by listing every file in the `data/items/` folder and loading each one, so adding an item needs no code change.
- N2: two items are the same item when their ids are equal. we never compare the definition objects themselves.
- N3: `max_stack` is a field in the item's data file. swords and key items have `max_stack = 1`, and `add_item` has no special case for them.

end your reply with exactly one line per decision in the form `N1: OK` or `N1: CHANGE`, N1 to N3 in order. OK means build it as written, CHANGE means it has to be done differently.
