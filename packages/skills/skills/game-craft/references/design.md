# Design, balance and economy

Output is a document, spec, table of numbers or simulation, never engine code. Numbers here are starting points to test unless a derivation is shown.

## Contents

1. Artifacts and workflow
2. Balance procedure
3. Curves, stats and damage
4. Difficulty and encounter scaling
5. Economy
6. Loot and streaks
7. Gotchas

## 1. Artifacts and workflow

Ask which artifact the user needs before writing: one-page pitch, living GDD, mechanic spec, balance model, economy map, or scope cut list.

- **Constraints first, at the top of the document:** platform, session length, team size and time, audience, comparables, monetisation. Every later decision checks against them.
- **Pillars:** 3 to 5 experience statements ("every fight is over in 30 seconds", not "fun combat"). Done when one pillar rejects a plausible feature.
- **Core loop:** write the moment loop (seconds), session loop (minutes) and meta loop (days), and name the decision at each step. A step with no decision is a cut candidate. Moment-loop feedback shows within about a second. The meta loop returns new verbs, not only bigger numbers.
- **Mechanic spec:** numbered, testable rules with units ("Dash moves 4 m over 0.15 s and grants invulnerability for its duration"), a tunables table (name, start, unit, range, effect of raising it), failure and edge cases, interactions with other systems, and open questions each naming the playtest that answers it. Mark guesses `(guess)`.
- **Scope cuts:** list each feature with its pillar and cost in days; priority must, should, could, won't. Cut from the bottom until the must list fits with about a quarter of the time spare for polish and bugs. A feature serving no pillar is a "won't" unless the platform requires it.
- **Decision log** in the GDD: date, decision, why, revisit-if.
- Start the GDD from one page and add a page per system only when someone needs it. One-pager fields: one line (`<genre> where the player <verb> to <goal>, unlike <comparable> because <hook>`), player fantasy, pillars, core loop, session, audience and platform, comparables (what to take or avoid), scope, biggest risk (the question a prototype must answer first).

## 2. Balance procedure

1. State the target in player terms ("a first-time player reaches level 10 in about 2 hours", "a boss fight lasts 60 to 90 s").
2. Write the formula with every constant named.
3. Simulate the whole game across weak, average and strong players. Judge the worst 10% of runs, not the mean.
4. Move the numbers into one data table per system.
5. Log the same quantities in playtests (time to level, fight length, deaths per encounter) and compare. Change one knob at a time and log it.

Done when model, data and playtest agree within the tolerance set in step 1. Use a script, not a spreadsheet, once there is randomness or more than two interacting curves:

```python
def simulate_run(rng, p):          # returns minutes to reach level 10
    level, xp, minutes = 1, 0, 0
    while level < 10:
        minutes += 1
        xp += rng.gauss(p["xp_per_min"] * level ** 0.5, 5)
        while xp >= p["base"] * level ** 2: xp -= p["base"] * level ** 2; level += 1
    return minutes
# rng = random.Random(1234); sort 10_000 runs; print median, p10, p90
```

## 3. Curves, stats and damage

| Family | Form | Use for |
|---|---|---|
| Polynomial | `a * n^k`, k about 1.5 to 2.5 | XP and most cost curves: fast early, readable late |
| Exponential | `a * r^n`, r about 1.1 to 1.5 | idle games, prestige resets, wave HP against matching income. XP growth 1.2 to 1.5 needs a level cap |
| Diminishing | `x / (x + K)` or `a * log(1 + n)` | soft caps, armour, upgrade returns |
| Logistic | `L / (1 + e^(-k(n - n0)))` | skill-gated unlock pacing |

