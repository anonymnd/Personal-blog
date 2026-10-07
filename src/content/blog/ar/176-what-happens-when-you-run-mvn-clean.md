---
title: "فهم Maven Lifecycle و Build Artifacts"
description: "شرح مفصل على مراحل Maven، الدوسي target، والفرق بين تقارير tests unitaires و integration tests."
pubDate: 2026-10-08T07:48:00.000Z
translationKey: 176-what-happens-when-you-run-mvn-clean
seriesOrder: 40
locale: ar
tags: ["maven-debugging","learning-series"]
draft: false
---

## كيفاش خدام Maven Lifecycle

mvn package كتدوز default lifecycle حتى package وكتنفذ goals المرتبطين حسب packaging وconfiguration. validate → compile → test → package رسم مبسط ناقص phases بيناتهم. Tests يقدرو ما يكونوش ولا يتـskipـاو ولا configured بطريقة أخرى؛ JAR ما كتثبتش tests نجحو. شوف effective POM وbuild log.
## الدوسي target وعلاش خاصنا `clean`

كاع داكشي اللي كيخرج من الـ build كيمشي لـ `target/` folder. تما كتلقى `.class` files، و الـ JAR final.

`mvn clean` هو lifecycle بوحدو. الخدمة ديالو الوحيدة هي يمسح الدوسي `target/`. هاد الخطوة مهمة بزاف حيت Maven ماشي ديما كيلاحظ كاع التغييرات في الـ dependencies أو الـ resources. إلا كان build قديم فشل وخلا شي حاجات، ودرتي `mvn package` من بعد، يقدر يجمع ليك كود قديم (stale). داكشي علاش `mvn clean package` كتضمن ليك build نقي من الزيرو.

## الفرق بين Unit Tests و Integration Tests

Surefire غالبا كتخدم unit tests فـ test مع JAR project، بـ patterns بحال Test* و*Test و*Tests و*TestCase. Failsafe كتخدم integration-test وverify غير إلا executions configured؛ patterns بحال IT* و*IT و*ITCase. Defaults قابلين للتغيير.

Failure ديال Surefire غالبا كتوقف قبل package. Failsafe كتسجل ordinary test failures باش توصل post-integration-test cleanup ومن بعد verify كتعلن failure. خدم mvn verify ماشي integration-test بوحدها. Plugin ولا infrastructure error تقدر توقف بكري، خاص cleanup robust.
## Plugin Goals مقابل Lifecycle Phases

أوامر بحال `mvn spring-boot:run` ماشي lifecycle phases. هادو كيتسماو **plugin goals**. الـ goal هو مهمة محددة كيديرها plugin. بينما `package` هي phase كتعيط لبزاف ديال goals، `spring-boot:run` كيتجاوز الـ lifecycle العادي باش يخدم application نيشان من `target/classes` بلا ما يحتاج يصاوب JAR.

## مثال تطبيقي: مشروع Report-Export

**السيناريو**: خدام على مشروع ديال export reports. درتي `mvn package` والـ build فشل. ملي شفتي `target/` لقيتي JAR موجود. هنا غتلف حيت الـ build فشل ولكن الـ JAR كاين.

**تتبع العملية (Trace)**:
1. **التنفيذ**: `mvn package` بدات.
2. **Compile**: دازت بنجاح. `.class` files تصاوبوا في `target/classes`.
3. **Test**: الـ Surefire plugin خدم، وواحد الـ test فشل. الـ build وقف هنا.
4. **الـ Artifact**: لقيتي JAR في `target/`. هاد الـ JAR راه **قديم (stale)** من شي build سابق كان ناجح. حيت الـ build الحالي وقف في `test` phase، ما وصلش لـ `package` phase. يعني هاد الـ JAR ما فيهش التغييرات الجديدة ديالك.

**الحل**:
باش تعرف المشكل وتصلحو، دير:
`mvn clean test` 

هكا كتمسح الـ JAR القديم وكتعطي التركيز غير للـ failure. ومن بعد كتمشي لـ `target/surefire-reports/TEST-com.project.ReportExportTest.xml` باش تشوف فين كاين المشكل بالضبط.

## Packaging: Plain JAR مقابل Executable JAR

Plain JAR فيها classes وresources وتقدر تكون executable إلا manifest وruntime classpath مناسبين؛ java -jar ما كتحتاجش دائما كاع dependencies داخلها. Spring Boot repackage كتنتج format خاصة مع dependencies وlauncher. Configure هاد goal؛ غير declaration ديال أي plugin ما كتضمنش كل package تنفذها.

spring-boot:run هي goal ولكن تقدر تطلب phases قبل التشغيل. clean كتحدف build directories configured وoutputs قدام؛ بوحدها ما كتضمنش deterministic build حيت dependencies وtools وenvironment كيأثرو.
## تمرين

**سؤال**: درتي `mvn verify`. الـ build فشل. لقيتي أن tests unitaires دازو، ولكن integration test واحد فشل. فين غتلقى التقرير (report)، وعلاش كاين JAR في الدوسي `target` وخا الـ build فشل؟

**الجواب**:
1. غتلقى التقرير في `target/failsafe-reports`. حيت tests unitaires دازو، الـ build كمل من `test` phase لـ `integration-test` phase.
2. الـ JAR كاين حيت `package` phase كتجي *قبل* من `integration-test` و `verify`. يعني Maven جمع الـ JAR بنجاح قبل ما يوصل للـ test اللي فشل.

## باش تزيد تفهم

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
