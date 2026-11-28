---
name: game-design
description: Game design documents and game numbers - one-page pitch, GDD, pillars, core loop, mechanic specs, scope cuts, XP and damage curves, difficulty and wave scaling, in-game economy (faucets and sinks, prices, inflation), loot tables, drop rates and pity. Read it before answering any game design, balance, economy or loot question, including a quick one with no files to look at, because it holds the templates and starting numbers to use. Use for "GDD", "design doc", "pitch", "core loop", "balance this", "too hard", "too much gold", "nothing to spend it on", "drop rates" or "never drops".
---

# Game design

Procedures and templates for deciding what a game is and tuning its numbers. Output is a document, a spec, a table of numbers or a simulation, never engine code. Building the mechanic goes to the engine skill (for Godot, the `godot` skill).

Not for: genre norms and genre-specific systems (`game-genres`), moment-to-moment feel and juice (`game-feel` or `game-craft`), level layout and pacing (`level-design` or `game-craft`), running playtests and reading feedback (`game-playtest` or `game-craft`), or a fast throwaway build (`game-prototype` or `game-craft`). Use each one if installed.

## Pick the artifact

Find the row that matches the request and read its file before writing anything: the templates, formulas and starting numbers are only in those files, not on this page. Ask which artifact is wanted only when no row matches.

| Request | Artifact | Read |
|---|---|---|
| "Pitch", "what's the game", early idea | One-page pitch with pillars and core loop | [references/gdd-template.md](references/gdd-template.md) section 1 |
| "GDD", "design doc" | Living GDD: one page first, then system pages | [references/gdd-template.md](references/gdd-template.md) |
| "Spec this mechanic", "how should X work" | Mechanic spec | [references/gdd-template.md](references/gdd-template.md) section 4 |
| "Balance", "XP curve", "damage formula", "too hard", "too easy" | Balance model and tuning table | [references/balancing.md](references/balancing.md) |
| "Economy", "currency", "shop prices", "inflation", "drop rates", "loot table" | Sources-and-sinks map, simulation, drop tables | [references/economy.md](references/economy.md) |
| "Cut scope", "too much to build" | Cut list | Step 6 below and [references/gdd-template.md](references/gdd-template.md) section 6 |

## Workflow

1. **Collect constraints first.** Platform, session length, team size and time, target audience, comparable games, monetisation model. Write them at the top of the document; every later decision checks against them.
2. **Write 3 to 5 pillars.** Each pillar is a short experience statement a feature can be tested against ("every fight is over in 30 seconds", not "fun combat"). Done when you can reject at least one plausible feature by pointing at a pillar.
3. **Draw the core loop as a chain of verbs.** Act, get feedback, earn a reward, grow, face a harder challenge, act again. Write the moment loop (seconds), the session loop (minutes) and the meta loop (days), and name what the player decides at each step. Every arrow needs feedback the player can see; a step with no decision is a candidate for cutting.
4. **Spec mechanics as rules plus numbers.** For each system: player intent, inputs, rules, states, tunable numbers with starting values and units, feedback, failure cases, interactions with other systems, and open questions. Numbers live in a data table, not in prose and not in code.
5. **Model numbers before tuning in-engine.** Build the curve or economy in a spreadsheet or a short script, run it across a full play-through and across player skill levels, and look at distributions, not averages. Then move the numbers into data files the game reads, and tune from playtest results.
6. **Cut scope against the pillars.** List every feature with its cost and the pillar it serves. Keep the must-haves for the core loop, mark the rest should, could or won't, and cut from the bottom. Done when the must list fits the schedule with slack.
7. **Record decisions.** Keep a short decision log in the GDD (date, decision, reason, what would change it), so later tuning doesn't relitigate settled questions.

## Questions to ask in a review

- What does the player decide here, and is there a dominant choice? Sid Meier's test: a game is a series of interesting decisions; a choice with an obvious best answer is not one.
- What is the player's goal at this moment, and how do they know?
- What does each system add to the core loop? What breaks if it is removed?
- Where does each resource come from, where does it go, and what happens after 20 hours?
- What does a new player see in the first 5 minutes, and what does an expert do at hour 50?
- Which numbers are guesses, and which playtest will test them?

## Gotchas

- **A GDD nobody reads.** A 100-page document goes stale in a month. Start from one page, add a page per system only when the team needs it, and keep it current or delete it.
- **Pillars that can't reject anything** ("fun", "polished", "immersive") are not pillars.
- **Exponential curves without a cap or a reset** (XP, damage, prices) run away; numbers past about a million stop being readable, and late-game balance collapses. Pick the curve family on purpose; see `balancing.md`.
- **Faucets without sinks** cause inflation: currency piles up, prices stop meaning anything, and rewards stop motivating. Map both before setting any price.
- **Pure random drops produce streaks** (ten commons in a row, or two legendaries back to back). Use a shuffle bag or a pity counter where streaks hurt, and seed the RNG so runs reproduce.
- **Balancing on averages.** A 10% drop rate means about 1 player in 3 still has nothing after 10 tries (0.9^10 ≈ 0.35). Look at the unlucky tail.
- **Designing for yourself.** The designer is the most skilled player the game will ever have. Tune difficulty from first-time players in playtests (`game-playtest`), not from your own runs.
- **Hard-coded numbers.** Tuning values in code need a programmer for every change. Put them in data files designers can edit and the game can hot-reload.

## Sources

The procedures here are built on published design work, cited rather than copied; the full list is in each reference: Schell, *The Art of Game Design: A Book of Lenses*; Fullerton, *Game Design Workshop*; Hunicke, LeBlanc and Zubek, "MDA: A Formal Approach to Game Design and Game Research" (2004); Adams and Dormans, *Game Mechanics: Advanced Game Design* (2012); Schreiber and Romero, *Game Balance* (2021); Sid Meier, "Interesting Decisions" (GDC 2012).
