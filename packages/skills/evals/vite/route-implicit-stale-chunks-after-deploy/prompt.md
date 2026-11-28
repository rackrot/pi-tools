---
name: route-implicit-stale-chunks-after-deploy
description: "Routing, implicit. Lazy-loaded chunks 404 for tabs that were open during a deploy. The prompt never says Vite; the hashed dist/assets output and the dynamic-import error are the only hints."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

since we started shipping the frontend several times a day, support keeps getting "blank page" reports. the console in their screenshots shows `TypeError: Failed to fetch dynamically imported module: https://app.example.com/assets/SettingsPage-D3kq9aXl.js` and the network tab has a 404 for that file. a hard refresh fixes it every time. the pipeline is just `npm run build` and then syncing `dist/` (index.html plus the hashed files in `dist/assets`) to the bucket, replacing what was there. what do we need to change so people with a tab already open stop hitting this?
