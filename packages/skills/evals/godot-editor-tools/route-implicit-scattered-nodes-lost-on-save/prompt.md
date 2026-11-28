---
name: route-implicit-scattered-nodes-lost-on-save
description: Implicit trigger. A tool script that places nodes in the open scene from an Inspector button loses them on save and cannot be undone; the words plugin, addon and EditorPlugin never appear.
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

godot 4.5. I have a "Scatter" button that shows up in the Inspector when I select my ForestArea node, it spawns a few hundred tree nodes under it while I'm working on the level. They show in the viewport fine, but after I save and reopen the scene they are all gone, and Ctrl+Z right after scattering does nothing. what am I doing wrong?
