---
title: "استعمال Optional كعقد واضح لغياب القيمة"
description: "تعلم كيفاش تستعمل Optional باش تعطي إشارة بلي القيمة تقدر تكون ماكايناش، وكيفاش تعامل مع fallback غالي بلا ما تضيع الموارد."
pubDate: 2026-10-07T19:48:00.000Z
translationKey: 128-optional-explained-without-overcomplicating-it
seriesOrder: 28
locale: ar
tags: ["java-fundamentals","learning-series"]
draft: false
---

## عقد الغياب (The Contract of Absence)

فـ Java، ملي كترجع `null` من شي method، كيكون المعنى ديالها غامض. اللي كيخدم بهاديك الـ method ما كيعرفش واش `null` هي نتيجة عادية، ولا وقع مشكل، ولا القيمة مازال ما تعمرات. `java.util.Optional<T>` كتحول هاد الغموض لعقد واضح فـ type. ملي شي method كترجع `Optional` كتقول للمبرمج: "راه هاد القيمة تقدر ما تكونش كاينا؛ خاصك تقرر كيفاش تعامل مع هاد الغياب قبل ما تحاول توصل للمعلومة."

## خطر الاستعمال الأعمى (Blind Access)

إلى استعملتي `Optional.get()` بلا ما تـverifier بـ `isPresent()`، راك كدير نفس الغلط ديال dereferencing null pointer، غير هو هنا كيعطيك `NoSuchElementException`. هاد الطريقة كتهرس الغرض من `Optional`. الهدف هو نحيدو من "واش هادي null؟" ونمشيو لـ "شنو غادي ندير بهاد القيمة إلا كانت كاينا؟".

## الفرق بين Eager و Lazy Fallbacks

أهم حاجة خاصك ترد ليها البال فـ API ديال `Optional` هي الفرق بين `orElse()` و `orElseGet()`.

- `orElse(T other)`: هادي **Eager**. يعني القيمة اللي وسط منها كتحسب (evaluated) ديما، وخا يكون الـ Optional عامر.
- `orElseGet(Supplier<? extends T> other)`: هادي **Lazy**. يعني الـ supplier function ما كتخدم حتى إذا كان الـ Optional خاوي.

إلى كان عندك شي fallback كيطلب عملية غالية (مثلا call لـ API ولا query تقيلة فـ database)، استعمال `orElse()` غادي يثقل ليك الـ application حيت العملية غتبقى تعاود كل مرة.

## مثال تطبيقي: البحث في كتالوج الكتب

تخيل عندنا كتالوج ديال الكتوبة، كنقلبو أولا على "النسخة المفضلة" (Preferred Edition). إلا مالقيناهاش، عاد كنديرو بحث غالي على أي نسخة متوفرة.

```java
import java.util.Optional;
import java.util.logging.Logger;

public class CatalogService {
    private static final Logger logger = Logger.getLogger(CatalogService.class.getName());

    public record BookEdition(String isbn, String format) {}

    // simulation ديال repository كيرجع Optional
    public Optional<BookEdition> findPreferredEdition(String bookId) {
        return Optional.empty();
    }

    public BookEdition findAnyEditionExpensive(String bookId) {
        logger.info("كنقومو ببحث غالي على: " + bookId);
        return new BookEdition("123-456", "Hardcover");
    }

    public BookEdition getEdition(String bookId) {
        return findPreferredEdition(bookId)
            // كنبدلو القيمة إلا كانت كاينا
            .map(edition -> {
                logger.info("لقينا النسخة المفضلة!");
                return edition;
            })
            // Lazy fallback: هاد الـ method ما غتخدم حتى إذا كان preferred خاوي
            .orElseGet(() -> findAnyEditionExpensive(bookId));
    }

    public void processEdition(String bookId) {
        // استعمال orElseThrow باش نعلنو على مشكل فـ business logic
        BookEdition edition = findPreferredEdition(bookId)
            .orElseThrow(() -> new RuntimeException("ماكاينا حتى نسخة لـ " + bookId));
    }
}
```

### تحليل التنفيذ
1. **الـ Pipeline**: `findPreferredEdition` رجعات `Optional.empty()`.
2. **الـ Map**: الـ block ديال `.map()` ما تخدمش حيت الـ Optional خاوي.
3. **الـ Fallback**: `orElseGet()` عيطات للـ `Supplier`. الـ log ديال "كنقومو ببحث غالي" غيظهر مرة وحدة فقط.
4. **حالة الخطأ**: كون استعملنا `.orElse(findAnyEditionExpensive(bookId))`, كانت ديك الـ method الغالية غتخدم فكل مرة، وخا تكون النسخة المفضلة كاينا.

## الربط الوظيفي باستعمال flatMap

بينما `map` كتبدل القيمة اللي وسط الـ Optional، `flatMap` كنستعملوها ملي كتكون الـ function اللي كتحول القيمة هي براسها كترجع `Optional`. هادشي كيخلينا نتفاداو نلقاو راسنا فـ `Optional<Optional<T>>`.

## تمرين

**السيناريو**: عندك record سميتو `User`. هاد الـ `User` يقدر يكون عندو `Optional<Profile>`، والـ `Profile` يقدر يكون عندو `Optional<Address>`. كتب method كتحاول تجيب الـ `Address` من الـ `User`؛ رجع Optional خاوي إلا كانت أي مرحلة ناقصة، ولوح `CustomException` إلا كانت النتيجة النهائية خاوية.

**الجواب**:
```java
public Optional<Address> getAddress(User user) {
    return user.getProfile() // كيرجع Optional<Profile>
              .flatMap(Profile::getAddress); // كيرجع Optional<Address>
}

// طريقة الاستعمال
Address addr = getAddress(user)
    .orElseThrow(CustomException::new);
```

## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
