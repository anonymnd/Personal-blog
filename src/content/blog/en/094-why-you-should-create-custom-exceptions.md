---
title: "Turn Domain Exceptions into a Stable API Error Contract"
description: "Implementing a boundary between domain-specific failures and a consistent ProblemDetail API response using RestControllerAdvice."
pubDate: 2026-10-07T11:48:00.000Z
translationKey: 094-why-you-should-create-custom-exceptions
seriesOrder: 20
locale: en
tags: ["validation-errors","learning-series"]
draft: false
---

## The Boundary Problem

In a complex system, the domain layer should not know about HTTP. If a delivery tracking service fails because a parcel is missing, the domain should throw a `ParcelNotFoundException`, not a `ResponseStatusException` with a 404 code. Mixing these concerns leaks infrastructure details into your business logic, making it impossible to reuse the domain in a CLI or a message queue consumer.

To solve this, we establish a boundary. The domain throws specific, typed exceptions. A global interceptor catches these and translates them into a stable API contract. This ensures that internal stack traces and database details never reach the client, while the client receives a predictable structure.

## Designing the Domain Failures

For a delivery tracking scenario, we distinguish between a resource that doesn't exist and a dependency that is failing. 

1. **ParcelNotFoundException**: A business-level failure indicating the ID is valid in format but absent from the system.
2. **CarrierIntegrationException**: A failure when the external carrier API is down or timing out.

```java
// Illustrative: Domain Exceptions
public class ParcelNotFoundException extends RuntimeException {
    private final String trackingNumber;
    public ParcelNotFoundException(String trackingNumber) {
        super("Parcel " + trackingNumber + " not found");
        this.trackingNumber = trackingNumber;
    }
    public String getTrackingNumber() { return trackingNumber; }
}

public class CarrierIntegrationException extends RuntimeException {
    private final String carrierCode;
    public CarrierIntegrationException(String carrierCode, Throwable cause) {
        super("Carrier " + carrierCode + " is currently unavailable", cause);
        this.carrierCode = carrierCode;
    }
    public String getCarrierCode() { return carrierCode; }
}
```

## Implementing the Translation Layer
Translate domain failures at the HTTP boundary with @RestControllerAdvice and Spring Framework ProblemDetail. The snippets below show selected mappings; they do not cover every security or infrastructure failure.

### The Global Exception Handler

```java
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestControllerAdvice
public class GlobalErrorHandler extends ResponseEntityExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalErrorHandler.class);

    @ExceptionHandler(ParcelNotFoundException.class)
    public ProblemDetail handleParcelNotFound(ParcelNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Parcel Not Found");
        problem.setProperty("trackingNumber", ex.getTrackingNumber());
        problem.setProperty("errorCode", "ERR_PARCEL_001");
        return problem;
    }

    @ExceptionHandler(CarrierIntegrationException.class)
    public ProblemDetail handleCarrierFailure(CarrierIntegrationException ex) {
        // Log the actual cause (stack trace) internally, but hide it from the client
        log.error("External carrier failure: {}", ex.getCarrierCode(), ex);
        
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.SERVICE_UNAVAILABLE, "The delivery carrier is temporarily unavailable");
        problem.setTitle("Carrier Integration Error");
        problem.setProperty("carrier", ex.getCarrierCode());
        problem.setProperty("errorCode", "ERR_CARRIER_503");
        return problem;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGenericError(Exception ex) {
        log.error("Unhandled system error", ex);
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
        problem.setTitle("Internal Server Error");
        return problem;
    }
}
```

## Analysis of the Mechanism

### Safe Logging vs. Safe Exposure
In the `CarrierIntegrationException` handler, we see a critical pattern: `log.error(..., ex)` captures the full stack trace for developers, but the `ProblemDetail` returned to the user contains a sanitized message. Exposing the raw `Throwable` cause in an API response can leak library versions, internal IP addresses, or database schema names.

### The ProblemDetail Contract
By returning `ProblemDetail`, the API output becomes consistent:
- **Type**: A URI identifying the error type.
- **Title**: A short, human-readable summary.
- **Status**: The HTTP status code.
- **Detail**: A specific explanation of this occurrence.
- **Custom Properties**: Fields like `errorCode` allow frontend applications to trigger specific UI logic (e.g., showing a "Retry" button for carrier errors but a "Search Again" button for missing parcels).

## Failure Cases and Edge Cases

Within one controller advice, source declaration order does not make a generic handler shadow a more specific exception handler. With multiple advice beans, ordering and cause-versus-root matching need deliberate review. ResponseEntityExceptionHandler covers standard MVC exceptions; authentication failures raised in security filters may need separate entry points or access-denied handlers.

ProblemDetail is a Spring Framework API, not a Jakarta EE type. Current Spring documentation follows RFC 9457, which supersedes RFC 7807. Use a stable type URI and machine-readable error code where useful, and expose only fields appropriate for the authorized caller.
## Focused Exercise

**Scenario**: You need to add a `DeliveryDateInvalidException` for cases where a user requests a tracking update for a date in the future. This is a business rule violation.

**Task**: 
1. Create the exception record/class.
2. Add a handler to the `GlobalErrorHandler` that returns a `422 Unprocessable Entity` status.
3. Include a custom property `requestedDate` in the response.

**Answer**:
```java
public class DeliveryDateInvalidException extends RuntimeException {
    private final String requestedDate;
    public DeliveryDateInvalidException(String date) {
        super("Delivery date cannot be in the future: " + date);
        this.requestedDate = date;
    }
    public String getRequestedDate() { return requestedDate; }
}

// Inside GlobalErrorHandler
@ExceptionHandler(DeliveryDateInvalidException.class)
public ProblemDetail handleInvalidDate(DeliveryDateInvalidException ex) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(
        HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
    problem.setTitle("Invalid Delivery Date");
    problem.setProperty("requestedDate", ex.getRequestedDate());
    problem.setProperty("errorCode", "ERR_DATE_422");
    return problem;
}
```

## Further reading

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
