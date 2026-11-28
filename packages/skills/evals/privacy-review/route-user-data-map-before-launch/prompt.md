---
name: route-user-data-map-before-launch
description: "Routing. A request, ahead of opening signups in Germany, to map every place a user's email, phone and IP end up and how long each copy lives routes to privacy-review."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we open signups in Germany next month and the compliance person wants a map of every place a user's email, phone number and IP address end up in this service and how long each copy lives. the signup handler is below, the rest of the service follows the same pattern. tell me what the map looks like for this handler and what is wrong with it.

```ts
// src/routes/signup.ts
export async function signup(req: Request) {
  const { email, phone, name } = await req.json();
  const user = await db.users.insert({ email, phone, name, signupIp: req.ip });
  logger.info(`new signup ${email} from ${req.ip}`);
  await redis.set(`welcome:${email}`, JSON.stringify({ name, phone }));
  await segment.track({ userId: user.id, event: "signup", properties: { email, phone } });
  await sendgrid.send({ to: email, templateId: "welcome", dynamicTemplateData: { name } });
  return redirect(`/welcome?email=${encodeURIComponent(email)}`);
}
```
