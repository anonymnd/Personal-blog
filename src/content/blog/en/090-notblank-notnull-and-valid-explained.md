---
title: "@NotBlank, @NotNull and @Valid Explained"
description: "Learn how to distinguish between different Jakarta Validation annotations to ensure your API receives clean, expected data."
pubDate: 2026-10-10T09:48:00.000Z
translationKey: 090-notblank-notnull-and-valid-explained
locale: en
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where a requester submits a purchase request. You notice that some requests arrive with empty names or null descriptions, causing your business logic to crash with a NullPointerException. This happens because you might be using @NotNull when you actually need to ensure the text isn't just empty spaces.

## Understanding the Constraints

While they seem similar, @NotNull and @NotBlank serve different purposes. @NotNull simply checks if the reference is not null. It allows empty strings (`""`) or strings containing only whitespace (`"  "`). In contrast, @NotBlank is stricter; it ensures the value is not null and that the trimmed length is greater than zero. It is specifically designed for `CharSequence` types.

## The Role of @Valid

Unlike the previous two, @Valid is not a constraint itself. It is a trigger. If you have a `PurchaseRequest` object containing a `User` object, putting @NotNull on the User field only checks if the User object exists. To tell Spring to go inside that User object and validate its internal fields (like the username), you must annotate the field with @Valid. This is called cascading validation.

## Worked Example: Procurement Request

```java
public class PurchaseRequest {
    @NotBlank(message = "Item name is required")
    private String itemName;

    @NotNull(message = "Quantity cannot be null")
    private Integer quantity;

    @Valid
    @NotNull
    private Requester requester;
}

public class Requester {
    @NotBlank
    private String employeeId;
}
```

In this scenario, if a user sends a request with `"itemName": " "`, @NotBlank will catch it. If they send `"quantity": null`, @NotNull will trigger. If the `requester` object is present but the `employeeId` inside it is empty, @Valid ensures the validation descends into the Requester class to find the error.

## Common Mistake: Over-reliance on Validation

A frequent error is assuming @NotBlank replaces database unique constraints. Validation happens at the application level. If two requesters submit the same unique ID at the exact same millisecond, validation will pass for both, and only a database unique constraint can prevent the duplicate.

## Practical Exercise

Which annotation should you use for a `String` field that must contain actual text and cannot be just spaces? Also, how do you ensure a nested object is validated?

**Answer:** Use @NotBlank for the text and @Valid on the nested object field.


## Further reading

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
