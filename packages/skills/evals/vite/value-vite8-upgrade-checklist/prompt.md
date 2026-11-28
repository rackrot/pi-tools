---
name: value-vite8-upgrade-checklist
description: "Value case. Vite 8 facts that differ from Vite 7 and that a model answering from memory tends to get wrong: the Rolldown codeSplitting option that replaces manualChunks, the removed object form, the legacy flag for the CommonJS default-import change, the raised default browser target and the built-in tsconfig paths option. No Glob or Grep on purpose: with them the no-skill arm searches the home directory for a Vite checkout and reads the migration guide, which hides the difference. A2 and A5 are usually known without the skill; A1, A3 and A4 carry the difference."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Skill]
---

we're moving our React SPA from Vite 7.3 to Vite 8.0 next sprint and I'm writing the upgrade checklist. the relevant parts of vite.config.ts today:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: { vendor: ['react', 'react-dom', 'react-router'] },
      },
    },
  },
})
```

`build.target` is not set, so we get the default. I'm away from my machine, so there is no checkout to look at. I need five facts about Vite 8.0 for the checklist:

- A1: the name of the bundler output option Vite 8 wants us to use for the vendor split in place of `manualChunks` (just the option name)
- A2: does the object form of `manualChunks` we have today still work in Vite 8? YES or NO
- A3: a few files do `import x from 'some-cjs-package'`, and I read that Vite 8 changed how the `default` import from a CommonJS module resolves. the config option that temporarily restores the old behaviour while we fix those imports (full dotted option name)
- A4: the oldest Safari version covered by the default `build.target` in Vite 8
- A5: the built-in Vite 8 config option that lets us drop the `vite-tsconfig-paths` plugin (full dotted option name)

explain as much as you like, but end your reply with exactly five lines in the form `A1: <answer>`, A1 to A5 in order, nothing after them.
