---
name: route-negative-graphql-public-schema
description: "Near miss: pagination, error reporting and retiring a field on a public GraphQL API belong to api-graphql, which api-rest-design names as out of scope."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we're opening our GraphQL API to third-party developers next quarter. before that I want a review of how we page through lists (right now `orders(page: 2, perPage: 50)`), how mutations report validation errors to the caller, and how we get rid of the `legacyPrice` field on `Product` without breaking the apps already querying it.
