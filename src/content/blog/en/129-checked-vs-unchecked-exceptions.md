---
title: "Checked and Unchecked Exceptions Express Handling Contracts"
description: "A deep dive into Java exception hierarchies to distinguish between recoverable business failures and programming errors using an import tool scenario."
pubDate: 2026-10-07T20:48:00.000Z
translationKey: 129-checked-vs-unchecked-exceptions
seriesOrder: 29
locale: en
tags: ["java-fundamentals","learning-series"]
draft: false
---

## The Exception Hierarchy as a Contract

RuntimeException is itself a subclass of Exception. Checked exception classes exclude RuntimeException and its subclasses; the compiler requires catching or declaring checked exceptions that can escape a method. RuntimeException and Error subclasses are unchecked.

This distinction defines compiler obligations, not recoverability. Business failures can be unchecked, while checked failures can be impossible to recover from locally. Choose an API contract and recovery boundary deliberately. Errors generally indicate serious conditions; avoid casually swallowing them.
## Scenario: The Data Import Tool

Consider a tool that imports business data from a file. We face three distinct failure types:
1. **Missing Input File**: The file isn't where it should be. This is an external environmental issue the user can fix (e.g., by providing the correct path). This is a **Checked Exception**.
2. **Malformed Business Rows**: The file exists, but a row has a string where a number should be. This is a business validation failure. This is a **Checked Exception**.
3. **Null Pointer in Parser**: A developer forgot to initialize a helper object. This is a bug. This is an **Unchecked Exception**.

## Worked Implementation

Here is how we model these contracts to ensure the caller knows exactly what to handle.

```java
import java.io.*;
import java.util.*;

// Checked: The caller MUST decide how to tell the user the file is gone
class ImportFileNotFoundException extends Exception {
    public ImportFileNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}

// Checked: The caller MUST decide if they skip the row or stop the whole import
class MalformedRowException extends Exception {
    private final int rowNumber;
    public MalformedRowException(String message, int rowNumber) {
        super(message);
        this.rowNumber = rowNumber;
    }
    public int getRowNumber() { return rowNumber; }
}

class DataImporter {
    public void importData(String path) throws ImportFileNotFoundException, MalformedRowException {
        File file = new File(path);
        if (!file.exists()) {
            // Preserve the cause by passing the original context if available
            throw new ImportFileNotFoundException("Target file missing: " + path, null);
        }

        // Illustrative parsing logic
        List<String> rows = List.of("ValidRow", "BadRow", "ValidRow");
        for (int i = 0; i < rows.size(); i++) {
            String row = rows.get(i);
            if ("BadRow".equals(row)) {
                throw new MalformedRowException("Invalid data format", i + 1);
            }
            // Potential RuntimeException here if a helper was null
            // helper.process(row);
        }
    }
}

public class ImportRunner {
    public static void main(String[] args) {
        DataImporter importer = new DataImporter();
        try {
            importer.importData("data.csv");
        } catch (ImportFileNotFoundException e) {
            System.err.println("Please check the file path: " + e.getMessage());
        } catch (MalformedRowException e) {
            System.err.println("Error at row " + e.getRowNumber() + ": " + e.getMessage());
        }
        // RuntimeExceptions (like NullPointerException) are not caught here
        // because they should be fixed in the DataImporter code, not handled by the runner.
    }
}
```

## Analysis of the Mechanism

### Preserving Causes
In the `ImportFileNotFoundException` constructor, we accept a `Throwable cause`. This is critical. If a `java.io.IOException` triggered our custom exception, passing it to `super(message, cause)` ensures the original stack trace is preserved. Without this, you lose the "why" behind the failure.

### The Recovery Fallacy
A common mistake is assuming checked exceptions *guarantee* recoverability. They do not. They only guarantee *visibility*. A `MalformedRowException` is checked, but the only "recovery" might be logging the error and crashing the program. The distinction is about the **API contract**, not the possibility of a fix.

### Failure Cases
- **Over-using Checked Exceptions**: If every single method throws five different checked exceptions, the code becomes cluttered with `try-catch` blocks, leading developers to use `catch (Exception e) {}` (swallowing exceptions), which is a dangerous anti-pattern.
- **Using Unchecked for Business Logic**: If `MalformedRowException` were a `RuntimeException`, the `ImportRunner` might forget to handle it, causing the entire application to crash unexpectedly when a bad row appears.

## Exercise

For an offline database, follow the contract of your database access library: JDBC uses checked SQLException for many failures, while Spring commonly translates persistence failures into unchecked exceptions. A temporary outage can be retryable even when represented by RuntimeException. A syntax error can arrive as a checked SQLException even though a developer must fix it.

Classify retryability from the actual failure, operation safety and policy rather than from checked versus unchecked inheritance. Preserve the cause and bound retries; do not retry a deterministic syntax error indefinitely.

## Further reading

- [Java records](https://dev.java/learn/records/)
