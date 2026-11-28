---
name: route-wall-off-smart-devices
description: "Routing, direct. A flat home network with cameras and smart plugs next to the NAS, and a worry about losing access to the switch, routes to homelab-network without naming the skill."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

everything in my house sits on one 192.168.1.0/24: laptops, the synology, a proxmox box, plus about 20 cheap smart plugs and four wifi cameras I don't trust at all. gear is an OPNsense mini pc as the router, a TP-Link managed switch and two Omada access points. I want the plugs and cameras walled off from the NAS and the laptops. last time I played with the switch settings I locked myself out and had to factory reset it, so I'd like to not repeat that. where do I start and in what order do I do things?
