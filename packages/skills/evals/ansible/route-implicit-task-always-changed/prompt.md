---
name: route-implicit-task-always-changed
description: "Routing, implicit. A task that shows as changed on every run, with no tool named, routes to ansible."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our nightly config run over the web fleet ends with `changed=1` on every single host, every night, and the on-call keeps getting pinged about "drift" that isn't there. it's always this one step in roles/base/tasks/main.yml:

```yaml
- name: Apply kernel tuning
  shell: sysctl -p /etc/sysctl.d/99-tuning.conf
  become: yes
```

nothing on the boxes is actually different between runs. how do I rewrite it so the recap is quiet unless something really changed?
