---
name: route-implicit-reach-nas-while-travelling
description: "Routing, implicit. Wanting to reach a NAS and Home Assistant from outside by forwarding ports on the home router routes to homelab-network without the words VPN, WireGuard, VLAN or homelab."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I travel for work two weeks a month and want to get at my NAS and Home Assistant from the hotel. my plan was to forward 5001 and 8123 on the router at home to those two boxes and bookmark my home IP. a friend says that's asking for trouble but didn't say what to do instead. the router is whatever my provider shipped, and I have a spare raspberry pi 4 doing nothing. what should I do?
