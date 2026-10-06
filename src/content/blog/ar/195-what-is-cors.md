---
title: "شنو هو CORS؟"
description: "شرح مبسط على CORS وكيفاش المتصفح كيتحكم في السيكوريتي ملي كيكون الـ frontend والـ backend في دومينات مختلفين."
pubDate: 2026-10-14T18:48:00.000Z
translationKey: 195-what-is-cors
locale: ar
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل معايا عندك تطبيق ديال المشتريات (procurement app)، الـ frontend خدام في `http://localhost:3000` والـ backend API في `http://localhost:8080`. كتبتي كود `fetch()` ناضي باش تصيفط طلب شراء، ولكن المتصفح حبس ليك الـ réponse وعطاك error بالحمراء فيها كلمة 'CORS'. هادشي كيوقع بسبب واحد الحاجة سميتها Same-Origin Policy، وهي سيكوريتي ك تمنع أي سكريبت من موقع باش يقرا بيانات من موقع آخر إلا إذا كان مسموح ليه.

## شنو هي الـ Origin؟
الـ Origin ك يتكون من تلاتة ديال الحوايج: الـ scheme (http ولا https)، الـ host (الدومين)، والـ port. إلا تبدلات وحدة فيهم، كتولي requête cross-origin. مثلا، `http://api.app.com` و `https://api.app.com` ماشي بحال بحال حيت الـ scheme مختلف.

## كيفاش كيخدم CORS؟
CORS هو واحد السيستيم كيخدم بـ HTTP headers باش يقول للمتصفح بلي السيرفر كيسمح لشي origin معينة باش تاخد البيانات. ملي المتصفح كيصيفط requête cross-origin، كيقلب في الـ réponse على واحد الـ header سميتو `Access-Control-Allow-Origin`. إلا لقى فيه الـ origin ديال الـ frontend أو لقى علامة `*` (wildcard)، كيخلي الـ frontend يقرا البيانات.

## الـ Preflight Requests
ملي كتكون الـ requête 'معقدة' (مثلا كتخدم بـ `PUT` أو `DELETE` أو headers ديال JSON)، المتصفح كيصيفط أولا واحد الـ requête سميتها `OPTIONS`. هادي بحال إلا كيسول السيرفر: "واش مسموح ليا نصيفط هاد الـ requête؟". السيرفر خاصو يجاوب بـ 200 OK ويحدد شنو هما الـ methods والـ origins اللي مسموح بيهم.

## مثال تطبيقي: موافقة المدير
نفترضو مدير بغا يوافق على طلب شراء من frontend في `https://manager.app`. الـ backend (Jakarta EE) خاصو يضيف هاد الـ headers:

```java
// مثال بسيط ديال filter
response.setHeader("Access-Control-Allow-Origin", "https://manager.app");
response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
response.setHeader("Access-Control-Allow-Headers", "Content-Type");
```
النتيجة: المتصفح كيشوف بلي الـ header مطابق لـ `https://manager.app` وكيخلي الـ UI تقرا تأكيد الموافقة.

## غلط شائع: خلط CORS مع الـ Auth
بزاف كيصحابلهم بلي CORS هو حيط ديال السيكوريتي كيمنع الـ requête توصل للسيرفر. في الحقيقة، CORS ك يتحكم غير في *قراءة* الـ réponse في المتصفح. الـ requête تقدر توصل للسيرفر وتبدل بيانات في الـ database وخا المتصفح يبلوكي الـ réponse. داكشي علاش ضروري دير authentication و authorization في السيرفر.

## تمرين تطبيقي
إلا كان الـ frontend ديالك في `http://localhost:3000` والسيرفر صيفط `Access-Control-Allow-Origin: http://localhost:8080` واش المتصفح غادي يخلي الـ frontend يقرا البيانات؟

**الجواب:** لا، حيت الـ origin اللي في الـ header خاصها تكون هي نفسها ديال اللي صيفط الطلب (`localhost:3000`) أو تكون `*`.


## باش تزيد تفهم

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
