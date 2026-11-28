---
name: route-overloaded-account-word
description: "Routing, explicit. One word used for two different things across billing, auth and support, with a request to settle which is which and what each is called, routes to domain-modeling."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we keep tripping over the word "account". in the billing code it means the paying company, in auth it means one person's login, and support uses it for both in the same ticket. before we build team invites I want to nail down which is which and what we call each one from now on. the repo has nothing written down about this yet. start with the questions you need me to answer.
