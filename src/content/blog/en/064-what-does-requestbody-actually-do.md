---
title: "What Does @RequestBody Actually Do?"
description: "A deep dive into how Spring Boot transforms raw HTTP request bodies into Java objects using message converters."
pubDate: 2026-10-09T07:48:00.000Z
translationKey: 064-what-does-requestbody-actually-do
locale: en
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. A requester sends a JSON object containing the item name and quantity to your server. You see the data in Postman, but in your Java controller, you have a `PurchaseRequest` object. How does the raw text of a network packet suddenly become a typed Java object? This is the magic of `@RequestBody`.

## The Deserialization Mechanism
When you annotate a controller method parameter with `@RequestBody`, you are telling Spring: "Don't look for this data in the URL parameters or headers; look in the body of the HTTP request." Spring doesn't do this conversion alone. It uses a strategy pattern called `HttpMessageConverter`. By default, Spring Boot includes the Jackson library. When a request arrives with `Content-Type: application/json`, Spring finds the `MappingJackson2HttpMessageConverter`, which reads the input stream and maps JSON keys to Java fields.

## Worked Example: Procurement Request
Consider a scenario where a user submits a new purchase request. The JSON sent is `{"item": "Laptop", "quantity": 1}`.

```java
@PostMapping("/requests")
public ResponseEntity<String> createRequest(@RequestBody PurchaseRequest request) {
    return ResponseEntity.ok("Received request for " + request.getItem());
}

// DTO using a Java Record for immutability
public record PurchaseRequest(String item, int quantity) {}
```

**Outcome:** Spring reads the JSON, instantiates the `PurchaseRequest` record, and injects it into the method. If the JSON keys match the record components, the object is fully populated.

## Common Mistake: Missing Getters or Default Constructors
Developers often use standard classes instead of records but forget to add a default (no-args) constructor or public getters. Since Jackson typically instantiates the object first and then sets fields via reflection or setters, a missing constructor will trigger a `HttpMessageNotReadableException`.

**Correction:** Use Java Records (as shown above) or ensure your POJO has a public no-args constructor and appropriate getters/setters.

## Validation and Binding
`@RequestBody` only handles the conversion. If the JSON is `{"item": "", "quantity": -5}`, Spring will still create the object because the JSON is syntactically valid. To prevent this, you must pair `@RequestBody` with `@Valid` from the Jakarta Bean Validation API to enforce business constraints.

## Practical Exercise
If a client sends a request with `Content-Type: text/plain` but your controller uses `@RequestBody` for a Java object, what happens?

**Answer:** Spring will throw a `415 Unsupported Media Type` error because it cannot find a suitable `HttpMessageConverter` to turn plain text into a structured Java object.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
