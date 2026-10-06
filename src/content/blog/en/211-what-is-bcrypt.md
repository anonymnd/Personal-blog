---
title: "What Is BCrypt?"
description: "A deep dive into the one-way hashing mechanism used to secure user passwords in modern applications."
pubDate: 2026-10-15T10:48:00.000Z
translationKey: 211-what-is-bcrypt
locale: en
tags: ["software-engineering","security","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where employees submit purchase requests. You have a database of users, but if a hacker gains access to your database, seeing passwords in plain text would be a disaster. You cannot use encryption because encryption is two-way; if you have the key, you can revert the hash back to the password. This is where BCrypt comes in.

## The Mechanism of One-Way Hashing
BCrypt is not encryption; it is a password hashing function. Unlike encryption, hashing is a one-way street. Once a password is hashed, it cannot be 'decrypted' back to the original string. BCrypt specifically uses a salt—a random string added to the password before hashing—to ensure that two users with the same password ('Password123') end up with completely different hashes. This prevents attackers from using pre-computed tables (Rainbow Tables) to crack passwords.

## The Cost Factor
One unique feature of BCrypt is its 'work factor' or cost. This allows developers to increase the time it takes to calculate a hash. As hardware gets faster, you can increase the cost to keep the hashing process slow, making 'brute-force' attacks computationally expensive for hackers while remaining barely noticeable for a single user logging in.

## Worked Example: Password Verification
In a Spring application using `jakarta.*` and Spring Security, you don't manually compare strings. You use a `BCryptPasswordEncoder`.

```java
// Illustrative excerpt
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12); // Cost factor 12
String rawPassword = "buyer_secret_2024";
String encodedPassword = encoder.encode(rawPassword);

// Verification process
boolean isMatch = encoder.matches(rawPassword, encodedPassword);
System.out.println("Password match: " + isMatch); // Outcome: true
```

## Common Mistake: Manual Salt Management
Beginners often try to generate their own salt, store it in a separate database column, and manually concatenate it. This is unnecessary and error-prone. BCrypt embeds the salt directly into the resulting hash string. The `matches()` method knows exactly how to extract that salt to verify the password.

## Practical Exercise
If a BCrypt hash starts with `$2a$10$...`, what does the `10` represent?

**Answer:** It represents the cost factor (logarithmic rounds), meaning the algorithm performed 2^10 iterations to derive the hash.

## Further reading

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
