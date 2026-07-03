---
title: "Trace a Browser Request Through Spring Boot"
description: "A deep dive into the lifecycle of an HTTP request, from the browser fetch to Spring's DispatcherServlet and message conversion."
pubDate: 2026-10-07T02:48:00.000Z
translationKey: 051-what-actually-happens-when-a-request-reaches-spring-boot
seriesOrder: 11
locale: en
tags: ["spring-architecture","learning-series"]
draft: false
---

## The Journey from Browser to Byte

When a user interacts with a weather dashboard, the browser doesn't just "send data"; it initiates a complex sequence of network and application-layer events. Let's trace two specific interactions: fetching station readings and subscribing to alerts.

### 1. The Origin and the Wire
When the dashboard executes `fetch('/stations/42/readings?limit=10')`, the browser constructs an HTTP GET request. The request contains a start line (`GET /stations/42/readings?limit=10 HTTP/1.1`), headers (like `Accept: application/json`), and an empty body.

Crucially, the frontend code (React/Vue/Angular) is already running in the browser's memory. It is a separate logical entity from the Spring Boot server, even if they are packaged in the same JAR. The request travels over TCP/IP to the server's IP and port (usually 8080).

### 2. The Entry Point: DispatcherServlet
Once the bytes reach the server, the embedded Tomcat container parses the raw text into an `HttpServletRequest` object. This object is handed to the `DispatcherServlet`, the "Front Controller" of Spring MVC.

The `DispatcherServlet` does not know how to handle weather data; it knows how to find someone who does. It consults the `HandlerMapping` to find a controller method that matches the URL pattern and the HTTP method.

### 3. Input Binding and Parameter Extraction
Spring must now map the raw HTTP request into Java types. This is where the distinction between Path, Query, and Body becomes critical.

#### Path Variables (`@PathVariable`)
In `/stations/{id}/readings`, the `{id}` is part of the URI itself. It identifies a specific resource. Spring extracts `42` from the URI path and converts it to the type declared in the method signature (e.g., `Long`).

#### Query Parameters (`@RequestParam`)
The `?limit=10` part is a query string. These are typically used for filtering, sorting, or pagination. Unlike path variables, query parameters are optional or have defaults. Spring looks for the key `limit` in the request parameters and converts `10` to an `Integer`.

#### Request Body (`@RequestBody`)
For the `POST /subscriptions` call, the data isn't in the URL. It's in the HTTP body as a JSON string: `{"email": "user@example.com", "stationId": 42}`.

Spring uses `HttpMessageConverters` (typically Jackson) to perform the conversion. The process is:
`JSON String` → `Jackson ObjectMapper` → `Java Record/POJO`.

## Worked Example: The Weather API

Here is how the controller is structured to handle these specific mechanisms. Note the use of Java records for DTOs to ensure immutability.

```java
// Illustrative Controller
@RestController
@RequestMapping("/stations")
public class WeatherController {

    // GET /stations/42/readings?limit=10
    @GetMapping("/{id}/readings")
    public List<Reading> getReadings(
            @PathVariable Long id,
            @RequestParam(defaultValue = "20") int limit) {
        // Logic to fetch readings for station 'id' limited to 'limit'
        return List.of(new Reading(22.5, "Celsius"));
    }

    // POST /subscriptions
    @PostMapping("/subscriptions")
    public SubscriptionResponse subscribe(@RequestBody SubscriptionRequest request) {
        // Logic to save subscription
        return new SubscriptionResponse("Confirmed");
    }
}

// DTOs as records
record SubscriptionRequest(String email, Long stationId) {}
record SubscriptionResponse(String status) {}
record Reading(double value, String unit) {}
```

### Trace Analysis
1. **GET Request**: The `DispatcherServlet` matches `/stations/{id}/readings`. It sees `@PathVariable Long id` and extracts `42`. It sees `@RequestParam int limit` and extracts `10`. If `limit` were missing, it would use the default `20`.
2. **POST Request**: The `DispatcherServlet` matches `/stations/subscriptions`. It sees `@RequestBody`. It checks the `Content-Type: application/json` header, invokes the Jackson converter, and instantiates a `SubscriptionRequest` record with the provided email and ID.

### Failure Cases
- **Type Mismatch**: If the browser sends `/stations/abc/readings`, Spring cannot convert `abc` to `Long`. This results in a `MethodArgumentTypeMismatchException`. Without a specific `@ControllerAdvice` mapping, this typically results in a 400 Bad Request.
- **Malformed JSON**: If the POST body is `{"email": "user@example.com",`, the JSON is invalid. Jackson throws a `HttpMessageNotReadableException`, again leading to a 400 Bad Request.
- **Missing Required Param**: If `@RequestParam` is used without a `defaultValue` or `required=false`, and the parameter is missing from the URL, Spring throws a `MissingServletRequestParameterException`.

## Exercise

**Scenario**: You need to add a feature to filter readings by a specific date range. The URL should look like: `GET /stations/{id}/readings?start=2023-01-01&end=2023-01-31`.

1. Which annotation should you use for `id`?
2. Which annotation should you use for `start` and `end`?
3. If the user forgets to provide the `end` date, how can you ensure the API doesn't crash and instead uses "today" as the default?

**Answer**:
1. `@PathVariable` because the station ID is a resource identifier in the path.
2. `@RequestParam` because the dates are filters for the result set.
3. Use `@RequestParam(required = false)` and handle the null value in the service layer, or provide a default string value in the annotation if the type allows it.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
