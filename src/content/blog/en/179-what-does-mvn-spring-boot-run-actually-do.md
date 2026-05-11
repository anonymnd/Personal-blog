---
title: "What Does mvn spring-boot:run Actually Do?"
description: "A deep dive into the mechanics of the Spring Boot Maven plugin and how it differs from standard lifecycle phases."
pubDate: 2026-10-14T02:48:00.000Z
translationKey: 179-what-does-mvn-spring-boot-run-actually-do
locale: en
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

You have just cloned a project, typed `mvn spring-boot:run` in your terminal, and the application starts. But if you look at the logs, you might wonder: did Maven just compile the code? Did it create a JAR file? Why is it different from running `java -jar`?

## Plugin Goal vs. Lifecycle Phase
Unlike `mvn clean` or `mvn install`, `spring-boot:run` is not a built-in Maven lifecycle phase. It is a specific goal provided by the `spring-boot-maven-plugin`. When you execute this command, Maven doesn't follow the standard sequence of validate -> compile -> test -> package. Instead, it triggers a specialized process designed for rapid development.

## The Execution Mechanism
When this goal runs, the plugin first ensures that your source code is compiled. However, it does not package the application into an executable archive (JAR/WAR) in the `target` folder. Instead, it creates a temporary classpath containing your compiled classes and all the project dependencies. It then launches the application using a separate JVM process, passing the main class and the classpath to it. This avoids the overhead of creating a physical archive every time you want to test a small change.

## Worked Example: Procurement App
Imagine a procurement system where a `Requester` submits a purchase request. You've added a new validation rule to the `RequestService` class.

```java
// Illustrative excerpt of a service
@Service
public class RequestService {
    public void submitRequest(PurchaseRequest req) {
        if (req.getAmount() <= 0) throw new IllegalArgumentException("Amount must be positive");
        // logic to save request
    }
}
```

Running `mvn spring-boot:run` will compile this change and launch the app immediately. If the app crashes, the console will show a stack trace. To debug, look for the first frame in the trace that mentions your package (e.g., `com.procurement.RequestService`) rather than the generic Spring framework frames.

## Common Mistake: The Package Confusion
Developers often assume `mvn spring-boot:run` updates the JAR file in the `target` directory. It does not. If you try to deploy the JAR from `target/myapp-0.0.1-SNAPSHOT.jar` after running the run goal, you will be deploying an old version of the code because the packaging phase was skipped.

**Correction:** Use `mvn package` or `mvn install` if you need a physical artifact for deployment.

## Practical Exercise
Question: If you run `mvn spring-boot:run` and then delete the `target/classes` folder while the app is still running, will the app crash immediately?

Answer: No. The JVM has already loaded the necessary classes into memory from the classpath at startup.


## Further reading

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
