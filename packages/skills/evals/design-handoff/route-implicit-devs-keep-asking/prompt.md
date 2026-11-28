---
name: route-implicit-devs-keep-asking
description: "Implicit trigger: developers keep asking the designer for missing details; the user wants one document that answers them up front, without naming a spec or a handoff."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

every sprint the frontend devs end up pinging our designer halfway through: what colour is the button on hover, what happens to the sidebar on a tablet, how long can a coupon code get, what does the cart look like with nothing in it. the checkout redesign is done now and I'd like to get ahead of that for once. here is what the design has, turn it into something that stops those questions:

- two columns on desktop: form on the left (560px), order summary on the right (360px), 32px gutter
- form steps: Contact, Shipping, Payment, each one collapses to a one-line summary when completed
- primary button "Pay now", #0B5FFF, 48px tall, full width of the form column
- coupon field under the order summary with an "Apply" button next to it
- order summary lists line items with thumbnail, name, quantity stepper and price
