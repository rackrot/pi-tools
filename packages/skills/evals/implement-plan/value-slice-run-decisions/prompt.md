---
name: value-slice-run-decisions
description: Value case. Six decisions met while running an approved multi-slice plan, asked as fixed-word answers. The bare model runs disjoint slices one by one, skips the per-slice review, stops after two failed attempts and leaves the plan file untouched.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

the plan below is approved, implement it. it lives at docs/plans/geo-search.md in the real repo; this sandbox doesn't have the repo and you can't write here, so for now I only want to know how you will run it once you're in there. don't check in with me between slices.

```
# Geo search

## Slices
1. `src/geo/distance.ts` (new): haversine distance. Check: `npm test -- distance`
2. `src/geo/bbox.ts` (new): bounding box for a radius. Check: `npm test -- bbox`
3. `src/config/geo.ts` (new): radius limits and defaults. Check: `npm test -- config`
4. `src/search/nearby.ts`: nearby search using 1 to 3. Depends on 1, 2, 3. Check: `npm test -- nearby`
5. `src/search/geocode.ts`: address lookup through the geocoding API. Depends on 4. Check: `npm run test:geocode-live`
```

that is the whole file. answer these:

- Q1: slices 1, 2 and 3 touch separate new files. do you run them ONE-BY-ONE, or in PARALLEL?
- Q2: the plan says nothing about commits and neither did I. once a slice passes, do you COMMIT it, LEAVE it uncommitted, or ASK me?
- Q3: slice 3's check passes and its diff is 15 lines. do you go straight on to the NEXT slice, or get the diff through a REVIEW first?
- Q4: slice 4's check fails. you tried two clearly different fixes, both failed, and you have a third, different idea. TRY it, or STOP and report to me?
- Q5: slice 5's check, `npm run test:geocode-live`, makes about 2000 billable calls to the geocoding API, roughly 10 dollars. RUN it, or STOP and ask me?
- Q6: all five slices are finished. compared with the text above, is docs/plans/geo-search.md UNCHANGED, or did you EDIT it along the way?

explain as much as you like, but end your reply with exactly one line per question in the form `Q1: PARALLEL`, Q1 to Q6 in order, using only the answer words given above.
