---
name: value-export-facts
description: Value case. Four yes/no export facts the bare model tends to get wrong - no rcedit since 4.5, single-threaded Web default since 4.3, PCK encryption needs self-compiled templates, and there is no "headless" feature tag.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm about to turn a teammate's notes into the export and release scripts for our Godot 4.6 game (GDScript, official editor, official export templates downloaded from the editor). before I build on them, check these four claims from the notes and tell me for each whether it is right.

- C1: "The Windows build is exported on a Linux CI runner, so to get our icon and the version/product metadata into the .exe we must install rcedit and wine on the runner and point Godot at rcedit."
- C2: "The Web preset is left at its defaults (we never touched Thread Support). It will start fine on itch.io without ticking itch's SharedArrayBuffer support option on the game page."
- C3: "We set an encryption key in the preset's Encryption tab and tick Encrypt Exported PCK. Exported with the official templates, the game runs normally and the pack is encrypted."
- C4: "The Linux server build is started with `--headless`, and the code detects that with `OS.has_feature(\"headless\")`, which returns true in that case."

end your reply with exactly four lines, C1 to C4 in order, in the form `C1: TRUE` or `C1: FALSE`.
