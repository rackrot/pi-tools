---
name: route-implicit-link-opens-in-browser
description: "Routing, implicit. Firing a URL at an installed app from the laptop to see which screen opens is a deep-link test with am start; the prompt names neither adb, deep links nor intents."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

QA says that tapping the order link from our confirmation email on a Pixel opens Chrome instead of the shop app (com.example.shop, debug build is on the phone on my desk, plugged in). I don't want to keep mailing myself links. How do I throw https://shop.example.com/orders/1042?ref=mail&utm=1 at the app from my laptop and see which screen it lands on?
