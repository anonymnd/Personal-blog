---
title: "شنو هو الـ Security Filter؟"
description: "شرح كيفاش الـ security filters كيوقفو الطلبات باش يحميو البيانات ديال التطبيق قبل ما توصل للـ business logic."
pubDate: 2026-10-15T04:48:00.000Z
translationKey: 205-what-is-a-security-filter
locale: ar
tags: ["software-engineering","security","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال المشتريات (procurement app)، فين الموظف كيصيفط طلب شراء، ولكن غير المدير (manager) اللي عندو الحق يوافق عليه. إلا بقيتي كتحقق من الدور (role) ديال المستخدم في كل ميثود وسط الـ service layer، الكود ديالك غادي يولي عامر تكرار ومخربق. هنا فين كيجي الدور ديال الـ Security Filter.

## كيفاش كيخدم هاد الـ Mechanism
الـ security filter هو واحد المكون كيكون واقف بين الطلب (request) اللي جاي من عند الكليان وبين المورد (resource) اللي كاين في السيرفر. كيخدم بنظام "السلسلة" (chain). ملي كتوصل طلب HTTP، خاصو يدوز من بزاف ديال الفلترات. الـ security filter كيوقف الطلب، كيقلب في الـ headers ولا الـ session، وكيقرر واش يخليه يدوز للـ controller ولا يبلوكيها بـ 401 Unauthorized ولا 403 Forbidden.

## التطبيق ديالو في الواقع
في Java باستعمال Jakarta EE ولا Spring Security، هاد الفلتر كيكون عبارة عن class كطبق واحد الـ interface. كيشوف واش كاين شي token بحال JWT. الفلتر ما كيديرش غير decode للـ token، بل خاصو يتأكد من السينيياتور (signature)، شكون صيفطو (issuer)، واش مازال صالح (expiration) عاد يتيق في المعلومات اللي لداخل.

## مثال تطبيقي: الموافقة على الطلب
تخيل طلب صيفطناه لـ `/api/procurement/approve`. الـ security filter غادي يوقفو هنا:

```java
// مثال بسيط على كيفاش كيخدم الفلتر
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
    String token = ((HttpServletRequest) request).getHeader("Authorization");
    if (token != null && jwtProvider.validateToken(token)) {
        Claims claims = jwtProvider.getClaims(token);
        if ("MANAGER".equals(claims.get("role"))) {
            chain.doFilter(request, response); // دوز الطلب للـ controller
            return;
        }
    }
    ((HttpServletResponse) response).sendError(HttpServletResponse.SC_FORBIDDEN);
}
```
النتيجة: إلا حاول شي واحد عندو دور 'REQUESTER' يدخل لهاد الصفحة، الفلتر غادي يحبسوا قبل ما يوصل أصلاً للـ business logic.

## غلط شائع: تيق في الـ Decoded Data
بزاف ديال المطورين كيغلطو ملي كيديرو decode للـ JWT باش يشوفو الـ role بلا ما يتأكدو من الـ signature cryptographique. إلا تقتي في المعلومات بلا verification، أي واحد يقدر يبدل الـ role ديالو لـ 'ADMIN' في الـ base64 ويقدر يدخل لأي بلاصة بغا.

## تمرين تطبيقي
سيناريو: عندك فلتر كيقلب على cookie ديال session. إلا ما كانتش، كيصيفط المستخدم لـ `/login`. إلا كانت ولكن سالات الصلاحية ديالها (expired)، شنو خاص الفلتر يدير؟

الجواب: الفلتر خاصو يمسح هاديك الـ cookie اللي سالات، ويصيفط المستخدم لصفحة الـ login بـ status 401، باش يضمن أن الطلب ما يوصلش للمعلومات المحمية.

## باش تزيد تفهم

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
