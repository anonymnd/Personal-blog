---
title: "كيفاش تيستي Method DELETE"
description: "تعلم كيفاش تـvérifier logic ديال المسح (deletion) فـ REST endpoint باستعمال JUnit و Mockito بلا ما تحتاج database حقيقية."
pubDate: 2026-10-11T06:48:00.000Z
translationKey: 111-how-to-test-a-delete-method
locale: ar
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على application ديال procurement (المشتريات). كاين واحد الـ feature فين manager يقدر يمسح طلب (request) اللي باقي pending. المشكل هو أن التيست ديال هاد العملية كيبان فيه الريسك؛ ما بغيتيش تمسح data حقيقية بالغلط، وما عارفش واش الـ service عيط فعلاً لـ repository ولا غير دار راسها.

## الخطة ديال التيست
باش تيستي DELETE method، كنركزو على التفاعل (interaction) بين الـ Controller، الـ Service، والـ Repository. حيت بغينا unit test يكون سريع، كنستعملو Mockito باش نديرو simulation لـ Repository. هنا ما كنقلبوش واش السطر تمسح من disk، ولكن كنأكدو واش method `deleteById` تعيطات بالـ ID الصحيح واش الـ API رجعات status code اللي كنا كنتسناو.

## مثال تطبيقي
ها هو واحد الجزء من تيست لـ `ProcurementRequestService` باستعمال Jakarta EE و Mockito.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;

    @InjectMocks
    private ProcurementService service;

    @Test
    void testDeleteRequest_Success() {
        Long requestId = 101L;
        // كنقولو لـ Mockito بلي هاد الـ ID كاين
        when(repository.existsById(requestId)).thenReturn(true);

        service.deleteRequest(requestId);

        // كنـvérifier واش repository.deleteById تعيطات مرة وحدة
        verify(repository, times(1)).deleteById(requestId);
    }
}
```

## التعامل مع حالة 'ما لقيتوش' (Not Found)
واحد الغلط شائع هو أن الواحد كيتيستي غير الحالة اللي خدامة (happy path). فـ application حقيقية، يلا حاولتي تمسح ID ما كاينش، خاص تطلع exception. يلا ما تيستيتيش هاد الحالة، الـ API تقدر ترجع 200 OK وخا ما تمسح والو، وهذا كيغلط الـ frontend.

**التصحيح:** استعمل `when(...).thenReturn(false)` ودير الـ service call وسط `assertThrows` باش تأكد بلي `ResourceNotFoundException` تـtriggerات.

## الفرق بين Verification و Persistence
خاصك تعرف بلي `verify(repository).deleteById(id)` ما كتشوفش الـ database. هي فقط كتأكد بلي الـ Java method تعيطات. باش تيستي المسح ديال SQL بصح، خاصك integration test بـ H2 database، ولكن فـ unit testing، الـ interaction verification هي اللي خدامة.

## تمرين تطبيقي
**المهمة:** كيفاش تبدل التيست باش تأكد بلي `deleteById` ما تعيطاتش كاع (NEVER) يلا كانت `existsById` رجعات false؟

**الجواب:** استعمل `verify(repository, never()).deleteById(anyLong());` من بعد ما تعيط لـ service بـ ID ما كاينش.


## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
