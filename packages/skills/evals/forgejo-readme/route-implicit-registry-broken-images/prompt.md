---
name: route-implicit-registry-broken-images
description: "Routing, implicit. Images that show on the repo page but break on the npm package page; the word README never appears."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our package page on npmjs.com shows a broken-image icon where the logo and the demo screenshot should be. on the repo page (https://codeberg.org/acme/tidewatch) both show up fine. they're referenced as assets/logo.svg and assets/demo.png. what do i change so they show in both places?
