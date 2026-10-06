---
title: "What Happens When You Run mvn test?"
description: "A detailed look at the Maven lifecycle phases and the Surefire plugin mechanism during the test execution process."
pubDate: 2026-10-14T00:48:00.000Z
translationKey: 177-what-happens-when-you-run-mvn-test
locale: en
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have just finished writing a new feature for a procurement app where a manager approves a purchase request. You are confident in your code, but you aren't sure if your changes broke the requester's submission logic. You type `mvn test` into your terminal, but you aren't quite sure what Maven is doing behind the scenes to validate your work.

## The Lifecycle Sequence
When you execute `mvn test`, Maven doesn't just jump to your test classes. It follows a strict build lifecycle. Before the `test` phase, Maven automatically executes the `validate`, `compile`, and `process-test-resources` phases. This ensures that your source code is converted to bytecode and your test configuration files are in the right place before any test logic runs.

## The Role of the Surefire Plugin
Maven itself doesn't know how to run a Java test; it delegates this task to the Maven Surefire Plugin. Surefire scans your `src/test/java` directory for classes that follow specific naming patterns, such as `*Test.java` or `**Tests.java`. It then launches a separate JVM to execute these tests, ensuring that the test environment is isolated from the build process.

## Worked Example: Procurement Approval
Consider a `RequestServiceTest` class that checks if a manager can approve a request. 

```java
@Test
void testApproveRequest() {
    Request req = new Request("Laptop", 1200);
    boolean result = service.approve(req, "Manager_1");
    assertTrue(result);
}
```

When you run `mvn test`, Surefire executes this method. If it passes, you see a success message. If it fails, Maven generates an XML and text report in `target/surefire-reports`. These reports contain the stack trace, which is essential for debugging the exact line where the assertion failed.

## Common Mistake: Confusing Test and Package
A frequent error is thinking that `mvn test` creates a JAR file. It does not. If you need a deployable artifact, you must run `mvn package`. While `mvn package` also runs the tests (because `test` is a prerequisite of `package`), `mvn test` stops immediately after the testing phase without bundling the code.

## Practical Exercise
Question: If you want to run your tests but ensure that old compiled classes from a previous failed build are removed first, which command should you use?

Answer: `mvn clean test`. The `clean` goal removes the `target` folder, forcing Maven to recompile everything from scratch.


## Further reading

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
