# Game AI: decide, path, steer

Three separate layers: **decide** (what to do), **path** (how to route there), **steer** (how to move along the route). A behavior tree picks a target, the pathfinder returns waypoints, steering follows them. The AI outputs intents and never writes transforms; the motor or controller applies them. Not for an engine's navigation API (`godot` navigation reference) or addon APIs such as Beehave and LimboAI (`godot-addons`). Numbers are starting points.

## Contents

1. Orient and pick a model
2. Behavior trees
3. Utility AI
4. Perception and difficulty
5. Pathfinding and steering
6. Pitfalls

## 1. Orient and pick a model

Find the engine, existing FSM or BT addons, navigation setup and the movement code the AI will drive; extend what exists. Ask how many agents run at once: ten guards and five hundred zombies need different budgets, not different algorithms.

| Situation | Model |
|---|---|
| 2 to 5 named states with obvious transitions | FSM |
| Many behaviours with priorities, interruption, reuse across enemy types | Behavior tree |
| "How much do I want each option now": targets, needs, item or ability choice | Utility AI |
| Combat with clear structure plus graded sub-choices | BT outside, utility inside one branch |

Start with an FSM; promote a state to a BT when its transition logic outgrows a few `if`s. Name the rejected model in the design note. FSM transitions live inside the states or one table; entry and exit code (start the run animation, release the cover point) goes in `enter`/`exit`; two parallel machines never write the same field. State-machine structure: `architecture.md`.

## 2. Behavior trees

- Every node ticks to SUCCESS, FAILURE or RUNNING. Earlier children are higher priority. Conditions have no side effects and are never RUNNING. A multi-frame action must return RUNNING or the tree restarts the walk or animation every tick.
- **Memory versus reactive composites.** A memory composite resumes at its RUNNING child and never re-checks earlier ones. A reactive composite re-ticks from child 0 every tick and aborts the running branch when an earlier child takes over; use a reactive selector at the root of combat AI. **Trap:** a memory Sequence under a reactive selector resumes at its RUNNING action and skips its own guard, so "CanSeePlayer, MoveTo, Attack" keeps chasing after sight is lost. Use a reactive sequence, or a decorator that re-checks every tick (the "conditional abort" in most BT tools).
- **`reset()` on abandon.** When a parent abandons a branch it must walk it: composites clear the resume index, a `Wait` clears elapsed time, an action releases what it holds (cover reservation, attack token, animation lock). Missing resets show as a timed action that "finishes instantly" on re-entry, or a cover point reserved forever. Parallel: apply the success/fail policy each tick and reset still-running children when it resolves.
- Cooldown decorator: `FAILURE` while `now < ready_at`, set `ready_at` on child SUCCESS; `now` comes from a clock the tree owns so cooldowns pause with the game.
- Blackboard: per-agent facts (`target`, `last_seen_pos`, `last_seen_time`, `home`, `path`, `alert_level`) written by perception and actions, read by conditions; no node references another node, which lets one `MoveTo(key)` serve chase, patrol and flee. Use a typed struct for hot agents and a dictionary only for designer-authored or serialized trees.
- Build the tree once at spawn (rebuilding loses RUNNING state), keep `tick` allocation-free, tick at 5 to 15 Hz from an accumulator, stagger agents into buckets, slow distant agents. The walk is rarely the cost; leaves (raycasts, path queries) are, so cache perception on the blackboard.
- "A behaviour never happens": check the guard key is written, the branch sits above a fallback that always succeeds, and the action returns RUNNING while working.

## 3. Utility AI

Score each action 0 to 1 and run the best. Harder to debug than a tree: build an on-screen score display from day one.

