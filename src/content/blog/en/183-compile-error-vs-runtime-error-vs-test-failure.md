---
title: "Compile Error vs Runtime Error vs Test Failure"
description: "Learn to distinguish between build-time crashes, execution crashes, and logic mismatches to debug your Java applications faster."
pubDate: 2026-10-14T06:48:00.000Z
translationKey: 183-compile-error-vs-runtime-error-vs-test-failure
locale: en
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where a requester submits a purchase request. You write your code, run `mvn package`, and suddenly the process stops. Is it because you forgot a semicolon, because the database is down, or because the manager's approval logic is wrong? Knowing the difference between these three errors saves hours of frustration.

## The Compile Error: The Gatekeeper
A compile error happens when the Java compiler cannot translate your source code into bytecode. This occurs during the `compile` phase of the Maven lifecycle. It is a syntax or type violation. If you have a compile error, no `.class` files are generated, and the application cannot even start.

## The Runtime Error: The Unexpected Crash
Runtime errors occur while the program is actually running. The code is syntactically correct, but an operation is impossible to perform. In Java, these are usually `Exceptions`. For example, if your procurement app tries to access a `Request` object that is `null`, you get a `NullPointerException`. The application crashes or throws a stack trace during execution.

## The Test Failure: The Logic Gap
A test failure is different because the code compiles and runs without crashing. However, the result is not what you expected. When you run `mvn test`, the Surefire plugin executes your JUnit tests. If you asserted that a request status should be "APPROVED" but it remained "PENDING", the test fails. This is a bug in business logic, not a crash.

## Worked Example: Procurement Logic
Consider this snippet for approving a request:

```java
public void approveRequest(Request req) {
    // Compile Error: if you wrote 'req.status = "APPROVED"' but status is private
    req.setStatus("APPROVED"); 
    
    // Runtime Error: if 'req' is null, this throws NullPointerException
    System.out.println(req.getId()); 
}
```
- **Compile Error**: Writing `req.setStat("APPROVED")` (typo in method name) prevents the build.
- **Runtime Error**: Calling `approveRequest(null)` crashes the app at runtime.
- **Test Failure**: A test checks `assertEquals("APPROVED", req.getStatus())`, but the method body was empty.

## Common Mistake: Misreading the Stack Trace
Developers often confuse a `RuntimeException` with a test failure. If the console says `java.lang.NullPointerException`, it is a runtime error that caused the test to crash. If it says `AssertionFailedError`, the code ran fine, but the logic is wrong.

## Practical Exercise
Which category does this scenario fall into: You run `mvn package`, and the console shows `cannot find symbol: method calculateTotal() in class Order`?

**Answer**: Compile Error. The compiler cannot find the method definition.


## Further reading

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
