---
title: "Why Two Java Classes With the Same Name Can Be Different Types"
description: "Understand how packages and class loaders prevent naming collisions and create distinct types in the JVM."
pubDate: 2026-10-11T14:48:00.000Z
translationKey: 119-why-two-java-classes-with-the-same-name-can-be-different-types
locale: en
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. You have a `Request` class in the `com.app.requester` package and another `Request` class in the `com.app.manager` package. You try to pass a requester's request to a manager's method, but the compiler throws a type mismatch error. Even though both are named `Request`, Java treats them as completely different entities.

## The Role of Fully Qualified Names
In Java, the name of a class is not just the identifier you see in the file. The true identity is the Fully Qualified Name (FQN), which combines the package path and the class name. `com.app.requester.Request` and `com.app.manager.Request` are as different as `String` and `Integer`. The package acts as a namespace, allowing different modules to use common terms without clashing.

## Class Loaders and Runtime Identity
Beyond packages, the JVM uses Class Loaders to load bytecode. A class is uniquely identified by the combination of its FQN and the Class Loader that defined it. If two different class loaders load the same `.class` file from different locations, the JVM sees them as two distinct types. This is common in plugin architectures or application servers where different versions of the same library are loaded in isolated environments.

## Worked Example: The Procurement Conflict
Consider this scenario where we handle a purchase request:

```java
package com.app.requester;
public class Request { public String item = "Laptop"; }

package com.app.manager;
public class Request { public boolean approved = false; }

public class ProcurementService {
    public void process(com.app.manager.Request mgrReq) {
        System.out.println("Processing...");
    }

    public void run() {
        com.app.requester.Request req = new com.app.requester.Request();
        // process(req); // This would cause a compile-time error
    }
}
```
Outcome: The `process` method expects a `manager.Request`. Passing a `requester.Request` fails because their FQNs differ, ensuring that the manager's logic doesn't accidentally operate on the requester's data structure.

## Common Mistake: Import Ambiguity
Developers often use `import com.app.requester.*;` and `import com.app.manager.*;` in the same file. If both packages contain a class named `Request`, using the word `Request` in the code causes an ambiguity error. 

**Correction:** Use the FQN directly in the code (e.g., `com.app.requester.Request req = new ...`) or import only one and use the FQN for the other.

## Practical Exercise
If you have `package a.User` and `package b.User`, can you cast an instance of `a.User` to `b.User` using `(b.User) myUser`?

**Answer:** No. This will throw a `ClassCastException` at runtime because they are distinct types despite having the same simple name.


## Further reading

- [Java records](https://dev.java/learn/records/)
