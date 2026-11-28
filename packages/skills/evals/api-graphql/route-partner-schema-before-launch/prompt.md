---
name: route-partner-schema-before-launch
description: "Routing, explicit. A schema about to be opened to outside integrators, pasted inline with a request for what to change before launch, routes to api-graphql."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we open this to outside integrators next month, until now only our own web app used it. what do I have to change before strangers start building on it? after launch I can't rename things freely any more.

```graphql
type Query {
  getOrders(offset: Int, limit: Int): [order]
  order_by_id(id: Int!): order
}

type order {
  id: Int!
  customerId: Int!
  mysql_shard: Int
  status: String
  active: Boolean
  items: [OrderItem]
}

type OrderItem {
  sku: String
  qty: Int
}

type Mutation {
  updateOrder(order: OrderData): order
}

input OrderData {
  id: Int
  status: String
  items: [ItemData]
}

input ItemData {
  sku: String
  qty: Int
}
```
