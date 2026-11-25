# Playtests and telemetry

A playtest is an experiment: the design is a hypothesis and the session collects evidence. Not for automated tests or code QA (`godot-testing`, `unit-testing`), crash triage, or deciding the design (`design.md`).

## Contents

1. Plan
2. Run
3. Analyse and decide
4. Telemetry
5. Privacy and gotchas

## 1. Plan

1. **Questions first.** One to three research questions, each tied to a decision and a threshold ("Do new players find the dash without the prompt? Fewer than half by minute 5: add a forced tutorial beat"). Name the evidence: observed behaviour, a metric or a survey answer.
2. **Test type:** first-time-user (moderated, one player at a time) to learn unaided; focused test on a slice for one mechanic; RITE (fix clear issues after each session, retest the next) for fast fixes; longer or take-home with telemetry and a diary or survey for fun over hours and drop-off; A/B with enough players per arm and one pre-chosen metric; sessions including players with disabilities for accessibility (`ui.md`).
3. **Recruit the target audience** (genre experience, platform, age), never teammates or friends who know the game. Five to eight players per round find most big usability problems; surveys and metrics need far more. Screen without revealing the game; exclude people who work in games or have seen it for first-time-user tests.
4. **Consent checklist:** what is recorded and why; who sees it, where it is stored, when deleted; the player can stop any time and still gets the incentive; plain-language confidentiality for unreleased content; guardian consent for minors; separate opt-in for clips outside the team.
5. **Build and kit:** stable build with a known build id, telemetry on, debug overlays off, saves reset; tasks phrased as goals ("Try to reach the lighthouse", not "Press Shift to dash"); observer sheet; survey; recording. Pilot with a colleague first.
6. **Keep, change or kill criteria written before the test**, with numbers, and read out in the readout: comprehension (most players state the goal and core verb in their own words); engagement (they keep playing when told they may stop, ask to play again, or use the core verb when optional); difficulty (deaths and retries per checkpoint inside the target band from `design.md`, nobody quits in frustration at the same spot); fit to pillars; kill signal (the core loop fails the comprehension or engagement bar for two rounds after fixes: change the loop, not the polish).

## 2. Run

- Brief that the game is tested, not them. Then stay quiet; answer questions with questions ("What would you try?"). Agree a stuck-time limit, give the smallest hint after it and log every intervention.
- Neutral prompts only: "What are you thinking?", "What do you expect that to do?". Leading questions plant the answer ("Was the jump too floaty?"): ask "Tell me about the jumping."
- **Concurrent think-aloud changes how people play, especially in fast action.** Use retrospective think-aloud over the recording, or prompt only at natural pauses.
- Observer sheet row: time, player, where, what happened (behaviour, not interpretation), quote, code, severity. Codes: C confusion, F frustration, D delight, B bug, X exploit, Q quit, H facilitator helped.
- Debrief open first, specific next, rating last: describe the game to a friend (comprehension); most frustrating moment; "At <timestamp> you <behaviour>, what was going on?"; what you expected next; if you could change one thing (a symptom, not a fix).
- Survey: under about 5 minutes, single-concept items on one consistent 5- or 7-point agreement scale, no double-barrelled items, one or two open questions. Prefer the Player Experience Inventory (PXI; Vanden Abeele et al., 2020). The Game Experience Questionnaire's factor structure is poorly supported (Law, Bruhlmann and Mekler, CHI PLAY 2018), so do not report its subscale scores as settled. Compare across rounds of the same game, not against other games.
- "Is it fun?" gets polite yeses: measure voluntary play time, replays and optional use.

## 3. Analyse and decide

- Synthesise the same day: merge the sheets into one row per root cause with players affected (count of total), worst severity, evidence (timestamps, clips, metric) and the research question. Keep observed behaviour apart from opinions.
- Severity: 4 blocker (cannot progress or quits), 3 major (big delay or frustration, or misses a core mechanic), 2 minor (short confusion, recovers alone), 1 cosmetic. `priority = players_affected x severity`; ties break toward the core loop and the first 10 minutes. Propose a fix with an effect you can check next round, and list issues you leave alone with the reason.
- **Small samples:** with fewer than about 20 respondents report counts per answer, not means; "60% liked it" from five players is three people. Small rounds find problems; they do not measure how frequent they are.
- Change one thing between rounds, except in RITE, where you fix only clear issues and log them. Retest fixes with fresh players.
- Readout: answers to each question with evidence and whether the threshold was met; keep/change/kill verdict against the pre-set criteria; top 5 issues; what worked (protect it); surprises; next round.

## 4. Telemetry

Telemetry shows what and where; observation shows why. For each research question write the metric, then the events it needs, and log no event no question uses (quit points: `session_end` and `checkpoint_reached`; difficulty: `death`, `level_start`, `level_complete`; shop use: `purchase`, `currency_changed`).

- One flat JSON-lines record per event. Fields: `event` (fixed list in code), `ts` (UTC ISO 8601 with milliseconds), `t_session` (seconds since start, survives clock changes), `session_id` (UUID per session), `player_id` (random UUID per install, never an email, name or platform account id), `build_id` (version plus commit, required to compare rounds), `level`, `checkpoint`, `pos` (for heatmaps), `data`.
- Core events: `session_start` and `session_end` (reason: quit, crash, completed, timeout), `level_start`, `level_complete`, `level_fail`, `checkpoint_reached`, `death` (cause, position), `retry`, `tutorial_step`, `ability_used` (first use matters most), `item_acquired`, `purchase`, `currency_changed` (source or sink, amount, balance after), `settings_changed` (accessibility options are worth tracking).
- Metrics: completion rate and the drop between consecutive checkpoints; deaths per checkpoint with the cause mix; time per level as median and p90; time to first use of each core mechanic; quit clusters; day-1 and day-7 return for betas. Funnel: count players reaching each step; the largest drop is the first thing to watch on recordings. Stuck detection: a small radius with no progress events for more than about 60 s.
- Logger: write locally, flush on level change and quit, upload only with consent in batches and never block gameplay on the network. One data file holds the event list and field definitions the logger validates against.
- Analysis: JSON lines load straight into DuckDB.

```sql
SELECT checkpoint, count(*) AS deaths, count(DISTINCT player_id) AS players
FROM read_json_auto('telemetry/*.jsonl')
WHERE event = 'death' AND build_id = '0.4.2+a1b2c3d' GROUP BY checkpoint ORDER BY checkpoint;
```

  Always filter by `build_id`, report player counts beside event counts, and read medians and p90, not means.
- Pitfalls: local timestamps (use UTC plus session time); a death logged by both player and enemy code (log each event from one owner); **survivorship** (early quitters vanish from late-level metrics, so read every metric beside the funnel); a high death count may be a satisfying challenge or a broken jump (watch the recording first); debug builds with cheats or skips pollute data (tag or exclude dev sessions).

## 5. Privacy and gotchas

- Player data is personal data. Collect the minimum the questions need: no names, emails, platform account ids, IP addresses or free-text chat. Random install and session ids, tell players what is collected, get consent where law or platform requires it, offer an off switch, set a retention period and delete raw files after it. Check the GDPR and children's privacy laws if young players are in the audience, and each platform's data policy, before telemetry leaves the studio.
- Telemetry without questions produces dashboards nobody reads. Testing with the team or friends finds almost nothing.
