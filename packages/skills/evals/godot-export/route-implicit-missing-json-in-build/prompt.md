---
name: route-implicit-missing-json-in-build
description: "Routing, implicit. A Godot game that runs from the editor but cannot open a res:// JSON file in the build sent to a friend routes to godot-export without the words export, preset or template."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

my godot 4 game works fine when I hit F5, but the windows build I zipped up and sent to a friend dies on the title screen with "can't open res://data/levels.json". the file is right there in the project folder and I load it with FileAccess.open. nothing else is missing as far as we can tell, the scenes and sprites all show up. what did I do wrong and how do I fix it?
