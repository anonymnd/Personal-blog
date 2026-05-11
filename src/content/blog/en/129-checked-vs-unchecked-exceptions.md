---
title: "Checked vs Unchecked Exceptions"
description: "Learn how to choose between checked and unchecked exceptions to build more resilient Java applications."
pubDate: 2026-10-12T00:48:00.000Z
translationKey: 129-checked-vs-unchecked-exceptions
locale: en
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where a requester submits a purchase request. You write a method to save this request to a file. Suddenly, the compiler forces you to wrap your code in a try-catch block or add a 'throws' clause, even though you know the file exists. This is the core tension between checked and unchecked exceptions.

## What checked actually means
A checked exception is an Exception subtype outside the RuntimeException branch. At a call that can throw one, Java requires the caller to catch it or declare it in its own throws clause. This checks an API obligation at compile time, not whether a failure will happen or whether recovery is possible. IOException is a familiar example. Declaring throws propagates the obligation; it does not itself handle the failure or tell the UI what to display.
## Unchecked does not mean unrecoverable
RuntimeException and Error subtypes are unchecked: the compiler does not require catch or throws for them. NullPointerException often indicates a programming defect, while a domain rejection or transient infrastructure failure may also be represented by a RuntimeException. An application can handle those failures at an appropriate boundary. Error usually represents serious runtime problems that ordinary business code should not try to broadly recover from. Recoverability and exception classification are related design considerations, not the same thing.
## Worked example: an explicit API choice
This illustrative service chooses a checked exception for unavailable infrastructure and an unchecked exception for an invalid method argument. Other APIs may choose unchecked exceptions for infrastructure errors; Java does not force the business meaning.

```java
class ServiceUnavailableException extends Exception {
    ServiceUnavailableException(String message) { super(message); }
}

class ApprovalService {
    void approve(long requestId, boolean available)
            throws ServiceUnavailableException {
        if (!available) {
            throw new ServiceUnavailableException("Service unavailable");
        }
        if (requestId <= 0) {
            throw new IllegalArgumentException("Invalid request ID");
        }
    }
}
```

The caller must catch or declare ServiceUnavailableException. A controller or another application boundary can then map the failure to an appropriate response. That is a separate decision from the exception hierarchy.
## Common Mistake: Over-catching
A frequent error is catching `Exception` (the parent of all) to silence errors. This hides unchecked exceptions like `NullPointerException`, making debugging nearly impossible because the app fails silently.

**Correction:** Always catch the most specific exception possible. Instead of `catch (Exception e)`, use `catch (IOException e)`.

## Practical exercise
Does an expected authorization failure have to be a checked exception?

**Answer:** No. Choose a consistent domain/API exception policy and handle failures at the appropriate boundary. Missing authentication may produce 401; authenticated access without permission may produce 403. Neither status determines whether the underlying Java exception must be checked or unchecked.


## Further reading

- [Java records](https://dev.java/learn/records/)
