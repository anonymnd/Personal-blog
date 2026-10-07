---
title: "التعامل مع Transactions ديال Database و Spring Transaction Boundaries"
description: "شرح عميق لـ ACID، كيفاش كيخدم @Transactional proxy، الـ propagation، والحدود ديال الـ rollback."
pubDate: 2026-10-08T01:48:00.000Z
translationKey: 149-what-is-a-database-transaction
seriesOrder: 34
locale: ar
tags: ["persistence","learning-series"]
draft: false
---

## الـ ACID والـ Database

الـ Transaction فـ database هي واحد المجموعة ديال العمليات اللي خاصها تدار كاملة ولا ماتدارش كاع، باش نحافظو على سلامة البيانات (Data Integrity). فـ PostgreSQL مع Hibernate، الـ transaction كتضمن لينا مثلاً يلا كنا كنصيفطو reward credits من الحساب A للحساب B، مانهبطوش الفلوس من A وميوصلوش لـ B.

*   **Atomicity**: يا إما كاع العمليات كيدوزو، يا إما حتى وحدة مادوز.
*   **Consistency**: الـ database كتمشي من حالة صحيحة لحالة صحيحة أخرى، مع احترام كاع الـ constraints.
*   **Isolation**: الـ transactions اللي خدامين فدقة وحدة مكيشوفوش التغييرات ديال بعضياتهم حتى تسالي العملية.
*   **Durability**: ملي كيدار الـ commit، البيانات كتبقى محفوظة وخا يوقع مشكل فـ system.

## كيفاش كيخدم @Transactional فـ Spring

Spring كيخدم بـ AOP (Aspect-Oriented Programming) proxies. ملي كدير `@Transactional` لشي method، Spring كيصاوب واحد الـ proxy wrapper داير بالـ bean. هاد الـ proxy هو اللي كيintercepter l'appel، كيحل transaction عن طريق `PlatformTransactionManager` ، كينفذ الـ method، وفالاخير كيقرر واش يدير commit ولا rollback على حساب شنو وقع.

### المشكل ديال Self-Invocation

حيت Spring كيخدم بالـ proxies، هاد الـ interception كتوقع غير يلا كان l'appel جاي من *برا* الـ bean. يلا كانت `methodA()` كتعيط لـ `methodB()` فـ نفس الـ class، هاد العيطة كتدوز نيشان لـ method المحلية وكتـbypass-ي الـ proxy. يعني أي `@Transactional` دايرها فـ `methodB()` غادي يتجاهلها Spring.

### الـ Propagation والـ Joining

الـ Propagation هي اللي كتحكم كيفاش كيتعامل Spring مع الـ transactions ملي تكون method transactional كتعيط لـ method وحدة أخرى. الـ default هو `REQUIRED` ، ومعناها: يلا كانت ديجا كاين transaction، دخل معاها؛ يلا مكانتش، صاوب وحدة جديدة. هادشي كيخلي بزاف ديال الـ services يخدمو فـ وحدة atomique وحدة.

## مثال تطبيقي: تحويل الـ Reward Credits

تخيل عندنا scenario فين كنحولو credits ونصيفطو email receipt.

```java
@Service
public class RewardService {

    private final AccountRepository accountRepository;
    private final EmailService emailService;

    public RewardService(AccountRepository accountRepository, EmailService emailService) {
        this.accountRepository = accountRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void transferCredits(Long fromId, Long toId, Integer amount) {
        Account from = accountRepository.findById(fromId)
            .orElseThrow(() -> new IllegalArgumentException("Source not found"));
        Account to = accountRepository.findById(toId)
            .orElseThrow(() -> new IllegalArgumentException("Target not found"));

        from.setCredits(from.getCredits() - amount);
        to.setCredits(to.getCredits() + amount);

        // هاد العيطة داخلية (self-invocation)
        this.sendNotification(fromId, toId, amount);

        if (amount > 1000) {
            throw new RuntimeException("Limit exceeded");
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendNotification(Long from, Long to, Integer amount) {
        emailService.send("Credits transferred: " + amount);
    }
}
```

### تحليل شنو وقع (Execution Trace)

1.  **الـ Proxy Call**: شي controller من برا كيعيط لـ `transferCredits()`. الـ proxy كيحل transaction.
2.  **الـ Self-Invocation**: الـ method `transferCredits()` كتعيط لـ `sendNotification()`. حيت هادي عيطة داخلية، الـ `REQUIRES_NEW` **كتجاهل**. الـ notification كتخدم وسط الـ transaction اللي ديجا محلولة.
3.  **الـ Side Effect**: الـ `emailService.send()` كتخدم. هادي عيطة لـ API خارجي (SMTP/HTTP).
4.  **الـ Failure**: كيوقع `RuntimeException` حيت الـ amount فات 1000.
5.  **الـ Rollback**: Spring كيشد الـ unchecked exception وكيقول لـ PostgreSQL يدير rollback. الـ credits فـ DB كيرجعو كيف كانوا.
6.  **الـ Leak**: الـ email ديجا تصيفط. الـ database transactions **مقدرش** يرجعو (undo) شي حاجة وقعات برا الـ DB. المستخدم غيوصلو reçu ديال تحويل اللي فالحقيقة ماتدارش.

## الـ Rollback Defaults

بـ default، Spring كيدير rollback غير فـ `RuntimeException` و `Error` (unchecked exceptions). مكيديرش rollback فـ الـ checked exceptions (بحال `IOException`) إلا يلا حددتيها نتا فـ `@Transactional(rollbackFor = Exception.class)`.

## تمرين

**Scenario**: عندك method سميتها `processOrder()` داير ليها `@Transactional`. لداخل ديالها، كتعيط لـ `updateInventory()` اللي حتى هي `@Transactional(propagation = Propagation.REQUIRED)`. الـ `updateInventory()` كتلوح checked exception سميتها `InsufficientStockException`.

1. واش الـ transaction غيدار ليها rollback بـ default؟
2. يلا كانت `processOrder()` كتعيط لـ `updateInventory()` عن طريق `this.updateInventory()`, واش الـ propagation setting غيكون عندو شي تأثير؟

**الجواب**:
1. لا. الـ checked exceptions مكيديروش rollback بـ default فـ Spring.
2. لا. الـ self-invocation كتـbypass-ي الـ proxy، يعني الـ method كتنفذ كـ Java method عادية وسط الـ transaction اللي بداتها `processOrder()`.

## باش تزيد تفهم

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
