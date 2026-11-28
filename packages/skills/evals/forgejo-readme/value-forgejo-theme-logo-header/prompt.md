---
name: value-forgejo-theme-logo-header
description: "Value case. A header with a theme-following logo and a CI badge for a Codeberg repo, everything given in the prompt: Forgejo strips picture and source, and serves the workflow badge itself. The bare model tends to write the GitHub picture element."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Our repo is https://codeberg.org/acme/widgets and that's the only place it lives. The top of README.md is just `# widgets`. Write me the header block to paste in there: a centred logo, the project name, the one-liner "Typed config loader for Go services.", and a badge for the CI workflow, which is .forgejo/workflows/ci.yml and runs on main.

About the logo: assets/logo-light.svg is drawn for light backgrounds and assets/logo-dark.svg for dark ones, so I'd like it to follow the visitor's theme on the repo page.

Reply with the block in one fenced code block, plus at most three sentences on anything I should know. Don't edit any files.
