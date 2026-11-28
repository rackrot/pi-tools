---
name: route-draft-per-file-audit-script
description: "Positive trigger: asks for an orchestration script with a runtime-sized fan-out and a refuter per finding, without naming SubagentWorkflow. Phrased as a drafting request because the eval harness has no subagent tool and the skill declines run requests without it."
tags: [trigger]
runs: 1
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Draft the orchestration script for a security audit, I'll save it and kick it off tonight. It should take a root directory as a parameter, find the route handler files under it (I don't know how many, 60 to 100 in our API repo), give each file to its own subagent, and then have a second agent try to knock down every finding so the result only holds the ones that survive. Just show me the script, don't run anything.
