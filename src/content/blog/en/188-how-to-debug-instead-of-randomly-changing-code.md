---
title: "How to Debug Instead of Randomly Changing Code"
description: "Learn a systematic approach to identifying bugs using stack traces and debugger tools instead of the 'guess-and-check' method."
pubDate: 2026-10-14T11:48:00.000Z
translationKey: 188-how-to-debug-instead-of-randomly-changing-code
locale: en
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

You have a bug in your Maven-based Java project. You change a variable, restart the app, and it still fails. You delete a line, add a print statement, and restart again. This 'shotgun debugging' is exhausting and often introduces new bugs while masking the original one.

## The Psychology of the Systematic Approach
Randomly changing code happens when we don't know exactly where the failure occurs. To stop guessing, you must move from 'I think it's here' to 'I know it's here.' This requires isolating the failure point before touching any logic. If you change code before understanding the cause, you destroy the evidence needed to diagnose the problem.

## Reading the Stack Trace
When a Maven project crashes during `mvn test` or `spring-boot:run`, the console provides a stack trace. Don't panic at the length. Look for the first occurrence of your own package name (e.g., `com.procurement.app`). 

Check the `Caused by:` section at the bottom; this usually contains the root exception. For example, if a procurement request fails to save, the trace might show a `NullPointerException` at `RequestService.java:42`. This tells you exactly which line is the culprit.

## Using Breakpoints Over Print Statements
Instead of adding `System.out.println()`, use a debugger. Set a breakpoint at the line where the error occurs. When the execution pauses, you can inspect the current state of all variables.

**Example Scenario:**
In a procurement app, a manager approves a request, but the status remains 'PENDING'.
- **Wrong way:** Change the status update logic and restart the server five times.
- **Right way:** Set a breakpoint in `ApprovalService.approve()`. Observe the `request` object. You might find that the `requestId` being passed is null, meaning the bug is actually in the Controller, not the Service.

## Common Mistake: The 'Clean' Misconception
Many developers run `mvn clean` every time they change code, thinking it fixes 'ghost' bugs. While `mvn clean` removes the `target` folder (build output), it does not fix logic errors in your source code. If the bug persists after a clean build, the issue is in your Java code, not the compiled bytecode.

## Practical Exercise
**Scenario:** Your `mvn test` fails with a `NoSuchMethodError` in a specific test class. You see the error in `target/surefire-reports`.

**Question:** Should you start renaming methods to see if it works, or check the stack trace for the conflicting library version?

**Answer:** Check the stack trace. A `NoSuchMethodError` usually indicates a dependency version mismatch in your `pom.xml`, not a logic error that requires renaming methods.


## Further reading

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
