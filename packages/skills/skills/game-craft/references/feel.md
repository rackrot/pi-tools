# Game feel: input, jump, camera, juice

Engine-neutral. Numbers are starting points to tune by playing unless a derivation is shown. Engine code for the same recipes: `godot-physics` (character controllers), `godot` (camera, tweens, InputMap).

## Contents

1. Method
2. Input and jump
3. Camera
4. Juice and hit-stop
5. Jitter and physics feel
6. Gotchas

## 1. Method

1. Name the complaint as a symptom and fix that cause before adding juice. "Floaty": low gravity or a slow fall. "Laggy": input latency, no buffer, or heavy smoothing. "Unfair": no coyote time, or a hitbox larger than the sprite. "Jittery": render and simulation rates out of step. "Weak": missing feedback.
2. Feel attaches to events (`jumped`, `landed`, `hit`, `died`). Add the events first if the mechanic does not emit them.
3. Tunables are named values in seconds or units per second, never frames, exposed so they change while the game runs.
4. Change one value at a time. Play at a 30 FPS cap and uncapped; anything that differs between the two is frame-rate dependent and wrong.
5. Feedback stays off the simulation: shake moves the camera offset, squash scales the sprite not the collider, hit-stop scales time and never stalls logic.
6. Report what you observed (does shake decay, does input register during hit-stop, is the camera steady at both frame rates). If you could not run the game, say so and list what to check.

## 2. Input and jump

- Gameplay reads named actions, never raw keys; bindings are data. Discrete actions read the edge (pressed this tick), continuous ones the held state or axis. A held check on jump re-fires every frame. Read held state in the fixed step.
- A press between two fixed ticks must not be lost. Some engines' just-pressed queries are already tick-aware; check the engine skill before adding a latch.
- **Input buffer** 100 to 150 ms (6 to 9 frames at 60 Hz); attack or dash buffer 100 to 200 ms. **Coyote time** 80 to 120 ms. Consume both when the jump fires: a lingering buffer double-jumps on landing, an uncleared coyote timer gives a second air jump.

```text
buffer_t -= dt;  coyote_t = COYOTE if on_floor else coyote_t - dt
if just_pressed("jump"): buffer_t = BUFFER
if buffer_t > 0 and coyote_t > 0: vel.y = JUMP_SPEED; buffer_t = 0; coyote_t = 0
```

- **Jump from design numbers:** peak height `h`, time to apex `t`: `g = 2h / t^2`, `v0 = 2h / t`.
- Variable height: on release while rising, multiply upward velocity by about 0.4 to 0.6 (or switch to a higher released gravity). Fall gravity 1.5 to 3 times rising gravity, clamped to a terminal velocity; symmetric gravity is the usual cause of floaty. Apex hang: halve gravity while `abs(vel.y)` is under a small threshold. Air control lower than ground, never zero. Ramp to top speed in 0.05 to 0.15 s, stop faster.
- Corner correction: nudge sideways when the head clips a ceiling corner by a few pixels, and the same for ledge edges on landing.
- Sticks: radial deadzone rescaled from its edge, never a per-axis clip (snaps diagonals to axes): `s = clamp((m - inner) / (outer - inner), 0, 1)`, `out = normalize(stick) * pow(s, curve)`; starting values inner 0.2, outer 0.95, curve 1.5 (the outer deadzone lets worn sticks reach full). Triggers get their own small deadzone. For 8-way movement snap the angle after the deadzone.
- Turn rate from a stick is a rate (times `dt`); mouse delta is a distance (never times `dt`, never smoothed in first person).
- Rebinding: capture mode with timeout and Escape to cancel; ignore the opening input and sub-deadzone noise; flag conflicts within a context and offer swap or clear; store bindings in settings, not the save; offer reset. Never let the binding that opens the menu or confirms in menus be removed without a fallback (unbound Escape with no gamepad strands the player).
- Prompts follow the last device with input above the deadzone, switching mid-session. Map gamepad buttons to positions (south, east, west, north). Touch: a floating-origin stick with the same radial deadzone, hit areas larger than the drawn button, no chords for essential actions. Accessibility toggles for input: `ui.md`.

## 3. Camera

