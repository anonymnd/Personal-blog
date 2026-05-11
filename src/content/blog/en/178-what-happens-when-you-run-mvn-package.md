---
title: "What Happens When You Run mvn package?"
description: "A detailed breakdown of the Maven lifecycle phases triggered when packaging a Java application into a JAR or WAR file."
pubDate: 2026-10-14T01:48:00.000Z
translationKey: 178-what-happens-when-you-run-mvn-package
locale: en
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have finished coding a new feature for a procurement app where a manager approves purchase requests. You are ready to send the application to the server, but you aren't sure if the code actually compiles or if the tests pass. This is where `mvn package` comes in. It isn't just a single command; it is a trigger for a sequence of events called the Default Lifecycle.

## The Chain Reaction of Phases
When you execute `mvn package`, Maven doesn't just jump to the end. It executes every preceding phase in the default lifecycle. First, it runs `validate` to check if the project structure is correct. Then, `compile` transforms your `.java` source files into `.class` bytecode. After that, `test` kicks in, where the Maven Surefire Plugin runs your unit tests. If any test fails, the process stops immediately to prevent packaging a broken build.

## The Packaging Mechanism
Once tests pass, Maven reaches the `package` phase. It takes the compiled code from `target/classes` and bundles it into the format defined in your `pom.xml` (usually `<packaging>jar</packaging>` or `war`). For our procurement app, this creates a file like `procurement-app-1.0.jar` inside the `target` folder. A normal Maven JAR contains the project’s compiled classes and resources, but does not automatically bundle dependency JARs or become executable. A configured Spring Boot repackage goal can create an executable archive with dependencies.

## Worked Example: Procurement App Build
Consider a simple `pom.xml` snippet:
```xml
<groupId>com.app</groupId>
<artifactId>procurement-system</artifactId>
<version>1.0-SNAPSHOT</version>
<packaging>jar</packaging>
```
Running `mvn package` results in:
1. **Compile**: `ProcurementRequest.java` → `ProcurementRequest.class`.
2. **Test**: `ApprovalTest.java` runs; results saved in `target/surefire-reports`.
3. **Package**: All classes are zipped into `target/procurement-system-1.0-SNAPSHOT.jar`.

## Common Mistake: Stale Artifacts
A frequent error is running `mvn package` and wondering why old, deleted classes are still appearing in the final JAR. This happens because `package` does not delete the `target` folder. To fix this, you must run `mvn clean package`. The `clean` command removes the `target` directory, ensuring you start from a fresh state.

## Practical Exercise
If you run `mvn package` and it fails during the `test` phase, will the `.jar` file be created in the `target` folder?

**Answer**: No new JAR is packaged by that failed run. An artifact from an earlier build may still remain in target because package does not clean the directory. Passing tests verifies their assertions, not the absence of every bug.


## Further reading

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
