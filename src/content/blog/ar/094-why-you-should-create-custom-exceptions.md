---
title: "كيفاش ترد الـ Domain Exceptions لـ API Error Contract مستقر"
description: "كيفاش تفرق بين المشاكل ديال الـ business والرد ديال الـ API باستعمال ProblemDetail و RestControllerAdvice."
pubDate: 2026-10-07T11:48:00.000Z
translationKey: 094-why-you-should-create-custom-exceptions
seriesOrder: 20
locale: ar
tags: ["validation-errors","learning-series"]
draft: false
---

## مشكل الحدود (The Boundary Problem)

فاش كنكونو خدامين بسيستيم معقد، الـ domain layer ما خاصهاش تعرف والو على HTTP. مثلا، إلا كان عندنا service ديال تتبع الطرود (delivery tracking) وما لقاش الطرد، الـ domain خاصو يلوح `ParcelNotFoundException` ماشي `ResponseStatusException` فيها كود 404. إلا خلطنا هادشي، كنوليو نخرجو تفاصيل ديال الـ infrastructure وسط الـ business logic، وهادشي كيخلي الـ domain ما صالحش يتخدم فبلايص أخرى بحال CLI ولا message queue.

الحل هو نديرو حدود واضحة. الـ domain كيصيفط exceptions محددة، وواحد الـ interceptor global هو اللي كيشدهم وكيرجعهم على شكل API contract مستقر. هاد الطريقة كتضمن بلي الـ stack traces وتفاصيل الـ database ما يوصلوش للي كيخدم بالـ API، وفي نفس الوقت كياخد رد منظم.

## تصميم مشاكل الـ Domain

فالحالة ديال تتبع الطرود، كنفرقو بين حاجة ما كايناش (missing resource) وبين شي service خارجية طايحة (dependency failure).

1. **ParcelNotFoundException**: مشكل ديال business كيعني بلي الرقم ديال التتبع صحيح ولكن الطرد ما كاينش فالسيسيتيم.
2. **CarrierIntegrationException**: مشكل كيوقع فاش الـ API ديال شركة الشحن (carrier) كتكون طايحة ولا فيها timeout.

```java
// Illustrative: Domain Exceptions
public class ParcelNotFoundException extends RuntimeException {
    private final String trackingNumber;
    public ParcelNotFoundException(String trackingNumber) {
        super("Parcel " + trackingNumber + " not found");
        this.trackingNumber = trackingNumber;
    }
    public String getTrackingNumber() { return trackingNumber; }
}

public class CarrierIntegrationException extends RuntimeException {
    private final String carrierCode;
    public CarrierIntegrationException(String carrierCode, Throwable cause) {
        super("Carrier " + carrierCode + " is currently unavailable", cause);
        this.carrierCode = carrierCode;
    }
    public String getCarrierCode() { return carrierCode; }
}
```

## تطبيق طبقة الترجمة (Translation Layer)
ترجم مشاكل domain فـ HTTP boundary بـ @RestControllerAdvice وProblemDetail ديال Spring Framework. Snippets لتحت كيبينو mappings مختارين، ماشي كاع مشاكل security ولا infrastructure.

### الـ Global Exception Handler

```java
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestControllerAdvice
public class GlobalErrorHandler extends ResponseEntityExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalErrorHandler.class);

    @ExceptionHandler(ParcelNotFoundException.class)
    public ProblemDetail handleParcelNotFound(ParcelNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Parcel Not Found");
        problem.setProperty("trackingNumber", ex.getTrackingNumber());
        problem.setProperty("errorCode", "ERR_PARCEL_001");
        return problem;
    }

    @ExceptionHandler(CarrierIntegrationException.class)
    public ProblemDetail handleCarrierFailure(CarrierIntegrationException ex) {
        // كنلوكي الـ stack trace كامل داخليا باش نعرفو المشكل، ولكن ما كنصيفطوهش للي كيخدم بالـ API
        log.error("External carrier failure: {}", ex.getCarrierCode(), ex);
        
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.SERVICE_UNAVAILABLE, "The delivery carrier is temporarily unavailable");
        problem.setTitle("Carrier Integration Error");
        problem.setProperty("carrier", ex.getCarrierCode());
        problem.setProperty("errorCode", "ERR_CARRIER_503");
        return problem;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGenericError(Exception ex) {
        log.error("Unhandled system error", ex);
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
        problem.setTitle("Internal Server Error");
        return problem;
    }
}
```

## تحليل الميكانيزم

### الـ Logging الآمن مقابل الـ Exposure
فالـ handler ديال `CarrierIntegrationException` كاين واحد البلان مهم: `log.error(..., ex)` كتخلي الـ developers يشوفو كاع التفاصيل، ولكن `ProblemDetail` لي كيرجع للـ client فيه ميساج نقي. إلا صيفطنا الـ `Throwable` cause كيفما هي، نقدروا نسربو versions ديال libraries ولا IPs ديال السيرفورات ولا سميات ديال tables فـ database.

### عقد الـ ProblemDetail
فاش كنرجعو `ProblemDetail` الرد ديال الـ API كيولي ديما بحال بحال:
- **Type**: رابط (URI) كيشرح نوع الخطأ.
- **Title**: ملخص قصير ومفهوم.
- **Status**: كود HTTP.
- **Detail**: شرح مفصل لهاد الحالة بالضبط.
- **Custom Properties**: بحال `errorCode` لي كتخلي الـ frontend يدير logic خاص (مثلا: يبين بوطون "إعادة المحاولة" إلا كان مشكل ديال carrier، ولكن يبين "بحث مرة أخرى" إلا كان الطرد ما كاينش).

## حالات الفشل (Failure Cases)

فـ controller advice وحدة، ترتيب declarations ما كيخليش generic handler يغطي specific handler. إلا عندك بزاف advice، راجع order وmatching ديال root exception ولا cause. ResponseEntityExceptionHandler كتغطي MVC errors؛ مشاكل security filters يقدرو يحتاجو entry points ولا access-denied handlers بوحدهم.

ProblemDetail API ديال Spring Framework، ماشي Jakarta EE. Documentation الحالية كتتبع RFC 9457 اللي عوضات RFC 7807. استعمل type URI ثابتة وerror code إلا مفيد، وما تعرض غير fields اللي مسموحين للطالب.
## تمرين تطبيقي

**السيناريو**: خاصك تزيد `DeliveryDateInvalidException` فاش شي واحد يطلب تتبع طرد بتاريخ فالمستقبل. هادا خطأ ديال business rule.

**المطلوب**:
1. صاوب الـ exception class.
2. زيد handler فـ `GlobalErrorHandler` يرجع status `422 Unprocessable Entity`.
3. زيد property سميتها `requestedDate` فـ الرد.

**الجواب**:
```java
public class DeliveryDateInvalidException extends RuntimeException {
    private final String requestedDate;
    public DeliveryDateInvalidException(String date) {
        super("Delivery date cannot be in the future: " + date);
        this.requestedDate = date;
    }
    public String getRequestedDate() { return requestedDate; }
}

// وسط GlobalErrorHandler
@ExceptionHandler(DeliveryDateInvalidException.class)
public ProblemDetail handleInvalidDate(DeliveryDateInvalidException ex) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(
        HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
    problem.setTitle("Invalid Delivery Date");
    problem.setProperty("requestedDate", ex.getRequestedDate());
    problem.setProperty("errorCode", "ERR_DATE_422");
    return problem;
}
```

## باش تزيد تفهم

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
