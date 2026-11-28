---
name: route-python2-django-phases
description: "Routing, explicit. A request for a phased way to get a Python 2.7 / Django 1.11 product onto a supported stack routes to modernize without the words modernize, legacy or migration plan."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our main product is still on Python 2.7 and Django 1.11, running on Ubuntu 16.04 boxes with Postgres 9.6 and Celery 3. management finally gave us a quarter to get all of it onto supported versions. about 180k lines, test coverage is patchy, and billing can't break while we do this. I don't have the repo here, just work from that. how do we cut this into phases, and what has to be true before each one is called done?
