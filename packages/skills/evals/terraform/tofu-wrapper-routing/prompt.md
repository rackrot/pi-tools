---
name: tofu-wrapper-routing
description: Planning a new VM through a mise tofu task with a saved plan routes to terraform:terraform. The task definition is pasted, so the prompt does not depend on workspace files.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm adding a VM for Jellyfin to the lab root of our homelab repo (infra/roots/lab, proxmox provider). nobody calls tofu directly there, it goes through this mise task:

```toml
[tasks.tofu]
description = "run tofu in one root with decrypted secrets"
usage = 'arg "<root>"' 
run = "cd infra/roots/{{arg(name='root')}} && sops exec-env secrets.enc.env 'tofu {{arg(name=\"args\", var=true)}}'"
```

I'll write the resource block myself. give me the exact `mise run tofu lab ...` commands so I end up with a saved plan file I can look over first, and tell me what you'd run after I say go. nothing gets applied before that.
