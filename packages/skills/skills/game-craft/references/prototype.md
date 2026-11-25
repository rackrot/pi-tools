# Prototyping: spikes and jams

A prototype exists to produce a decision (keep, kill or retune), not a product. Two modes: **spike** (a timebox, answers "is this fun?") and **jam** (a fixed external deadline and a submission). If the user names a jam, a weekend or a submission, it is jam mode. Not for web UI or state-model prototypes (`prototype`), the production build of a validated mechanic (the engine skill), or uploading a build (`game-publish`). Timeboxes and hour schedules below are starting points.

## Contents

1. Spike mode
2. Jam mode
3. Gotchas

## 1. Spike mode

1. **One question** per prototype, binary-ish ("Is grappling while falling satisfying to control?"). Two questions means two prototypes.
2. **Decide throwaway or keep before coding.** Default throwaway: hard-coded values, one file, deleted afterwards. "Keep" only means folders and names that can grow.
3. **Hard timebox:** 30 to 90 minutes for a mechanic, one sitting for a vertical slice. Stop when it ends, finished or not.
4. **Greybox everything except the core verb:** boxes, capsules, circles, built-in font, one debug sound or none. Menus, saves, inventory and settings are stubs or absent.
5. **Instrument for the question:** put the numbers being judged on screen (speed, jump height, timing window, distance) and expose tuning values as constants or debug sliders at the top of the file.
6. **Playtest at once:** play it, then hand it to one other person without explaining the controls and watch where they stall.
7. **Call it against criteria written before coding**, judged with placeholder art, and record the verdict and the tuned numbers:

```text
QUESTION / CORE VERB / THROWAWAY (yes | no) / TIMEBOX / KEEP IF / KILL IF
```

- **Keep** when a fresh player does the core verb on purpose within about 30 seconds, unprompted, and someone replays the loop without being asked.
- **Kill** when the verb only feels good after you explain it, making it fun needs systems far beyond the prototype, or you catch yourself adding art or levels to avoid admitting the verb is flat.
- **Retune** when one variable is clearly off (too slow, window too tight): change that one value, retest, and narrow the question if it still fails.
- Containment: build the spike outside the shipping code (`prototypes/<idea>/`, a separate project or a throwaway branch) and never import it from the main game. A keep authorises a **rewrite** in the real project that carries over the tuned numbers and the lesson, not the code.

## 2. Jam mode

1. Read the rules before the theme drops: length, theme reveal time, deadline with timezone, team size, whether pre-made assets, engines and templates are allowed, whether rating other entries is required.
2. Prep the boring parts where rules allow: an empty project that exports, input and title or end screen stubs, an export run once end to end, licensed font and SFX sources.
3. Theme to one sentence: ten ideas in 15 minutes, then commit to one that fits "You [verb] to [goal] while [constraint]". A second sentence means too big.
4. Scope to the clock with the table: one core mechanic and one hook, everything else a stretch goal. Vertical slice first: a 30-second start, play, win or lose, restart loop running early; a complete tiny loop beats half a big one.
5. Reserve the last 20% for shipping: export, a build test from a clean path, screenshots, the page text.
6. **Submit early, then update.** Upload a working build hours before the deadline; most jam pages allow swapping the file until close. **On itch.io, attach the game to the jam's submission form; uploading to your own page does not enter it.**

| | 48-hour | 72-hour | 1-week |
|---|---|---|---|
| Core mechanics | 1, playable by hour 6 | 1 or 2 | 2 or 3 interacting |
| Content | 1 level or one generated space | 3 to 5 levels | 8 to 12 plus progression |
| Art | placeholder, one palette | one cohesive set | themed set plus UI |
| Audio | 3 to 5 SFX, 1 loop | SFX, 1 or 2 tracks | adaptive music |
| Ship buffer | last 8 to 10 hours | last 12 to 16 hours | last full day |

```text
H0-2 ideate, lock the sentence, name win and lose   H2-8 core loop on primitives, no art
H8-12 sleep   H12-24 one level or encounter, tune, add the hook   H24-30 sleep, one outside playtest, cut
H30-38 art, audio, juice   H38-44 feature freeze: crashes and soft-locks only
H44-48 export, clean-path test, screenshots, page, submit by about H46
```

- Feature triage, in order, for every idea: does the loop work without it (then it is a stretch goal); would a player notice it missing (if not, cut it); is it under 30 minutes of work (if not, defer past the ship buffer). Under deadline the default answer is cut.
- Pre-submit check, on an extracted copy: runs from the extracted zip on a machine or path without the engine installed; controls shown on screen or on the page; no soft-lock, restart works, no error spam in the log; web build set to playable in browser on the host page; page has a one-line pitch, controls, screenshots, credits and asset licenses; submission attached to the jam, not only to your page.

## 3. Gotchas

- Polish hides a flat verb: juice multiplies fun that is already there and cannot create it.
- No written kill criterion means nothing ever gets killed; write it before you are attached.
- The spike becomes the product: prototype code carries prototype assumptions, so rewrite on keep.
- Export once in hour one of a jam: "works in the editor" is not "works in the build" (missing assets and wrong working directories show only in the export).
- Unlicensed assets can break jam rules and any later release.
