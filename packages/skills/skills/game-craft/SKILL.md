---
name: game-craft
description: "Engine-neutral game-development craft: game design and balancing, game feel, UI and accessibility, audio, enemy AI, code architecture and saves, art assets, level design, prototyping, playtests and performance. Use for design docs, floaty jumps, HUDs, music mixes, behavior trees, save systems, tilesets, pacing, greyboxing, playtest plans and stutter. Not for engine API (godot-* skills) or store pages, builds and releases (game-publish)."
---

# Game craft

Decision-changing numbers, procedures and traps for building a game in any engine. Read the one reference that matches the request; do not load the others.

Not for: engine API such as nodes, signals, physics bodies, shaders, export or tests (the `godot-*` skills, if installed); store pages, builds, itch.io and Steam uploads and release planning (`game-publish`); web or app UI (design skills).

## Route by topic

| Request | Read |
|---|---|
| GDD, pillars, core loop, mechanic spec, scope cuts, balance, XP and damage curves, economy, drop rates, "too hard" | [references/design.md](references/design.md) |
| "Floaty", "laggy", jump, coyote time, input buffer, deadzones, rebinding, camera follow and shake, juice, hit-stop, jitter | [references/feel.md](references/feel.md) |
| HUD, menus, pause, scaling and safe areas, gamepad focus, localization layout, subtitles, accessibility options | [references/ui.md](references/ui.md) |
| Mix, bus layout, volume sliders, loudness, ducking, SFX variation, adaptive music, beat sync | [references/audio.md](references/audio.md) |
| Running or analysing a playtest, surveys, observer notes, telemetry events, what to fix first, keep or kill | [references/playtest.md](references/playtest.md) |
| Enemy or NPC logic, FSM, behavior tree, utility AI, perception, pathfinding, "the enemy gets stuck" | [references/ai.md](references/ai.md) |
| Code structure, state machines, game loop and fixed step, pooling, inventory, abilities and buffs, save system | [references/architecture.md](references/architecture.md) |
| Art style, palette, sprites, tilesets, asset list, generated art briefs, import settings, asset licenses | [references/assets.md](references/assets.md) |
| Greybox or mechanic spike, vertical slice, game jam plan, keep or kill a prototype | [references/prototype.md](references/prototype.md) |
| Level layout, blockout, pacing, encounters, gating, procedural dungeons, caves, WFC, seeds | [references/levels.md](references/levels.md) |
| Low FPS, stutter, hitches, frame budget, profiling, regression benchmark | [references/performance.md](references/performance.md) |

A request that spans topics reads each file it touches. Each rule lives in one place and the other files point to it:

- Jump math, coyote time, input buffer and deadzones: `feel.md`.
- Object pooling, stat modifier order, inventory and save rules: `architecture.md`.
- Accessibility numbers (text, subtitles, flashing): `ui.md`.
- Telemetry events and survey rules: `playtest.md`.
- Seeded RNG and sub-seeds: `levels.md`.
- Drop tables, shuffle bags and pity: `design.md`.

## Where two topics collide

- "Jitters" at a steady frame rate is feel (render and physics rates out of step); low or uneven FPS is performance. Engine-side CharacterBody tuning is `godot-physics`.
- "Economy" and "loot" are design; "generate a roguelike dungeon" is levels, with the loot table left to design.
- "State machine" for a player controller or inventory is architecture; for an enemy's decisions it is AI, which defers structure to architecture.
- Planning a playtest is playtest; deciding what the design should be is design; automated tests are `godot-testing`.

## Rules that apply to every topic

- **Name the target or symptom first.** Write the player-facing target ("a boss fight lasts 60 to 90 s", "feels floaty" and its likely cause) before choosing a technique, and change one value at a time.
- **Numbers are starting points.** Quote a number with its scope and condition ("for console and PC only"), say it is a starting point to test unless its basis is named, and keep tunables as named data in seconds or units per second, never frames or constants buried in code.
- **Measure, then report what you measured.** Frame times, loudness readings, playtest counts, simulation percentiles. If you could not run the game or the profiler, say so and list what to check; never write "should be faster" or "should feel better".
- **Ask which artifact is wanted** when a design request could mean a pitch, a GDD, a mechanic spec, a balance model or a cut list.
- **Name the alternative you rejected** when recommending a structure or format, with the deciding factor.
- **Saves never use a format that can instantiate arbitrary types or run scripts** (engine-native resource or object serialisation) for user-writable files. Use JSON, a binary format you control, or a plain key-value file. Details in `architecture.md`.
- **Player data is personal data.** Telemetry and playtest recordings need consent, random ids instead of names or account ids, and the minimum fields the research questions need. Details in `playtest.md`.
- **Never install packages or tools without asking**, and confirm a tool exists before suggesting its command (asset checks, profilers).
- **Do not hand-write what the engine ships** (camera smoothing, physics interpolation, local avoidance, navmesh): check the engine skill first, then hand-roll only what it lacks.
