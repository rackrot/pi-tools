---
name: value-attach-draft-commands
description: Value case. Exact gh command lines for opening and updating a PR with screenshots (--attach on gh pr create and gh pr edit) and the draft default, also for a fork PR; the bare model does not know --attach (commits the images or uses a gist) and opens a non-draft PR.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I need to open two pull requests on GitHub with the gh CLI (latest release, logged in as `alice`). Don't run anything, I paste the commands myself, and treat every command below as already approved. I only need the exact command lines, set up the way you would recommend.

Situation A: my own repo on github.com. Branch `fix/chart-legend` is already pushed, the base is `main`, the PR text is in `/tmp/pr-body.md`, and the title is "Fix chart legend overlap". It is a visual fix, and I have `./before.png` and `./after.png` in the current directory that must show up in the PR description. I want one command that opens the PR with both images in it, with no browser steps and without committing the images to the repo.

Situation B: the PR from A got number 57. A reviewer asked how it looks in dark mode, and I have `./after-dark.png`. I want one command that adds that image to the description of PR 57, again without a browser and without committing the image.

Situation C: a different project, `github.com/tokio-rs/axum`, where I have no push access. My fork `alice/axum` is the `origin` remote and my branch `fix/empty-header-panic` is already pushed there. Give me the one command that opens the PR against `main` of tokio-rs/axum, titled "Fix panic on empty header", with the text from `/tmp/axum-body.md`.

End your reply with exactly three lines, each one a single command with nothing else after the colon:

A: <command>
B: <command>
C: <command>
