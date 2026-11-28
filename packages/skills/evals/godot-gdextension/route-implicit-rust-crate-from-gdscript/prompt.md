---
name: route-implicit-rust-crate-from-gdscript
description: Implicit trigger. Calling a Rust crate from a Godot 4 game without naming GDExtension, godot-rust or any file the description lists; godot-gdextension should load.
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we wrote our hex-grid pathfinder as a plain Rust crate for the game server. now the Godot 4.5 client needs the same code so GDScript can call find_path() on it instead of our slow port. the stock editor from the website has to keep working, no custom engine build. how do I hook the crate up, and what do I have to ship per platform?
