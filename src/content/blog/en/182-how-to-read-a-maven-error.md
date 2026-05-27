---
title: "Debug Java Failures by Evidence, Not Random Edits"
description: "A systematic approach to tracing Java exceptions from logs to root cause using a timezone-specific invoice import failure."
pubDate: 2026-10-08T08:48:00.000Z
translationKey: 182-how-to-read-a-maven-error
seriesOrder: 41
locale: en
tags: ["maven-debugging","learning-series"]
draft: false
---

## The Hierarchy of Failures

Before diving into logs, you must distinguish where the failure occurs. A mistake in this classification leads to wasted hours searching the wrong place.

*   **Compile-time Errors:** These occur during the `mvn compile` phase. The Java compiler (javac) cannot translate source code to bytecode. These are structural (syntax, missing imports, type mismatches). They prevent the application from ever starting.
*   **Runtime Errors:** These occur while the JVM is executing the bytecode. They manifest as `Exceptions` or `Errors`. The code is syntactically correct, but the logic encounters an impossible state (e.g., `NullPointerException`, `ArrayIndexOutOfBoundsException`).
*   **Test Failures:** These are logical discrepancies. The code runs without crashing, but an assertion fails (e.g., `assertEquals(expected, actual)`). The system is 'working' from a JVM perspective, but 'wrong' from a business perspective.

## Anatomy of a Java Stack Trace

When a runtime failure occurs, the JVM produces a stack trace. Reading it linearly from top to bottom is often misleading because framework wrappers (Spring, Hibernate, Tomcat) bury the actual cause.

### The "Caused By" Chain
Modern Java frameworks wrap exceptions. You will see a `ServletException` caused by a `RuntimeException`, which is caused by a `DataAccessException`, which is finally caused by a `SQLException`.

**The Golden Rule:** Scroll to the *last* `Caused by` section. This is usually the root cause. Once you find the root exception, look for the first line that references your own package (e.g., `com.myapp.service`). This is the exact line of code that triggered the failure.

## Worked Scenario: The Timezone Invoice Glitch

Use a hypothetical invoice importer whose contract requires an unambiguous timestamp. The input 2023-10-29 02:30 in Europe/Brussels has two valid offsets under the relevant timezone rules. Do not invent a parse failure: LocalDateTime has no zone, and atZone normally chooses an overlap offset rather than throwing. A real failure requires evidence from the application’s own validation or conversion policy.

The following minimal reproducer makes that policy explicit. It accepts a local timestamp only when the zone has exactly one valid offset, rejecting both gaps and overlaps:

```java
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class TimezoneReproducer {
    static Instant requireUnambiguous(String input, ZoneId zone) {
        LocalDateTime local = LocalDateTime.parse(input,
            DateTimeFormatter.ofPattern("uuuu-MM-dd HH:mm"));
        List<ZoneOffset> offsets = zone.getRules().getValidOffsets(local);
        if (offsets.size() != 1) {
            throw new IllegalArgumentException("Explicit offset required");
        }
        return local.toInstant(offsets.get(0));
    }
    public static void main(String[] args) {
        ZoneId zone = ZoneId.of("Europe/Brussels");
        System.out.println(requireUnambiguous("2023-10-28 02:30", zone));
        System.out.println(requireUnambiguous("2023-10-29 02:30", zone));
    }
}
```

The first call succeeds; the second throws our application’s IllegalArgumentException because the offset list has two entries. Inspect those offsets in a debugger and compare the same date in UTC. This experiment tests the stated policy, not a supposed Java parser bug.

Resolve the requirement before changing code: require an explicit offset or documented earlier/later overlap selection. Retain enough input context to trace the invoice without logging sensitive data. A corrected test should assert the chosen instant and preserve ordinary-date behavior, rather than merely stop throwing.
## Diagnostic Best Practices

1.  **No Random Edits:** Never change a line of code because "it might fix it." If you cannot explain *why* the change works based on the stack trace, you are introducing technical debt.
2.  **Log Sanitization:** When sharing logs for help, remove secrets (API keys, passwords, PII). A stack trace is a map of your code; it doesn't need your database password to be useful.
3.  **Narrowing:** If a process fails for 1,000 records, find the *first* record that fails. Isolate that specific data input. If it fails for one, it's a data/logic issue; if it fails for all, it's a configuration/infrastructure issue.

## Exercise

**Scenario:** You see this in your logs:
`Caused by: java.lang.NullPointerException: Cannot invoke "com.myapp.User.getName()" for null`
`at com.myapp.InvoiceService.generateInvoice(InvoiceService.java:115)`

**Question:**
1. Is this a compile-time or runtime error?
2. What is the most likely cause at line 115?
3. What is the first step to debug this without changing code?

**Answer:**
1. Runtime error (NPE occurs during execution).
2. The `User` object being called is null. The code likely looks like `user.getName()`, but `user` was not found in the database or passed as null.
3. Identify the specific Invoice ID being processed at the time of the crash and check the database to see if the associated User exists.

## Further reading

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
