---
title: "شنو هي @ElementCollection؟"
description: "تعلم كيفاش تخدم بـ collections ديال types simples ولا embeddables في JPA بلا ما تحتاج تصاوب entity كاملة."
pubDate: 2026-10-12T12:48:00.000Z
translationKey: 141-what-is-elementcollection
locale: ar
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك كتصاوب application ديال procurement (المشتريات) فين كل `PurchaseRequest` خاص يكون عندها واحد list ديال tags (مثلا 'Urgent', 'IT-Hardware', 'Office-Supply') باش manager يقدر يفلتر الطلبات. ما بغيتيش تصاوب entity جديدة سميتها `Tag` عندها ID ديالها و lifecycle بوحدها غير باش تخزن شوية ديال strings. هنا فين كنحتاجو `@ElementCollection`.

## Collection ديال قيم تابعة للـ owner
`@ElementCollection` كتمثل قيم بسيطة بحال String ولا Integer، ولا value objects من نوع embeddable. القيمة ما عندهاش هوية ديال entity ولا repository ودورة حياة بوحدها؛ كتخص owner ديالها. فالتخزين العلائقي، غالبا كتكون فـ collection table عندها foreign key للـ owner. إلا حيدتي owner عن طريق JPA كيتحيدو حتى القيم ديالو. ولكن ماشي أي DELETE مكتوب مباشرة فـ SQL غيدير cascade بوحدو؛ هادي كتحددها constraints ديال database.
## مثال: tags ديال الطلب
الطلب عندو Set ديال tags. كنسميو table والـ column ديال owner بوضوح:

```java
@Entity
public class PurchaseRequest {
    @Id
    @GeneratedValue
    private Long id;

    @ElementCollection
    @CollectionTable(name = "request_tags",
        joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "tag_name", nullable = false)
    private Set<String> tags = new HashSet<>();
}
```

لطلب جديد فيه ثلاثة tags مختلفين، Hibernate يقدر يكتب سطر ديال الطلب وثلاثة أسطر ديال collection فوقت synchronization. ما كايناش Tag entity كتتسير بوحدها. ما تفترضش بلي annotation بوحدها كتفرض نفس primary key فكل schema؛ شوف mapping والجداول الحقيقيين. إلا tag خاصها تكون فريدة داخل الطلب، زيد constraint بحال `UNIQUE (request_id, tag_name)` فـ migration ديال database.
## تبديل قيمة ماشي update ديال entity مستقلة
String هي immutable؛ باش تبدل tag كتحيد القيمة القديمة وكتزيد الجديدة. Embeddable تقدر تكون عندها properties mutable، والتغييرات ديالها كتقدر تتسجل مع owner. ولكن ما كتوليش entity مستقلة عندها ID ديالها. رد البال إلا بدلت object وسط Set: تبديل حقول داخلة فـ equals ولا hashCode يقدر يخسر collection. بدل القيمة كاملة ولا استعمل value objects immutable إلا كان هاد الاختيار مناسب.
## تمرين تطبيقي
**السيناريو:** بغيتي تزيد list ديال `PhoneNumber` (لي هي `@Embeddable` فيها `countryCode` و `number`) لـ entity سميتها `Supplier`.

**السؤال:** شنو هي الـ annotation اللي خاصك دير فوق field ديال `List<PhoneNumber>` في class `Supplier`؟

**الجواب:** `@ElementCollection`.

## باش تزيد تفهم

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
