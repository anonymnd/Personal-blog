---
title: "كيفاش تديبيغي (Debug) مشاكل Java بالدليل ماشي بالتجريب"
description: "طريقة منظمة باش تتبع الـ exceptions في Java من الـ logs حتى توصل للسبب الحقيقي، باستعمال مثال ديال مشكل في التوقيت (timezone) فواحد الـ import ديال الفاكتورات."
pubDate: 2026-10-08T08:48:00.000Z
translationKey: 182-how-to-read-a-maven-error
seriesOrder: 41
locale: ar
tags: ["maven-debugging","learning-series"]
draft: false
---

## أنواع ديال الـ Failures

قبل ما تبدا تقلب في الـ logs، خاصك تعرف فين كاين المشكل بالضبط. إلا غلطتي هنا، غادي تضيع السوايع كتقلب في بلاصة غلط.

*   **Compile-time Errors:** هادو كيوقعو فاش كدير `mvn compile`. الـ compiler ديال Java ما قدرش يحول الكود لـ bytecode. كيكون مشكل في السنتاكس (syntax)، شي import ناقص، أو غلط في الـ types. هادو كيمنعو التطبيق باش أصلاً يخدم.
*   **Runtime Errors:** هادو كيوقعو والـ JVM خدامة. كيبانو على شكل `Exceptions` أو `Errors`. الكود مكتوب صحيح من ناحية السنتاكس، ولكن المنطق (logic) وصل لشي حالة مستحيلة (مثلاً `NullPointerException`).
*   **Test Failures:** هادو مشاكل ديال المنطق. الكود خدام وما كيتبلوكاوش، ولكن الـ assertion فشلات (مثلاً `assertEquals`). السيستيم خدام تقنياً، ولكن النتيجة غلط من ناحية البيزنس.

## كيفاش تقرا الـ Stack Trace

فاش كيوقع runtime failure، الـ JVM كتعطيك stack trace. إلا قريتيها من الفوق لتحت، غادي تتلف حيت الـ frameworks (بحال Spring أو Hibernate) كيغلفو الـ exception الحقيقية بزاف ديال المرات.

### السلسلة ديال "Caused By"
الـ frameworks كيديرو wrap للـ exceptions. تقدر تلقى `ServletException` سبباتها `RuntimeException` اللي سبباتها `DataAccessException` اللي في الأخير سبباتها `SQLException`.

**القاعدة الذهبية:** هبط حتى لآخر `Caused by` في الـ log. تما فين كيكون السبب الحقيقي (root cause). ملي تلقاه، قلب على أول سطر فيه الـ package ديالك (مثلاً `com.myapp.service`). هاديك هي السطر بالضبط فين وقع المشكل.

## مثال تطبيقي: مشكل التوقيت (Timezone Glitch)

خد invoice importer افتراضية عندها contract كتطلب timestamp ما فيهاش ambiguity. 2023-10-29 02:30 فـ Europe/Brussels عندها جوج offsets صالحين. ما نخترعوش parse failure: LocalDateTime ما فيهاش zone وatZone غالبا كتختار offset فالـ overlap بلا exception. Failure حقيقية خاصها evidence من validation ولا conversion policy ديال application.

هاد reproducer كتوضح السياسة: كتقبل local time غير إلا كان offset صالح واحد، وكترفض gap ولا overlap:

```java
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class TimezoneReproducer {
    static Instant requireUnambiguous(String input, ZoneId zone) {
        LocalDateTime local = LocalDateTime.parse(input,
            DateTimeFormatter.ofPattern("uuuu-MM-dd HH:mm"));
        List<ZoneOffset> offsets = zone.getRules().getValidOffsets(local);
        if (offsets.size() != 1) {
            throw new IllegalArgumentException("Explicit offset required");
        }
        return local.toInstant(offsets.get(0));
    }
    public static void main(String[] args) {
        ZoneId zone = ZoneId.of("Europe/Brussels");
        System.out.println(requireUnambiguous("2023-10-28 02:30", zone));
        System.out.println(requireUnambiguous("2023-10-29 02:30", zone));
    }
}
```

النداء الأول كينجح؛ الثاني كيرمي IllegalArgumentException ديال application حيت list فيها جوج offsets. شوفهم فـ debugger وقارن نفس date فـ UTC. التجربة كتختبر السياسة اللي حددنا، ماشي bug مفترضة فـ Java parser.

حدد requirement قبل code fix: offset صريحة ولا اختيار موثق ديال earlier/later offset. خلي input context مفيدة بلا sensitive data. Test مصححة خاصها تثبت instant المختارة والسلوك ديال dates العاديين، ماشي غير توقف exception.
## قواعد ذهبية في الـ Diagnostic

1.  **ممنوع التبدال العشوائي:** ما تبدل حتى سطر في الكود حيت "يمكن يخدم". إلا ما قدرتيش تشرح *علاش* هاد التغيير غادي يحل المشكل بناءً على الـ stack trace، راك غير كتزيد في الـ technical debt.
2.  **نقي الـ Logs:** فاش تبغي تصيفط الـ logs لشي حد يعاونك، حيد منها secrets (API keys, passwords). الـ stack trace هي خريطة ديال الكود، ما محتاجاش المودباس ديال الـ DB باش تكون مفيدة.
3.  **التضييق (Narrowing):** إلا كان عندك مشكل في 1,000 سجل، قلب على *أول* واحد فشل. عزل ديك الداتا بوحدها. إلا كان غير واحد اللي فشل، المشكل في الداتا/المنطق؛ إلا فشلو كاملين، المشكل في الـ config أو الـ infrastructure.

## تمرين

**السيناريو:** لقيتي هادشي في الـ logs ديالك:
`Caused by: java.lang.NullPointerException: Cannot invoke "com.myapp.User.getName()" for null`
`at com.myapp.InvoiceService.generateInvoice(InvoiceService.java:115)`

**السؤال:**
1. واش هادا compile-time error ولا runtime error؟
2. شنو هو السبب المرجح في السطر 115؟
3. شنو هي أول خطوة ديرها باش تديبيغي بلا ما تبدل الكود؟

**الجواب:**
1. Runtime error (حيت NPE كيوقع والبرنامج خدام).
2. الـ object ديال `User` اللي كنعيطو ليه هو null. غالباً الكود داير `user.getName()` ولكن `user` ما لقاهش في الـ DB أو جا null.
3. نقلب على الـ Invoice ID اللي كان كيتحسب فاش وقع الـ crash، ونمشي للـ database نشوف واش الـ User اللي مرتبط بيه كاين أصلاً.

## باش تزيد تفهم

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
