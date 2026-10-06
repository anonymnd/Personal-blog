---
title: "How Spring Converts JSON Into Java Objects"
description: "An exploration of the Jackson library and HttpMessageConverters that enable Spring Boot to automatically map JSON requests to Java POJOs."
pubDate: 2026-10-09T10:48:00.000Z
translationKey: 067-how-spring-converts-json-into-java-objects
locale: en
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. A requester sends a JSON payload containing a product name and quantity to your API. You see the data arriving in the network tab, but you wonder: how does that raw string of text suddenly become a Java object you can call `.getProductName()` on?

## The Role of HttpMessageConverters
Spring Boot doesn't handle JSON conversion manually in every controller. Instead, it uses a strategy pattern via `HttpMessageConverters`. When a request arrives with `Content-Type: application/json`, Spring searches its list of registered converters to find one that can handle both the incoming media type and the target Java class defined in your `@RequestBody` parameter.

## Jackson: The Engine Under the Hood
By default, Spring Boot includes the Jackson library. Jackson is the actual engine that performs the 'binding'. It uses reflection to inspect your Java class and matches JSON keys to Java fields. If your JSON has a key called `requestDate`, Jackson looks for a field named `requestDate` or a setter method named `setRequestDate()`.

## Worked Example: Procurement Request
Consider a simple DTO (Data Transfer Object) for a purchase request:

```java
public record PurchaseRequest(String item, int quantity, String requester) {}
```

When a client sends this HTTP POST:
`{"item": "Laptop", "quantity": 5, "requester": "Alice"}`

Spring invokes the `MappingJackson2HttpMessageConverter`. Jackson creates an instance of `PurchaseRequest` and populates the fields. The outcome is a type-safe Java object ready for business logic.

## Common Mistake: Missing Default Constructors
If you use a standard class instead of a `record`, a common error is forgetting the default no-args constructor. Jackson typically needs to instantiate the object before filling it. If you only provide a parameterized constructor, you might see a `InvalidDefinitionException`.

**Correction:** Always ensure your DTOs have a protected or public no-args constructor, or use Java Records which Jackson supports natively in newer versions.

## Practical Exercise
If you have a JSON field named `order_id` but your Java field is named `orderId`, will Spring map it automatically?

**Answer:** No. Jackson expects exact matches. You must use the `@JsonProperty("order_id")` annotation on the Java field to bridge the naming difference.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
