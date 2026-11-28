---
name: value-generator-review
description: "Value case. Generator plan review: a plain room chain and noise-threshold scatter are flagged (MST plus loops, Poisson-disc), while capped placement that accepts fewer rooms and capped WFC restarts are kept."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

plan for our dungeon and overworld generator. No code exists yet, these four lines are all there is. Mark each line PASS (build it like this) or FAIL (change the plan).

- G1: Rooms are linked in a chain: each room gets a corridor to the room placed after it, so everything is connected.
- G2: Trees go on every grass tile where a second noise layer is above 0.7.
- G3: Room placement tries up to 200 random rectangles and then goes with however many fit.
- G4: When wave function collapse for a room interior hits a contradiction, we restart it with the next sub-seed, up to 10 times.

end your reply with exactly one line per item in the form `G1: PASS` or `G1: FAIL`, G1 to G4 in order.
