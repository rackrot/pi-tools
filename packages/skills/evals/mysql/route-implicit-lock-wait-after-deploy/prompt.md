---
name: route-implicit-lock-wait-after-deploy
description: "Routing, implicit. A lock wait timeout on an InnoDB table after a batch job was added routes to mysql without the words MySQL, MariaDB, deadlock or slow query."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

since last night's deploy checkout fails a few times an hour with `ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction`. the only db-related thing in that deploy is a new job that runs every 10 minutes and does one big `UPDATE inventory SET reserved = 0 WHERE warehouse_id = ? AND reserved_until < NOW()`. db is on RDS, tables are InnoDB, nothing else changed. how do I see who is holding the lock when it happens, and what should I change so checkout stops failing?
