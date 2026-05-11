---
title: "How Password Hashing Works"
description: "A deep dive into the one-way process of securing user credentials using salts and slow hashing algorithms."
pubDate: 2026-10-15T09:48:00.000Z
translationKey: 210-how-password-hashing-works
locale: en
tags: ["software-engineering","security","learning-series"]
draft: false
---

Imagine you are building a procurement app where a manager approves expensive orders. If you store passwords in plain text and your database is leaked, every account is compromised instantly. Many beginners mistake hashing for encryption, but encryption is two-way (you can decrypt it), whereas hashing is a one-way street designed to be irreversible.

## The Hashing Mechanism
A hash function takes an input and produces a fixed-length string of characters. No matter how long the password is, the output (the digest) is always the same length. Crucially, the same input always produces the same output. However, if you change just one letter, the entire hash changes completely. This is called the avalanche effect.

## The Role of the Salt
If two users use the password "123456", their hashes would be identical. Hackers use "Rainbow Tables" (pre-computed lists of common passwords and their hashes) to crack these instantly. To prevent this, we use a **Salt**: a random string added to the password before hashing. Now, even if two users have the same password, their salts are different, resulting in unique hashes.

## Choosing the Right Algorithm
Modern security avoids fast hashes like MD5 or SHA-256 because GPUs can guess millions of combinations per second. Instead, we use "slow" algorithms. BCrypt is widely used in Spring applications, though OWASP now recommends Argon2id for new systems because it resists GPU-based attacks more effectively.

## Worked Example: The Procurement App
When a requester creates an account with the password `SecurePass123`:
1. **Registration**: The system generates a salt `xYz789`. It hashes `SecurePass123 + xYz789` using BCrypt. The database stores the resulting hash: `$2a$10$R9h...` (which includes the salt).
2. **Login**: The user enters `SecurePass123`. The system retrieves the stored hash, extracts the salt from it, hashes the input, and compares the results. If they match, access is granted.

## Common Mistake: Using Encryption
A common error is using AES or other symmetric encryption. If a developer stores the encryption key on the server, an attacker who gains server access can decrypt every password in the database. Hashing removes the need for a decryption key entirely.

## Practical Exercise
**Question**: Why is adding a salt necessary if the hashing algorithm is already complex?
**Answer**: To prevent Rainbow Table attacks and ensure that identical passwords result in different stored hashes.

## Further reading

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
