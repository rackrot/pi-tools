# Level design and procedural generation

A level is a sequence of intended experiences delivered through space. Order: metrics, blockout, play, fix, only then dress. Authored and procedural levels follow the same rules: a generator still needs metrics, a critical path, pacing and a validation pass. Not for tile, grid-map or terrain API (`godot`), movement tuning (`feel.md`), enemy behaviour (`ai.md`), or loot tables and difficulty balance (`design.md`). Numbers are starting points.

## Contents

1. Workflow and metrics
2. Critical path and gating
3. Pacing and encounters
4. Blockout review
5. Procedural generation

## 1. Workflow and metrics

1. **Lock the metrics:** run speed, maximum jump height and distance (standing and running), reach, crouch height, how much of the level the camera shows. Keep them as named constants next to the level data and size every gap, ledge, door and corridor in them. If the jump changes (`feel.md` owns the jump numbers), re-derive the gaps.
2. **Beat list before rooms:** per room a type (teach, practice, combat, puzzle, rest, reward, climax) and an intensity from 0 to 1, kept as data next to the level so spawns and music intensity can read it and reviewers can read the curve without playing. Intensity rises in a sawtooth, never flat: spikes separated by rests, each peak a little higher than the last, a clear rest right before the hardest beat.
3. **Critical path as a graph** (rooms are nodes, connections carry their gates), validated before building geometry.
4. **Blockout** the whole level from untextured primitives at correct scale; check flow, sightlines and reachability while changes are cheap. **Play it and watch someone else play it.** Getting lost is fixed with guidance (a light, a sightline, a landmark), not a wall. Dress only after it plays well.
5. Report what was validated (metrics, path graph, playtest notes) and what was not.

```text
SAFE_GAP = MAX_JUMP_DIST * 0.7     # required jumps: comfortable
HARD_GAP = MAX_JUMP_DIST * 0.95    # optional skill checks only
```

- Required traversal uses safe values; near-limit jumps are for optional rewards. (Illustrative metrics in the source: run 240 units/s, jump height 96, running jump distance 200.)
- Size corridors for the character and the camera, not only the collider (a third-person camera needs room behind the player). Keep a metrics test room (gap ladder, ledge heights, slopes) and re-run it whenever movement changes. On a grid pick a cell size that divides the metrics evenly (a jump of 3 tiles high and 5 wide) so the grid enforces fair geometry.

## 2. Critical path and gating

- **Critical path:** the shortest start-to-goal route, solvable with keys and abilities obtained in order. **Golden path:** the route most players take; pace along it. Branches are optional loops that reward the detour and rejoin quickly; shortcuts back to a hub reduce backtracking fatigue.
- Gates: locks and keys, ability gates, one-way drops (telegraph them, and check the player cannot be stranded below without the ability to continue), soft gates (hazards that say "not yet").
- **Validate order, not just connectivity:** a flood fill from the start that crosses a gate only once its requirement has been collected. If the goal is not reached there is a soft-lock (a key behind its own lock is one). Re-run after every layout change, and on every seed for a generated level.

## 3. Pacing and encounters

- Teaching loop: introduce a mechanic where failure is harmless, develop it with a known element, twist the context, then test under pressure. Never meet a new mechanic during a lethal test; at most one new idea per section.
- Encounters are designed problems, not headcounts: mix roles (fodder, ranged, tank, flanker, support); telegraph before the fight; never spawn in view or behind the player without warning, spawn from readable places; trigger the next wave on a count left (for example two enemies left) rather than zero so tension holds, and cap the number alive; place health and ammo where the curve dips and a little before the spike; change one knob (count, mix, arena size, cover, time pressure, resource drops) per escalation step; signal clearly when the encounter ends.
- Arenas: at least two routes around the space, cover that blocks some lines of fire but not all, sightlines from the entrance, no dead-end corners the AI can be cheesed from, every enemy can reach the player, camera room in 3D third person.
- Guidance: light and contrast (a lit doorway reads "go here"), leading lines, landmarks (more important in 3D), one consistent colour or material for climbable or interactive surfaces and never on surfaces that are not, breadcrumbs, framing the next goal from a high point. What looks reachable should be reachable; a fake affordance teaches players to distrust the level. In 2D, off-screen threats need warning (audio, approach time).
- Hand-placed content in a procedural game (boss rooms, set pieces) is authored separately and stitched in: generation gives variety, not authored pacing.

## 4. Blockout review

Critical path solvable (gated flood fill passes); every required jump fits the safe metrics; intensity reads as a rising sawtooth with a rest before each major spike; each mechanic introduced safely before it is tested; the eye is guided to the path and first-time players were watched for getting lost; optional content rewards the detour and rejoins smoothly; one-way moves telegraphed and cannot strand the player; encounters telegraph, spawn fairly and signal their end; it plays well untextured; players other than the designer validated it.

## 5. Procedural generation

