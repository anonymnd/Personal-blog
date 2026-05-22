---
title: "طرق HTTP وردود النجاح: دليل شامل وموحد"
description: "شرح معمق لمفاهيم الـ safety و idempotency لـ POST, PUT, PATCH, و DELETE باستعمال مثال ديال API ديال playlists."
pubDate: 2026-10-07T08:48:00.000Z
translationKey: 076-get-post-put-patch-and-delete-explained-properly
seriesOrder: 17
locale: ar
tags: ["rest-api","learning-series"]
draft: false
---

## مفاهيم الـ Safety و Idempotency

Safety كتخص العملية المطلوبة: GET ما خاصهاش تطلب تعديل playlist، وخا logs يقدرو يتكتبو. Idempotency كتخص الأثر المقصود ديال تكرار request، ماشي نفس response ولا غياب logs. PUT وDELETE idempotents حسب semantics؛ POST ما كتضمنهاش ولكن API تقدر توفر deduplication. PATCH كتعلق بالعملية وبـ format.
## مثال تطبيقي: Playlist API

تخيل عندنا resource ديال Playlist. الكليان (client) هو اللي كيتحكم فـ representation ديال الـ playlist (العنوان، الوصف، وليستة ديال IDs ديال التراكات).

### 1. الإنشاء (POST)
فاش الكليان كيبغي يكريي playlist، كيصيفط `POST` لـ `/playlists`. السيرفر هو اللي كيعطي الـ ID.

**الطلب:** `POST /playlists` 
**الـ Body:** `{"title": "Chill Vibes", "tracks": [101, 102]}`

**رد النجاح:** `201 Created`. 
ضروري السيرفر يزيد `Location` header: `Location: /playlists/789`. هكا الكليان كيعرف فين كاين الـ resource الجديد بالضبط.

### 2. التعويض الكامل (PUT)
`PUT` كنستعملوه باش نبدلو الـ resource كامل. الكليان كيصيفط representation كاملة ومحدثة.

**الطلب:** `PUT /playlists/789` 
**الـ Body:** `{"title": "Chill Vibes Updated", "tracks": [101, 102, 103]}`

**رد النجاح:** `200 OK` (إلا رجعنا الـ playlist المحدثة) أو `204 No Content` (إلا كان الكليان ما محتاجش الـ body).

### 3. التعديل الجزئي (PATCH)
`PATCH` كنستعملوه للتعديلات البسيطة. عكس `PUT` ، الكليان كيصيفط غير الحقول اللي بغا يبدل.

**الطلب:** `PATCH /playlists/789` 
**الـ Body:** `{"title": "Midnight Jazz"}`

**رد النجاح:** `200 OK` مع الـ representation اللي تبدلات.

### 4. المسح (DELETE)
`DELETE` كيمسح الـ resource اللي محدد فـ URI.

**الطلب:** `DELETE /playlists/789` 
**رد النجاح:** `204 No Content`. هادا هو الستاندار فاش كيكون المسح ناجح وما كاينش body يرجع.

## الفرق فـ الـ Idempotency

إلا format ديال patch موثقة وكتعطي title قيمة، التكرار كيبقى عندو نفس الأثر. JSON Patch كتستعمل application/json-patch+json وarray ديال operations. باش تزيد فآخر tracks استعمل /-:

```json
[{"op":"add","path":"/tracks/-","value":104}]
```

إلا duplicates مسموحين، كل تكرار كيزيد track أخرى. add فـ /tracks كتبدل member كاملة، ما كتزيدش فآخر array؛ فرّق paths.
## المعالجة غير المتزامنة (202 Accepted)
إلا كان إنشاء playlist كياخد وقت طويل (مثلاً خاص السيرفر يتأكد من 1,000 تراك واش عندهم حقوق النشر)، السيرفر ما خاصوش يخلي الكونيكسيو مفتوحة. هنا كنرجعو `202 Accepted`. هاد الكود كيعني أن الطلب صحيح وتقبل، ولكن النتيجة النهائية مازال ما واجداش. الـ response غالباً كيكون فيها `Location` header كيدي لـ URI فين تقدر تتبع الحالة ديال الطلب.

## جدول ملخص لردود النجاح

| الكود | المعنى | فين كنستعملوه غالباً |
| :--- | :--- | :--- |
| 200 OK | نجاح | نتائج `GET` ، تحديثات `PUT`/`PATCH` مع body |
| 201 Created | تم الإنشاء | إنشاء `POST` ، أو إنشاء `PUT` (إلا كان مسموح) |
| 202 Accepted | بدأ المعالجة | مهام طويلة، jobs asynchrones |
| 204 No Content | نجاح بدون Body | نجاح `DELETE` ، تحديث `PUT` بلا body |

## تمرين تطبيقي

**السيناريو:** بغيتي تصاوب endpoint باش تدير "Archive" لـ playlist. الـ Archive هو عملية كتخلي الـ playlist غير نشطة (inactive) ولكن المعلومات ديالها كتبقى. بغيتي هاد العملية تكون idempotent.

1. أما Method غادي تستعمل إلا كنتي كتعامل مع "archived" كـ property ديال الـ resource؟
2. أما status code غادي ترجع إلا كانت الـ playlist أصلاً archived وما وقع حتى تغيير؟
3. إلا كانت عملية الـ archive كتدير cleanup لملفات فـ cache وكتاخد 30 ثانية، أما status code هو اللي مناسب؟

**الجواب:**
1. `PATCH` (باش تبدل `archived` لـ `true`) أو `PUT` (إلا صيفطتي الـ representation كاملة).
2. `200 OK` أو `204 No Content`. حيت الـ method idempotent، الـ *effect* هو هو (راها archived)، إذن الطلب ناجح وخا ما وقع حتى تغيير فـ هاد المرة بالضبط.
3. `202 Accepted`.

## باش تزيد تفهم

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
