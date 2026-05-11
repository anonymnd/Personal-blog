---
title: "شنو هو Kafka؟"
description: "شرح مبسط على Apache Kafka كيفاش كيخدم باش يفرق بين microservices فواحد السيستيم."
pubDate: 2026-10-16T01:48:00.000Z
translationKey: 226-what-is-kafka
locale: ar
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

تخيل معايا كتصاوب تطبيق ديال الشراء (procurement). ملي الموظف كيدفع طلب شراء، خاص بزاف ديال الحوايج يوقعوا: manager يوصلو notification، service budget يتأكد واش كاين الفلوس، و audit log يقيد العملية. إلا خدمتي بـ API calls نيشان، السيستيم غيولي معقد بزاف. وإلا كان service budget طايح، الطلب كامل غيفشل. هنا فين كيجي Kafka باش يحل هاد المشكل، حيت كيخدم بحال واحد الـ distributed commit log.

## كيفاش كيخدم Kafka
Kafka خدام بنظام publish-subscribe. بلاصة ما تصيفط ميساج لشي واحد نيشان، الـ 'Producer' كيصيفط البيانات (event) لواحد الـ 'Topic'. هاد الـ topic بحال شي دوسي أو تصنيف. البيانات كتقسم على 'Partitions' باش Kafka يقدر يوزع الخدمة على بزاف ديال السيرفورات. الـ 'Consumers' كيتسجلو فهاد الـ topics باش يقراو البيانات فلوقت اللي كيناسبهم. وبما أن Kafka كيسجل البيانات فـ disk، إلا طاح شي consumer، يقدر يرجع يكمل من فين وقف.

## مثال ديال تطبيق الشراء
فالتطبيق ديالنا، الـ topic سميتو 'Request-Submitted' وهو اللي كيسير الخدمة:
1. **Producer**: الـ Request Service كيصيفط event JSON: `{"id": 101, "item": "Laptop", "amount": 1200}`.
2. **Topic**: Kafka كيخزن هاد الـ event فـ topic سميتو `purchase_requests`.
3. **Consumers**:
   - **Notification Service** كيقرا الـ event ويصيفط email لـ manager.
   - **Budget Service** كيقرا نفس الـ event باش يحجز الفلوس.

النتيجة: الـ Request Service ما محتاجش يعرف شكون اللي كيسمع ليه، هو غير كيصيفط الـ event ويسالي خدمتو.

## الترتيب و Idempotency
واحد الحاجة مهمة هي أن Kafka كيضمن الترتيب ديال الميساجات غير *داخل نفس الـ partition*. إلا كانو عندك بزاف ديال partitions، الميساجات يقدروا يتسيروا ماشي بالترتيب. وزيد عليها، حيت يقدر يوقع مشكل فـ network ويصيفط الـ producer نفس الميساج جوج مرات، خاص الـ consumers يكونوا 'idempotent'. يعني واخا يتعالج نفس الـ request ID جوج مرات، ما خاصش ينقص الفلوس جوج مرات من الميزانية.

## غلط شائع: استعمال Kafka كقاعدة بيانات
بزاف ديال المطورين كيسحاب ليهم Kafka هو database حيت كيخزن البيانات. ولكن Kafka مصاوب باش يدوز البيانات (streaming)، ماشي باش تدير فيه recherches معقدين.

**التصحيح**: خدم بـ Kafka باش تنقل البيانات بين services، ولكن خزن الحالة النهائية (مثلا status ديال الطلب) فـ database بحال PostgreSQL أو MongoDB.

## تمرين تطبيقي
إلا كان عندك topic فيه 3 ديال partitions و 4 ديال consumers فـ نفس الـ consumer group، شنو غيوقع لـ consumer الرابع؟

**الجواب**: الـ consumer الرابع غيبقى بلا خدمة (idle) حيت كل partition فـ group واحد كتمشي لـ consumer واحد فقط.
