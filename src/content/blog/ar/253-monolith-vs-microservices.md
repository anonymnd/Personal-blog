---
title: "Monolith مقابل Microservices: شنو الفرق بيناتهم؟"
description: "دليل باش تختار بين نظام واحد مجموع (Monolith) ونظام مقسم لخدمات مستقلة (Microservices)."
pubDate: 2026-10-17T04:48:00.000Z
translationKey: 253-monolith-vs-microservices
locale: ar
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال الشراء (procurement). فالبداية، درتي مشروع واحد فيه كاع المنطق ديال اللي كيطلب (requester)، اللي كيوافق (manager)، واللي كيشري (buyer). مع الوقت، الفريق كبر ولقيتي بلي أي تغيير بسيط فـ 'الموافقة' كيفرض عليك تعاود تـdéployer التطبيق كامل، وهادشي كيوقف الخدمة على الناس اللي كيدوزو الطلبيات. هنا فين كيبان الفرق بين Monolith و Microservices.

## شنو هو الـ Monolith؟
الـ Monolith هو ملي كيكون التطبيق كامل فـ deployment واحد. هادشي ماشي معناه أن الكود مرون؛ تقدر دير Monolith منظم فيه modules مفرقين. النقطة الأساسية هي أن كلشي كيخدم بنفس الذاكرة (memory) ونفس الـ database. هادشي كيخلي الخدمة ساهلة فالبداية، ولكن المشكل هو أن أي غلط صغير فـ module واحد يقدر يطيح السيستيم كامل.

## الانتقال لـ Microservices
هنا كنقسمو التطبيق لخدمات مستقلة على حسب الخدمة (domain). فالتطبيق ديالنا، غادي يكون عندنا Service ديال الطلبات، Service ديال الموافقة، و Service ديال الشراء. كل واحد فيهم عبارة عن process مستقل كيهضر مع الآخرين عن طريق APIs. هادشي كيخلينا نكبرو (scale) غير الـ Service اللي عليه الضغط بلا ما نضيعو الموارد فالباقي.

## جدول مقارنة
| الميزة | Monolith | Microservices |
| :--- | :--- | :--- |
| الـ Deployment | وحدة واحدة | بزاف ديال الوحدات مستقلة |
| التناسق (Consistency) | قوي (ACID) | تدريجي (Eventual) |
| التعقيد | ساهل فالتسيير | صعيب فالتسيير (Ops) |
| الأعطال | نقطة فشل واحدة | أعطال موزعة |

## مثال تطبيقي: دورة الشراء
فـ Monolith، الـ `RequestService` كيعيط لـ `ApprovalService.approve(id)` نيشان فـ Java. أما فـ Microservices، كيكون داكشي بحال هكا:

```java
// مثال بسيط ديال اتصال بين Microservices
public void submitRequest(Request req) {
    requestRepo.save(req);
    restTemplate.postForEntity("http://approval-service/approve", req, Void.class);
}
```
النتيجة: إلا طاح الـ Service ديال الموافقة، الـ Service ديال الطلبات كيبقى خدام ويجمع الطلبات فـ queue حتى يرجع السيستيم.

## غلط شائع: الـ Distributed Monolith
بزاف ديال الناس كيغلطو وكيقسمو الخدمات على حسب التقنية (مثلا Service ديال الـ DB و Service ديال الـ UI) ماشي على حسب البيزنس. هادشي كيخلي الخدمات مرتبطة بزاف. الحل: قسم الخدمات على حسب المهام ديال البيزنس (مثلا 'الشراء' بوحدو و 'المخزن' بوحدو).

## تمرين تطبيقي
سيناريو: عندك module ديال 'التقارير' (Reporting) كيستهلك 90% من الـ CPU كل يوم اثنين، وهادشي كيتقل الخدمة ديال 'الطلبيات' على كاع المستخدمين. أما architecture هي اللي تحل هاد المشكل أحسن؟

**الجواب:** Microservices. حيت إلا عزلنا الـ Reporting فـ service بوحدو، نقدروا نزيدوه الـ RAM و CPU بلا ما نأثرو على الـ service ديال الطلبيات.
