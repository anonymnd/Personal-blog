---
title: "استعمل Messaging و Kafka ملي كيكون الخدمة خاصها تبقى واخا تسالي Request"
description: "تعلم كيفاش تفصل الخدمات (decouple) باستعمال Kafka، وركز على Outbox pattern و partition ordering و idempotency باش تضمن أن طباعة labels و analytics تخدم بلا مشاكل."
pubDate: 2026-10-08T18:48:00.000Z
translationKey: 226-what-is-kafka
seriesOrder: 51
locale: ar
tags: ["system-design","learning-series"]
draft: false
---

## الفرق بين Synchronous و Asynchronous

ملي شي client كيصيفط request لـ API، السيرفر عندو جوج خيارات: إما يكمل كاع داكشي اللي خاص يدار عاد يجاوب (Synchronous)، ولا يأكد بلي توصل بالطلب ويخلي الخدمة تدار من بعد (Asynchronous).

فـ flow synchrone، إلا كان السيرفيس ديال طباعة labels طايح، الـ request ديال la commande كاملة غادي تفشل، واخا la commande تسجلات فـ database. هادشي كيخلي السيستيم ضعيف حيت أي حاجة طاحت كتوقف كلشي.

التواصل asynchrone باستعمال message broker بحال Kafka كيحل هاد المشكل. الـ API كتسجل la commande وكتصيفط message. من بعد الـ API تقدر ترجع `202 Accepted` لـ client. السيرفيس ديال labels و analytics كيقراو هاد message كل واحد على حساب السرعة ديالو. إلا طاحت imprimante واحد 10 دقايق، لي messages كيبقاو مجموعين فـ Kafka؛ ما كيضيعوش، و la commande ديال الكليان ما كتحبسش.

## الفرق بين Broker و Database و Cache

Relational DB مناسبة للحالة وtransactions وqueries؛ DB-backed work queue حتى هي تقدر تكون design صالحة حسب scale. قيس polling وcontention بلا رفض عام. Redis pub/sub transient؛ structures أخرى فـ Redis عندها persistence وdelivery مختلفة.

Kafka كتقدم partitioned logs وreplay وconsumer groups. ما كتبدلش order DB وما كتخليش كل event durable للأبد أوتوماتيكيا. Configure replication وacks وretention وrecovery. خلي label printing وanalytics فـ consumer groups مختلفين إلا بجوج خاصهم يشوفو كل events.
## كيفاش خدام Kafka

كل partition فيها records مرتبين بـ offsets. Committed group offset غالبا كتحدد next record تقراها، ما كتثبتش كاع external side effects سالاو. فـ group العادية، partition كتكون عند consumer وحدة فالوقت، ولكن retries وrebalances وcrashes يقدرو يعاودو processing.

Order_id key وpartitioning ثابتين كيجمعو events ديال order؛ تبديل partition count ولا routing خاصو الحذر. Log order ما كتضمنش completion order إلا handlers asynchronous. Key بوحدها ما كتصلحش producers كيصيفطو events بترتيب business غلط.
## ضمان الخدمة: Outbox Pattern و Idempotency

Commit order وoutbox row فنفس SQL transaction. Relay كتpublish بـ event_id ثابتة وكتعلم progress غير بعد broker ack configured. هادشي كيخلي publication قابلة للاسترجاع، ماشي مضمونة بلا relay خدامة وdata محفوظة وretry policy. Crash بعد publish تقدر تعاود publication.

| وقت failure | شنو خاص recovery |
| --- | --- |
| قبل SQL commit | لا order لا outbox row كيتحفظو |
| بعد commit وقبل publish | Relay كتعاود row المحفوظة |
| بعد publish وقبل confirmation | Event تقدر تعاود تتنشر |
| بعد printing وقبل local receipt | Outcome مشكوك فيها؛ خاص printer-side idempotency |

لـ analytics update داخلية، دخل event_id مع unique constraint وعدل counter فنفس DB transaction. Check-then-act منفصلة فيها race. Commit Kafka offset غير بعد نجاح transaction.

Printing أثر فيزيكي خارجي. تشوف processed_events وتطبع ومن بعد تحفظ marker ماشي آمنة: process تقدر تطيح بعد printing وretry كتعاودها. Marker قبل printing تقدر تخليك ما تطبعش نهائيا. صيفط idempotency key ثابتة لـ label service كتدير durable deduplication وكتعرض job status، ولا صمم reconciliation/manual review للنتائج المشكوك فيها. بلا تعاون external system، ما تضمنش physical print وحدة. Outbox كتصلح SQL-to-event coordination ماشي كاع downstream effects.
## تمرين

مع3 partitions و4 consumers فـ conventional group، على الأكثر3 عندهم assignments؛ واش فعلا خدامين كيتعلق بالـ records. A وC فنفس partition عندهم log order، ولكن processing completion كتتبعو غير إلا handler كتحتافظ بيه.

Kafka transactions كتنسق reads/writes Kafka المدعومين حسب contract. ما كتدخلش فيها أوتوماتيكيا printer ولا أي external DB. حدد transaction boundary وcrash windows قبل claims ديال exactly-once business outcome.
