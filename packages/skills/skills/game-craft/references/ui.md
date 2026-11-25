# Game UI, UX and accessibility

Engine-neutral. Widget API: `godot` (`ui-control.md`, `localization.md` references). Not for web or app UI, visual punch (`feel.md`) or art style (`assets.md`).

## Contents

1. Workflow
2. Layout and scaling
3. Focus and screen flow
4. HUD, world-space and localization
5. Accessibility
6. Gotchas

## 1. Workflow

1. List every screen (title, HUD, pause, settings, inventory, dialogs) and every target: resolutions, aspect ratios (16:9, 16:10, 21:9, phone portrait and landscape), TV at couch distance, touch, mouse, gamepad. Done when each screen has a device list.
2. Anchors and containers, never absolute pixels.
3. One scaling policy for the whole UI, written down, with the engine setting matching it.
4. Critical UI inside the safe area; every screen works on the gameplay input device; screens form a stack; the HUD is event-driven; accessibility from the first screen.
5. Verify on real targets: resize through every target ratio, play with the mouse unplugged, test at couch distance or on the smallest phone, switch to the longest translation. Report what you saw at which resolutions, not what the editor preview showed.

## 2. Layout and scaling

| Mode | Use for |
|---|---|
| Scale UI to window from a reference size | most games |
| Fixed-resolution viewport scaled up | pixel art, with integer scaling and nearest filtering |
| No scaling | tools, rarely games |

Then the aspect policy: expand (extra space becomes visible; anchor HUD corners outward), keep (letterbox or pillarbox; fixed-screen puzzles), keep width (vertical shooters) or keep height (side-scrollers). When the engine blends width and height matching with a 0 to 1 slider, use 0.5 by default, 1.0 when vertical layout must never clip, 0.0 when horizontal layout must never clip. A 16:9-only layout crops on ultrawide and phones.

- Safe area: the OS rectangle excludes notches, rounded corners and some TV overscan. Inset only critical UI (health, timers, prompts); backgrounds may bleed. Convert to anchors `min = (safe.x / w, safe.y / h)`, `max = ((safe.x + safe.w) / w, (safe.y + safe.h) / h)`. Re-apply on resize and orientation change, not once at startup. On consoles offer a "UI margin" or "screen area" setting.
- Test matrix: design resolution, one 21:9, one portrait or tall phone, smallest supported window; each with anchoring, insets, legibility at viewing distance, gamepad-only navigation, longest translation.

## 3. Focus and screen flow

1. **Every screen open and every modal close sets focus.** No initial focus means a dead menu on a controller.
2. Explicit neighbours where automatic navigation guesses wrong (grids with gaps, diagonals, tabs). Visible focus style distinct from hover and not colour alone.
3. Wrap or stop at list ends on purpose; trap focus inside modals. Restore focus to the opener on close, after checking it still exists.
4. Mouse movement may move selection but never clears focus. Tabs take shoulder buttons; "back" is always the same button and pops one level.
5. Screens are a stack: push disables the top's input and remembers its focus, pop restores both; `replace` is pop then push (title to game). Only the top screen takes input. Pause is a push: the world pauses, the pause screen keeps processing. Confirm dialogs trap focus and "back" cancels. A scene change clears the stack. Menu flow as booleans (`is_paused`, `in_settings`) turns contradictory; a stack has one top.
6. The HUD subscribes to `health_changed` and similar events and updates on change; never poll game state each frame.

## 4. HUD, world-space and localization

- Non-diegetic is clearest. Diegetic (ammo on the gun) can hurt readability: keep a non-diegetic fallback for critical info. World-space markers anchor to a world point, clamp to the screen edge when off-screen, and scale or fade with distance in 3D. Screen-edge vignettes need a non-colour, non-visual cue as well.
- Externalise every string behind a key; no sentence built from fragments (word order differs); named-argument format strings and plural rules. Containers size to content: German and Finnish often run about 30% longer than English, and short English labels can double. Plan right-to-left mirroring, font coverage per script, no text in textures. Test with a pseudo-locale that lengthens strings and adds accents.

## 5. Accessibility

