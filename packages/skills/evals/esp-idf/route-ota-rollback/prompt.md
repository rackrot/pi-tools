---
name: route-ota-rollback
description: Routing. Adding OTA with automatic rollback to ESP32-S3 firmware routes to esp-idf.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

We ship an ESP32-S3 sensor hub with 8 MB flash and right now every update means someone plugs in a USB cable. I want to add over-the-air updates so that a bad release rolls itself back instead of bricking units in the field. What has to change in the partition table and in the app?
