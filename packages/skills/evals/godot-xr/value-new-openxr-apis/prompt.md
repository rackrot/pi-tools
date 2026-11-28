---
name: value-new-openxr-apis
description: "Value case. Three features that need the exact Godot 4.5 to 4.7 API names from the skill's platform reference: user_presence_changed (4.7), OpenXRSpatialAnchorCapability.create_new_anchor plus XRAnchor3D (4.6, the skill warns there is no XRSpatialAnchor class) and OpenXRRenderModelManager (4.5). A model without the reference tends to invent names or fall back to older signals."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Our Quest 3 game is on Godot 4.7 with the built-in OpenXR support. I want three things using only what ships in the engine, no extra addon code. There are no project files to look at, just answer.

1. Pause the game the moment the player takes the headset off their face (not just when the system menu opens).
2. Let the player pin a virtual object to a spot in their real room so it stays there.
3. Show the player's real controllers as 3D models supplied by the headset runtime, without us bundling controller meshes.

For each one, tell me in a sentence or two which engine API to use. Then end your reply with exactly these four lines, each filled with the exact Godot identifier and nothing else after the colon:

HEADSET_REMOVED_SIGNAL: <signal name on OpenXRInterface>
ANCHOR_CREATE_CALL: <Class.method that creates the anchor>
ANCHOR_NODE: <node class that follows the anchor in the scene>
CONTROLLER_MODEL_NODE: <node class to add under XROrigin3D>
