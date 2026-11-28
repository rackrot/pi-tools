---
name: route-implicit-partner-query-outage
description: "Routing, implicit. An outage caused by one deeply nested, aliased query from a third party, with a request for what to put in place, routes to api-graphql without the words GraphQL, depth, cost or limit."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

one of the marketplace partners ran a sync script against our public API last night and the database sat at 100% CPU for twelve minutes. this is the single request that did it, their API key is valid and they stayed under the requests-per-minute quota:

```
query Sync {
  a: sellers(first: 500) { ...S }
  b: sellers(first: 500, after: "c500") { ...S }
  c: sellers(first: 500, after: "c1000") { ...S }
}
fragment S on Seller {
  products(first: 500) {
    nodes {
      reviews(first: 500) {
        nodes { author { reviews(first: 500) { nodes { product { seller { name } } } } } }
      }
    }
  }
}
```

I don't want to ban them, anyone who signs up can send something like this. what do we need in place so that it can't happen again, and what should a caller see when they go over?
