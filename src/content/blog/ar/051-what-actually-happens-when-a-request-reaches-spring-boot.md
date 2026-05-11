---
title: "شن كيوقع بالضبط ملي كتوصل Request لـ Spring Boot؟"
description: "شرح مفصل للمسار ديال HTTP request من السيرفر حتى كيوصل للـ controller ديالك عبر DispatcherServlet."
pubDate: 2026-10-08T18:48:00.000Z
translationKey: 051-what-actually-happens-when-a-request-reaches-spring-boot
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل صاوبتي application ديال الشراء (procurement app) فين الموظف كيصيفط طلب شراء. ملي كتكليكي على 'Submit'، واش عارف كيفاش داك الـ HTTP packet كيتحول لـ Java object وسط `@RestController`؟ بزاف ديال الناس كيسحاب ليهم Spring Boot غير سحر، ولكن هو في الحقيقة عبارة عن pipeline منظم.

## نقطة الدخول: Embedded Servlet Container
ملي كتوصل request، أول حاجة كتقيس هي السيرفر اللي داخل مع Spring (غالباً Tomcat). Tomcat ما كيعرفش الـ beans ديال Spring، كيعرف غير الـ Servlets. داكشي علاش كيصيفط request لـ `DispatcherServlet` اللي هو 'Front Controller' ديال Spring MVC كامل، وهو اللي كينظم كلشي.

## Handler Mapping والـ Controller
ملي `DispatcherServlet` كيشد request، كيسول `HandlerMapping` باش يعرف فين خاصها تمشي. كيشوف الـ URL (مثلاً `/requests/submit`) والـ method (POST) باش يلقى الـ method اللي عندها `@PostMapping` في الـ controller. ملي كيلقاها، كيخدم بـ `HandlerAdapter` باش يعيط لهاديك الـ method.

## تحويل البيانات بـ Jackson
قبل ما تخدم الـ method ديال الـ controller، Spring خاصو يحول الـ JSON اللي جاي في الـ body لـ Java object. هنا فين كيخدمو `HttpMessageConverters`. Spring Boot كيخدم بـ Jackson باش يربط الحقول ديال JSON مع Java Record أو POJO.

```java
// مثال بسيط ديال DTO ديال طلب الشراء
public record PurchaseRequest(String item, int quantity, double price) {}

@PostMapping("/requests/submit")
public ResponseEntity<String> submit(@RequestBody PurchaseRequest request) {
    return ResponseEntity.ok("Request received for " + request.item());
}
```

## طريق الرجوع
ملي كتسالي الـ logic ديالك، النتيجة كترجع لـ `HandlerAdapter`. إلا رجعتي `ResponseEntity` أو POJO، الـ `HttpMessageConverter` كيخدم بالعكس، كيرجع الـ Java object لـ JSON باش يتصيفط في الـ HTTP response.

## غلط شائع: الفرق بين Filter و Interceptor
بزاف كيغلطو وكيديرو logic ديال business في `Filter` وهي خاصها تكون في `HandlerInterceptor`. الـ Filters تابعين لـ Servlet container وكيخدمو قبل ما توصل request لـ `DispatcherServlet`. أما الـ Interceptors كيكونوا تابعين لـ Spring وعندهم access للـ controller اللي غادي يخدم.

## تمرين تطبيقي
إلا وصلت request للسيرفر ولكن عطات 404 قبل ما توصل للـ controller، شكون هو الـ component اللي مالقاش match؟

**الجواب:** الـ `HandlerMapping` هو اللي مالقاش شي method في الـ controller كتناسب مع الـ URL والـ HTTP method.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