- Smooth with `t = 1 - exp(-rate * dt)`, `pos = lerp(pos, target, t)`; rate 5 (floaty) to 12 (snappy), 6 to 10 as a start. `lerp(pos, target, 0.1)` smooths per frame, and `k * dt` still drifts with frame rate and overshoots when `k * dt > 1`. Use it for zoom and look-ahead too; a critically damped spring also works.
- 2D rig order, after the target moves: deadzone (move focus only by the overflow; box or circle on purpose; 32 to 64 px) then look-ahead (offset along motion or facing, 40 to 120 px, ignore motion under a small threshold, ease the offset over 0.2 to 0.4 s) then smooth then clamp the view then add shake.
- Clamp the visible rectangle, not the centre: centre in `[min + half_view, max - half_view]`, `half_view = viewport / 2 / zoom`; centre on an axis where the level is smaller than the view.
- Platformers: look ahead more horizontally than vertically, lock vertical follow while airborne and re-centre on landing, allow looking down on long falls. Ease bounds between rooms.
- Update the camera after movement and physics. Follow the target's interpolated transform when physics interpolation is on.
- **Trauma shake:** one `trauma` in [0, 1]; events add (never reset); decay linear about 1.0 to 1.5 per second; shake = `trauma^2` (or `^3`); smooth noise per axis with a different seed (summed sines at unrelated rates also work), never a fresh random value per frame. Starting values: offset 8 to 16 px horizontal, 6 to 10 px vertical, roll 0.05 to 0.12 rad, per-hit trauma 0.15 (light) to 0.8 (heavy). Apply to the camera offset, never the follow target. Add a directional kick for one-sided hits. Scale by the player's shake setting (0 to 100%, default about 60 to 80%).
- 3D third person: pivot at shoulder or head, yaw on the pivot and pitch on a child; sphere cast from the pivot to the desired position and pull in fast, ease out slowly or it pumps; pitch clamp about -80 to +45 degrees; fade geometry between camera and player instead of pulling in for thin objects. First person: yaw rotates the body, pitch only the camera, clamp about +/-85 to 89 degrees, expose FOV (narrow FOVs sicken some players).
- Group framing: bounding box plus padding, clamp and smooth the zoom. Split screen: one camera per player and one audio listener, recompute rectangles on resize.
- On respawn, teleport or cut, reset smoothing (focus, look-ahead, velocity, trauma) or cut on purpose behind a fade; blend gameplay to cutscene cameras over 0.3 to 1 s. Prefer the engine's camera; hand-roll only what it lacks (look-ahead easing, trauma shake, platform snapping), and check whether its smoothing is frame-rate independent.

## 4. Juice and hit-stop

- One satisfying hit is 5 to 8 small responses inside about 100 ms (sound, particles, flash, hit-stop, knockback, shake, number pop). Start with 2 or 3 and add until it reads. Exaggerate briefly, then return to rest: scale 1, trauma 0, time scale 1, flash cleared.
- Assign every event to a tier and keep the table in data:

| Tier | Trauma | Hit-stop | Particles | Extra |
|---|---|---|---|---|
| small | 0.10 to 0.20 | none | 0 to 4 | tick SFX |
| medium | 0.30 to 0.50 | 0.04 to 0.06 s | 6 to 12 | flash |
| large | 0.70 to 1.00 | 0.10 to 0.15 s | 20 to 40 | flash, zoom, number |

- Squash and stretch roughly preserve area: `(1.3, 0.7)` on land, then spring back. Flash 1 to 3 frames. Knockback: a short clamped impulse with a 0.1 to 0.2 s control lockout. Pops 0.12 to 0.25 s, settles 0.2 to 0.4 s, menu slides 0.2 to 0.3 s; back/elastic ease-out for pops, cubic ease-out to settle.
- **Hit-stop:** time scale near 0 (for example 0.05) for 40 to 150 ms, restored from a timer that ignores time scale; a scaled timer never fires at scale 0. Overlapping hits extend the stop rather than stack. Durations by weight: 0.04 s light, 0.06 to 0.1 s medium, 0.12 to 0.15 s heavy. Trigger once per impact and cap the total per second, or a held or multi-hit attack locks the game. Keep input buffering live during it. Global time scale also slows physics, animation and audio pitch in some engines; to avoid that, freeze only attacker and target. In online games freeze visuals locally, never global time.
- A new tween on a property that is already tweening kills or replaces the old one; two tweens on one property jitter and leave the value wrong.
- Pool particles (`architecture.md`). Never convey critical information by flashing or shake alone.

## 5. Jitter and physics feel

- Simulate on the fixed step and draw interpolated transforms; enable the engine's physics interpolation before hand-rolling. Visible stutter at a steady frame rate usually means render and physics rates drift with no interpolation, and a per-frame camera following a physics-tick body jitters for the same reason. Reset interpolation after a teleport.
- Mass does not change fall speed; shape feel with gravity scale and drag.
- Fast small bodies tunnel thin walls: use continuous collision detection or a speed cap with `speed / physics_hz` below the thinnest wall.

## 6. Gotchas

- A 2D camera node may ignore rotation by default, which silently drops shake roll. Enable rotation or drop the roll.
- Feedback that blocks buffered input reads as lag.
- Ship a shake scale (0 to 100%), reduced flashing and reduced camera motion with the game; full list in `ui.md`.
