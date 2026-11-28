---
name: value-android-ci-toolchain
description: Value case. The Android SDK package versions Godot 4.7 asks for (build-tools 35.0.1, NDK r28b 28.1.13356709) and the setup-godot use-dotnet default (true); the bare model answers with the older 34 / r23c toolchain.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm writing the Android job of our GitHub Actions workflow for a Godot 4.7 game (GDScript only, Gradle build, AAB for Play). the draft is below with three blanks. give me the values Godot 4.7 itself asks for, not "whatever is newest".

```yaml
      - uses: chickensoft-games/setup-godot@v2
        with:
          version: 4.7.2
          include-templates: true
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: "17" }
      - run: |
          sdkmanager --sdk_root="$ANDROID_HOME" "platform-tools" \
            "build-tools;<BLANK 1>" "platforms;android-<BLANK 2>" \
            "cmdline-tools;latest" "ndk;<BLANK 3>"
```

also: I left `use-dotnet` out of the setup-godot step on purpose because we have no C#. with the input left out, does the action download the standard editor or the .NET one?

end your reply with exactly these four lines:

`BUILD_TOOLS: <version>`
`PLATFORM: <api level number>`
`NDK: <full package version, digits and dots>`
`DOWNLOADED_AS_WRITTEN: STANDARD` or `DOWNLOADED_AS_WRITTEN: DOTNET` (what the draft above downloads as it stands, not what I should want)
