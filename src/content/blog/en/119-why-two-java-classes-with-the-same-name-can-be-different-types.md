---
title: "Java Type Identity Depends on Packages and Class Loaders"
description: "Explaining why classes with identical names are distinct types and how to handle boundary-safe mapping."
pubDate: 2026-10-07T15:48:00.000Z
translationKey: 119-why-two-java-classes-with-the-same-name-can-be-different-types
seriesOrder: 24
locale: en
tags: ["java-fundamentals","learning-series"]
draft: false
---

## The Definition of a Type in Java

In Java, a class is not identified by its simple name (e.g., `Money`), but by its Fully Qualified Name (FQN). The FQN consists of the package name and the class name. If two classes share the same simple name but reside in different packages, the JVM treats them as entirely unrelated types.

Type identity is further tied to the ClassLoader. A class is uniquely identified by the combination of its FQN and the ClassLoader that defined it. If the same `.class` file is loaded by two different ClassLoaders, the resulting `Class` objects are distinct, and attempting to cast one to the other will trigger a `ClassCastException`.

## Scenario: The Legacy SDK Conflict

Consider a scenario where your application defines a `Money` record for internal domain logic, but you must integrate a legacy SDK that also provides its own `Money` class. Because these are different types, you cannot use a cast to convert between them, even if their fields are identical.

### Illustrative Implementation

```java
// Application Domain Type
package com.app.domain;

public record Money(java.math.BigDecimal amount, String currency) {}

// Legacy SDK Type
package com.legacy.sdk;

public class Money {
    private final java.math.BigDecimal value;
    private final String isoCode;

    public Money(java.math.BigDecimal value, String isoCode) {
        this.value = value;
        this.isoCode = isoCode;
    }

    public java.math.BigDecimal getValue() { return value; }
    public String getIsoCode() { return isoCode; }
}
```

## Boundary-Safe Mapping

When moving data across the boundary between the SDK and your application, you must implement an explicit mapping mechanism. A cast fails because the JVM checks the type identity (FQN + ClassLoader) at runtime.

### Worked Mapping Example

```java
package com.app.service;

import java.util.Optional;
import com.app.domain.Money; // Application type


public class CurrencyConverter {

    public com.app.domain.Money mapToDomain(com.legacy.sdk.Money sdkMoney) {
        if (sdkMoney == null) return null;

        // Explicit conversion: Extracting values to build a new instance
        return new com.app.domain.Money(
            sdkMoney.getValue(),
            sdkMoney.getIsoCode()
        );
    }

    public void processPayment(com.legacy.sdk.Money sdkMoney) {
        // This would throw ClassCastException:
        // com.app.domain.Money domainMoney = (com.app.domain.Money) sdkMoney;

        com.app.domain.Money domainMoney = mapToDomain(sdkMoney);
        System.out.println("Processed: " + domainMoney.amount());
    }
}
```

### Analysis of the Mechanism
1. **FQN Resolution**: The compiler uses the imports to distinguish between `com.app.domain.Money` and `com.legacy.sdk.Money`. Within a single file, if both are needed, one or both must be referenced by their full path.
2. **Memory Allocation**: `mapToDomain` creates a new object on the heap. It does not change the identity of the SDK object; it projects its state into a type the application understands.
3. **Failure Case**: If a developer attempts to use a generic `Object` reference from the SDK and casts it to the domain `Money`, the JVM will see that the class was loaded from the `com.legacy.sdk` package and reject the cast, regardless of the field names.

## Exercise

**Question**: You have a class `com.util.Config` and `com.internal.Config`. You receive an object of type `Object` that you know is a `com.util.Config`. What happens if you execute `(com.internal.Config) receivedObject`? How do you safely move the data from the utility config to the internal config?

**Answer**: A `ClassCastException` is thrown because the FQNs differ. To move the data, you must use an explicit mapper: instantiate `com.internal.Config` and manually pass the values retrieved from the `com.util.Config` instance via its getter methods.

Use separate source files for the package declarations shown. Java has no import alias syntax. A direct cast between these unrelated final types may be rejected at compilation; a cast through Object can compile and then fail at runtime. The ClassLoader distinction concerns the defining loader: two initiating loaders can delegate to the same definition and receive the same type.

## Further reading

- [Java records](https://dev.java/learn/records/)
