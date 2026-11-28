---
name: route-negative-call-order-footgun
description: "Near miss: closing one recurring misuse (send before connect) so it cannot be written is mistake-proof's job, which the codebase-design description excludes by name."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

third incident this quarter from the same thing: someone calls `client.send(msg)` on our queue client before `await client.connect()` has finished, and the message is silently dropped. The README already says to connect first and nobody reads it.

```ts
class QueueClient {
  constructor(private url: string) {}
  async connect(): Promise<void> { /* opens the socket */ }
  send(msg: Message): void { /* no-op when the socket is not open */ }
}
```

change the types so that this mistake can no longer be written, and tell me what is left that the compiler still cannot catch.
