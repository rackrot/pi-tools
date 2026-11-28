---
name: route-negative-mockito-strict-stubs
description: Near-miss negative. A Mockito strict-stubs failure in a *Test.java file belongs to java-testing, not java.
tags: [trigger, negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

`src/test/java/billing/InvoiceServiceTest.java` started failing after I moved the shared stubbing into `@BeforeEach`:

```
org.mockito.exceptions.misusing.UnnecessaryStubbingException:
Unnecessary stubbings detected in test class: InvoiceServiceTest
Clean & maintainable test code requires zero unnecessary code.
Following stubbings are unnecessary (click to navigate to relevant line of code):
  1. -> at billing.InvoiceServiceTest.setUp(InvoiceServiceTest.java:31)
```

Line 31 is `when(rateClient.currentRate("EUR")).thenReturn(RATE);` and only three of the five tests in the class hit that call. The class uses `@ExtendWith(MockitoExtension.class)`. What's the right way to fix this without turning the check off for the whole class?
