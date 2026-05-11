---
title: "الفرق بين Class و Record في Java"
description: "تعلم فوقاش تستعمل Class عادية وفوقاش تستعمل Record باش تسير البيانات فـ Java."
pubDate: 2026-10-11T16:48:00.000Z
translationKey: 121-class-vs-record-in-java
locale: ar
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال الشراء (procurement app)، فين الموظف كيصيفط طلب `PurchaseRequest`. خاصك طريقة باش تنقل هاد البيانات للمدير. إلا استعملتي Class عادية، غادي تضيع نص وقتك كتكتب فـ getters و `equals()` و `hashCode()` غير باش المدير ملي يبغي يقارن بين جوج طلبات تخرج ليه النتيجة صحيحة. هاد الكود الزايد كيغبر لينا المنطق الحقيقي ديال الخدمة.

## الفرق الأساسي
Class عادية تقدر تكون mutable ولا immutable؛ أنت كتختار الحقول والـ constructors والسلوك ديالها. Record هي class محدودة مخصصة باش تحمل المعطيات بطريقة واضحة. بدات كـ preview فـ Java 14 وولات feature نهائية فـ Java 16. Compiler كيوجد الحقول، canonical constructor، accessors وequals وhashCode وtoString. تقدر تزيد validation وmethods، ولكن ما تقدرش تورث من class أخرى ولا تزيد instance fields من برا المكونات المحددة.
## كيفاش كيخدم الـ Record
الـ Records كيكونوا immutable بشكل سطحي (shallowly immutable). يعني المراجع (references) لي وسط منو مكيتبدلوش، ولكن إلا كان عندك `List` وسط record، راه تقدر تزيد فيها عناصر. والـ record كيكون `final` ديما، يعني ميمكنش دير ليه extend.

## مثال تطبيقي: طلب شراء
شوف الفرق بين الطريقة القديمة والجديدة فـ هاد الكود:

```java
// الطريقة ديال Class العادية
public class RequestDTO {
    private final String item;
    private final int quantity;

    public RequestDTO(String item, int quantity) {
        this.item = item;
        this.quantity = quantity;
    }
    public String getItem() { return item; }
    public int getQuantity() { return quantity; }
    // هنا خاصك تزيد equals() و hashCode() و toString()
}

// الطريقة ديال Record
public record RequestRecord(String item, int quantity) {}
```

النتيجة: `RequestRecord` كيدير نفس الخدمة ديال `RequestDTO` ولكن فسطر واحد. وإلا قارنتي جوج records عندهم نفس القيم، `equals()` كتعطيك `true` بلا ما تكتب والو.

## غلط شائع: shallow ماشي deep immutability
Component ديال record ما كتعاودش تعطيه reference أخرى من بعد الإنشاء، ولكن object اللي كيشير ليه يقدر يبقى mutable. دير `List.copyOf(items)` فـ compact constructor باش تحمي list من التغييرات فالبنية ديالها عبر reference القديمة. هاد النسخة ما كتسمحش تزيد ولا تحيد عناصر، ولكن ماشي deeply immutable: العناصر mutable اللي وسطها يقدرو يتبدلو. إلا خاصك ضمان أقوى، استعمل عناصر immutable ولا نسخ دفاعية ديالهم.
## تمرين تطبيقي
صاوب record سميتو `Order` فيه `String orderId` و `double totalAmount`. كيفاش تجبد `orderId` من واحد الـ instance سميتها `myOrder`؟

**الجواب:** كتستعمل `myOrder.orderId()` (رد البال بلي records مكنستعملوش prefix ديال `get`).


## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
