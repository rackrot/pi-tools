---
name: game-craft
description: "Engine-neutral game craft for one request spanning several topics, such as demo or playtest feedback mixing sluggish controls, frame drops and lost saves. Covers design, balance and art assets only when game-design or game-assets is not installed. Not for single-topic requests: enemy/NPC AI (game-ai), code structure and saves (game-architecture), audio mix (game-audio), feel-only requests such as floaty jumps and camera shake (game-feel), HUDs, menus or accessibility (game-ui), levels and procgen (level-design), low FPS and stutter (game-performance), playtests (game-playtest), prototypes or game jams (game-prototype), engine API (godot-* skills), store pages and releases (game-publish)."
---

# Game craft

Decision-changing numbers, procedures and traps for building a game in any engine. Read the one reference that matches the request; do not load the others.

Not for: engine API such as nodes, signals, physics bodies, shaders, export or tests (the `godot-*` skills, if installed); store pages, builds, itch.io and Steam uploads and release planning (`game-publish`); web or app UI (`ui-direction`, `design-critique`, `accessibility-review`). A single-topic request goes to its topic skill: enemy and NPC decision-making, behavior trees, utility AI, perception, pathfinding and steering (`game-ai`); code structure, state machines, game loop, pooling, inventory, abilities and save systems (`game-architecture`); game audio mix, loudness, ducking, SFX variation, adaptive music and beat sync (`game-audio`); control feel, camera and juice on their own (`game-feel`); game HUDs, menus, scaling, focus and accessibility options (`game-ui`); level design, pacing, encounters and procedural levels (`level-design`); low FPS, stutter, hitches, frame budgets and profiling (`game-performance`, if installed); planning, running or analysing playtests (`game-playtest`); mechanic spikes, greyboxing, vertical-slice prototypes, keep-or-kill calls on a prototype, and game-jam plans (`game-prototype`); game design docs, balance, economy or drop rates (`game-design`, if installed); the game art pipeline (`game-assets`, if installed).

## Route by topic

| Request | Read |
|---|---|
| GDD, pillars, core loop, mechanic spec, scope cuts, balance, XP and damage curves, economy, drop rates, "too hard" | `game-design` skill if installed; otherwise [references/design.md](references/design.md) (only when game-design is not installed) |
| "Floaty", "laggy", jump, coyote time, input buffer, deadzones, rebinding, camera follow and shake, juice, hit-stop, jitter | Feel-only request: `game-feel` skill. Read [references/feel.md](references/feel.md) only when feel is one part of a multi-topic request |
| HUD, menus, pause, scaling and safe areas, gamepad focus, localization layout, subtitles, accessibility options | `game-ui` skill |
| Acting on playtest results, surveys, observer notes, telemetry events, what to fix first | `game-playtest` skill |
| Code structure, state machines, game loop and fixed step, pooling, inventory, abilities and buffs, save system | `game-architecture` skill |
| Art style, palette, sprites, tilesets, asset list, generated art briefs, import settings, asset licenses | `game-assets` skill if installed; otherwise [references/assets.md](references/assets.md) |
| Level layout, blockout, pacing, encounters, gating, procedural dungeons, caves, WFC, seeds | `level-design` skill |
| Low FPS, stutter, hitches, frame budget, profiling, regression benchmark | `game-performance` skill |

A request that spans topics reads each skill or file it touches. Each rule lives in one place and the others point to it:

- Jump math, coyote time, input buffer and deadzones: `game-feel` (`feel.md` is a short summary for multi-topic requests).
- Object pooling, stat modifier order, inventory and save rules: `game-architecture`.
- Accessibility numbers (text, subtitles, flashing): `game-ui` (references/accessibility.md).
- Telemetry events and survey rules: `game-playtest`.
- Seeded RNG and sub-seeds: `level-design`.
- Drop tables, shuffle bags and pity: `game-design` if installed, otherwise `design.md`.

## Where two topics collide

- "Jitters" at a steady frame rate is feel (`game-feel`; render and physics rates out of step); low or uneven FPS is `game-performance`. Engine-side CharacterBody tuning is `godot-physics`.
- "Economy" and "loot" are design; "generate a roguelike dungeon" is `level-design`, with the loot table left to design.
- State machine for a player controller or inventory is architecture; for an enemy's decisions it is `game-ai`.
- Planning or analysing a playtest is `game-playtest`; deciding what the design should be is design; automated tests are `godot-testing`.

## Rules that apply to every topic

- **Name the target or symptom first.** Write the player-facing target ("a boss fight lasts 60 to 90 s", "feels floaty" and its likely cause) before choosing a technique, and change one value at a time.
- **Numbers are starting points.** Quote a number with its scope and condition ("for console and PC only"), say it is a starting point to test unless its basis is named, and keep tunables as named data in seconds or units per second, never frames or constants buried in code.
- **Measure, then report what you measured.** Frame times, loudness readings, playtest counts, simulation percentiles. If you could not run the game or the profiler, say so and list what to check; never write "should be faster" or "should feel better".
- **Ask which artifact is wanted** when a design request could mean a pitch, a GDD, a mechanic spec, a balance model or a cut list.
- **Name the alternative you rejected** when recommending a structure or format, with the deciding factor.
- **Saves never use a format that can instantiate arbitrary types or run scripts** (engine-native resource or object serialisation) for user-writable files. Use JSON, a binary format you control, or a plain key-value file. Details in `game-architecture`.
- **Player data is personal data.** Telemetry and playtest recordings need consent, random ids instead of names or account ids, and the minimum fields the research questions need. Details in `game-playtest`.
- **Never install packages or tools without asking**, and confirm a tool exists before suggesting its command (asset checks, profilers).
- **Do not hand-write what the engine ships** (camera smoothing, physics interpolation, local avoidance, navmesh): check the engine skill first, then hand-roll only what it lacks.