**Seeds and determinism**

- One seeded RNG per generator, passed explicitly; the global random function is order-dependent and breaks reproducibility when call order changes.
- **Sub-seeds** per system: `hash(world_seed, "layout")`, `hash(world_seed, "loot")`, so an extra loot roll leaves the layout unchanged. Per-chunk seeds `hash(world_seed, chunk_x, chunk_y)` let an infinite world generate chunks in any order.
- **Seed from text** (shareable codes, daily challenges) with a stable hash you control, such as FNV-1a over UTF-8 bytes: some languages randomise their built-in string hash per process, giving a different world each launch.
- Nothing non-deterministic may leak in: wall-clock time, frame timing, physics results, thread scheduling, iteration over an unordered map or set (sort keys first where order affects output). A different engine version, noise library or float behaviour can change the world: keep the generator version in the save beside the seed, and keep the old generator if old seeds must stay valid. Floats can differ across CPUs and compilers: generate with integers for cross-platform lockstep or competitive daily seeds. Store the seed in the save.

**Noise** (use a library such as FastNoiseLite; do not hand-write gradient noise)

- fBm: sum octaves (default 5, lacunarity 2.0, gain 0.5), divide by the summed amplitude to return to 0..1. Check the library's output range (-1..1 or 0..1) and rescale before combining. Normalise input coordinates (`x / width`); if it looks blocky or like static the frequency is too high (for tile coordinates try 0.01 to 0.05).
- `pow(e, k)` with `k > 1` flattens lowlands; ridged `1 - abs(2n - 1)` makes mountain spines; `round(e * levels) / levels` terraces. Biomes: sample elevation and moisture with different seeds (the same seed gives bands that line up). Island: `d = 1 - (1 - nx^2)(1 - ny^2)` with `nx`, `ny` in -1..1, `e = lerp(e, 1 - d, mix)`. Scatter objects with Poisson-disc sampling or a jittered grid, not a noise threshold, which clumps. Seamless wrap: sample on a cylinder (angle into cos and sin of 3D noise) or a torus in 4D.

**Algorithms**

- Rooms and corridors: place random rectangles rejecting overlaps with a one-tile margin (cap attempts; an unbounded "keep trying until N rooms fit" loop can spin forever on a small map); connect centres with a minimum spanning tree and add 10 to 20% of the remaining edges back for loops (a plain chain makes long dead ends); L-shaped corridors with random order; assign roles after layout (start at one end of the longest shortest path, boss at the other, treasure in dead ends).
- BSP: split along the longer axis at a random position keeping `min_size` on both sides of every cut; one room per leaf, smaller than the leaf; connect siblings as the recursion unwinds. Overlapping rooms mean the split came too close to an edge.
- Drunkard's walk: carve until about 40 to 50% of the map is open; clamp inside the border; connected by construction; several or direction-biased walkers give corridors instead of blobs.
- **Cellular-automata caves:** fill each cell as wall if border or random under 0.45 (0.40 to 0.50 works), then 4 to 6 passes where a cell is wall if 5 or more of its 3x3 block (itself included, out-of-bounds counting as wall) are walls. **Write each pass into a new grid;** in-place updating makes the result depend on scan order. All wall or all floor means too extreme a fill or too few passes. Caves come out as disconnected pockets: flood-fill regions then keep the largest, tunnel between them, or reject if the largest is under a target share. Remove wall regions under N tiles to drop floating pillars.
- **Wave function collapse:** pick the uncollapsed cell with the fewest options (weighted entropy if tiles have frequencies), collapse by tile weight, propagate with a stack. **Detect a contradiction during propagation the moment any cell reaches zero options;** a loop that only looks at cells with more than one option misses empty cells and reports success with holes. On contradiction restart with the next sub-seed (cap restarts) or backtrack. **Rules must be symmetric** (if A allows B on its right, B allows A on its left): generate the table from edge labels or a sample image, not by hand. Too-restrictive rules cause frequent contradictions: add transition tiles or allow more neighbours before adding backtracking. Pre-collapse fixed cells (entrance, exit, set piece) then propagate. WFC enforces only local rules, so run validation afterwards; generate in chunks with fixed borders for large maps.

**Validation and performance**

- On every result, then repair or reject with a bounded retry count and log the seed of each rejected map: spawn tile is floor and safe (no enemy or hazard within a radius); a path exists from spawn to exit; every required room and key is reachable and no key sits behind the lock it opens (the gated flood fill); size and composition limits hold (minimum room count, minimum open area). Tune with the seed fixed, then sweep many seeds and check the distribution, not one lucky map.
- Generating a large map in one frame freezes the game: yield every N rows or cells, or generate plain data on a worker thread and build scene objects on the main thread (engine scene objects usually cannot be created or edited from a worker). Batch tile writes and use the engine's terrain or autotile rules; for streaming worlds generate chunks ahead from per-chunk seeds and unload far ones.
