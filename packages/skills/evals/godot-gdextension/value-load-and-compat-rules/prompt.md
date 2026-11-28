---
name: value-load-and-compat-rules
description: Value case. Six yes/no statements on GDExtension loading rules (the 4.0 break, the compatibility_minimum floor, top-to-bottom library matching, no C# wrappers, GDREGISTER_CLASS running in the editor); the bare model guesses several wrong.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

our first native extension for the game (C++ with godot-cpp, lives in addons/foo/ with foo.gdextension) ships with the next release. The release plan leans on the assumptions below and I want each one checked before I sign it off. I can't attach the repo here, so go by the statements as written.

- S1: A library we built against the Godot 4.0 extension API will load in Godot 4.2.
- S2: A library we built against the Godot 4.3 extension API will load in Godot 4.6.
- S3: Godot 4.3 accepts a .gdextension file that has `compatibility_minimum = "4.0"`.
- S4: Our [libraries] section lists `linux.x86_64 = "bin/libfoo.debug.so"` on the first line and `linux.release.x86_64 = "bin/libfoo.release.so"` on the second line. A Linux x86_64 release export loads libfoo.release.so.
- S5: Our C# gameplay scripts can write `var n = new FooNode();` for a class FooNode that the extension registers, because Godot generates a C# wrapper for it.
- S6: A node class registered with plain `GDREGISTER_CLASS` has its `_process` called while its scene is open in the editor.

end your reply with exactly one line per statement in the form `S1: YES` or `S1: NO`, S1 to S6 in order.
