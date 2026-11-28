---
name: play-publishing
description: 'Google Play release path for an Android app: uploads, tracks, staged rollouts and signing keys. Read this before answering any question about a Play upload error ("Version code N has already been used", "signed with the wrong key"), a lost upload key, getting an AAB to the internal track from CI, stopping, halting or widening the rollout of a release that is already reaching users, or the target API deadline, even when the workspace has no project files. Covers upload key versus Play App Signing, Gradle Play Publisher, fastlane supply, mapping upload, store listing and data safety drafts. Never publishes without an explicit yes.'
---

# Play publishing

Orient first, set up the safe path, and publish only after an explicit yes. This skill never prints, commits or echoes a credential, and never publishes on its own.

Not for (the `android-skills:` names are the third-party `android-skills` plugin, if installed): auditing the app against Play policy or finding undeclared data collection (`android-skills:play-policy-insights`), Play Billing upgrades (`android-skills:play-billing-library-version-upgrade`), Engage SDK (`android-skills:engage-sdk-integration`), signing config and build errors in Gradle (`android-build`), and App Store or TestFlight (out of scope).

## Orient

1. Find the release path: `com.github.triplet.play` in a build file or `gradle/libs.versions.toml`, `fastlane/Fastfile` calling `upload_to_play_store` or `supply`, a CI workflow that uploads to Google Play, or manual Play Console uploads. Read it before proposing anything.
2. Find the signing setup (`signingConfigs` in the app module, or environment-driven properties) and the `versionCode` scheme (literal, CI run number, date-based, git count).
3. Ask whether the app is enrolled in Play App Signing. If yes, the key in the repo or CI is the upload key, not the app signing key.
4. Check `.gitignore` covers `*.jks`, `*.keystore`, `keystore.properties`, `local.properties` and the service-account JSON. Report gaps; do not print file contents.
5. Done when you can state the path, the signing source, the versionCode source, the track used today and where each secret lives.

## Secrets

1. Keystores, passwords and the service-account JSON come from CI secrets or files outside the repo, read through environment variables or a gitignored properties file.
2. Never commit, print, `cat` or echo them, including in logs, `--info` output and error reports. If a literal secret is already in a tracked file, move it out, tell the user it is exposed in history, and let them rotate it.
3. The service account needs only the Play Console permissions for the tracks it releases to.
4. Keys and the reset procedure: [references/signing.md](references/signing.md).

## Build and upload

1. Build with `./gradlew :app:bundleRelease`. The AAB is the upload artifact; use `bundletool build-apks` only for local APK sets and device tests.
2. R8 mapping and native debug symbols travel inside the AAB when configured; see [references/signing.md](references/signing.md) for `debugSymbolLevel` and manual upload.
3. Pick the tool already in the repo: [references/gradle-play-publisher.md](references/gradle-play-publisher.md) or [references/fastlane.md](references/fastlane.md). For a new setup with no preference, use Gradle Play Publisher, but say it is in maintenance mode and offer fastlane supply when the team wants an actively maintained tool.
4. Done when a validate-only run (GPP `commit.set(false)`, fastlane `validate_only: true`) succeeds, or the user has the exact commands to run. A draft upload still sends the bundle to Play, so it needs the user's yes like any other upload.

## Actions confirm first

Any upload, track promotion, rollout change, halt, listing edit or metadata push changes what users or reviewers see, and most cannot be undone from the repo. Before running one, state:

- what changes (upload, promote, set rollout, halt, listing);
- the application id, track, `versionCode` and rollout percentage;
- the status (draft or completed).

Then wait for a yes. A yes covers that one action only. A plan approved in advance ("10%, then 25, 50, 100 if vitals are fine") is not a yes for each step: confirm every rollout change when it is due. A draft upload needs a yes too. During setup run nothing that publishes; dry runs and validate-only checks are fine.

## Defaults

- New setups target the `internal` track with draft releases. Promotion to closed, open or production is a separate confirmed step. Do not propose switching CI to completed releases on your own; if the user asks for it, treat the change as a confirmed step and say that every tag will then reach testers without a manual rollout.
- Production starts as a staged rollout; widen it in steps and halt on crash or ANR regressions. Steps: [references/tracks-and-rollouts.md](references/tracks-and-rollouts.md).
- `versionCode` only goes up and never repeats across tracks. For "Version code N has already been used", raise it above the highest code in any track, rebuild, and re-upload.

## Store content

1. Listing text, images and changelogs live in the repo in the GPP (`src/<variant>/play/`) or fastlane (`fastlane/metadata/android/`) layout; pull existing ones with the tool's bootstrap or `supply init` before editing.
2. Draft data safety answers from manifest permissions and the SDKs present: [references/data-safety.md](references/data-safety.md). The account owner reviews and submits the form. A policy audit is out of scope; say so, and suggest `android-skills:play-policy-insights` only if it is installed.

## Target API

New apps and updates must target a minimum API level by a deadline set by Play. [references/target-api.md](references/target-api.md) says where to fetch the current level and deadline; it holds no dates. Fetch the page before quoting dates; they change yearly. Raising `targetSdk` itself is an `android-build` task.
