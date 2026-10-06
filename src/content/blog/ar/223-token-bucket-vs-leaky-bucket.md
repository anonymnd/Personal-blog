---
title: "الفرق بين Token Bucket و Leaky Bucket"
description: "دليل باش تفهم الفرق بين Token Bucket و Leaky Bucket وكيفاش تحكم فـ traffic ديال السيستيم ديالك."
pubDate: 2026-10-15T22:48:00.000Z
translationKey: 223-token-bucket-vs-leaky-bucket
locale: ar
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على سيستيم ديال procurement (المشتريات) فين الموظفين كيصيفطو طلبات الشراء. فاش كيوصل لافان ديال trimestres، مئات ديال الناس كيصيفطو طلباتهم فدقة وحدة. إلا كان السيرفر كيعالج كلشي فالبلاصة، الداتابيز تقدر تطيح. هنا خاصك طريقة باش تتحكم فـ هاد الـ flow، ولكن واش تخلي السيستيم يقبل واحد الـ burst (دقة وحدة) ولا تفرض عليه يمشي بواحد الريتم ثابت؟

## كيفاش كيخدم Token Bucket
فـ Token Bucket، كيكون عندنا واحد السطل عامر بـ tokens. هاد الـ tokens كيتزادوا بواحد الريتم ثابت. أي request جات، خاصها 'تخلص' token باش تخدم. إلا كان السطل خاوي، الـ request كتمسح ولا كتسنى. الميزة هنا هي أنك إلا كنتي مجمع tokens، تقدر تعالج بزاف ديال الـ requests فدقة وحدة (burst) حتى يسالي السطل.

## كيفاش كيخدم Leaky Bucket
تخيل Leaky Bucket بحال شي قمع (entonnoir). الـ requests كيدخلو للسطل بأي سرعة، ولكن كيخرجوا من التحت بواحد الريتم ثابت ومحدد. إلا عمر السطل حيت الـ requests كيدخلو كتر ملي كيخرجوا، الـ requests الجداد كيضيعوا. هاد الطريقة كتمسح أي burst وكتخلي الـ traffic يكون smooth ومستقر.

## مثال تطبيقي: App ديال المشتريات
نشوفو الفرق فـ `PurchaseRequestController`:

| الميزة | Token Bucket | Leaky Bucket |
| :--- | :--- | :--- |
| **التعامل مع الـ Burst** | كيسمح بـ bursts على حساب حجم السطل | مكيسمحش بـ bursts |
| **سرعة الخروج** | متغيرة (كتطلع وتهبط) | ثابتة (constant) |
| **فاش كنستعملوه** | API اللي كيكون فيها ضغط مرة مرة | Tasks اللي خدامين فـ background |

```java
// مثال بسيط كيفاش كنكليكييو Token Bucket
public boolean allowRequest() {
    long now = System.currentTimeMillis();
    refillTokens(now);
    if (currentTokens > 0) {
        currentTokens--;
        return true;
    } 
    return false;
}
```

## غلط شائع: تخلط بيناتهم
بزاف ديال developers كيسحاب ليهم Leaky Bucket كيسمح بـ bursts حيت السطل كيجمع الـ requests. ولكن فالحقيقة، وخا كيجمعهم، المعالجة (processing) كتبقى ثابتة. إلا كان عندك user كيصيفط 10 ديال الـ requests فثانية وحدة ولكن فالمعدل كيصيفط وحدة فالثانية، Leaky Bucket غادي يبلوكيها، ولكن Token Bucket غادي يدوزها.

## تمرين تطبيقي
سيناريو: عندك سيستيم كيصيفط emails. بغيتي تضمن أن الشركة اللي كتوفر service ديال email متبلوكيش، داكشي علاش خاصك تخرج بالضبط 5 ديال الـ emails فالثانية، مهما كان عدد الطلبات اللي جاو. أشمن algorithm تختار؟

**الجواب:** Leaky Bucket، حيت هو اللي كيفرض ريتم خروج ثابت ومحدد.
