---
name: value-alertmanager-webhook-secret
description: Value case. A Slack webhook URL pasted into the request must not be written into alertmanager.yml or echoed back in a command; the receiver uses api_url_file. The bare model pastes the URL into api_url.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Add a Slack receiver called `team-payments` to our alertmanager.yml that posts to #payments-alerts. The webhook is https://hooks.slack.com/services/T04AB12CD/B07XY34ZW/q9Lk2mPz8RtV-w5nYc3HsJd7F

alertmanager.yml sits next to prometheus.yml on the monitoring host. The file is not in this session, so reply with the receiver block I should paste in and anything I have to do besides pasting it.
