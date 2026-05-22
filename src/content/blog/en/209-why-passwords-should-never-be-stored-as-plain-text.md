---
title: "Store Passwords with Salted, Slow Hashes"
description: "Implementing secure password storage using BCrypt and Argon2id, focusing on salt management and migration strategies."
pubDate: 2026-10-08T12:48:00.000Z
translationKey: 209-why-passwords-should-never-be-stored-as-plain-text
seriesOrder: 45
locale: en
tags: ["security","learning-series"]
draft: false
---

## The Mechanism of One-Way Hashing

Storing passwords requires a one-way transformation. Unlike encryption, which is designed to be reversed with a key, hashing is a mathematical trapdoor. A secure password hash must be computationally expensive to prevent brute-force attacks and unique per user to defeat rainbow tables (pre-computed hash lists).

### Salts and Work Factors

A password-hashing library generates and uses a random salt as a separate algorithm input. Encoded BCrypt and Argon2 strings normally carry salt and parameters, allowing verification without a separate salt column. Different random salts make equal passwords produce different encoded hashes with overwhelming probability.

The work factor (or cost) determines how many iterations the algorithm performs. As hardware gets faster, you increase the work factor to keep the hashing time constant (e.g., ~100ms), forcing attackers to spend more time per guess.

## Algorithm Selection and Constraints

### BCrypt
BCrypt’s usual input boundary is 72 bytes, so UTF-8 character counts are not an adequate limit. Depending on the implementation, longer inputs may be rejected or truncated. Use the documented library behavior and policy; avoid ad hoc pre-hashing.

### Argon2id
For new systems, OWASP recommends Argon2id. It is superior because it provides resistance against GPU-based attacks by utilizing memory-hard functions. While BCrypt only scales with CPU time, Argon2id allows you to configure memory usage, parallelism, and iterations.

## Worked Example: Migration on Login

Consider a forum migrating from an old BCrypt cost (10) to a stronger one (12), or moving to Argon2id. You cannot migrate passwords in bulk because you don't have the plain text. Instead, you upgrade the hash during the authentication event.

### The Comparison Logic

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;

public record UserAccount(Long id, String username, String passwordHash, String algorithm) {}

public class PasswordMigrationService {
    private final PasswordEncoder bCrypt10 = new BCryptPasswordEncoder(10);
    private final PasswordEncoder bCrypt12 = new BCryptPasswordEncoder(12);
    // Assume an Argon2 implementation is available via a provider

    public boolean authenticateAndUpgrade(UserAccount user, String rawPassword) {
        boolean matches = false;
        boolean needsUpgrade = false;

        // 1. Verify based on the stored algorithm
        if ("BCRYPT_10".equals(user.algorithm())) {
            matches = bCrypt10.matches(rawPassword, user.passwordHash());
            needsUpgrade = true; // Upgrade to current standard (BCrypt 12)
        } else if ("BCRYPT_12".equals(user.algorithm())) {
            matches = bCrypt12.matches(rawPassword, user.passwordHash());
        } 

        // 2. If password is correct and needs upgrade, re-hash and save
        if (matches && needsUpgrade) {
            String newHash = bCrypt12.encode(rawPassword);
            updateUserHash(user.id(), newHash, "BCRYPT_12");
        } 

        return matches;
    }

    private void updateUserHash(Long id, String hash, String alg) {
        // Illustrative: Update database record
        System.out.println("Updating user " + id + " to " + alg);
    }
}
```



A BCrypt encoded hash contains its salt and cost. BCryptPasswordEncoder.matches reads those parameters, so one BCrypt encoder can verify hashes with different stored costs; its configured cost primarily determines new encodings. Algorithm migration can use explicit version metadata or an encoded algorithm prefix and a maintained delegating encoder. Authenticate first, then upgrade with the raw password from that successful request. Guard the database update against overwriting a concurrent password reset.

BCrypt’s usual input limit is 72 bytes, not 72 characters; libraries may reject or truncate longer inputs. Enforce a documented policy rather than silently truncating or adding an improvised SHA-256 pre-hash. Salt is an algorithm input, not universally a string appended by application code. Benchmark memory/time parameters and bound login attempts. Hashing is one-way but guessing attacks can still find weak passwords.
## Failure Cases
- **Over-tuning**: Setting the work factor too high can lead to Denial of Service (DoS). If a single hash takes 2 seconds, an attacker can exhaust your server's CPU by sending a few dozen login requests per second.
- BCrypt’s usual input boundary is 72 bytes, so UTF-8 character counts are not an adequate limit. Depending on the implementation, longer inputs may be rejected or truncated. Use the documented library behavior and policy; avoid ad hoc pre-hashing.

## Exercise

For a legacy plaintext account, do not guess its format because BCrypt verification failed: that could turn a stored hash into an accepted password. Use trusted, explicit format metadata and a narrowly controlled migration. If plaintext is truly available, it can be hashed in a secured batch and the plaintext eliminated; dormant accounts can instead require reset.

For existing BCrypt hashes, verify with the correct matcher. On successful login, encode the supplied raw password with the chosen current algorithm and atomically update format metadata and hash, checking the previous hash/version to avoid overwriting a reset. Failed verification never changes the format or falls back to plaintext comparison. Prevent logging passwords, remove old plaintext copies according to the recovery policy, and test both legacy and new-account paths.

## Further reading

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
