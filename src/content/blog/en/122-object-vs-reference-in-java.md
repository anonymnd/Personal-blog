---
title: "Objects, References and new in Java"
description: "A deep dive into heap allocation, reference aliasing, and the mechanics of pass-by-value in Java."
pubDate: 2026-10-07T17:48:00.000Z
translationKey: 122-object-vs-reference-in-java
seriesOrder: 26
locale: en
tags: ["java-fundamentals","learning-series"]
draft: false
---

## Allocation and the Nature of References

In Java, there is a fundamental distinction between a reference variable and the object it points to. When you declare `ShoppingBasket basket;`, you have created a reference variable—a slot in memory capable of holding a reference to a `ShoppingBasket` object. At this stage, no object exists on the heap.

Using the `new` keyword triggers three distinct actions:
1. **Memory Allocation**: The JVM allocates space on the heap for all instance fields of the class.
2. **Initialization**: Fields are set to their default values (0, false, or null), and the constructor is executed to set the initial state.
3. **Reference Assignment**: The `new` expression returns the reference of the newly created object, which is then stored in the variable.

Crucially, Java references are not pointers in the C++ sense. You cannot perform pointer arithmetic or see the actual physical memory address. The reference is an opaque handle managed by the JVM.

## Aliasing and Identity

Aliasing occurs when multiple reference variables point to the same object on the heap. Because they share the same reference value, any mutation performed through one variable is visible through all others.

Identity is determined by whether two references point to the same object on the heap. This is checked using the `==` operator. In contrast, `.equals()` is intended to check for logical equality (value equivalence), though it defaults to identity unless overridden.

## Pass-by-Value: The Reference Trap

Java is strictly pass-by-value. When you pass an object to a method, you are not passing the object itself, nor are you passing a reference to the variable. You are passing a **copy of the reference value**.

Consider this scenario: two variables reference the same basket. We pass one to a method that both mutates the basket and attempts to reassign the reference.

### Worked Example: The Basket Mutation

```java
import java.util.*;

public class BasketDemo {
    static class ShoppingBasket {
        List<String> items = new ArrayList<>();

        void addItem(String item) {
            items.add(item);
        }
    }

    public static void main(String[] args) {
        ShoppingBasket basketA = new ShoppingBasket();
        ShoppingBasket basketB = basketA; // Aliasing: both point to the same object

        System.out.println("Initial: basketA == basketB is " + (basketA == basketB));

        processBasket(basketB);

        System.out.println("After method: basketA items: " + basketA.items);
        System.out.println("After method: basketA == basketB is " + (basketA == basketB));
    }

    static void processBasket(ShoppingBasket localBasket) {
        // Mutation: This affects the object on the heap
        localBasket.addItem("Apple");

        // Reassignment: This only changes the local copy of the reference
        localBasket = new ShoppingBasket();
        localBasket.addItem("Orange");
        // The 'Orange' is added to a new object that will be garbage collected
    }
}
```

**Analysis of the Output:**
1. `Initial: basketA == basketB is true`: Both variables hold the same reference value.
2. `After method: basketA items: [Apple]`: The mutation `addItem("Apple")` happened to the object on the heap. Since `basketA` and `basketB` both point there, `basketA` sees the change.
3. `After method: basketA == basketB is true`: The reassignment `localBasket = new ShoppingBasket()` only changed the local variable `localBasket` inside the method. It did not change `basketB` in the `main` method.

## Uninitialized Locals and Nulls

Field variables (instance variables) are automatically initialized to defaults. However, **local variables** (inside methods) are not. Attempting to use an uninitialized local variable results in a compile-time error.

`null` is a special reference value indicating that the variable does not currently point to any object. Calling a method on a `null` reference triggers a `NullPointerException` because there is no object on the heap to dispatch the method call to.

## Exercise

Given the following code, what is the final state of `list1` and `list2`?

```java
List<Integer> list1 = new ArrayList<>(List.of(1, 2));
List<Integer> list2 = list1;
modify(list1, list2);

void modify(List<Integer> a, List<Integer> b) {
    a.add(3);
    a = new ArrayList<>();
    b.add(4);
}
```

**Answer:**
Both `list1` and `list2` will contain `[1, 2, 3, 4]`.
- `a.add(3)` mutates the shared object.
- `a = new ArrayList<>()` only reassigns the local copy `a`; it has no effect on `list1`.
- `b.add(4)` mutates the shared object because `b` still points to the original list.

## Further reading

- [Java records](https://dev.java/learn/records/)
