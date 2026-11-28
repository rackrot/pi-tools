---
name: value-review-report-shape
description: Value case. A class review reported in the skill's severity shape (Critical, Improvements, Minor, Done well) with the caller-owned list in a record filed as Critical; the bare model invents its own headings.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

can you review this before I merge it? it's the whole of `src/main/java/billing/Invoice.java` plus the one new method in `InvoiceMailer.java`. I can't attach files from here so it's pasted.

```java
package billing;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public record Invoice(String id, List<BigDecimal> lines, Optional<String> poNumber) {

    public BigDecimal total() {
        BigDecimal sum = BigDecimal.ZERO;
        for (BigDecimal line : lines) {
            sum = sum.add(line);
        }
        return sum;
    }

    public String reference() {
        return id + "/" + poNumber.get();
    }
}
```

```java
// InvoiceMailer.java
void sendWithRetry(Invoice invoice) {
    for (int attempt = 1; attempt <= 3; attempt++) {
        try {
            smtp.send(render(invoice));
            return;
        } catch (MailException e) {
            try {
                Thread.sleep(2000L * attempt);
            } catch (InterruptedException ignored) {
            }
        }
    }
}
```
