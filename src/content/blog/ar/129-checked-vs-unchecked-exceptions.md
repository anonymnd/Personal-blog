---
title: "الفرق بين Checked و Unchecked Exceptions"
description: "تعلم كيفاش تختار بين checked و unchecked exceptions باش تصاوب تطبيقات Java صحيحة ومكتقطعش."
pubDate: 2026-10-12T00:48:00.000Z
translationKey: 129-checked-vs-unchecked-exceptions
locale: ar
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك خدام على application ديال procurement (المشتريات) فين الموظف كيصيفط طلب شراء. كتبتي واحد la méthode باش تسجل هاد الطلب فشي fichier. فجأة، الـ compiler كيفرض عليك دير try-catch ولا تزيد 'throws'، واخا تكون عارف بلي الملف كاين. هنا فين كاين الفرق بين checked و unchecked exceptions.

## شنو كتعني checked بالضبط؟
Checked exception كتكون من Exception ولكن ماشي من فرع RuntimeException. ملي كتعيط لـ method تقدر ترميها، Java كيفرض عليك تشدها بـ catch ولا تصرح بها فـ throws ديالك. هادشي كيراقب التزام ديال API فوقت compilation، ماشي واش الخطأ غيوقع ولا واش تقدر تصلحو. IOException مثال معروف. Throws غير كيدوز الالتزام للي عيط عليك؛ ما كيعالجش الخطأ وما كيقرر حتى رسالة ديال UI.
## Unchecked ما كتعنيش مستحيل تعالج الخطأ
RuntimeException وError والفروع ديالهم unchecked: compiler ما كيفرضش catch ولا throws. NullPointerException غالبا كتدل على bug، ولكن رفض ديال قاعدة métier ولا مشكل مؤقت فـ infrastructure حتى هو يقدر يكون RuntimeException. التطبيق يقدر يعالج هاد الحالات فـ boundary مناسبة. Error غالبا كيعني مشاكل خطيرة فـ runtime وماشي حاجة خاص كود الخدمة يحاول يغطي عليها كلها. واش تقدر تعالج الخطأ وواش هو checked راه جوج اختيارات ماشي نفس المعنى.
## مثال: اختيار واضح ديال API
هاد service التوضيحية اختارت checked exception إلا كانت infrastructure ما خداماش، وunchecked exception إلا كان argument ما صالحش. API أخرى تقدر تختار unchecked حتى لمشاكل infrastructure؛ Java ما كيفرضش هاد المعنى ديال الخدمة.

```java
class ServiceUnavailableException extends Exception {
    ServiceUnavailableException(String message) { super(message); }
}

class ApprovalService {
    void approve(long requestId, boolean available)
            throws ServiceUnavailableException {
        if (!available) {
            throw new ServiceUnavailableException("Service unavailable");
        }
        if (requestId <= 0) {
            throw new IllegalArgumentException("Invalid request ID");
        }
    }
}
```

اللي عيط على method خاصو يشد ServiceUnavailableException ولا يصرح بها. من بعد، controller ولا boundary أخرى تقدر تحول الخطأ لرد مناسب. هاد القرار مختلف على شجرة exceptions.
## غلط شائع: Catch لكلشي
بزاف ديال الناس كيديرو `catch (Exception e)` باش يسكتو الأخطاء. هادشي كيغطي على unchecked exceptions بحال `NullPointerException` وكيخلي الـ debugging صعيب بزاف حيت البرنامج كيوقف بلا ما تعرف علاش.

**التصحيح:** ديما دير catch لأصغر وأدق Exception ممكنة. بلاصة `catch (Exception e)`، دير مثلاً `catch (IOException e)`.

## تمرين تطبيقي
واش خطأ ديال الصلاحيات كنتي متوقعو خاصو ضروري يكون checked exception؟

**الجواب:** لا. اختار سياسة موحدة ديال exceptions وعالجها فـ boundary المناسبة. إلا كانت authentication ناقصة تقدر ترجع 401؛ وإلا المستخدم معروف ولكن ما عندوش الحق تقدر ترجع 403. هاد status codes ما كيفرضوش واش Java exception تكون checked ولا unchecked.


## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
