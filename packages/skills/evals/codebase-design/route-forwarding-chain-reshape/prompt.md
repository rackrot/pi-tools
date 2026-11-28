---
name: route-forwarding-chain-reshape
description: "Routing, explicit. A package of thin classes that forward to each other, with a request for how to decide what to merge and what the public surface should be, routes to codebase-design without the words deep, seam, interface or architecture."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our notifications package is 11 files. `NotificationManager.notify()` calls `NotificationDispatcher.dispatch()`, which calls `ChannelRouter.route()`, which calls `EmailSender.send()` or `SmsSender.send()`, which call `TemplateRenderer.render()` and `DeliveryLogger.log()`. Each class is 20 to 40 lines and mostly passes its arguments on to the next one. Callers elsewhere in the app import five of these classes directly, and to follow one email going out you have to open seven files.

I want to reshape this so the rest of the app has one small thing to call and everything else is hidden behind it. How do I decide which of these classes to merge, which to keep, and what the callers should see? Give me the reasoning, not just a new file list.
