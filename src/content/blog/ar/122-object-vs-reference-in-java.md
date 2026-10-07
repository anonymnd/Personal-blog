---
title: "الأوبجيكت، الريفرنس و 'new' في جافا"
description: "شرح عميق لـ allocation في heap، وكيفاش كيخدم aliasing و pass-by-value في جافا."
pubDate: 2026-10-07T17:48:00.000Z
translationKey: 122-object-vs-reference-in-java
seriesOrder: 26
locale: ar
tags: ["java-fundamentals","learning-series"]
draft: false
---

## Allocation وطبيعة الريفرنس (Reference)

في جافا، كاين فرق كبير بين variable de référence والأوبجيكت اللي كيشير ليه. ملي كدير `ShoppingBasket basket;` راك غير كريتي بلاصة في الميموار تقدر تهز ريفرنس (reference) ديال أوبجيكت من نوع `ShoppingBasket`. فهاد اللحظة، مازال ما كاين حتى أوبجيكت في الـ heap.

ملي كتخدم بـ `new` كيوقعو تلاتة ديال الحوايج:
1. **Allocation Mémoire**: الـ JVM كتحجز بلاصة في الـ heap على حساب شحال ديال fields كاينين في الكلاس.
2. **Initialisation**: الـ fields كياخدو قيم افتراضية (0، false، أو null)، ومن بعد الـ constructor كيخدم باش يعطي القيم الأولية.
3. **Reference Assignment**: العملية ديال `new` كترجع لينا الريفرنس ديال الأوبجيكت اللي تكريا، وهاد العنوان هو اللي كيتحط في الـ variable.

واحد الحاجة مهمة: الريفرنس في جافا ماشي هو pointer بحال في C++. ما تقدرش دير عليه عمليات حسابية (pointer arithmetic) وما تقدرش تشوف العنوان الحقيقي ديال الميموار. الريفرنس هو مجرد handle كتحكم فيه الـ JVM.

## Aliasing و Identity

الـ Aliasing كيوقع ملي كيكونوا جوج variables de référence أو أكثر كيشيرو لنفس الأوبجيكت في الـ heap. حيت كيشاركو نفس قيمة الريفرنس، أي تغيير (mutation) درتيه بواحد منهم، كيبان عند لخرين كاملين.

الـ Identity هي ملي كيكونوا جوج ريفرنس كيشيرو لنفس الأوبجيكت في الـ heap. كنتاكدو من هادشي باستعمال `==`. أما `.equals()` فهي مديورة باش تقارن القيمة (logical equality)، ولكن الا ما كانتش redéfinie، كدير نفس الخدمة ديال `==`.

## Pass-by-Value: الفخ ديال الريفرنس

جافا ك تخدم بـ pass-by-value ديما. ملي كتصيفط أوبجيكت لشي method، راك ما كتصيفطش الأوبجيكت راسو، وما كتصيفطش الريفرنس ديال الـ variable. اللي كتصيفط هو **نسخة من قيمة الريفرنس**.

نشوفو هاد السيناريو: جوج variables كيشيرو لنفس السلة (basket). غنصيفطو وحدة لـ method اللي غتغير السلة ومن بعد غتحاول تبدل الريفرنس راسو.

### مثال تطبيقي: Mutation ديال السلة

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
        ShoppingBasket basketB = basketA; // Aliasing: بجوجهم كيشيرو لنفس الأوبجيكت

        System.out.println("Initial: basketA == basketB is " + (basketA == basketB));

        processBasket(basketB);

        System.out.println("After method: basketA items: " + basketA.items);
        System.out.println("After method: basketA == basketB is " + (basketA == basketB));
    }

    static void processBasket(ShoppingBasket localBasket) {
        // Mutation: هادي كتاثر على الأوبجيكت اللي في الـ heap
        localBasket.addItem("Apple");

        // Reassignment: هادي كتبدل غير النسخة المحلية ديال الريفرنس
        localBasket = new ShoppingBasket();
        localBasket.addItem("Orange");
        // 'Orange' تزدات في أوبجيكت جديد اللي غيمسحو الـ Garbage Collector
    }
}
```

**تحليل النتيجة:**
1. `Initial: basketA == basketB is true`: بجوجهم عندهم نفس قيمة الريفرنس.
2. `After method: basketA items: [Apple]`: التغيير `addItem("Apple")` وقع في الأوبجيكت اللي في الـ heap. وبما أن `basketA` و `basketB` بجوجهم كيشوفوه، `basketA` لقات التغيير.
3. `After method: basketA == basketB is true`: التبدال ديال `localBasket = new ShoppingBasket()` بدل غير الـ variable المحلية `localBasket` وسط الـ method. ما بدّلش `basketB` اللي كاين في `main`.

## Local Variables و Null

الـ fields ديال الكلاس كيتاخدو قيم افتراضية أوتوماتيكيا. ولكن **local variables** (اللي وسط الـ methods) ما كيتاخدوش. الا حاولتي تخدم بـ local variable مازال ما عطيتيهاش قيمة، الـ compiler غيعطيك error.

`null` هي قيمة خاصة ديال الريفرنس كتعني أن الـ variable ما كيشير لحتى أوبجيكت. الا حاولتي تعيط لشي method على ريفرنس `null` غتوقع `NullPointerException` حيت ما كاين حتى أوبجيكت في الـ heap فين تمشي الـ method.

## تمرين

عطاك هاد الكود، شنو غتكون الحالة النهائية ديال `list1` و `list2`؟

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

**الجواب:**
`list1` و `list2` بجوج غيكون فيهم `[1, 2, 3, 4]`. 
- `a.add(3)` بدلات الأوبجيكت المشترك.
- `a = new ArrayList<>()` بدلات غير النسخة المحلية `a`؛ ما أثراتش على `list1`.
- `b.add(4)` بدلات الأوبجيكت المشترك حيت `b` مازال كيشير لـ list الأصلية.

## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
