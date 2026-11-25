# Game performance: measure first

Profile, find the one biggest cost, fix it, measure again. Do not change code for speed until a profile points at it; the intuitive culprit is usually wrong. Not for the engine profiler UI, monitors and rendering settings (`godot` performance reference), physics jitter and tunnelling (`feel.md`), restructuring without a measured cost (`architecture.md`), or slow non-game code. Budgets and tables below are starting points; set real numbers from the target hardware.

## Contents

1. Workflow
2. CPU or GPU triage
3. Hitches
4. Allocations and fixes
5. Budgets and regression checks

## 1. Workflow

1. **Target in milliseconds:** 60 FPS is 16.67 ms per frame, 30 is 33.3 ms, 120 is 8.33 ms, a 90 Hz VR headset needs 11.1 ms. Name the target hardware (minimum spec, a specific phone, a handheld).
2. **Reproduce the worst case:** a scene and action slow every time, ideally scripted (fixed seed, fixed camera path). "Sometimes slow" cannot be fixed; a repeatable spike can.
3. **Profile a release or optimised build on target hardware.** Editor and debug builds add overhead and skip optimisations, so they mislead; if you can only profile in the editor, say so in the report. Vsync hides headroom: turn it off while measuring. Profilers have overhead and inflate small, frequently called functions: confirm a hotspot with a cheaper sampling pass or a timer before rewriting it.
4. **Capture** frame time per frame (not FPS) with average, 95th and 99th percentile and maximum over a fixed scripted run; CPU by system (scripts, physics, render submission, audio, UI); GPU time; draw calls and visible object counts; memory (total, texture, allocations per frame); and the build type, hardware and settings, without which numbers are not comparable. An in-game overlay of frame time, CPU/GPU split and draw calls lets testers report numbers.
5. **Classify** before fixing: GPU, CPU scripts or game logic, physics, CPU-side render submission, memory and GC, loading and I/O; and steady low frame rate versus hitches (different causes).
6. **Fix the single biggest cost.** Prefer doing less work (cull, cache, partition, run less often, cut an O(n^2) loop) over polishing a hot line. Re-measure on the same scene and hardware; keep the change only if the number moved, otherwise revert and classify again.
7. Report measured numbers: before and after frame time (average and worst percentile), the bottleneck and the fix. Never write "should be faster".

## 2. CPU or GPU triage

- The slower of the CPU frame and the GPU frame sets the rate, because they run in parallel. Fixing the wrong side changes nothing.
- **Halve the render resolution.** Frame rate jumps: GPU-bound (fill rate, pixel shading); attack draw calls, overdraw, shader cost, resolution, lights and shadows, post-processing. Unchanged: CPU-bound; attack scripts, physics, pathfinding, allocations, entity counts, render submission. Disabling a heavy layer or all particles, or freezing AI or physics with a debug toggle, also locates the cost.
- Both close: check resolution scaling and the top CPU function; fix the cheaper win.
- Starting budget at 60 FPS: scripts about 5 ms, physics about 3 ms, render submission about 4 ms, UI and other about 2 ms, the rest slack. The subsystem that blows its share is the target.

## 3. Hitches

Spikes in an otherwise smooth game: read the 99th-percentile frame time or the 1% low, not average FPS, which can look fine while the game stutters.

- **Garbage collection** (C#, Java, JavaScript, Lua) pauses when the heap fills: aim for zero allocation per frame in steady state. **Reference-counted scripting** has no GC pause, but freeing a large object graph at once (unloading a level, clearing a huge array) spikes: spread it out, and watch for reference cycles that leak.
- **Shader or pipeline compilation** hitches the first time an effect appears: pre-warm behind a loading screen or use the pipeline cache or shader baking. **Main-thread loading** (instantiating a big scene, decoding a texture): load asynchronously ahead of need. **First-use instantiation** (the first enemy of a type, the first explosion): pre-warm during loading.
- **Frame pacing:** an uneven cadence (16, 33, 16 ms) feels worse than a steady lower rate: cap below what the hardware can sustain and check vsync.
- Mobile and handhelds throttle under heat: a game holding 60 FPS for two minutes then dropping is overheating. Test sustained play for 10 minutes or more, cap the frame rate and leave headroom.

## 4. Allocations and fixes

- Managed languages: no `new`, LINQ or closure allocation in update loops, no boxing, reuse lists with `clear()`, non-allocating physics query variants, cached component lookups; target zero bytes per frame in steady state and check the profiler's allocation view. Reference-counted: reuse temporary arrays and dictionaries, prefer typed or packed arrays for bulk data, free large structures gradually. Watch object and node counts across repeated level loads: a count that climbs each cycle is a leak.
- Draw calls: a change of material, texture or render state usually breaks a batch; atlas textures, share materials, GPU instancing for repeated meshes, mark static geometry static. 2D: per-sprite materials, shader parameters and offscreen effects break batches. Overdraw: large stacked transparent layers, particles and full-screen effects shade a pixel many times. Each real-time shadow-casting light can re-render the scene: cap them, shorten shadow distance, bake static lighting.
- Do less: update AI, perception and HUD on timers and stagger entities across frames; spatial partitioning and the physics broadphase instead of looping over all N; narrow collision layers; let resting bodies sleep; LOD and culling; memoise pathfinding and line of sight and invalidate on change.
- Pooling is owned by `architecture.md` (reset on acquire, generation handles). Moving work to a thread helps only if it is independent: compute on plain data, apply on the main thread.
- Do not optimise a prototype that is not fun yet: set the budget early and measure, but restructure only when the numbers demand it.

## 5. Budgets and regression checks

Write per-subsystem budgets in milliseconds and asset budgets where artists see them, and check imports against them with a script or import report that flags oversized textures and meshes.

| Asset | Desktop | Mobile |
|---|---|---|
| Texture max size (GPU-compressed; mipmaps for 3D) | 2048 to 4096 | 1024 to 2048 |
| Hero character triangles (LODs for distance) | 30k to 80k | 5k to 20k |
| Draw calls per frame | low thousands | a few hundred |
| Real-time lights | a few | 1 or 2 plus baked |
| Real-time shadow casters | a few | 0 or 1 |
| Audio | streamed music, short SFX in memory | same |

**Regression recipe:** a benchmark scene or scripted flythrough with fixed seed, camera path and settings; a release build on dedicated or consistent hardware with vsync off and a warm-up discarded; record average, 95th and 99th percentile, maximum, draw calls and peak memory; compare against a stored baseline with a tolerance (for example fail on more than 10% regression in the 95th percentile), because run-to-run noise is real and shared CI runners are noisy; update the baseline deliberately in its own commit; on mobile add a sustained run of 10 minutes or more and record whether frame rate drops as the device heats up.
