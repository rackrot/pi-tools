---
name: route-negative-apollo-client-cache
description: "Near miss. Updating the Apollo Client cache after a mutation in a React app is client code against someone else's schema, not public schema design; api-graphql must stay quiet."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

in our React app the todo list doesn't show a new item until I reload the page. I add it with `useMutation(ADD_TODO)` and the list comes from `useQuery(GET_TODOS)`. right now I pass `refetchQueries: [GET_TODOS]` and it works but it fires a second request every time. how do I write the new todo straight into the Apollo Client cache instead? show me the `update` function.
