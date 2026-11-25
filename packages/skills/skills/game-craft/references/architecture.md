# Game architecture, pooling, inventory, abilities and saves

The basics are well known; this file holds the choices and pitfalls. When you recommend a structure, name the alternative you rejected and the deciding factor ("a hierarchical machine, not a flat one, because grounded and airborne states share their transitions"); a pick with no named alternative cannot be challenged. Engine API: `godot` (nodes, signals, autoloads, file access). Not for controller feel (`feel.md`) or NPC decisions (`ai.md`).

## Contents

1. Workflow and loop
2. State machines
3. Structure and communication
4. Object pools
5. Inventory
6. Abilities, effects and stat modifiers
7. Save systems

## 1. Workflow and loop

Read how the project is already structured before proposing anything and extend the existing pattern unless it causes the problem. Find the real requirement (state count, number of concerns, whether designers edit data, whether saves survive patches, whether it is networked), pick the smallest structure that meets it and say what would make you upgrade. Write the save format, stable ids and update order down before building systems that depend on them: they are the expensive things to change.

- Simulate on a fixed step (commonly 50 to 120 Hz), render as fast as the display allows and interpolate between the last two states. Moving things and collisions use the fixed `dt`; visuals, UI and camera go per frame.
- **Clamp the frame delta and the steps per frame** (for example `acc += min(render_dt, FIXED_DT * MAX_STEPS)` with `MAX_STEPS` 5). Without it one slow frame demands many steps, making the next slower still (the spiral of death); breakpoints and window drags cause the same spike. Interpolation adds up to one step of latency; reset it after teleports.
- A variable step behaves differently at 30 and 144 FPS (jump height changes, springs gain energy, fast objects tunnel). Determinism (replays, lockstep) also needs a seeded RNG, a stable update order and no iteration over unordered maps; floats can still differ across platforms.

## 2. State machines

| Situation | Pick |
|---|---|
| Fewer than about 5 states, little enter or exit logic | enum and `match` |
| Several states each with enter, exit, update | one object per state plus a machine owning the current one |
| States nest and transitions apply to groups | hierarchical |
| Independent concerns (movement, combat, animation) | parallel machines, one per concern |
| Designers configure states without code | data-driven states |

- Upgrade from an enum when enter or exit code repeats across branches, when animation needs explicit hooks, or when the `match` passes about 100 lines. Other upgrade signals: flags like `is_attacking and not is_stunned` creeping into every state; transitions "from anywhere" (a parent state is missing).
- One flat machine multiplies states (3 movement times 3 combat is 9, and crouch doubles it); parallel machines keep 3 + 3. Parallel machines must not write the same field: one owns it, the others request changes. Animation reads the others and writes nothing back.
- A nested machine runs and receives input only while its parent state is active: enter its initial state when the parent enters, exit the child first when the parent exits; unhandled transitions bubble up. The common bug is a child that initialises itself and keeps handling input while the parent is inactive.
- States return the next state's name and the machine exits, swaps, enters. Switching from inside `enter` recurses: queue the transition. Log transitions in debug builds; most FSM bugs show as an unexpected transition there.

## 3. Structure and communication

- Composition over inheritance; inheritance only for "variant with only exported values changed". Calls down, events up, a bus sideways (unrelated systems: UI, audio, achievements); no bus between a parent and child that hold references. Few explicit global singletons: each is hidden coupling.
- Content (items, enemies, abilities) is data with a stable string id that never changes after release. Code and saves reference ids, never file paths or object references.
- One owner handles scene flow, loads asynchronously behind a loading screen, then swaps.
- Static or global state survives scene reloads and "restart level": reset it explicitly. Update order (input, AI, physics, camera) is explicit, not scene-tree or creation order.

## 4. Object pools

Pool what is spawned often and briefly (bullets, particles, damage numbers, audio one-shots, wave enemies), and only what profiling shows is churned; pooling everything adds bugs for no gain (`performance.md`).

```text
acquire(): obj = free.pop() or (create() if live < cap else recycle_oldest())
           obj.generation += 1; reset(obj); activate(obj)      # reset on ACQUIRE
release(obj): deactivate(obj); disconnect_listeners(obj); free.push(obj)
handle = (obj, obj.generation)       # holders compare generation before use
```

- Pre-warm at load. Decide the overflow policy: grow, refuse or recycle the oldest. Deactivation stops processing, collision and drawing; hiding alone leaves the object updating and colliding.
- Code holding a reference after release acts on the object's next life: hence the generation counter. An `await` that resumes after the object was freed or pooled acts on a dead or recycled object; check validity and generation after every wait. Events connected to a freed or reset pooled object still fire: disconnect on release.

## 5. Inventory

Make three decisions explicitly and say which you picked: item definitions are data files with a stable `id`; slot containers are plain runtime objects, not assets (assets invite saving stale item copies); `add_item(item, qty)` returns the leftover count (a boolean forces a re-query). A weight-based bag, a grid with shaped items or an unlimited list is not a fixed slot array: say so before building.

- **Two passes to add:** fill existing stacks first, then empty slots; one pass scatters an item and reports the bag full while space remains. One change event per operation, after both passes. Clear a slot's item when quantity hits 0. Stacking rules live in data (`max_stack = 1` for equipment and key items). Compare items by `id`, never by object reference.
- Save `{id, qty}` plus per-instance data (durability) and load through an id-to-definition registry. **Build the registry from an explicit list** (exported array, manifest or generated index), not by scanning the source folder at runtime: exported builds rename, pack or convert files, so a scan that works in the editor finds nothing in the shipped game. An id missing on load (removed in a patch) is dropped or substituted with a log line, never a crash.
- Equipment is a second container keyed by slot type (an enum, not a string); compute totals when asked rather than caching.

