---
name: route-implicit-phone-photos-wont-open
description: "Routing, implicit. A client who cannot open iPhone HEIC photos, with a request to make the folder sendable, routes to file-conversion without the words convert, format or a tool name."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

the client is on an old Windows laptop and says none of the photos from Saturday's shoot will open. they're in ~/Pictures/shoot-0614, about 40 .HEIC files straight off my iPhone. sort it out so I can just zip the folder and send it, and don't mess up the rotation on the portrait ones.
