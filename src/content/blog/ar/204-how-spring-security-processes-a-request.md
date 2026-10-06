---
title: "كيفاش Spring Security كايعالج الطلبات (Requests)"
description: "شرح مفصل لـ DelegatingFilterProxy و SecurityFilterChain لي كايحبسو أي طلب HTTP جاي للسيرفر."
pubDate: 2026-10-15T03:48:00.000Z
translationKey: 204-how-spring-security-processes-a-request
locale: ar
tags: ["software-engineering","security","learning-series"]
draft: false
---

تخايل معايا خدام على تطبيق ديال المشتريات (procurement app)، فين الموظف كايصيفط طلب شراء، وخاص غير المدير (manager) هو لي يقدر يوافق عليه. هنا غادي تسول راسك: كيفاش Spring Security كايعرف شكون هو هاد المستخدم قبل ما يوصل الطلب لـ @RestController؟

## الباب الأول: DelegatingFilterProxy
Spring Security ماشي جزء من Servlet container فالبداية، بل كاين وسط Spring ApplicationContext. باش يربط بيناتهم، Spring كايستعمل `DelegatingFilterProxy`. هاد الفلتر خدمتو بسيطة: كايقلب على واحد الـ bean سميتو `FilterChainProxy` وكايعطيه الطلب باش يتكلف بيه. هاد الطريقة كاتخلينا نستعملو الـ dependency injection ديال Spring وسط السيكيريتي.

## القلب ديال العملية: FilterChainProxy و SecurityFilterChain
الـ `FilterChainProxy` هو لي كايسير كلشي. هو لي كايتحكم فواحد أو بزاف ديال `SecurityFilterChain`. ملي كايجي الطلب، Spring كايشوف أما chain هي لي كاتناسب الـ URL. كل chain فيها مجموعة ديال الفلاتر مرتبين (مثلاً `UsernamePasswordAuthenticationFilter` أو `JwtAuthenticationFilter`).

## كيفاش كاتخدم: Authentication و SecurityContext
ملي الطلب كاي دوز من الفلاتر، كاين واحد الفلتر مكلف يخرج المعلومات ديال المستخدم (بحال JWT token أو session cookie). هاد المعلومات كايصيفطهم لـ `AuthenticationManager`. إلا كانت صحيحة، كايتكرى واحد الـ object سميتو `Authentication` وكايتحط فـ `SecurityContextHolder`. هاد البلاصة هي لي كاتولي المرجع ديالنا طول مدة الطلب.

## مثال تطبيقي: الموافقة على طلب شراء
تخايل طلب جاي لـ `POST /orders/approve`:
1. **مرحلة الفلتر**: الفلتر ديال JWT كايجبد التوكن، كايتأكد من السينييتور (signature) والتاريخ، وكايلقى المستخدم هو 'Manager_Ali'.
2. **مرحلة السياق**: الـ `SecurityContext` كايتعمر بـ `Authentication(principal=Manager_Ali, authorities=[ROLE_MANAGER])`.
3. **مرحلة الصلاحيات**: الـ `AuthorizationFilter` كايشوف واش المستخدم عندو `ROLE_MANAGER`. حيت عندو، الطلب كايزيد حتى كايوصل للـ Controller.

## غلط شائع: الخلط بين Authentication و Authorization
بزاف ديال الناس كايسحاب ليهم بلي مادام المستخدم authenticated (يعني داخل للحساب)، راه عنده الحق يدير أي حاجة. مثلاً، موظف عادي يقدر يكون authenticated، ولكن ما خاصوش يوصل لـ `/orders/approve`. ديما خاصك تحدد الصلاحيات (RBAC) من بعد ما تسالي عملية الـ authentication.

## تمرين تطبيقي
إلا كان الطلب داز بلا ما يدوز على `SecurityFilterChain` حيت درنا ليه `permitAll()`، واش الـ `SecurityContextHolder` غادي يكون فيه معلومات المستخدم؟

**الجواب**: لا. حيت إلا كان الطلب مسموح بيه بلا authentication، الفلاتر لي كايعمرو الـ `SecurityContext` إما ما كايخدموش أو ما كايلقاو حتى معلومة، داكشي علاش كاييبقى الـ context خاوي.

## باش تزيد تفهم

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
