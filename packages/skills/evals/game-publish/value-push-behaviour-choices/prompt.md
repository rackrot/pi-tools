---
name: value-push-behaviour-choices
description: Value case. Non-obvious butler and SteamPipe behaviours picked from fixed options (--hidden on an existing channel errors, single-zip auto-unzip, multi-platform channel tags, latest build is upload order not semver, SetLive never sets default, html5 channel name does not make a build browser-playable).
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm writing the release script for our game (itch.io via butler, Steam via steamcmd) and want to know what actually happens in six situations before I rely on them. Pick one option for each, one sentence of why.

Q1. Our itch.io channel `windows` already has public builds. I run `butler push build/win studio/game:windows --hidden`.
  A) the new build is uploaded and stays hidden until I unhide it
  B) the flag is ignored and the new build goes public
  C) the push fails with an error

Q2. `dist/` contains exactly one file, `game-win.zip`. I run `butler push dist studio/game:windows`. What do players get on that channel?
  A) the files that were inside the zip
  B) the file `game-win.zip` itself

Q3. I push a Java build to one channel named `win-linux-mac-stable`. Which platform tags does itch.io give it at first?
  A) Windows only, the first match wins
  B) Windows, Linux and macOS
  C) none, the name is not a known platform

Q4. Yesterday I pushed `--userversion 1.10.0` to `windows`; today a hotfix with `--userversion 1.9.5` to the same channel. Which one does itch.io serve as the latest build?
  A) 1.10.0
  B) 1.9.5

Q5. Our game is released on Steam. I put `"SetLive" "default"` in `app_build.vdf` and run the upload. After steamcmd finishes:
  A) the build is uploaded but not live for players; someone has to set it live on default by hand in the partner site
  B) the build is live for all players

Q6. I push the web export to a new channel named `html5`. Is it playable in the browser on the game page?
  A) yes, the channel name `html5` tags it as a browser build
  B) yes, as soon as the project Kind is set to HTML
  C) no, not until the upload itself is also ticked as playable in the browser by hand

end your reply with exactly one line per question in the form `Q1: A`, Q1 to Q6 in order.
