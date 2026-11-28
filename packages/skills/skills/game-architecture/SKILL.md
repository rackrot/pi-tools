---
name: game-architecture
description: "Rules and pitfalls for structuring game code in any engine: game loop and fixed timestep, player and object state machines (enum, per-state objects, hierarchical, parallel), event buses, object pools, item and inventory data, abilities, buffs and stat modifiers, scene flow, and save files that survive patches. Read it before designing, restructuring or reviewing these systems, even with no project files to look at. Use for \"how should I structure\", a sprawling player state machine, buffs that stack or expire wrongly, pooled bullets, how systems should talk to each other, or a save system. Not for NPC decisions (game-ai), controller feel (game-feel) or frame rate (game-performance)."
---

# Game architecture

How to structure game code so it survives growth. The basics are well known; this skill exists for the choices and the pitfalls. When you recommend a structure, name the alternative you rejected and the deciding factor ("a hierarchical machine, not a flat one, because grounded and airborne states share their transitions"). A pick with no named alternative can't be challenged.

Not for: engine API (for Godot, the `godot` skill covers nodes, signals, autoloads and file access, if installed); controller feel (`game-feel`); NPC decision-making (`game-ai`); frame-rate work (`game-performance`); general software design outside games (`codebase-design`). The `game-craft` umbrella routes architecture and save questions here.

## Workflow

1. Read how the project is already structured (scene or entity layout, global singletons, how systems talk) before proposing anything. Extend the existing pattern unless it's the cause of the problem.
2. Find the real requirement: the state count, the number of concerns, whether designers edit the data, whether saves must survive patches, whether the game is networked.
3. Pick the smallest structure that meets it, and say what would make you upgrade.
4. Write the save format, the stable IDs and the update order down before writing systems that depend on them. They are the expensive things to change later.

## Loop and timestep

- Simulate on a fixed step (commonly 50 to 120 Hz) and render as fast as the display allows, interpolating between the last two simulation states. The engine usually runs this loop; know which callback is fixed and which is per frame.
- Gameplay that moves things or reads collisions goes in the fixed step and uses the fixed `dt`. Visuals, UI and camera go per frame.
- Clamp the frame delta and the number of steps per frame. Without the clamp, one slow frame asks for many steps, which makes the next frame slower still (the spiral of death). Breakpoints and window drags cause the same spike.
- A variable-step simulation behaves differently at 30 and 144 FPS: jumps change height, springs gain energy and fast objects tunnel. Use the fixed step for anything that must be repeatable.
- Determinism (replays, lockstep netcode) also needs a fixed step, a seeded RNG, a stable update order and no iteration over unordered maps. Floats can still differ across platforms.
- Read `references/patterns.md` for the accumulator loop with interpolation.

## State machines

| Situation | Pick |
| --- | --- |
| Fewer than about 5 states, little enter or exit logic | an enum and a `match` or `switch` |
| Several states, each with its own enter, exit and update | one object per state, plus a machine that owns the current one |
| States nest (on-ground holds idle, walk, run), and transitions apply to whole groups | hierarchical |
| Independent concerns (movement, combat, animation) | parallel machines, one per concern |
| Designers configure states and transitions without code | data-driven states (resource or asset files) |

- Upgrade from an enum when enter or exit code repeats across branches, when animation needs explicit enter and exit hooks, or when the `match` passes about 100 lines.
- Combining concerns in one flat machine multiplies the states: 3 movement states times 3 combat states is 9, and crouch doubles it. Parallel machines keep it to 3 + 3.
- Parallel machines must not write the same field. If movement and combat both set velocity, one of them owns it and the other requests changes.
- A nested machine runs and receives input only while its parent state is active. Enter its initial state when the parent enters, not when the machine is created, and exit the child when the parent exits.
- Handle transitions in one place: states return the name of the next state (or nothing), and the machine calls exit, swaps, then calls enter. A state that switches state from inside `enter` can recurse; queue the transition instead.
- Name transitions explicitly and log them in debug builds. Most FSM bugs show up as an unexpected transition in that log.

## Structure and communication

- **Composition over inheritance.** Build entities from small components (health, hurtbox, mover), not deep class trees. Use inheritance for "is a variant of" with only exported values changed.
- **Calls down, events up, a bus sideways.** A parent calls its children directly. Children emit events their owner listens to. Unrelated systems (achievements, audio, UI) use an event bus. Don't use the bus between a parent and child that already hold references to each other.
- Keep the global singletons few and explicit (game state, save, audio, bus). Each one is hidden coupling.
- **Data-driven content:** items, enemies and abilities are data files with a stable string ID that never changes after release. Code references IDs; saves store IDs, not file paths or object references. Build the ID-to-definition registry from an explicit list (exported array, manifest or generated index), never by scanning a folder at runtime: exported builds rename, pack or convert asset files, so a scan that works in the editor finds nothing in the shipped game.
- **Scene flow:** one owner handles transitions (menu, loading, level, results). It loads the next scene asynchronously behind a loading screen, then swaps. Don't let arbitrary scripts change scenes.
- **Object pools** for things spawned often and briefly (bullets, particles, damage numbers). Reset all state on acquire, not only on release. Code that keeps a reference to a pooled object after release will act on its next life, so give pooled objects a generation counter and check it.
- Before designing or reviewing an event bus, pool, inventory, item registry, ability or buff system, read `references/patterns.md`.

## Save systems

- Save data, not engine objects: values, IDs, flags and seeds. Rebuild objects from the data on load.
- Stamp an integer `version` in every save from the first release, and migrate old saves step by step (v1 to v2 to v3).
- Write atomically: write to a temp file, flush, keep the previous save as `.bak`, then rename over the target.
- Load defensively: parse, check the version (refuse a newer one), migrate, validate, and fall back to the backup on failure.
- Never load user-writable saves with a format that can instantiate arbitrary types or run scripts (engine-native resource or object serialization). Use JSON, a binary format you control, or the engine's plain key-value file.
- Read `references/save-systems.md` for the full design: slots, autosave, migrations, validation, format choice, settings versus progress, and the JSON number pitfalls.

## Gotchas

- An `await` or coroutine that resumes after its object was freed or pooled acts on a dead or recycled object. Check validity and the pool generation after every wait.
- Signals or events connected to a freed object, or to a pooled object that's been reset, still fire. Disconnect on release.
- Update order between systems matters (input, then AI, then physics, then camera). Make it explicit instead of relying on scene-tree or creation order.
- Static or global state survives scene reloads and "restart level". Reset it explicitly.

## References

- `references/patterns.md`: the fixed-step loop, state-machine shapes, event bus, pooling, the inventory model, and the ability, effect and stat-modifier model.
- `references/save-systems.md`: save design, atomic writes, versioning and migration, validation and formats.

## Related skills

- `godot`: node-based state machines, signals, autoloads and save files in Godot, if installed.
- `game-ai`: behaviour trees and utility AI, which build on these state machines.
- `game-feel`: the controller code that runs inside these structures.
- `game-performance`: profiling before restructuring for speed.
