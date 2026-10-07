---
title: "كيفاش تخزن passwords بـ Salted, Slow Hashes"
description: "طريقة تخزين passwords آمنة باستعمال BCrypt و Argon2id، مع التركيز على الـ salt وكيفاش تدير migration ليهم."
pubDate: 2026-10-08T12:48:00.000Z
translationKey: 209-why-passwords-should-never-be-stored-as-plain-text
seriesOrder: 45
locale: ar
tags: ["security","learning-series"]
draft: false
---

## كيفاش كيخدم الـ One-Way Hashing

باش تخزن passwords، خاصك تستعمل تحويل كيمشي فجهة وحدة (one-way). هادشي ماشي هو encryption حيت encryption كيرجع الأصل ديالو بـ key، ولكن hashing هو « فخ » رياضي. باش يكون الـ hash آمن، خاصو يكون تقيل فالحساب (computationally expensive) باش اللي بغا يسرقو بـ brute-force ياخد وقت طويل، وخاصو يكون مختلف من مستخدم لآخر باش نحبسو الـ rainbow tables (ليستات ديال hashes واجدين).

### الـ Salts و Work Factors

Library كتولد salt عشوائية وكتستعملها كـ input منفصلة ديال algorithm. BCrypt وArgon2 encoded strings غالبا فيهم salt وparameters بلا column منفصلة. Salts مختلفة كتعطي hashes مختلفين لنفس password باحتمال كبير بزاف.

الـ work factor (أو cost) هو اللي كيحدد شحال من مرة الـ algorithm كيعاود العملية. كلما زاد الـ hardware فـ السرعة، حنا كنطلعو الـ work factor باش يبقى الوقت ديال الـ hashing ثابت (مثلا ~100ms)، وهكدا كنصعبوها على الـ hackers.

## اختيار الـ Algorithm والمشاكل ديالو

### BCrypt
Limit العادي BCrypt هو72 bytes، ماشي count ديال UTF-8 characters. حسب implementation، الطويل يقدر يترفض ولا يتقطع. تبع library behavior وpolicy موثقين بلا pre-hashing عشوائية.

### Argon2id
بالنسبة للأنظمة الجديدة، OWASP كتنصح بـ Argon2id. هو أحسن حيت كيصعب الخدمة على الـ GPUs حيت كيستهلك الـ memory (memory-hard). BCrypt كيخدم غير بـ CPU، ولكن Argon2id كيخليك تـ configurer الـ memory، الـ parallelism، والـ iterations.

## مثال تطبيقي: Migration وقت الـ Login

تخيل عندك forum بغيتي تبدل الـ cost ديال BCrypt من 10 لـ 12، أو تحول لـ Argon2id. ما تقدرش تبدل كاع الـ hashes دقة وحدة حيت ما عندكش الـ passwords فـ texte clair. الحل هو تبدل الـ hash غير فاش يدخل المستخدم (login).

### الكود ديال المقارنة

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;

public record UserAccount(Long id, String username, String passwordHash, String algorithm) {}

public class PasswordMigrationService {
    private final PasswordEncoder bCrypt10 = new BCryptPasswordEncoder(10);
    private final PasswordEncoder bCrypt12 = new BCryptPasswordEncoder(12);

    public boolean authenticateAndUpgrade(UserAccount user, String rawPassword) {
        boolean matches = false;
        boolean needsUpgrade = false;

        // 1. كنـ verify على حساب الـ algorithm اللي مخزن
        if ("BCRYPT_10".equals(user.algorithm())) {
            matches = bCrypt10.matches(rawPassword, user.passwordHash());
            needsUpgrade = true; // خاصنا نطلعوه لـ BCrypt 12
        } else if ("BCRYPT_12".equals(user.algorithm())) {
            matches = bCrypt12.matches(rawPassword, user.passwordHash());
        }

        // 2. إلا كان الـ password صحيح وخاصو upgrade، كنـ re-hash ونسجلوه
        if (matches && needsUpgrade) {
            String newHash = bCrypt12.encode(rawPassword);
            updateUserHash(user.id(), newHash, "BCRYPT_12");
        }

        return matches;
    }

    private void updateUserHash(Long id, String hash, String alg) {
        // Illustrative: تحديث الـ record فـ database
        System.out.println("Updating user " + id + " to " + alg);
    }
}
```



BCrypt hash encoded فيها salt وcost. BCryptPasswordEncoder.matches كتقراهم، يعني نفس encoder تقدر تتحقق من costs مختلفة مخزنة؛ configured cost كتحدد بالأساس encodings الجدد. Algorithm migration كتحتاج version واضحة ولا prefix مع delegating encoder maintained. دير authentication أولا وعاد upgrade بـ raw password ديال request الناجحة. حمي DB update باش ما تغطيش password reset متزامنة.

Limit العادي 72 bytes ماشي characters؛ library تقدر ترفض ولا تقطع الطويل. حدد policy موثقة بلا silent truncation ولا SHA-256 pre-hash مخترعة. Salt input ديال algorithm، ماشي دائما string كتزيدها application. قيس memory/time parameters وحدد login attempts. Hash one-way ولكن تخمين password ضعيفة يبقى ممكن.
## حالات الفشل
- **تزيار بزاف (Over-tuning)**: إلا درتي work factor عالي بزاف، تقدر تسبب DoS. إلا كان الـ hash كياخد 2 ثواني، أي واحد يقدر يطيح ليك السيرفر غير بـ شوية ديال requests ديال login.
- Limit العادي BCrypt هو72 bytes، ماشي count ديال UTF-8 characters. حسب implementation، الطويل يقدر يترفض ولا يتقطع. تبع library behavior وpolicy موثقين بلا pre-hashing عشوائية.

## تمرين

فالـ legacy plaintext account، ما تخمنش format حيت BCrypt verification فشلات: تقدر تولي تقبل hash المخزنة كـ password. استعمل format metadata موثوقة وmigration محدودة بوضوح. إلا plaintext فعلا موجودة، تقدر تدير secured batch hashing وتحيدها؛ dormant accounts يقدرو يحتاجو reset.

للـ BCrypt hashes استعمل matcher الصحيحة. ملي login تنجح، encode raw password المستلمة بـ algorithm الحالية وعدل format وhash atomically، مع check ديال hash/version القديمة باش ما تغطيش reset. Failure ما كتبدلش format وما كتجربش plaintext fallback. ما تسجلش passwords فالـ logs، عالج copies القديمة حسب recovery policy وجرب بجوج paths.

## باش تزيد تفهم

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
