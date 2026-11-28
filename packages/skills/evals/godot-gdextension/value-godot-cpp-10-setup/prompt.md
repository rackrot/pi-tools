---
name: value-godot-cpp-10-setup
description: Value case. New godot-cpp project for Godot 4.7 that must also load in 4.4; the bare model picks a per-engine godot-cpp branch and does not know the hot-reload build option that is off by default in godot-cpp 10.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

starting a new C++ native extension for our Godot game this week. I'm on Godot 4.7, two teammates are still on 4.4 and the same built library has to load for them too. godot-cpp goes in as a git submodule and we build with scons. Nothing is set up yet, so there are no files to look at. Three things I need settled before I start:

1. which godot-cpp branch or tag do I check out in the submodule?
2. I'll put `reloadable = true` in the .gdextension file so the editor picks up rebuilds. Do I have to pass anything to scons for that to actually work, and if so what?
3. what value goes in `compatibility_minimum`?

Keep it short, and end your reply with exactly these three lines, filled in:

REF: <branch or tag name>
RELOAD_OPTION: <the scons option as I would type it, or NONE>
COMPAT_MIN: <version>
