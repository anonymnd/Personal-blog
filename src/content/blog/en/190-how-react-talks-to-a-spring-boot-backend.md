---
title: "How React Talks to a Spring Boot Backend"
description: "A beginner's guide to connecting a React frontend to a Spring Boot API using fetch and CORS configuration."
pubDate: 2026-10-14T13:48:00.000Z
translationKey: 190-how-react-talks-to-a-spring-boot-backend
locale: en
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have built a beautiful procurement dashboard in React where a requester can submit a purchase request. You click 'Submit', but nothing happens because your data is sitting in the browser and your Java logic is sitting on a server. The bridge between these two is the HTTP protocol, typically using a REST API.

## The Request-Response Cycle
React runs in the user's browser, while Spring Boot runs on a server. To communicate, React sends an HTTP request (like GET or POST) to a specific URL (endpoint). Spring Boot listens for these requests, processes the business logic—such as saving a request to a database—and sends back a response, usually in JSON format. JSON is the universal language here because both JavaScript and Java can parse it easily.

## Handling CORS Barriers
When you first try to connect, you will likely see a 'CORS error' in the browser console. Cross-Origin Resource Sharing (CORS) is a security feature enforced by the browser. Since your React app might be on `localhost:3000` and Spring Boot on `localhost:8080`, the browser blocks the response because the origins differ. You must tell Spring Boot to allow requests from your React origin.

## Worked Example: Submitting a Request
In Spring Boot, you create a controller to handle the procurement request:

```java
@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "http://localhost:3000")
public class ProcurementController {
    @PostMapping
    public ResponseEntity<String> createRequest(@RequestBody PurchaseRequest req) {
        return ResponseEntity.ok("Request " + req.getId() + " submitted!");
    }
}
```

In React, you use the `fetch` API to send the data:

```javascript
const submitRequest = async (data) => {
  const response = await fetch('http://localhost:8080/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await response.text();
  console.log(result);
};
```

## Common Mistake: Forgetting the Content-Type
A frequent error is omitting the `'Content-Type': 'application/json'` header in the React fetch call. Without it, Spring Boot's `@RequestBody` won't know how to deserialize the incoming bytes into a Java object, resulting in a `415 Unsupported Media Type` error.

## Practical Exercise
If your React app is hosted at `https://app.procure.com` and your API at `https://api.procure.com`, which annotation or configuration is needed in Spring Boot to allow communication?

**Answer:** Use `@CrossOrigin(origins = "https://app.procure.com")` on the controller or a global `WebMvcConfigurer` bean to permit that specific origin.


## Further reading

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
