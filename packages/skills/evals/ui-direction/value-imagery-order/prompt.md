---
name: value-imagery-order
description: Value case. The imagery order of preference (own, generated, open collections, drawn in code, the sheet's photographs as atmosphere, type and colour alone). The bare model tends to rank real open-licence photos above generated ones or bundled stock above drawings.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

planning the launch page for Brinehouse, a small fermentation shop in Leith (kimchi, sauerkraut, hot sauce). brand new page, static html/css, the look is designed from scratch. they have no photographs of their own. these are the picture sources I could use:

- A: the atmospheric stock photographs that come bundled with the design direction we picked
- B: real CC0 / public-domain pictures of their world (Leith docks, cabbages, chillies) from open collections
- C: illustrations drawn in code (SVG/CSS) from the subject
- D: no pictures at all, type and colour only
- E: pictures I generate for it myself with an image-generation tool (I have one and will run it, you just write the prompts)

rank them from the one to reach for first to the last resort. end your reply with exactly one line in this form: `ORDER: A, B, C, D, E` with the letters in your order.
