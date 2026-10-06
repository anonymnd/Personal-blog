---
title: "شنو خاص الـ UPDATE Endpoint ترجع؟"
description: "دليل باش تختار الـ HTTP status codes والـ response body الصحيح ملي كتبدل شي حاجة فـ REST API."
pubDate: 2026-10-09T22:48:00.000Z
translationKey: 079-what-should-an-update-endpoint-return
locale: ar
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك ساليتي واحد الـ feature فين الـ manager كيوافق على طلب شراء (procurement request). الكود خدام والـ database تـupdata-ات، ولكن دابا وحلتي فـ return: واش ترجع الـ object اللي تبدل، ولا غير ميساج ديال success، ولا ماترجع والو؟ إلا ختاريتي غلط، تقدر تضيع الـ bandwidth ولا تفرض على الـ frontend يعاود يدير appel API آخر بلا فايدة.

## الحيرة بين 200 OK و 204 No Content
ملي كيكون الـ update ناجح، كاينين جوج خيارات مشهورين: `200 OK` و `204 No Content`. استعمل `200 OK` إلا كان الـ client محتاج يعرف الحالة الجديدة ديال الـ resource ديك الساعة. مثلاً، إلا كان السيرفر هو اللي كيزيد تاريخ التعديل (`updatedAt`) ولا كيبدل الـ status من 'Pending' لـ 'Approved'. أما `204 No Content` استعملها ملي كيكون الـ client ديجا عارف شنو تبدل وما محتاجش السيرفر يصيفط ليه الداتا عاوتاني باش يخفف على الريزو.

## الفرق بين PUT و PATCH
بجوجهم كيديرو update، ولكن المعنى ديالهم مختلف. `PUT` غالباً كيبدل الـ resource كاملة. إلا كانت الـ resource ما كايناش و الـ API كتسمح بـ creation عبر PUT، هنا كنرجعو `201 Created`. أما `PATCH` كيدير تغييرات جزئية. حيت PATCH ماشي ديما idempotent، من الأحسن ترجع الـ representation كاملة بـ `200 OK` باش تأكد شنو اللي تبدل بالضبط.

## التعامل مع الأخطاء و الـ Conflicts
ماشي ديما الـ update كيدوز. إلا كان اللي طلب التعديل ما عندوش الحق (authorization)، رجع `403 Forbidden`. وإلا كان الـ ID ما كاينش، رجع `404 Not Found`. وكاين واحد الـ code مهم بزاف هو `409 Conflict`. هذا كيكون ملي شي واحد آخر يكون بدل الـ resource فـ نفس الوقت اللي كنتي خدام عليها، باش ما تمسحش التعديلات ديالو بلا ما تعرف.

## مثال تطبيقي: الموافقة على طلب شراء
تخيل عندنا `PATCH /requests/{id}` باش نوافقو على طلب.

**الطلب (Request):**
`PATCH /requests/123` 
`{ "status": "APPROVED" }`

**الجواب (Response 200 OK):**
```json
{
  "id": 123,
  "status": "APPROVED",
  "approvedBy": "manager_01",
  "updatedAt": "2023-10-27T10:00:00Z"
}
```
النتيجة: الـ frontend كيحدث الصفحة ديك الساعة بالتاريخ اللي عطاه السيرفر.

## غلط شائع: ترجع "Success" فـ 200
بزاف ديال المطورين كيديرو `200 OK` وكيرجعو `{"message": "Updated successfully"}`. هذا غلط حيت ما كيعطي حتى معلومة تقنية على الـ resource. يا إما رجع الـ object اللي تبدل، يا إما استعمل `204 No Content`.

## تمرين تطبيقي
إلا صاوبتي `PUT` request كيبدل البروفيل ديال مستخدم، وبغيتي تقول للـ client بلي راه كلشي داز مزيان ولكن ما بغيتيش تصيفط ليه حتى شي داتا، شنو هو الـ status code اللي غتستعمل؟

**الجواب:** `204 No Content`.

## باش تزيد تفهم

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
