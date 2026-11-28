---
name: value-dedicated-server-plan
description: Value case. Five claims in a Godot 4 dedicated-server plan judged OK or WRONG; turns on there being no "headless" feature tag, the dedicated_server tag forcing --headless, the glibc requirement, PCK encryption not hiding server code, and placeholder resources keeping scenes loadable. The bare model tends to accept the headless feature check and reject the launch without --headless.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

this is the plan for the server side of our Godot 4.7 arena game (ENet, GDScript, one project for client and server). before I hand it to the ops guy, tell me for each point whether what it claims is right.

- D1: the server is started on the VPS as `./game.x86_64 --headless`. the boot autoload does `if OS.has_feature("headless"): start_server() else: start_client()`. claim: on the VPS this takes the `start_server()` branch.
- D2: the server preset uses the "Export as dedicated server" export mode. the systemd unit runs `/srv/game/game.x86_64 -- --port 7777`, with no `--headless` in it, and the VPS has no display. claim: the process starts fine and does not try to open a window.
- D3: the container image is `FROM alpine:3.20` and we copy in the binary and .pck produced with the official Linux x86_64 export template. claim: the binary runs in that image as is.
- D4: `anti_cheat.gd` holds the server's detection thresholds and is part of the shared project, so it is in the client build too. the client preset is exported with PCK encryption turned on. claim: players can not get at the contents of that script.
- D5: with the "Export as dedicated server" mode, the textures and meshes our level scenes reference are not shipped in the server .pck. claim: the server can still load those level scenes without missing-resource errors.

end your reply with exactly one line per point in the form `D1: OK` or `D1: WRONG`, D1 to D5 in order.
