---
title: "Method References Explained Simply"
description: "Learn how to replace verbose lambda expressions with clean method references in Java to improve code readability."
pubDate: 2026-10-11T22:48:00.000Z
translationKey: 127-method-references-explained-simply
locale: en
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

You have written a lambda expression like `(s) -> System.out.println(s)`, and you realize it feels redundant. You are essentially telling Java to take a value and pass it directly into another method without changing it. This is where method references come in, acting as a shorthand for lambdas that only call an existing method.

## How Method References Work
A method reference is a compact way to refer to a method without executing it immediately. It uses the double colon `::` operator. Instead of defining the logic inside a lambda, you point Java to the method that already contains that logic. This only works if the method's signature matches the functional interface's requirements.

## Types of References
There are four main types: static methods (`ClassName::method`), instance methods of a particular object (`obj::method`), instance methods of an arbitrary object of a particular type (`ClassName::method`), and constructors (`ClassName::new`).

## Practical Example: Procurement App
Imagine a procurement system where we need to filter a list of requests and print the IDs of those that need approval.

```java
import java.util.*;
import java.util.stream.*;

public class ProcurementSystem {
    public static void main(String[] args) {
        List<Request> requests = List.of(new Request(101, "Laptop"), new Request(102, "Mouse"));
        
        // Lambda way
        requests.forEach(r -> System.out.println(r.getId()));
        
        // Method Reference way (Instance method of arbitrary object)
        requests.stream()
                 .map(Request::getId)
                 .forEach(System.out::println);
    }
}

class Request {
    private int id; private String item; 
    public Request(int id, String item) { this.id = id; this.item = item; }
    public int getId() { return id; }
}
```
In the example, `Request::getId` replaces `r -> r.getId()`. The outcome is the same: the IDs 101 and 102 are printed to the console.

## Common Mistake: Wrong Context
Developers often try to use method references for methods that require extra arguments. For example, `System.out::println` works because `println` takes one argument, matching the Stream's element. If you need to concatenate a string like `r -> System.out.println("ID: " + r.getId())`, you cannot use a method reference; you must keep the lambda.

## Quick Exercise
Convert this lambda to a method reference: `list.stream().filter(s -> s.isEmpty()).collect(Collectors.toList());` 

**Answer:** `list.stream().filter(String::isEmpty).collect(Collectors.toList());`


## Further reading

- [Java records](https://dev.java/learn/records/)
