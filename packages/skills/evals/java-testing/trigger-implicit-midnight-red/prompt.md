---
name: trigger-implicit-midnight-red
description: Implicit trigger. A Java test that reads the wall clock and goes red on the nightly build routes to java-testing without naming JUnit, flakiness or a clock.
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

CouponServiceTest.acceptsCouponUntilExpiryDay went red on the nightly build again and was green when I reran it this morning. third time this month. the relevant bit:

```java
@Test
void acceptsCouponUntilExpiryDay() {
    Coupon coupon = new Coupon("SPRING10", LocalDate.now().plusDays(1));
    assertTrue(service.isValid(coupon));
}
```

and CouponService.isValid is just `return !LocalDate.now(ZoneId.of("Europe/Berlin")).isAfter(coupon.expiresOn());`. the nightly runs at 23:30 UTC. what do I change so this stops happening?
