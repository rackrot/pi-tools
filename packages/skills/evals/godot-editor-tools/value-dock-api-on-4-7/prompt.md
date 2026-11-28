---
name: value-dock-api-on-4-7
description: Value case. On Godot 4.7 both a side dock and a bottom-panel tab go through add_dock with an EditorDock (add_control_to_dock and add_control_to_bottom_panel are deprecated since 4.6); the bare model answers with the deprecated calls.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Two quick ones for my editor plugin. It only has to run on Godot 4.7, and I want zero deprecation warnings.

1. Which EditorPlugin method do I call in _enter_tree to put my panel on the right side as a dock?
2. I have a second panel that should be a tab in the bottom panel, next to Output. Which EditorPlugin method adds that one?

End your reply with exactly these two lines, nothing after them:

DOCK: <method name only>
BOTTOM: <method name only>
