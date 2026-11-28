---
name: android-performance
description: 'Sets up and interprets Android Macrobenchmark and Baseline Profile work and reduces app size. Use for "add a baseline profile for startup", "cold start regressed between two CI runs", "the startup median rose 40 ms, do we block the merge", writing a startup benchmark or the results note for a PR, checking the profile is installed, or "the release APK or AAB got bigger, what takes the space and what can we cut" (abiFilters, ABI splits, compressed native libraries, locales, resource shrinking). Covers StartupTimingMetric, CompilationMode, the androidx.baselineprofile plugin, BaselineProfileRule, reportFullyDrawn, APK Analyzer, and download size versus install size.'
---

# Android performance

Measure on a build that matches what ships, change one thing, measure again, and report what was and was not measured.

Not for (the `android-skills:` names are the third-party `android-skills` plugin, if installed; no skill in this package covers Perfetto, heap or ANRs): Perfetto and system traces, heap and memory, startup trace analysis (`android-skills:android-profiler`), ANRs (`android-skills:anr-audit-and-fix`), Compose recomposition and stability (`jetpack-compose`, or `android-skills:jetpack-compose-performance` if installed), release-only crashes and keep rules for a failing build (`android-build`), keep-rule audits and code shrinking (`android-skills:r8-analyzer`, if installed), and unit or UI test setup (`android-testing`).

## Orient

1. Find the modules: an `com.android.test` module with `androidx.benchmark.macro` (Macrobenchmark), one applying `androidx.baselineprofile` (the profile producer), and the app module that consumes the profile. Read `gradle/libs.versions.toml` for the AndroidX Benchmark version; the baselineprofile plugin and `benchmark-macro-junit4` are released together.
2. Find the build types. Timings need a non-debuggable, release-like type (usually `benchmark`, initialised from `release`, signed with the debug key), not `debug`.
3. Check for a device. `adb devices` must list a physical device; an emulator gives numbers that say nothing about users. Without one, you can write the code and the Gradle wiring but cannot claim any timing. With several attached, pin one with `ANDROID_SERIAL=<serial>` for every Gradle and adb command, and name the device in the report.
4. Check what already exists before adding: a `baseline-prof.txt` under `app/src/main/`, `generated/baselineProfiles/`, or `profileinstaller` in dependencies.
5. Done when you can name the benchmark module, the build type under test, the device, and whether a profile is already shipped.

## Rules for any timing claim

1. Measure a build that is not debuggable and matches the shipped minification and resource shrinking. A debug build can be several times slower and shows different bottlenecks.
2. Record, with every result: build type, whether R8 ran, compilation mode, device model and API level, iteration count, and the metric names.
3. Run at least 10 iterations per scenario; compare medians and the min-to-max ranges. If the two ranges mostly overlap, report "not enough evidence"; call it a change only when the ranges overlap little or not at all.
4. Never turn on `androidx.benchmark.suppressErrors` to get a number. Macrobenchmark refuses debuggable apps, emulators and low battery for a reason; fix the setup instead.
5. End the report with a "Not measured" line: for example warm and hot start, other devices, low-memory conditions, or a run on the CI hardware.

## Macrobenchmark

1. Create the module with the `com.android.test` plugin, `targetProjectPath` set to the app, and a `benchmark` build type that falls back to the app's `release`. Details and a rule skeleton are in `references/macrobenchmark.md`.
2. Pick the metric by question. Startup: `StartupTimingMetric` (time to initial display, plus time to full display once the app calls `reportFullyDrawn`). Scrolling and animation: `FrameTimingMetric`. Use a `StartupMode` of `COLD` for startup claims.
3. Pick the compilation mode on purpose: `None` is the worst case with no profile, `Partial` uses the shipped baseline profile, `Full` is the best case with everything ahead-of-time compiled. A startup claim compares `None` against `Partial`.
4. Drive the app with UiAutomator inside `measureBlock`, with a fixed scenario and `setupBlock` that resets state.
5. Done when the benchmark runs on a device through Gradle and produces a JSON result for each mode.

## Baseline Profiles

1. Apply `androidx.baselineprofile` in the producer module and the app, point the app at the producer with the `baselineProfile` configuration, and write a generator with `BaselineProfileRule.collect`. `references/baseline-profiles.md` has the wiring and the generate command.
2. Cover the startup path and the one or two journeys users take most, not every screen. A profile that lists everything dilutes the benefit.
3. Verify the profile ships: the built APK or AAB contains `assets/dexopt/baseline.prof`, the device compiled it (`speed-profile`), and a `Partial` benchmark beats `None`. Without that comparison the profile is unproven.
4. Done when the generated profile is committed (or generated in the release job) and the verification numbers sit beside the build type and device.

## Time to full display

`reportFullyDrawn()` in the Activity, or `ReportDrawnWhen` in Compose, marks the point where the content users came for is shown. Call it once the data the first screen needs is on screen, not at `onCreate`. Without it the time-to-full-display metric is missing. The macrobenchmark and the profile both improve when this is honest.

## Comparing runs and CI

1. Compare the same device, build type, compilation mode and iteration count; change one variable at a time.
2. Keep the JSON each run writes and compare median and spread per metric. Fail a CI job only on a regression larger than the spread, with a stated percentage threshold, and re-run once before blocking.
3. Pin CI to one device model; mixed fleets produce shifts that are not regressions. `references/macrobenchmark.md` shows where the JSON lands and what to read.

## App size

Measure first, then cut the largest contributor. Read `references/size.md` before ruling on any size proposal: it covers APK Analyzer and `apkanalyzer`, download size vs install size, resource shrinking, native libraries and ABIs, and the order to attack them. Rulings that are easy to get wrong:

- Keep native libraries uncompressed (`useLegacyPackaging = false`): the uploaded artifact is larger, but the Play download and the install are smaller. Do not compress them to save size.
- For an AAB, Play already splits by ABI, density and language, so `abiFilters` and locale filters barely change a user's download; they shrink the universal or sideloaded APK.
- Never combine `splits { abi }` with a bundle upload.

A release build broken by R8 (release-only crash, missing keep rule) goes to `android-build`. DEX-size reduction goes to `android-skills:r8-analyzer`, if installed; this skill records whether R8 ran and the size before and after.
