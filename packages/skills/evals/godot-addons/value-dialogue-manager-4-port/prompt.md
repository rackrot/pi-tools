---
name: value-dialogue-manager-4-port
description: Value case. Porting a project from Dialogue Manager 3.x to 4.1 - self-closing response condition placed before the jump, the inline non-awaited mutation, and two renamed members. The bare model answers with 3.x forms or guesses.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

We replaced addons/dialogue_manager 3.10.5 with 4.1.0 (plugin.cfg says version="4.1.0", Godot 4.7) and I'm porting our .dialogue files and the balloon script by hand. Pick the form that is correct for 4.1 in each of these.

Q1. A response that is only offered when the player has 10 gold and jumps to the `shop` cue:
  A. `- Buy a potion [if PlayerState.gold >= 10] => shop`
  B. `- Buy a potion => shop [if PlayerState.gold >= 10 /]`
  C. `- Buy a potion [if PlayerState.gold >= 10 /] => shop`
  D. `- Buy a potion [if PlayerState.gold >= 10] => shop [/if]`

Q2. Mid-line we used to fire a screen shake without waiting for it: `Nathan: Watch out! [do! Fx.shake()] Too late.` The 4.1 inline form that still does not await:
  A. `[$>> Fx.shake()]`
  B. `[$> Fx.shake()]`
  C. `[$>! Fx.shake()]`
  D. `[do! Fx.shake()]` (unchanged)

Q3. The balloon script looks up voice clips with `line.translation_key`. On a 4.1 `DialogueLine` that property is:
  A. `translation_key` (unchanged)
  B. `line_key`
  C. `cue_id`
  D. `static_id`

Q4. Our quest log connects to `DialogueManager.passed_title`. The 4.1 signal is:
  A. `passed_title` (unchanged)
  B. `passed_cue`
  C. `cue_passed`
  D. `title_passed`

End your reply with exactly one line per question in the form `Q1: A`, Q1 to Q4 in order, nothing after them.
