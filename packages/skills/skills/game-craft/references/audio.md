# Game audio: mix, loudness, SFX, adaptive music

Engine-neutral. Engine nodes and API: `godot` (`audio.md` reference). Middleware such as FMOD or Wwise implements most of this natively. Not for import and compression settings or composing. Numbers marked "about" are starting points.

## Contents

1. Mix and loudness
2. SFX
3. Beat sync
4. Adaptive music

## 1. Mix and loudness

- Route every sound through buses (for example `Master <- Music, SFX, Ambience, UI, Voice`); sliders map to bus volumes and no gameplay code sets a clip volume to balance the mix. Clip gain only normalises source files.
- **Slider to volume goes through decibels:** `bus.volume_db = linear_to_db(v)`, and mute at `v <= 0.001` instead of passing 0 (minus infinity dB). `bus.volume_db = v` makes 0.5 mean +0.5 dB, so the slider feels dead until the bottom of its range.
- Headroom: summed master below 0 dBFS with a true-peak ceiling around -1 dBTP; a limiter on Master is a safety net, not the mixer.
- **Loudness target** (integrated, measured over a representative play session): about -24 LUFS (+/-2) for console and PC per Sony's ASWG-R001, which other platform holders follow; about -18 LUFS for mobile and handheld per PlayStation guidance as reported by Audiokinetic. Both checked 2026-10-17 and second-hand, so confirm against the platform's current delivery spec before cert. Music-streaming loudness (-14 LUFS) is too hot for games: no room for dynamics between quiet exploration and loud combat.
- **Ducking:** voice and critical cues dip music and ambience via a sidechain compressor or a volume tween. Attack about 10 ms, release 300 to 500 ms, ratio about 4:1 to 8:1. Without a sidechain: tween the music bus to about -10 dB over 0.1 s on voice start and back over 0.4 s on voice end. Pumping means too fast a release or too much ratio: lengthen the release, lower the ratio, or duck less.
- Sounds carrying gameplay information (enemy behind you, reload done) need a visual equivalent and must stay distinct; offer separate Music, SFX, Voice and UI sliders and a mono toggle (`ui.md`). 3D sound: set a max distance per category and check important cues stay audible at gameplay range.
- Verify on headphones, TV speakers and a phone speaker; play a full session with music at default; check ducking is audible without pumping, transitions land on the beat and every slider covers its range smoothly. Report loudness meter readings and what you heard.

## 2. SFX

- Pick from a pool of 3 or more takes without immediate repeats, with pitch about +/-5% and volume about +/-2 dB.
- Cap simultaneous voices per sound (footsteps 4 to 8, a gun 3 to 6, starting points) with a steal policy (oldest or quietest). Pool or free one-shot players when they finish; unbounded one-shots pile up voices and leak players.

## 3. Beat sync

Schedule beat-locked events from the audio playback position plus output latency, never from accumulated frame delta, which drifts within seconds.

```text
spb = 60 / bpm;  pos = playback_position() + output_latency()
wait_for = spb - (pos mod spb)
```

## 4. Adaptive music

Two techniques, often combined. One looped track for a whole level tires fast: use layers or segments, and add silence.

- **Vertical layering:** stems (drums, bass, melody, tension pad) of identical length and tempo start together, silent, and stay sample-aligned; only volumes change (fades of 0.5 to 1.5 s sound musical, instant cuts sound mechanical). Intensity can change at any moment without losing sync. Use the engine's synchronized-stream feature if it has one so stems cannot drift.
- **Horizontal re-sequencing:** segments (intro, explore A, explore B, combat, victory, outro). A change request is queued and applied at the next safe boundary, never mid-bar. Boundary by section length: beat for fast reactive cues, bar for most changes, phrase (4 or 8 bars) for big mood shifts.
- Transitions, roughly in order of polish: immediate crossfade 0.2 to 2 s (low stakes, menus); quantised switch (default for music that stays in time); a written transition segment (signature moments such as combat start or a boss); stinger over the bed (events that must not change the loop); resume at position (exploration music after a short combat).
- **Drive music from one smoothed 0..1 intensity**, not raw events, with hysteresis so it does not flap at a threshold:

```text
raw = clamp(enemies_near / 5, 0, 1) * (1 - 0.4 * player_hp01)
intensity = lerp(intensity, raw, 1 - exp(-k * dt))
level_from(i, current): 0 -> 1 above 0.6;  1 -> 0 below 0.4;  else current
```

- Add a minimum dwell per level (for example 8 bars) so short skirmishes do not bounce the score. Show the intensity in a debug overlay while tuning.
- Author stems and segments at one tempo, bounced aligned; loop points sample-accurate and on bar boundaries (test the wrap for clicks). Store BPM, beats per bar and segment boundaries as data. Stream long music, decode SFX into memory; many stems cost voices and memory on low-end and mobile. Move to middleware once the system outgrows a handful of stems and segments.
