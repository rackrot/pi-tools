---
name: route-review-playbook-before-prod
description: "Routing, explicit. A pasted playbook to be reviewed before it runs against production hosts routes to ansible."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

a contractor left us this and I'm supposed to run it against the prod load balancers tomorrow morning. can you look it over and tell me what to fix before I do, and how I should run it so I don't take both of them down at once?

```yaml
- hosts: loadbalancers
  become: yes
  tasks:
    - name: install haproxy
      apt: name=haproxy state=latest
    - name: config
      template: src=haproxy.cfg.j2 dest=/etc/haproxy/haproxy.cfg
    - name: set stats password
      shell: echo "{{ stats_password }}" | /usr/local/bin/set-stats-pw
    - name: restart
      service: name=haproxy state=restarted
```
