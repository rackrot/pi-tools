---
name: value-gag-thresholds
description: Value case. Six UI facts judged against the numeric thresholds of the Game Accessibility Guidelines, each chosen so the plausible guess is wrong (static stripes can fail, few or small moving stripes pass, slow flashing fails on duration, fast flashing on a small area passes, 44 characters per subtitle line fails).
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

accessibility pass on our console action game before we lock the UI and VFX. Check each item against the numeric thresholds the Game Accessibility Guidelines (gameaccessibilityguidelines.com) give, as written there. Not WCAG, not what you would personally prefer: an item passes when it stays inside every number the guidelines state and fails when it crosses one.

- B1: The loading screen has a static (not moving) high-contrast striped backdrop: 10 stripes, covering about 50% of the screen.
- B2: The warp tunnel has moving high-contrast stripes: 4 stripes, covering about 60% of the screen.
- B3: A scanner beam effect has moving high-contrast stripes: 6 stripes, covering about 20% of the screen.
- B4: The low-health warning pulses the whole screen bright red twice per second and keeps going for 8 seconds.
- B5: The minigun muzzle flash flickers five times per second for 2 seconds per burst and covers about 10% of the screen.
- B6: Subtitles are two lines at most, with up to 44 characters per line.

end your reply with exactly one line per item in the form `B1: PASS` or `B1: FAIL`, B1 to B6 in order.
