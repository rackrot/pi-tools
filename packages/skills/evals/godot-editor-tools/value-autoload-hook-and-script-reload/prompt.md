---
name: value-autoload-hook-and-script-reload
description: Value case. Two editor-plugin facts a bare model gets wrong - autoloads are added in _enable_plugin (not _enter_tree), and on Godot 4.7 scripts rewritten on disk are refreshed in the Script editor with ScriptEditor.reload_open_files().
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Reviewing a teammate's Godot 4.7 editor plugin (GDScript) before we publish it, need a second pair of eyes on two spots.

A. The plugin registers a global with `add_autoload_singleton("PropRegistry", "res://addons/prop_placer/registry.gd")` and removes it with `remove_autoload_singleton`. Which EditorPlugin virtual method should the add call live in?

B. The plugin regenerates a few .gd files on disk with FileAccess. If one of them is open in the Script editor, the tab keeps showing the old text. Which method do I call on `EditorInterface.get_script_editor()` to make the open tabs pick up the new files?

End your reply with exactly these two lines, nothing after them:

AUTOLOAD: <method name only>
RELOAD: <method name only>
