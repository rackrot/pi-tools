---
name: value-app-size-facts
description: "Value case. Three app-size rulings from references/size.md for an app shipped as an AAB: abiFilters barely change the Play download, native libraries stored uncompressed give the smaller download, and splits.abi must not be combined with a bundle upload. S1 and S3 are controls the bare model gets right; the case turns on S2 (double weight), where the bare model answers COMPRESSED."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

why is our release so big and what do we do about it: the universal APK built from our bundle is 61 MB. we ship an AAB through Play, minSdk 26, AGP 9, and the app bundles native libraries for arm64-v8a, armeabi-v7a and x86_64. three proposals came up in the meeting and I need a ruling on each.

- S1: add `ndk { abiFilters += listOf("arm64-v8a", "armeabi-v7a") }` to drop x86_64. will that noticeably shrink what a user on an arm64 phone downloads from Play?
- S2: our native libraries are currently stored uncompressed in the APK (`useLegacyPackaging = false`). someone wants to flip that so the .so files are compressed. for the smallest Play download, which is better: stored uncompressed or stored compressed?
- S3: add `splits { abi { isEnable = true } }` to the same build we upload as a bundle, to get smaller downloads. should we?

end your reply with exactly these three lines, S1 to S3 in order:
`S1: SMALLER` or `S1: SAME`
`S2: UNCOMPRESSED` or `S2: COMPRESSED`
`S3: YES` or `S3: NO`
