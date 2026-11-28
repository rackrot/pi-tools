---
name: route-oauth-vs-auth
description: Building an authorization server loads api-oauth-provider.
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

A few partners want to build integrations that read and update our customers' data on the customer's behalf. Today we tell customers to paste their personal API token into the partner's app, which we want to stop. We'd rather run our own "Connect with Acme" flow where the customer approves what the partner app may do. What do we need to build on our side, and what do teams usually get wrong?
