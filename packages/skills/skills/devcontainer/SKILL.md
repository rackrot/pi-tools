---
name: devcontainer
description: 'Dev Container spec rules that are easy to get wrong from memory (which values waitFor accepts, string vs array vs object lifecycle commands, what a prebuild caches, remoteEnv leaking into the image label, Feature install order). Use for any question about devcontainer.json, .devcontainer/, "Reopen in Container", Dev Container Features or GitHub Codespaces setup, startup time, prebuilds or cost, including when the config is pasted into the chat and when a tool works in the container terminal but a setup or lifecycle command reports "command not found". Not for plain Dockerfiles or Compose stacks with no dev container.'
---

# Dev containers and Codespaces

Not for plain Dockerfiles or Compose stacks outside a dev container (`docker`), Kubernetes (`kubernetes`), GitHub Actions workflows except where a CI job builds a dev container, or mise.toml / .tool-versions pinning (`mise`).

`waitFor` accepts only `initializeCommand`, `onCreateCommand`, `updateContentCommand` (the default), `postCreateCommand` or `postStartCommand`. `postAttachCommand` is not a valid value; to wait for the latest hook possible, use `postStartCommand`.

## Load what the task needs

- `references/rules.md`: twelve rules, each quoting the Dev Container spec, the reference CLI source or vendor docs (eleven spec-backed, one Claude Code-specific). Read it for any review or authoring of `devcontainer.json`, `devcontainer-feature.json` or a Feature's `install.sh`.
- `references/codespaces.md`: measure, guardrails, at most three fixes, verify. Read it when the goal is Codespaces startup time, spend, machine size, idle timeout or prebuild scope.

## How to review

1. Find the config: `.devcontainer/devcontainer.json`, `.devcontainer.json`, or `.devcontainer/<name>/devcontainer.json`, plus any Dockerfile, Compose file, `devcontainer-lock.json`, Features under `.devcontainer/` and CI or prebuild config that builds it.
2. Note each lifecycle hook's form (string runs through `/bin/sh`, array runs with no shell, object entries run in parallel) before applying the other rules.
3. Apply `rules.md`. Every rule is a reading task; none needs a build.
4. Respect the two **Do not report** guards: a `remoteEnv` value that is a `${localEnv:...}` or `${containerEnv:...}` reference is the fix, not a leak, and an absent `updateRemoteUserUID` is the correct default.
5. Remember the image label merge: a value present in the file wins, but a value absent from it may still come from the image's `devcontainer.metadata` label. Don't report an absent lifecycle command, `remoteUser` or env block as proof the behaviour is missing.

## How to write one

- Start minimal: an image or Dockerfile, the Features the project needs, `customizations.vscode` for extensions and settings (never top-level `extensions`/`settings`), and `forwardPorts` rather than `appPort`.
- Put cacheable installs (`npm ci`, `pip install`, `go mod download`) in `onCreateCommand` or `updateContentCommand` so Codespaces prebuilds and `devcontainer up --prebuild` cache them; keep `postCreateCommand` for work that needs the user's own credentials.
- Set a non-root `remoteUser`, and `chown` any named volume mounted under it.
- Declare needed secrets under `secrets` and pass values at run time (Codespaces secrets, `--secrets-file` kept outside the repo). Never commit a literal credential in `remoteEnv`, `containerEnv` or `build.args`; those land in the image label, a layer or the image history.
- Commit `devcontainer-lock.json` to pin Feature versions.
- Validate with `devcontainer build` or `devcontainer up` when the CLI is available, since the CLI does not check the JSON Schema; otherwise say the review was static.

## Report

List findings per rule with the file, the key, what the file states, where the image label could still change it, and the fix. Separate spec findings from the Claude Code rule and from Codespaces cost advice. Attach no severity or confidence numbers; none were measured.