Paraphrased from the Game Accessibility Guidelines (https://gameaccessibilityguidelines.com/full-list/), numbers read from those pages on 2026-10-17; recheck before quoting them as current. Platform holders' versions: Xbox Accessibility Guidelines. Communication features (text and voice chat) in games sold in the US fall under the CVAA; check the current FCC rules before shipping chat.

**Basic checklist, ship on every game:** readable default text; strong text and UI contrast; no essential information by colour alone or sound alone; subtitles for important speech, presented clearly; separate music, effects and speech volume; remappable controls and a UI usable with the gameplay input device; adjustable sensitivity and haptics that turn down or off; large, well-spaced touch targets; no flashing or high-contrast patterns past the thresholds below; text prompts advance at the player's pace; start without digging through menus; a wide choice of difficulty; settings saved and remembered, features described in-game and on the store page; a channel for accessibility feedback.

- **Text:** default body at least about 28 px at 1080p, scaled for TV distance, with a text-size option and better UI scaling. Contrast at least 4.5:1 (the WCAG 2 AA level the guideline cites); text over busy scenery needs a backing panel or outline. Sentence case, left-aligned, short lines, plain language; reinforce instructions with visuals or speech, not text alone.
- **Subtitles:** at least about 46 px at 1080p by default or option, no more than two lines (three only in exceptional cases), about 40 characters per line at most, on a solid or semi-opaque backing box (outline or shadow too). Offer them before any audio plays (first-boot screen). Show who is speaking (name label, colour plus name, or marker). Caption significant non-speech sounds (`[footsteps behind]`). Let players set size, background opacity and colour. The guideline points at broadcaster norms such as the BBC's for reading speed and fixes no number.
- **Controls:** full remapping across mouse, keyboard and gamepad, with conflicts flagged rather than silently swapped. Toggle alternatives to holds; alternatives to mashing and quick-time events. Every key action reachable by digital input; no required simultaneous actions (click-drag). Simpler scheme option and an in-play controls reminder. Optional input cool-down of about 0.5 s for tremor; no essential precise timing, or a skip. Adjustable timing windows (longer buffer and coyote time, `feel.md`); no artificial input delay.
- **Colour and visuals:** pair every colour cue with a shape, icon, pattern or label (colour-blind presets are a supplement, not the fix). Keep essential temporary information near the eye-line. Crosshair colour and shape choices; a contrast option; for 3D a sensible default FOV and a FOV slider; hide non-essential HUD and background movement.
- **Audio information:** anything audio tells the player (enemy direction) also appears visually, such as a directional damage indicator; stereo/mono toggle; key sounds distinct from each other. Multiplayer: text chat beside voice, pings or quick-chat.
- **Flashing** (flicker guideline): avoid more than three flashes in one second over 25% or more of the screen; flashing sequences longer than 5 seconds; moving high-contrast repeating patterns (about 5 or more stripes) over 25% of the screen; static ones (about 8 or more stripes) over 40%. A flash includes a big brightness jump, a fast cut, or a change to or from saturated red. Formal checks: the Harding test and Ofcom guidance.
- **Motion:** toggles for reduce-motion, camera shake, head-bob, motion blur and screen flash; avoid sudden unexpected movement or offer an option; do not decouple camera from controller movement without an option; in VR avoid forced camera motion and acceleration.
- **Difficulty:** several levels, changeable mid-game; assists (auto-aim, steering assist), a game-speed option, exposed tuning variables; a skip for non-core gameplay such as a minigame; practice without failure; interactive tutorials, objective reminders, story recaps; autosave plus manual save; competitive multiplayer matchmaking preference for players using advantage-giving assists.
- **Settings menu:** a short first-boot prompt (subtitles, text size, colour-blind mode, presets) before the first audio or cutscene; group by need (Vision, Hearing, Motor, Cognitive) or by system; preview each visual option; apply live, keep reset-to-default, persist in profiles. The menu itself is readable at default size, fully gamepad-navigable and reachable from the pause menu.
- **Testing:** include players with disabilities among playtesters (`playtest.md`). Self-checks: sound off with subtitles on; a colour-blindness filter; couch distance; gamepad only; one hand on default bindings; largest text size.

## 6. Gotchas

- Small text is the most common UI complaint; scale it with the UI.
- Fixed-width buttons sized to English clip other locales; state shown only by colour fails colour-blind players.
