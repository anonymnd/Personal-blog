---
title: "كيفاش React كيهضر مع Backend ديال Spring Boot"
description: "دليل للمبتدئين باش تربط React مع Spring Boot API باستعمال fetch و configuration ديال CORS."
pubDate: 2026-10-14T13:48:00.000Z
translationKey: 190-how-react-talks-to-a-spring-boot-backend
locale: ar
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك صاوبتي dashboard ديال procurement بـ React فين اللي باغي يشري شي حاجة كيصيفط demande. كتكليكي على 'Submit' ولكن والو ما كيوقع، حيت الداتا باقة غير فالمتصفح (browser) والخدمة ديال Java كاينة فالسيرفر. باش يواصلو بيناتهم، كنستعملو البروتوكول HTTP، وبالضبط REST API.

## كيفاش كتم العملية (Request-Response)
React خدام فالمتصفح ديال المستخدم، و Spring Boot خدام فالسيرفر. باش يتواصلو، React كيصيفط طلب (HTTP request) بحال GET ولا POST لواحد العنوان (URL) محدد. Spring Boot كيتسنى هاد الطلبات، كيدير الخدمة ديالو—مثلاً كيسجل demande فالداتابيز—وكيرجع جواب (response)، غالباً كيكون على شكل JSON. هاد JSON هو اللي كيتفاهمو عليه بجوج حيت ساهل فـ JavaScript و Java.

## مشكل CORS
فاش غتبغي تربطهم أول مرة، غالباً غتلقى واحد error سميتها 'CORS' فـ console ديال browser. هاد CORS هي واحد الحماية كيديرها المتصفح. حيت React يقدر يكون فـ `localhost:3000` و Spring Boot فـ `localhost:8080` (يعني origins مختلفين)، المتصفح كيمنع الجواب باش يحمي المستخدم. خاصك تقول لـ Spring Boot بلي راه مسموح لـ React باش يهضر معاه.

## مثال تطبيقي: صيفط demande
فـ Spring Boot، كنصاوبو controller بحال هكا:

```java
@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "http://localhost:3000")
public class ProcurementController {
    @PostMapping
    public ResponseEntity<String> createRequest(@RequestBody PurchaseRequest req) {
        return ResponseEntity.ok("Request " + req.getId() + " submitted!");
    }
}
```

وفـ React، كنستعملو `fetch` باش نصيفطو الداتا:

```javascript
const submitRequest = async (data) => {
  const response = await fetch('http://localhost:8080/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await response.text();
  console.log(result);
};
```

## غلط شائع: نسيان Content-Type
بزاف ديال الناس كينساو يزيدو `'Content-Type': 'application/json'` فـ headers ديال fetch. إلا نسيتيها، Spring Boot ما غاديش يعرف بلي الداتا اللي جاية هي JSON وما غاديش يقدر يحولها لـ Java object، وغيعطيك error `415 Unsupported Media Type`.

## تمرين تطبيقي
إلا كانت React app ديالك فـ `https://app.procure.com` و API ديالك فـ `https://api.procure.com` ، شنو خاصك تزيد فـ Spring Boot باش يخدم التواصل بيناتهم؟

**الجواب:** خاصك تستعمل `@CrossOrigin(origins = "https://app.procure.com")` فـ controller ولا تزيد configuration globale باستعمال `WebMvcConfigurer` باش تسمح لهاد origin.


## باش تزيد تفهم

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
