---
title: "شنو كيوقع ملي كنكليكي على شي بوطون فـ Application Web؟"
description: "شرح مبسط للمسار اللي كتمشي فيه المعلومة من المتصفح للسيرفر وترجع."
pubDate: 2026-10-14T16:48:00.000Z
translationKey: 193-what-happens-when-you-click-a-button-in-a-web-application
locale: ar
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك خدام فـ application ديال الشرا (procurement). عمرتي الطلب ديالك باش تشري PC جديد، ودابا وركتي على بوطون 'Submit Request'. بان ليك داك السينيال ديال chargement كيدور. ولكن شنو واقع لداخل فـ هاد الثواني القليلة؟

## كيفاش كيبدا كلشي (Event Trigger)
ملي كتكليكي، المتصفح (browser) كيعيق بلي وقع 'click event'. فـ الكود ديال frontend (JavaScript)، كاين واحد الـ listener كيتسنى هاد الحركة. فـ بلاصة ما تعاود الصفحة كاملة تـ charger، الـ apps ديال دابا كيصيفطو طلب API (بـ `fetch` ولا `axios`) بلا ما يحبسو الصفحة. المتصفح كيجمع المعلومات فـ واحد الـ HTTP packet فيه النوع ديال الطلب (غالباً POST)، العنوان (URL)، والمعلومات ديال الـ PC على شكل JSON.

## الطريق ديال الـ Network و الـ CORS
قبل ما يخرج الطلب، المتصفح كيشوف الـ 'Origin' (يعني scheme, host, و port). إلا كان الـ API فـ دومين مختلف على السيت، المتصفح كيطبق واحد القاعدة سميتها CORS. خاصك تعرف بلي CORS ماشي سيكيريتي كتمنع الطلب يوصل للسيرفر، ولكن هي قاعدة كتمنع الـ JavaScript ديالك يقرا الجواب إلا كان السيرفر ما عطاش الإذن.

## شنو كيوقع فـ السيرفر (Server-Side)
ملي كيوصل الطلب للسيرفر، واحد الـ controller كيتكلف بيه. إلا كنا خدامين بـ Java Jakarta EE، الكود كيكون بحال هكا:

```java
@POST
@Path("/requests")
public Response submitRequest(ProcurementRequest request) {
    // Logic: واش كاين الميزانية؟
    boolean approved = budgetService.verify(request.getAmount());
    return Response.ok(new ResponseDto("Submitted", approved)).build();
}
```
السيرفر كيشوف واش الطلب صحيح، كيسجل المعلومات فـ la base de données، وكيرجع جواب HTTP (مثلاً `201 Created` إلا داز كلشي مزيان).

## التحديث ديال الصفحة
المتصفح كيوصلو الجواب، والـ JavaScript كيحيد داك السينيال ديال chargement وكيطلع ليك ميساج بلي الطلب تصيفط بنجاح.

## غلط شائع: كيسحاب ليهم CORS هي السيكيريتي
بزاف كيغلطو وكيصحاب ليهم بلي CORS هي اللي كتحمي السيرفر من الـ hackers. فـ الحقيقة، CORS كتحمي غير المستعمل ديال المتصفح. أي واحد عندو terminal (بحال curl) يقدر يصيفط طلبات بلا ما يتسوق لـ CORS. داكشي علاش ضروري دير authorization فـ السيرفر لداخل.

## تمرين تطبيقي
إلا وركتي على بوطون وصيفط طلب لـ `api.company.com` من سيت `app.company.com` وطلعات ليك 'CORS error' فـ console، واش السيرفر وصلو الطلب؟

**الجواب:** آه، الطلب غالباً كيوصل للسيرفر، ولكن المتصفح هو اللي مابغاش يخلي الـ frontend يقرا الجواب حيت السيرفر ما صيفطش الإذن (headers) المناسب.


## باش تزيد تفهم

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
