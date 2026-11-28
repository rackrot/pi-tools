# App size

Verified 2026-11-01 as practice; confirm flags against developer.android.com/topic/performance/reduce-apk-size when an option errors.

## Measure first

1. Build the shipped form: `./gradlew :app:bundleRelease` for Play, `:app:assembleRelease` for a sideloaded APK.
2. Look inside. Android Studio: Build, Analyze APK (open the `.apk`; for a bundle, build the APK set first). CLI, from the Android SDK `cmdline-tools`:
   - `apkanalyzer apk summary app-release.apk` (size, id, version);
   - `apkanalyzer apk file-size app-release.apk` and `download-size`;
   - `apkanalyzer files list app-release.apk`, `dex packages app-release.apk`, `resources packages app-release.apk`.
3. Compare two builds with Studio's APK Analyzer diff, or `apkanalyzer` output from each. Report raw size and download size separately: Play delivers per-device splits, so the download is smaller than the universal APK. `bundletool get-size total --apks=app.apks` gives an estimate per device spec.
4. Start with the largest bucket: usually `lib/` native libraries, then `classes*.dex`, then `res/` and `resources.arsc`, then `assets/`.

## Resources

- Resource shrinking (`isShrinkResources = true`) needs `isMinifyEnabled = true`; it removes resources unreachable from code after R8. Check what it drops with the `resources.txt` report in the build outputs and `./gradlew :app:lintRelease` for `UnusedResources`.
- Keep only the locales you ship: `androidResources { localeFilters += listOf("en", "de") }` (older AGP: `resourceConfigurations`). Densities and languages are already split for Play bundles; this matters for APKs.
- Prefer vector drawables and WebP over PNG for large bitmaps; check `res/` and `assets/` for oversized images and duplicated fonts.
- Library resources count: a library pulled in for one string or icon costs its whole resource table.

## Native libraries and ABIs

- Ship only the ABIs you support: `ndk { abiFilters += listOf("arm64-v8a") }` in a `defaultConfig` for APK builds. For an AAB, Play splits by ABI itself, so filtering mostly shrinks the universal or sideloaded artifact.
- `splits { abi { ... } }` produces per-ABI APKs and is for APK distribution only; do not combine with a bundle upload.
- Keep native libraries uncompressed (`packaging { jniLibs { useLegacyPackaging = false } }`, the default from minSdk 23). The APK or AAB you upload is larger, but the Play download is smaller, because Play compresses the download itself and does that better on uncompressed .so files, and the install is smaller because nothing is extracted. Do not switch to compressed libraries to save size.
- Strip debug symbols from release `.so` files and upload them to Play as native debug symbols separately (`play-publishing`).
- Check each prebuilt `.so` against the dependencies that supply it; a transitive ML or media library often dominates `lib/`.

## Code

DEX size is R8's job. A release build that R8 breaks (release-only crash, missing keep rule) goes to `android-build`. Minification, keep-rule bloat and unused libraries can go to `android-skills:r8-analyzer`, if installed. This skill records whether R8 ran and the size before and after.

## Report

State build type, artifact type, size before and after in raw and download terms, which bucket changed, and what was not checked (other ABIs, other device specs, install size on device).
