---
title: "كيفاش كاتطور الـ Architecture مع كبران ديال Application"
description: "دليل باش تعرف كيفاش تحول من Monolith بسيط لـ système modulaire ولا distribué على حساب الاحتياجات ديال الخدمة."
pubDate: 2026-10-17T12:48:00.000Z
translationKey: 261-how-architecture-evolves-as-an-application-grows
locale: ar
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال developers كيبداو project وكيديرو كاع الـ logic فبلاصة وحدة حيت كتكون ساهلة وسريعة فالبداية. ولكن ملي الفريق كيكبر من جوج لـ 20 ديال الناس، كتلقى راسك بلي تغيير بسيط فـ logic ديال 'Shipping' خسر ليك الـ 'Payment' بلا ما تحس. هادشي كيوقع حيت الـ architecture مابقاتش متناسبة مع حجم الفريق والتعقيد ديال الـ domain.

## البداية بـ Modular Monolith
فالأول، أحسن حاجة هي يكون عندك deployment unit وحدة. ولكن السر هو ماتردش الكود "روينة" (big ball of mud)، بل دير Modular Monolith. هنا خاصك تنظم الكود على حساب الـ domain capabilities—مثلا `Procurement` و `Inventory` و `UserManagement`—ماشي غير على حساب layers بحال `Controllers` و `Services`. ملي كتكون cohesion عالية داخل كل module و coupling قليل بيناتهم، السيستيم كيبقى ساهل فالتطوير.

## فوقاش خاصنا نغيرو الـ Architecture؟
الـ architecture خاصها تطور على حساب قياسات حقيقية ماشي حيت شي حاجة trendy. كتعرف بلي خاصك تخرج من الـ monolith ملي كيوليو الـ teams كيبلوكيوا بعضياتهم باش يديرو deploy، ولا ملي كتلقى بلي شي جزء من app (مثلا rapport ديال achats) كياكل RAM بزاف وكيطيح الـ app كاملة.

## الانتقال لـ Microservices
ملي كتولي الـ operational independence هي الأولوية، هنا كنقسمو الـ modules لـ microservices. كل service خاص تكون عندو database ديالو باش يكون مستقل بصح. ولكن هادشي كيجيب مشاكل جديدة بحال distributed failure. مثلا، إلا طاح service ديال `Buyer` الـ `Manager` مايقدرش يأكد الطلبات. هنا خاصك تخدم بـ eventual consistency عوض transactions عادية.

## مثال تطبيقي: App ديال Procurement
تخيل عندنا app ديال الشراء. فالبداية، `Request` و `Approval` و `Ordering` كانوا غير packages فـ Spring Boot app وحدة. ملي كبرات الخدمة، الـ logic ديال `Ordering` ولات معقدة، فخرجناها لـ service بوحدها:

```java
// قبل: كانت غير method call
// orderService.placeOrder(request);

// دابا: ولات REST call ولا event
restTemplate.postForEntity("http://ordering-service/orders", request, Response.class);
```
النتيجة: الفريق ديال `Ordering` دابا يقدر يدير deploy شحال ما بغا فاليوم بلا ما يخاف يهرس الـ workflow ديال `Approval`.

## غلط شائع: وهم الـ Interface
بزاف كيصحابلهم بلي إلا داروا interface بين جوج modules راه حيدوا الـ coupling. هادشي غلط. إلا كان module `Approval` باقي كيعتمد على structure ديال data ديال `Request` راه باقيين coupled. الـ decoupling الحقيقي كيكون على حساب الـ domain boundaries ماشي غير interfaces ديال Java.

## تمرين تطبيقي
سيناريو: عندك module ديال 'Notification' كاع الـ app كتخدم بيه. هاد module كيخلي الـ app كاملة تبلانتا ملي كيكون provider ديال email تقيل. واش تحولو لـ microservice ولا غير تحسن الكود؟

الجواب: تحولو لـ microservice ولا asynchronous worker. هكذا كتضمن بلي إلا تعطل الـ email، الـ process ديال الشراء كامل مايوقفش.
