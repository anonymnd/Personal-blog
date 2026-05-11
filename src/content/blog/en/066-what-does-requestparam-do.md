---
title: "What Does @RequestParam Do?"
description: "Learn how to capture query parameters from a URL to make your Spring Boot controllers dynamic."
pubDate: 2026-10-09T09:48:00.000Z
translationKey: 066-what-does-requestparam-do
locale: en
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. A manager wants to see a list of requests, but they don't want every single one; they only want to see requests from a specific department. If your URL is just `/requests`, you get everything. But how do you tell Spring Boot to filter for only 'IT' or 'HR'? This is where `@RequestParam` comes in.

## The Mechanism of Query Parameters
`@RequestParam` is an annotation used in Spring Boot controllers to extract values from the query string of a URL. The query string is the part that comes after the `?` symbol. For example, in `/requests?dept=IT`, the key is `dept` and the value is `IT`. Spring Boot maps this value directly into a method parameter in your Java code, allowing your logic to change based on the user's input.

## Practical Implementation
In a procurement scenario, you might have a method to filter requests. Here is how the code looks:

```java
@GetMapping("/requests")
public List<Request> getRequests(@RequestParam(name = "dept") String department) {
    // Logic to filter requests by the provided department
    return requestService.findByDepartment(department);
}
```
If a user visits `/requests?dept=Finance`, the `department` variable will hold the string "Finance".

## Handling Optional Parameters
By default, `@RequestParam` is required. If the user visits `/requests` without the `?dept=...` part, Spring will throw a 400 Bad Request error. To prevent this, you can set `required = false` or provide a `defaultValue`.

| Attribute | Effect | Result if Missing |
| :--- | :--- | :--- |
| `required = true` | Default behavior | 400 Bad Request |
| `required = false` | Parameter is optional | Variable is `null` |
| `defaultValue` | Provides a fallback | Variable uses default value |

## Common Mistake: Confusing with @PathVariable
A frequent error is using `@RequestParam` when the value is part of the URL path (e.g., `/requests/123`) instead of the query string. `@PathVariable` is for the path structure, while `@RequestParam` is for filtering or optional data.

**Correction:** Use `@RequestParam` for `?key=value` and `@PathVariable` for `/{id}`.

## Practical Exercise
Create a controller method that accepts a query parameter called `status` (e.g., `PENDING`, `APPROVED`) with a default value of `PENDING` if none is provided.

**Check:** Your method signature should look like: `public List<Request> getByStatus(@RequestParam(defaultValue = "PENDING") String status)`.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
