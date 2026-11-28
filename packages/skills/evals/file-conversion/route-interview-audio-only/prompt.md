---
name: route-interview-audio-only
description: "Routing, explicit. A phone recording that is needed as an MP3 with the audio only routes to file-conversion; the prompt does not quote the description's examples or name a tool."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I recorded a 40 minute interview on my phone, it's ~/Downloads/interview-kessler.mov. the transcription person only takes mp3 and doesn't need the picture. can you turn it into one for me?
