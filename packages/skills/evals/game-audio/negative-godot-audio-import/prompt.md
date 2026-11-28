---
name: negative-godot-audio-import
description: Near-miss negative. Engine import and compression settings for audio files belong to the engine skill (godot), not to game-audio.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Godot 4.4 project. I have a two minute music loop as a 24-bit WAV and about forty short footstep and impact WAVs. which of them should I re-export as Ogg Vorbis, which import dock options do I set so the music loops without a gap, and where do I enter the BPM?
