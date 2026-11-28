---
name: route-implicit-customer-security-questionnaire
description: "Routing, implicit. A customer's security team asks for a diagram of how data moves between components and what could go wrong at each hop; the user has nothing and asks for it to be produced. Routes to threat-model without naming the method."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

a bank we are trying to sign sent their vendor questionnaire and two items have us stuck. they want (a) a diagram of how data moves between our components, with the points marked where it passes from something we control to something we don't, and (b) for each of those points what could go wrong there and what we have in place against it. we have never written anything like this down. the product is a document-signing service: a react front end, a node API, a postgres database, a pdf rendering worker fed from a queue, and we call a third-party SMS provider for the signing codes. can you put both items together for us? say what you need from me first.