## 6. Abilities, effects and stat modifiers

Definitions are data, runtime state lives in a component on the entity, communication is by events. Ability definitions are stateless and shared (name, cost, cooldown, cast time, required and blocked tags); cooldown timers and charges live in the caster's component, keyed by ability id.

- Activation: check tags, cost and cooldown, then enter a casting state for `cast_time`; at the end commit (spend cost, start cooldown, apply effect). An interrupt cancels the cast at no cost. Decide whether cost is paid at start or at commit and do it in one place. A `cast_time` nothing enforces is a common bug. The component emits `activated`, `failed(reason)`, `cooldown_started`, `cooldown_finished`; the HUD listens and never polls.
- Effects have a duration (zero or less is instant), an optional tick interval and `on_apply`, `on_tick`, `on_expire`. Remove expired ones after the loop, never while iterating. **Track each by `(effect id, source)`** with an explicit stacking policy: refresh (reset duration, one instance), stack (up to `max_stacks`; duration shared or per stack), independent (one instance per source), or replace-if-stronger. Keying by the definition object alone makes a second application silently reset the first.
- **Stat modifiers** are keyed by source so removing a buff removes exactly its modifiers. Compute in fixed order: `base + sum(ADD)`; times `(1 + value)` for each MULTIPLY (+20% and +10% give 1.32), or sum the percentages first (`1 + 0.2 + 0.1`) if the design wants additive percentages (pick one rule, document it); OVERRIDE replaces the result (highest or most recent wins, pick one); clamp to min and max. Cache and recompute when modifiers change. Never save computed stats: save base values and active effects.
- **Gameplay tags** (`status.stunned`, `immune.fire`) gate abilities through required and blocked lists and effects through an immunity tag. Count tags rather than store a set: two stuns from two sources count 2, and one expiring must not clear the other.

## 7. Save systems

- **Save data, not engine objects:** values, ids, flags, seeds, positions, RNG seeds and the generator version; vectors and colours as plain numbers. Recompute derived data on load (final stats, procedural maps from the seed, quest UI from flags): saved derived data drifts when a formula changes in a patch. Each savable object reports its state under a stable id; never node paths (renaming a node breaks every old save). Keep an in-memory canonical shape and serialise at the boundary; migrations work on that shape.
- **Format:** JSON for most saves; a binary format you control for large state (needs its own versioning); a plain key-value or INI file for settings and bindings; a cloud store for cross-device saves. **Never use engine-native resource or object serialisation for user-writable files:** loading can instantiate arbitrary types or run embedded scripts, so a shared or downloaded save becomes code execution. Name the format you rejected and why ("JSON, not engine resources, because players share save files").
- **JSON number pitfalls:** many parsers return every number as a float, so cast ints (counts, ids, enum values) back on load or `3` becomes `3.0` and breaks equality and dictionary keys; integers above 2^53 lose precision, so store 64-bit ids and large seeds as strings; NaN and Infinity are not valid JSON, so validate before writing; serialise with a locale-invariant writer (some locales write `1,5`); integer dictionary keys come back as strings.
- **Atomic write:** write `path.tmp`, flush, close, copy or rename the old file to `.bak`, rename tmp over the target. Writing in place leaves a truncated save after a crash. Rename-over is atomic on POSIX on one volume; on Windows it is not guaranteed, so the `.bak` is what guarantees recovery. On load try the primary, then `.bak`, and tell the player if both fail. For large saves snapshot on the main thread, then write off-thread. A checksum detects truncation, not editing.
- **Versioning:** an integer `version` in every save from the first release (no version field means the first patch cannot tell old saves apart). Refuse a newer version. Migrate one step at a time with `MIGRATIONS[v]` pure functions (v1 to v2 to v3), never one function converting anything to latest. Additive change: insert the default. Rename or restructure: transform in the migration so game code never reads both names. Removal: drop the field. Keep old migrations forever and a corpus of real saves from every shipped version, loaded after each change.
- **Validate on load:** required keys with the right types after casting; sane ranges (no NaN, health at least 0, indices in bounds); ids still exist in current content; references resolve; on failure log, try the backup, then tell the player plainly.
- **Slots and autosave:** manual slots and autosaves in separate files; autosave at safe points (checkpoints, level transitions, after a menu closes), never mid-combat or mid-cutscene, throttled (for example at most once a minute), rotating a ring such as `autosave_0` to `autosave_2`; a small per-slot metadata header (version, timestamp, playtime, location, thumbnail path) readable without parsing the save. Settings and bindings in their own file, so deleting a save does not reset controls. Save to the per-user data directory, never next to the executable. Never save secrets. In multiplayer a local save is player-controlled, never authoritative for online state. Saving mid-action captures an inconsistent state (half-applied damage, an open door with no key spent).
- **Test checklist:** save, quit fully, relaunch, load and compare; kill the process during a save and confirm the next launch loads the previous save or the backup; load a save from every previous version; load a save with a removed item id, a truncated file and a newer version number, each failing gracefully; save and load under an OS locale with comma decimals.
