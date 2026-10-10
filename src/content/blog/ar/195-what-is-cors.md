---
title: "فهم الـ Origins و CORS وكيفاش كيتحكم المتصفح في الوصول"
description: "شرح مفصل على Same-Origin Policy، كيفاش كيخدم الـ preflight، والفرق الكبير بين CORS والـ authentication."
pubDate: 2026-10-08T09:48:00.000Z
translationKey: 195-what-is-cors
seriesOrder: 42
locale: ar
tags: ["web-communication","learning-series"]
draft: false
---

## شنو هي الـ Origin؟

السيكوريتي في المتصفح (browser) كتبدا بـ Same-Origin Policy (SOP). الـ "origin" ماشي غير الدومين، بل هي مجموعة (tuple) فيها تلاتة ديال الحوايج: **البروتوكول (Scheme)، الهوست (Host)، والـ Port**. إلا كان شي واحد فيهم مختلف، المتصفح كيعتبر الطلب cross-origin.

نشوفو المثال ديالنا: واحد الـ dashboard خدام في `http://localhost:3000` وبغا يعيط لـ backend في `http://localhost:8080`.

*   **البروتوكول:** `http` == `http` (متطابقين)
*   **الهوست:** `localhost` == `localhost` (متطابقين)
*   **الـ Port:** `3000` != `8080` (مختلفين)

حيت الـ ports مختلفين، هادو كيتعبروا origins مختلفين. نفس الشيء كيوقع مع الـ subdomains: `dashboard.example.com` و `api.example.com` كيتعبروا origins مختلفين حيت الهوست ماشي هو هو.

## SOP مقابل CORS: سياسة القراءة

بزاف كيغلطو وكيصحاب ليهم بلي SOP كتمنع *إرسال* الطلبات. في الحقيقة، SOP كتمنع أساساً *قراءة* الجواب (response). في بزاف ديال الحالات، المتصفح كيصيفط الداتا للسيرفر، والسيرفر كيجاوب، ولكن المتصفح كيمنع الكود ديال JavaScript باش يقرا داك الجواب، إلا إذا كان السيرفر عاطي الإذن صراحة عن طريق Cross-Origin Resource Sharing (CORS).

## الطلبات البسيطة (Simple) والـ Preflight

ماشي كاع الطلبات cross-origin كيتعاملو بنفس الطريقة. المتصفح كيقسمهم لـ "Simple" و "Preflighted".

### الطلبات البسيطة (Simple Requests)
الطلبات اللي كتخدم بـ `GET` أو `POST` أو `HEAD` ومعاها headers عادية (بحال `Accept` أو `Content-Type: application/x-www-form-urlencoded`) كيتصيفطو مباشرة. المتصفح كيشوف الـ header ديال `Access-Control-Allow-Origin` في الجواب. إلا مالقاش فيه الـ origin اللي صيفطت الطلب، كيطلع error ديال CORS وكيخبي الجواب على الكود.

### طلبات الـ Preflight (OPTIONS)
إلا كان الطلب كيخدم بـ `PUT` أو `DELETE` أو كان فيه header بحال `Content-Type: application/json` المتصفح كيصيفط أولاً طلب `OPTIONS`. هادشي هو اللي كنسميوه "Preflight". بحال إلا كيقول للسيرفر: "راني ناوي نصيفط طلب PUT فيه JSON، واش مسموح لي؟"

إلا جاوب السيرفر بـ `200 OK` وعطاه الـ `Access-Control-Allow-Methods` و `Access-Control-Allow-Headers` المناسبين، عاد المتصفح كيصيفط الطلب الحقيقي.

## الـ Credentials وفخ الـ Wildcard

للـ cross-origin cookies، client كتحتاج credentials: include ولا withCredentials، وresponse خاصها Access-Control-Allow-Credentials: true وorigin صريحة مسموحة بلا *. Domain وSameSite وbrowser policies يقدرو يبقاو يمنعو cookies.

Authorization header اللي كتزيدها يدويا حالة أخرى: صيفطها بوضوح وسمح ليها فـ preflight headers؛ credentials: include ماشي ضرورية غير باش تصيفط هاد header. ما تخلطش bearer token مع cookies. Reflecting أي Origin عشوائيا كتفسد allowlist.
## مثال تطبيقي: تحليل المشكل (Diagnosis)

Dashboard كتبعث JSON POST مع cookies. Preflight فيها Origin وAccess-Control-Request-Method: POST وAccess-Control-Request-Headers: content-type. خاص permissions مناسبة للـ origin وcredentials وheaders. نقص Allow-Headers: content-type كيحبس JSON request. POST نفسها safelisted، يعني غير غياب Allow-Methods ماشي مثال صحيح ديال failure هنا.

Actual response حتى هي خاصها explicit origin وcredential permission. Allow-Origin: * مع include كيخلي response ما تتقراش. Preflight بـ204 تقدر تنجح؛ ماشي غير 200.
## CORS ماشي هي السيكوريتي

الـ CORS هي ميكانيزم كيديرو المتصفح باش يحمي الداتا ديال المستخدم من سكريبتات خايبة في tabs خرين. ولكن CORS **ماشي** بديل لـ:
*   **Authentication:** CORS ما كتعرفش شكون هو المستخدم.
*   **Authorization:** CORS ما كتشوفش واش المستخدم عندو الحق يمسح شي حاجة.
*   **CSRF Protection:** حيت الطلبات البسيطة (simple requests) كيتصيفطو *قبل* ما يتشيكا الـ CORS، يعني شي موقع خايب يقدر يدير CSRF attack ويصيفط POST request تبدل الداتا، وخا ما يقدرش يقرا الجواب.

## تمرين

**السؤال:** عندك بيئة production فيها frontend في `https://app.example.com` و API في `https://api.example.com`. الـ frontend كيصيفط طلب `DELETE` مع header خاص سميتو `X-Request-ID` ومعاه cookies ديال session. شنو هما الـ headers اللي خاص السيرفر يرجعهم في الـ preflight وفي الجواب الحقيقي باش يخدم هادشي؟

**الجواب:**
1.  **في الـ Preflight (OPTIONS):**
    *   `Access-Control-Allow-Origin: https://app.example.com`
    *   `Access-Control-Allow-Methods: DELETE`
    *   `Access-Control-Allow-Headers: X-Request-ID`
    *   `Access-Control-Allow-Credentials: true`
2.  **في الجواب الحقيقي (DELETE):**
    *   `Access-Control-Allow-Origin: https://app.example.com`
    *   `Access-Control-Allow-Credentials: true`

## باش تزيد تفهم

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
