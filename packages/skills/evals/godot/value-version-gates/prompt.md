---
name: value-version-gates
description: Value case. Five changed defaults and renames from the skill's 4.5 to 4.7 version notes (TileMapLayer physics_quadrant_size, glow_intensity, area_mask, DEVICE_ID_KEYBOARD, font hinting); the bare model does not know the properties and numbers.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

We took our Godot game from 4.4 to 4.7 and five things changed that I have to fix or write down. Give me the exact names and numbers:

- A: since the 4.5 step, `get_coords_for_body_rid()` on our TileMapLayer returns a cell near the one that was hit instead of the exact one. Which TileMapLayer property do I set, and to what value, to get exact cells back?
- B: since the 4.6 step the glow is far too strong. What was the default of the Environment property `glow_intensity` before 4.6, and what is it from 4.6 on?
- C: since the 4.7 step our AudioStreamPlayer2D nodes no longer pick up the `audio_bus_override` of the Area2D they stand in. Which property on the player do I set, and to what value, to get that back?
- D: our rebinding code tells keyboard events apart with `event.device == 0`, and that stopped matching in 4.7. Which `InputEvent` constant do keyboard events carry as their device now?
- E: fonts imported after the 4.7 step look different. What was the font importer's default `hinting` value before 4.7, and what is it now?

End your reply with exactly five lines in this form and nothing after them:

A: property_name = value
B: old -> new
C: property_name = value
D: CONSTANT_NAME
E: old -> new
