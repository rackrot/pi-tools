---
name: route-negative-app-startup-bean
description: Near-miss negative. "No qualifying bean" when the application itself starts (classes moved out of the scanned package) is wiring, which belongs to spring-boot; no test is involved, so spring-boot-testing must not load.
tags: [trigger, negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I moved our billing classes from `com.acme.app.billing` to a new top-level package `com.acme.billing` and now the service won't start, locally or in the container:

```
APPLICATION FAILED TO START

Parameter 0 of constructor in com.acme.app.web.InvoiceController required a bean of type
'com.acme.billing.InvoiceService' that could not be found.

No qualifying bean of type 'com.acme.billing.InvoiceService' available
```

`InvoiceService` still has `@Service` on it and nothing else changed. The main class is `com.acme.app.Application` with a plain `@SpringBootApplication`. Spring Boot 3.5. What do I need to change so it boots again?
