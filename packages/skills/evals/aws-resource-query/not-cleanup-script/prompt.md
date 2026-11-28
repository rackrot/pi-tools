---
name: not-cleanup-script
description: "Near miss: writing a script that deletes resources is aws-cli (script and write-command mechanics), not a read-only question about what exists."
tags: [routing, negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Write me a bash script that goes through every region and deletes EBS volumes that have been unattached for more than 90 days. It needs a dry-run flag and has to cope with accounts that have thousands of volumes.
