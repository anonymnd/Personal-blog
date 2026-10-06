---
title: "What Actually Happens When a Request Reaches Spring Boot?"
description: "A deep dive into the journey of an HTTP request from the embedded server through the DispatcherServlet to your controller."
pubDate: 2026-10-08T18:48:00.000Z
translationKey: 051-what-actually-happens-when-a-request-reaches-spring-boot
locale: en
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have built a procurement app where a requester submits a purchase request. You click 'Submit', but you aren't sure how that raw HTTP packet transforms into a Java object inside your `@RestController`. Many beginners think Spring Boot is a magic black box, but it is actually a carefully orchestrated pipeline.

## The Entry Point: Embedded Servlet Container
When a request hits your application, it first reaches the embedded server (usually Tomcat). Tomcat doesn't know about your Spring beans; it only knows about Servlets. It directs the request to the `DispatcherServlet`, which is the 'Front Controller' of the entire Spring MVC framework. This single servlet acts as the central coordinator for every incoming request.

## Handler Mapping and the Controller
Once the `DispatcherServlet` has the request, it asks the `HandlerMapping` to find the right destination. It looks at the URL (e.g., `/requests/submit`) and the HTTP method (POST) to find a method in your controller annotated with `@PostMapping`. Once the mapping is found, the `DispatcherServlet` uses a `HandlerAdapter` to actually invoke your method.

## Message Conversion with Jackson
Before your controller method runs, Spring must convert the JSON body into a Java object. This is where `HttpMessageConverters` come in. By default, Spring Boot uses the Jackson library to bind the JSON fields to a Java Record or POJO. 

```java
// Illustrative excerpt of a procurement request DTO
public record PurchaseRequest(String item, int quantity, double price) {}

@PostMapping("/requests/submit")
public ResponseEntity<String> submit(@RequestBody PurchaseRequest request) {
    return ResponseEntity.ok("Request received for " + request.item());
}
```

## The Return Journey
After your logic executes, the return value is passed back to the `HandlerAdapter`. If you return a `ResponseEntity` or a POJO, the `HttpMessageConverter` works in reverse, turning the Java object back into JSON for the HTTP response body.

## Common Mistake: Confusing Filter vs Interceptor
A common error is placing business logic in a `Filter` when it should be in a `HandlerInterceptor`. Filters are part of the Servlet container and run before the request even reaches the `DispatcherServlet`. Interceptors are Spring-managed and have access to the specific handler (controller) being called.

## Practical Exercise
If a request reaches the server but returns a 404 before hitting your controller, which component likely failed to find a match?

**Answer:** The `HandlerMapping` could not find a controller method matching the URL and HTTP method.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
