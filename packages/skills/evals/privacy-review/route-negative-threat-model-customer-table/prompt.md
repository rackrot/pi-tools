---
name: route-negative-threat-model-customer-table
description: "Near miss: an attacker-focused STRIDE model of a service that stores customer emails and addresses is the threat-model skill's job, not a personal-data handling review."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our customer service stores emails and home addresses, so security wants a threat model of it before the pen test. do a STRIDE pass on the design below: trust boundaries, a data-flow diagram, and an attack tree for someone trying to steal the customer table.

- public React app talks to an Express API behind an nginx reverse proxy
- API authenticates with a session cookie, admin panel is the same API under /admin
- Postgres holds the customers table, nightly pg_dump goes to an S3 bucket
- a support tool run by a contractor reads customers through a read-only API key
