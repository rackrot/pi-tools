---
name: value-churn-plan-essentials
description: Value case. A plan-only request for tabular churn prediction gets ML.NET plus the ML.NET branch essentials (fixed seed, held-out evaluation, AUC and F1, PredictionEnginePool); the bare model picks ML.NET but serves it from a singleton and skips the seed.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Product wants GPT to score customers for churn from our customers table (tenure, plan, monthly spend, support tickets): a nightly batch plus a live score served from our ASP.NET Core API on .NET 8. No code yet and no repo to look at on this machine. Give me the approach you'd take and the short list of things the implementation has to get right.
