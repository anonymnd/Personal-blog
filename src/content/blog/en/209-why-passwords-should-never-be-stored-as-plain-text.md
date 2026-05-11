---
title: "Why Passwords Should Never Be Stored as Plain Text"
description: "A deep dive into the dangers of plain text storage and the mechanism of one-way salted hashing for securing user credentials."
pubDate: 2026-10-15T08:48:00.000Z
translationKey: 209-why-passwords-should-never-be-stored-as-plain-text
locale: en
tags: ["software-engineering","security","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine a developer building a procurement app where employees submit purchase requests. To keep it simple, they store user passwords in a database column called `password` as simple strings. If a malicious actor gains access to the database via SQL injection or a leaked backup, every single account is instantly compromised. The attacker doesn't need to guess; they simply read the list.

## The Danger of Plain Text
Storing passwords in plain text is a critical failure because it creates a single point of total failure. Once the data is leaked, there is no second line of defense. Furthermore, because users frequently reuse passwords across multiple platforms, a leak in your procurement app could give an attacker access to the user's corporate email or banking accounts.

## Hashing vs. Encryption
A common mistake is thinking passwords should be 'encrypted'. Encryption is two-way; if you have the key, you can decrypt the password back to plain text. Passwords should instead be hashed. Hashing is a one-way cryptographic function. You can turn a password into a hash, but you cannot mathematically reverse the hash to find the original password.

## The Role of Salting
Simple hashing is vulnerable to 'Rainbow Tables'—precomputed lists of hashes for common passwords. To prevent this, we use a 'salt': a unique, random string added to the password before hashing. This ensures that two users with the same password will have completely different hashes in the database.

## Implementation Example
In a modern Spring application, `BCryptPasswordEncoder` is a standard choice. It handles the salt automatically.

```java
// Illustrative excerpt using Spring Security
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String rawPassword = "SecurePass123!";

// Store this result in the DB
String hashedPassword = encoder.encode(rawPassword);

// To verify during login:
boolean isMatch = encoder.matches(rawPassword, hashedPassword);
```

## Common Mistake: Using Fast Hashes
Developers often use MD5 or SHA-256 because they are fast. However, speed is a weakness here. Attackers can attempt billions of MD5 hashes per second. Modern standards like Argon2id or BCrypt are intentionally slow (work factors) to make brute-force attacks computationally expensive.

## Practical Exercise
**Scenario:** You see a database table where two users both have the hash `5e884898da28...` for different accounts. What is missing from the security implementation?

**Answer:** Salting. Since the hashes are identical for the same password, no unique salt was used per user.

## Further reading

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
