---
title: "What Does @PathVariable Do?"
description: "Learn how to extract dynamic values from a URL path to create flexible and RESTful API endpoints in Spring Boot."
pubDate: 2026-10-09T08:48:00.000Z
translationKey: 065-what-does-pathvariable-do
locale: en
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement system. You have thousands of purchase requests, and you need a way to fetch a specific one by its ID. If you created a separate endpoint for every single ID, your code would be infinite. This is where the struggle begins for beginners: how do you tell Spring Boot that a part of the URL is actually a variable and not a static string?

## The Mechanism of @PathVariable

The `@PathVariable` annotation is used to bind a URI template variable to a method parameter in a Spring controller. When a request hits your server, Spring looks at the `@RequestMapping` (or `@GetMapping`) path. If it sees a placeholder wrapped in curly braces, like `{id}`, it extracts the value from that position in the actual URL and assigns it to the variable annotated with `@PathVariable`.

## Practical Implementation

In a procurement app, a manager needs to approve a specific request. Instead of sending the ID in a query string (like `?id=10`), we use a path variable for a cleaner RESTful design.

```java
@RestController
@RequestMapping("/requests")
public class RequestController {

    @GetMapping("/{requestId}")
    public String getRequestDetails(@PathVariable Long requestId) {
        // In a real app, you would call a service here
        return "Fetching details for procurement request ID: " + requestId;
    }
}
```

If a user visits `/requests/502`, Spring identifies `502` as the `requestId`. The outcome is a response saying: "Fetching details for procurement request ID: 502".

## Common Mistake: Naming Mismatches

A frequent error occurs when the name in the curly braces doesn't match the method parameter name. For example, using `/{id}` in the mapping but `@PathVariable Long requestId` in the method. This causes a runtime error because Spring cannot find a variable named `requestId` in the path.

**Correction:** Either make the names identical or explicitly define the name in the annotation: `@PathVariable("id") Long requestId`.

## PathVariable vs RequestParam

| Feature | @PathVariable | @RequestParam |
| :--- | :--- | :--- |
| URL Style | `/requests/10` | `/requests?id=10` |
| Purpose | Identifying a resource | Filtering or sorting |
| Requirement | Usually mandatory | Can be optional |

## Practical Exercise

Create a method mapping that allows a buyer to update the status of an order using a path variable for the `orderId` and a path variable for the `status` (e.g., `/orders/123/status/shipped`).

**Check:** Your method signature should look like: `public String updateStatus(@PathVariable Long orderId, @PathVariable String status)`.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
