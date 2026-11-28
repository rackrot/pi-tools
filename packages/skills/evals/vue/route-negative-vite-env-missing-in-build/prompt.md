---
name: route-negative-vite-env-missing-in-build
description: "Near miss. An env value missing from the production bundle and a dev proxy that does not apply in preview are bundler configuration (vite), even though the app happens to be a Vue app."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our vue admin app works in `npm run dev` but after `npm run build` + `npm run preview` every API call goes to `undefined/users`. the base url comes from `.env.production`:

```
API_BASE_URL=https://api.internal.example
```

and in src/api.ts we do `const base = import.meta.env.API_BASE_URL`. in dev it only works because of the `/api` proxy in vite.config.ts. what do I need to change in the env file and the config so the built bundle gets the url?
