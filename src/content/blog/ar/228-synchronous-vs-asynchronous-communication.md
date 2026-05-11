---
title: "الفرق بين Communication Synchronous و Asynchronous"
description: "دليل باش تختار بين التواصل المباشر (Request-Response) والتواصل المفرق (Message-based) في تصميم الأنظمة."
pubDate: 2026-10-16T03:48:00.000Z
translationKey: 228-synchronous-vs-asynchronous-communication
locale: ar
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال المشتريات (procurement app). واحد الموظف كيصيفط طلب شراء، والسيستيم خاصو يعلم المدير. إلا خدمتي بـ Synchronous communication، الشاشة ديال الموظف غتبقى مبلوكية حتى يجاوب السيرفيس ديال notifications بلي راه وصلو الميساج. وإلا كان هاد السيرفيس طايح، الطلب كامل غيفشل. هنا فين كاين الفرق بين هاد جوج طرق.

## التواصل المتزامن (Synchronous): الخط المباشر
هنا كيكون عندنا cycle ديال request-response. الكليان كيصيفط طلب وكيستنى (blocking) حتى يجاوب السيرفر. هاد الطريقة غالباً كتكون بـ HTTP/REST ولا gRPC. كنستعملوها فاش كيكون المستخدم محتاج جواب دابا، بحال مثلاً واش شي برودوي كاين فـ stock قبل ما يزيدو فالسلة.

## التواصل غير المتزامن (Asynchronous): لاكوي (Queue)
هنا كنفرقو بين اللي صيفط والمستقبل. اللي صيفط كيحط الميساج فـ broker (بحال Kafka ولا RabbitMQ) وكيكمل خدمتو بلا ما يتسنى. والمستقبل كياخد الميساج فاش كيكون مسالي. هادشي مزيان للمهام اللي كتاخد الوقت، بحال تصويب PDF ولا صيفط email للمدير باش يوافق على الطلب.

## مثال تطبيقي: سيرفيس المشتريات
فالسيستيم ديالنا، كنخلطوهم بجوج:
1. **Sync**: الموظف $ightarrow$ API $ightarrow$ Database (تسجيل الطلب). المستخدم كياخد `201 Created` ديك الساعة.
2. **Async**: API $ightarrow$ Message Broker $ightarrow$ Notification Service. المدير كيوصلو التنبيه فـ background.

```java
// مثال بسيط: Async producer
public void approveRequest(Long requestId) {
    requestRepo.updateStatus(requestId, "APPROVED");
    // صيفط الميساج بلا ما تبلوكي السيرفيس
    messageBroker.send("notification-topic", new ApprovalEvent(requestId));
}
```
النتيجة: الموافقة كتسجل فالبلاصة، والتنبيه كيمشي من بعد بلا ما يتقال السيستيم.

## غلط شائع: السلسلة المتزامنة (Sync Chain)
بزاف ديال المطورين كيديرو سلسلة: Service A كيعيط لـ B، و B لـ C، و C لـ D. إلا كان Service D تقيل، السلسلة كاملة كتبلوكا وكيوقع cascading failure.
**التصحيح**: أي حاجة ماشي ضرورية تكون فورية، ردها Asynchronous. إلا كان B ما محتاجش جواب من C باش يجاوب A، خدم بـ queue.

## تمرين تطبيقي
سيناريو: مستخدم بغا يـ upload-ي ملف CSV فيه 10,000 منتج باش يدخلهم للسيستيم. واش نديرو ليها Synchronous ولا Asynchronous؟

**الجواب**: Asynchronous. حيت معالجة 10,000 سطر كتاخد الوقت، و HTTP connection غيدير timeout. خاص السيستيم يجاوب بـ "جاري المعالجة" ويعلم المستخدم فاش يسالي.
