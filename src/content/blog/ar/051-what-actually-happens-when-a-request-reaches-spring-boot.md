---
title: "تتبع طلب Browser فـ Spring Boot"
description: "غوص عميق فـ كيفاش كيدوز HTTP request من الـ fetch ديال browser حتى لـ DispatcherServlet و conversion ديال data."
pubDate: 2026-10-07T02:48:00.000Z
translationKey: 051-what-actually-happens-when-a-request-reaches-spring-boot
seriesOrder: 11
locale: ar
tags: ["spring-architecture","learning-series"]
draft: false
---

## الرحلة من الـ Browser حتى لـ Bytes

ملي المستخدم كيخدم بـ weather dashboard، الـ browser ماشي غير "كيصيفط data"، بل كيبدا واحد السلسلة ديال أحداث network و application-layer. أجي نتبعو جوج ديال الحالات: جلب بيانات محطة (stations) و التسجيل فـ التنبيهات (subscriptions).

### 1. الـ Origin و الطريق
ملي الـ dashboard كيدير `fetch('/stations/42/readings?limit=10')` الـ browser كيصاوب HTTP GET request. هاد الطلب فيه start line (`GET /stations/42/readings?limit=10 HTTP/1.1`) و headers (بحال `Accept: application/json`) و body خاوي.

خاصك تعرف بلي الـ frontend code (React/Vue/Angular) راه خدام ديجا فـ الميموار ديال الـ browser. هو كيتحسب entity بوحدو بعيد على Spring Boot server، وخا يكونوا بجوج مجموعين فـ JAR واحد. الطلب كيمشي عبر TCP/IP لـ IP و port ديال السيرفر (غالبا 8080).

### 2. نقطة الدخول: DispatcherServlet
ملي كيوصلوا الـ bytes للسيرفر، الـ Tomcat container كيحول داك النص لـ `HttpServletRequest` object. هاد object كيمشي لـ `DispatcherServlet` اللي هو "Front Controller" ديال Spring MVC.

الـ `DispatcherServlet` ما عارفش كيفاش يتعامل مع بيانات الجو، ولكن عارف كيفاش يلقى اللي عارف. كيشوف `HandlerMapping` باش يلقى controller method اللي كاتناسب مع URL pattern و HTTP method.

### 3. ربط البيانات (Input Binding)
دابا Spring خاصو يحول HTTP request لـ Java types. هنا فين كاين الفرق بين Path, Query, و Body.

#### متغيرات المسار (`@PathVariable`)
فـ `/stations/{id}/readings` الـ `{id}` جزء من الـ URI. هو اللي كيحدد resource معينة. Spring كيجبد `42` من الـ path و كيحولها لـ type اللي محدد فـ method (مثلا `Long`).

#### بارامترات الاستعلام (`@RequestParam`)
داك الجزء ديال `?limit=10` كيتسمى query string. هادو غالبا كيتستعملو للـ filtering ولا pagination. عكس الـ path variables، هادو يقدروا يكونوا optional ولا عندهم default values. Spring كيقلب على الساروت `limit` و كيحول `10` لـ `Integer`.

#### جسم الطلب (`@RequestBody`)
فـ حالة `POST /subscriptions` الـ data ما كايناش فـ URL، بل كاينا فـ الـ body على شكل JSON string: `{"email": "user@example.com", "stationId": 42}`.

Spring كيخدم بـ `HttpMessageConverters` (غالبا Jackson) باش يدير التحويل. العملية هي:
`JSON String` → `Jackson ObjectMapper` → `Java Record/POJO`.

## مثال تطبيقي: Weather API

ها كيفاش كيكون الـ controller باش يتعامل مع هاد الميكانيزمات. استعملنا Java records للـ DTOs باش تكون data immutable.

```java
// Illustrative Controller
@RestController
@RequestMapping("/stations")
public class WeatherController {

    // GET /stations/42/readings?limit=10
    @GetMapping("/{id}/readings")
    public List<Reading> getReadings(
            @PathVariable Long id,
            @RequestParam(defaultValue = "20") int limit) {
        // Logic باش نجيبو readings ديال station 'id' بـ limit محدد
        return List.of(new Reading(22.5, "Celsius"));
    }

    // POST /subscriptions
    @PostMapping("/subscriptions")
    public SubscriptionResponse subscribe(@RequestBody SubscriptionRequest request) {
        // Logic باش نسجلو subscription
        return new SubscriptionResponse("Confirmed");
    }
}

// DTOs as records
record SubscriptionRequest(String email, Long stationId) {}
record SubscriptionResponse(String status) {}
record Reading(double value, String unit) {}
```

### تحليل المسار
1. **GET Request**: الـ `DispatcherServlet` لقى match مع `/stations/{id}/readings`. شاف `@PathVariable Long id` وجبد `42`. وشاف `@RequestParam int limit` وجبد `10`. كون ما كانتش `limit` موجودة، كان غادي يخدم بـ default value اللي هي `20`.
2. **POST Request**: الـ `DispatcherServlet` لقى match مع `/stations/subscriptions`. شاف `@RequestBody`. تأكد من `Content-Type: application/json` عيط لـ Jackson converter وصاوب `SubscriptionRequest` record بالـ email و ID اللي صيفط الـ browser.

### حالات الفشل (Failure Cases)
- **غلط فـ النوع (Type Mismatch)**: إلا صيفط الـ browser `/stations/abc/readings` الـ Spring ما يقدرش يحول `abc` لـ `Long`. هنا كيوقع `MethodArgumentTypeMismatchException` و غالبا كيرجع 400 Bad Request.
- **JSON خاسر**: إلا كان الـ body ديال POST هو `{"email": "user@example.com",` (ناقصة bracket)، الـ JSON ماشي valid. Jackson كيطلع `HttpMessageNotReadableException` و حتى هي كترجع 400.
- **بارامتر ناقص**: إلا استعملنا `@RequestParam` بلا `defaultValue` وبلا `required=false` و ما صيفطناش البارامتر فـ URL، Spring كيطلع `MissingServletRequestParameterException`.

## تمرين

**السيناريو**: بغيتي تزيد ميزة باش تفلتر الـ readings على حساب تاريخ محدد. الـ URL خاصو يكون بحال هكا: `GET /stations/{id}/readings?start=2023-01-01&end=2023-01-31`.

1. أما annotation غادي تستعمل لـ `id`؟
2. أما annotation غادي تستعمل لـ `start` و `end`؟
3. إلا نسا المستخدم ما صيفطش تاريخ النهاية (`end`)، كيفاش تضمن بلي الـ API ما يطيحش و يخدم بـ "اليوم" كـ default؟

**الجواب**:
1. `@PathVariable` حيت الـ station ID هو معرف ديال resource فـ الـ path.
2. `@RequestParam` حيت التواريخ هما غير فلاتر (filters) للنتائج.
3. تستعمل `@RequestParam(required = false)` و تعالج القيمة null فـ service layer، ولا دير default value فـ الـ annotation إلا كان الـ type كيسمح.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