- **Golden rule: every consideration returns 0..1.** One returning 0..100 dominates and makes weights meaningless. Normalise `t = clamp((x - a) / (b - a), 0, 1)` (with `a > b` for lower-is-better), then a response curve: linear, quadratic `t^k` (only matters near the top), inverse quadratic `1 - (1-t)^2`, exponential, logistic (soft threshold, flee below about 40% health), smoothstep. Invert with `1 - f(t)`; clamp every output.
- **Combine by multiplying**, so any zero vetoes ("no ammo" vetoes "shoot"). Raw products sink as considerations are added, so apply the compensation factor (Dave Mark, *Behavioral Mathematics for Game AI*): `product = multiply all n outputs; mod = 1 - 1/n; compensated = product + (1 - product) * mod * product; score = weight * clamp(compensated)`. A weighted sum cannot veto; use it only when that is intended.
- Selection: argmax with an inertia bonus of 0.05 to 0.1 on the running action (stops flip-flop on near-ties); or softmax `exp(score / temperature)` with temperature about 0.1 to 0.2; or weighted random over entries within 80% of the best. Seed the random source per agent so a bad decision replays.
- **Hybrid default for combat:** the BT decides engage, disengage or patrol; inside engage a utility leaf picks the attack or target, resetting the previous behaviour when the choice changes. Keep the utility set small and local to the branch; utility choosing between whole trees thrashes.
- Cost is actions times considerations per decision: cheap gate first, stop scoring an action when one factor hits 0, re-score only when a fact changes or at 5 to 10 Hz. Tune by watching score bars over a simulated day: no action should sit at 1.0 constantly (an un-normalised fact). Most utility bugs are a mis-shaped curve or an un-normalised fact.

## 4. Perception and difficulty

Perception writes facts to the blackboard; decisions read them. Never raycast inside a decision node.

- Sight: squared-distance range check, then view-cone angle, then a line-of-sight ray, at 5 to 10 Hz per agent, staggered. Hearing: gameplay events broadcast a position and loudness radius. Memory: store last-known position and time seen, search that spot when sight is lost, forget after a timeout. Damage from an unseen source: turn toward it and go alert.
- **Reaction delay** 0.2 to 0.6 s between "saw the player" and "shoots" reads as fair; instant reads as cheating.
- Tune difficulty by what the AI perceives and how fast it acts, not by inflating health or damage:

| Knob | Easier | Harder |
|---|---|---|
| Reaction delay | 0.6 s | 0.2 s |
| Aim error | wide, narrowing over a burst | tight from the first shot |
| Sight range and cone | short, narrow | long, wide |
| Memory of last-known position | forgets fast | searches thoroughly |
| Attack tokens | 1 to 2 | 3 to 4 |
| Flanking and grenades | off | on |

- **Attack tokens** (a shared pool limiting how many enemies attack at once; the rest reposition or posture) fix most "unfair dogpile" complaints. Telegraph big attacks. Rubber-banding feels bad when noticed; keep it small and invisible.
- Verify: draw the state or BT branch, path, perception cone and utility scores above each agent; log transitions, not ticks. Done means each agent reaches its goals, recovers from being blocked and never oscillates between two states for more than a moment.

## 5. Pathfinding and steering

- Grid or tile game: A* on the grid or a coarser waypoint graph. 3D or arbitrary geometry (agent radius and height, off-mesh links, crowd avoidance): the engine's baked navmesh. Many agents to one goal: one flow field (a Dijkstra pass outward from the goal; each cell points at its cheapest neighbour). Write your own A* only for a discrete grid or graph, or when you need the cost function (danger maps, faction territory).
- A* details that go wrong: heuristic must not overestimate (Manhattan on an 8-way grid, or a scaled Euclidean, is inadmissible and returns fast non-shortest paths; 8-way uses octile); forbid diagonal moves that cut a blocked corner; test the goal on pop, not on push.
- Repath on a timer of 0.2 to 0.5 s or when the goal enters a new cell, never every frame; cache the waypoints and advance an index. Defer the first request until the navigation map is ready (engines build it asynchronously). Cap searches per frame and queue the rest. When an obstacle moves, repath only agents whose remaining path crosses the changed cells.
- Grid paths zig-zag: string-pull (skip to the farthest waypoint with clear line of sight and width) or steer to a look-ahead point.
- **Tower-defence mazes:** before accepting a placement, check a path from spawn to goal still exists and reject the placement if not. Recompute the flow field when a tower is placed, not per agent.
- Steer toward the next waypoint, advancing within a radius, never straight at the final goal. Flocking: weighted separation (highest), alignment, cohesion, neighbours from a spatial grid. Use the engine's local avoidance before writing your own.

## 6. Pitfalls

- No stuck check: if progress toward the waypoint stalls for about a second, repath or change state, or agents grind into walls forever.
- Ticking every agent's brain every frame: decide at 5 to 15 Hz, stagger, slow distant agents.
- Pathfinding every frame for every agent.
- Utility flip-flop on near-ties: give the running action an inertia bonus.
