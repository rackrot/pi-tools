---
name: route-implicit-bad-json-accepted
description: "Routing, implicit. A symptom report (bad request bodies are accepted, crashes come back as HTML) in a net10.0 project with MapPost lambdas routes to aspnet-core without the words ASP.NET, minimal API, validation, ProblemDetails or middleware."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our orders service (net10.0, a handful of app.MapPost / app.MapGet lambdas in Program.cs) happily saves an order when the JSON body has no customerId and a quantity of -3, and when something throws the mobile team gets an HTML error page instead of JSON they can parse. what do I need to change so bad input is rejected with a 400 that names the fields, and crashes come back as a JSON error?