- Pair curves that must stay in balance (enemy HP against player DPS, prices against income) and plot them together. Cap or reset any exponential.
- Check time-to-level, not XP-to-level: divide by expected XP per minute at that stage. Early levels take minutes each. Grant new verbs at milestones, not only bigger numbers.
- Damage: subtractive `max(1, attack - defence)` suits small numbers and trivialises hits at high defence. Ratio `mitigation = defence / (defence + K)` with K about 100 scales smoothly (half damage at defence = K). Then variance about +/-10%, crit about 1.5x to 2x, type multiplier 0.5 / 1 / 2. Pick one family and stay with it.
- Stat modifier order and stacking rules: `architecture.md`.
- Build a time-to-kill table (rows attacker builds, columns targets). Outliers are the balance bugs.
- Put every option's cost and benefit on one scale and plot them: options far above the line are dominant, far below are traps. With many options, script a search for the best build; a wide winner means a dominant strategy.

## 4. Difficulty and encounter scaling

- Target a band. Most first-time players beat early encounters on the first or second try; take retry and death counts from playtests, not designer runs (the designer is the most skilled player the game will have).
- Alternate pressure (hard, breather, spike), never a monotonic ramp. Telegraph a spike one encounter ahead.
- Wave scaling: geometric HP growth about 1.1 to 1.2 per wave against roughly linear income forces upgrades. HP growing slower than player DPS trivialises the game; faster, it walls.
- Can-this-hold check for defence games: `damage_dealt = dps * (1 - armour) * time_in_range`, summed over covering towers, must reach each enemy's HP, allowing for how many enemies share the range.
- Offer difficulty options and assists rather than one tuned curve (`ui.md`).

## 5. Economy

1. List every resource and mark it hard currency, soft currency or consumable.
2. Map faucets, sinks, converters (crafting, trading) and pools (wallet, stash). A plain table works; Adams and Dormans' internal-economy diagrams are a good notation.
3. Estimate rates per hour of play at early, mid and late stage for casual, average and grinder players.
4. Simulate net balance over time. Each soft-currency pool should rise and fall around a target, never climb forever.
5. Price from income: `price = income_per_hour_at_stage * hours_the_item_should_take`. Recheck when income changes. Keep the player almost able to afford the next meaningful thing.

- Every faucet needs a sink players want to use, ideally one that buys new options, not one that recovers losses. Recurring sinks (consumables, upgrade tiers) keep late currency meaningful; one-off sinks run out.
- Close every buy-sell loop: selling returns 25% to 70% of the price. A craft-sell loop must not create value. Leaks and failures cost something, so failure is never the optimal play. Cap interest or banking mechanics, which snowball.
- Telemetry to tune from: currency held over time, time between purchases, items never bought (`playtest.md`).
- Real-money currency: keep soft and hard separate, show real-money prices where the platform requires it, and check platform and regional rules on randomised paid items before adding them. Tell players about pity or guarantee rules where trust matters, and follow disclosure rules.

## 6. Loot and streaks

- Drop tables are lists of (entry, relative weight); weights need not sum to 100. Keep "nothing" or common as the bulk of the weight. Nest tables (rarity picks a sub-table, which picks the item), scale rare weights by depth instead of rewriting tables, guarantee key drops (quest items, first-clear rewards) outside the random table, and give every entry an id in a data file.
- Probability of at least one rare in n tries is `1 - (1 - p)^n`. At p = 5%, about 45 tries give 90% (`ln 0.1 / ln 0.95`). A 10% drop leaves about 1 player in 3 with nothing after 10 tries (0.9^10 = 0.35). Show that number in the review.
- Where streaks hurt, use one of: a **shuffle bag** (fill in proportion to weights, shuffle, draw without replacement, refill when empty; exact rate per bag), a **pity counter** (count rolls since the last rare, raise or force the chance past a threshold, reset on a rare), or a **pseudo-random distribution** (start low, raise by a constant per miss, reset on a hit). Keep all of them on a seeded RNG so sequences reproduce.

## 7. Gotchas

- A GDD nobody reads goes stale within a month. Keep it current or delete it.
- Pillars like "fun", "polished" or "immersive" reject nothing.
- Tuning values hard-coded in code need a programmer per change. Keep them in data the game can hot-reload.
- Check the unlucky tail (p90 tries for each key drop) as well as the average.
