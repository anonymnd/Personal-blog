---
title: "علاش خاصنا نخليو configuration ديال CI/CD وسط repository؟"
description: "شرح ديال طريقة 'Pipeline as Code' وعلاش تخزين خطوات الـ deployment مع الكود كيخلي الخدمة نقية ومضمونة."
pubDate: 2026-10-16T17:48:00.000Z
translationKey: 242-why-keep-ci-cd-configuration-inside-the-repository
locale: ar
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل عندك application ديال procurement (المشتريات) فين الموظف كيصيفط demande. كلشي خدام عندك في pc، ولكن ملي كدير push للـ production، الـ build كيوقع فيه erreur حيت السيرفر فيه version قديمة ديال Java. كتبقى تضيع السوايع باش تعرف شنو تبدل في الـ interface ديال tool CI اللي خسر ليك الخدمة. هادشي هو اللي كنسميوه مشكل 'البواطة الكحلة' (black box).

## المفهوم ديال Pipeline as Code
ملي كنحطو configuration ديال CI/CD (بحال `.github/workflows/main.yml`) وسط الـ repository، كنحولوا عملية الـ deployment لـ 'Pipeline as Code'. بلاصة ما نبقاو نكليكيوا في interface web، كنكتبو ملف فيه كاع الخطوات. هكذا، الطريقة باش كنـ build-يو ونـ test-يو الـ app ديال المشتريات كتكون حدا الكود Java ديالها.

## التزامن والـ Versioning
ملي كتكون الـ config في الـ repo، الـ pipeline كيتطور مع الكود. مثلاً، إلا طلعتي الـ app لـ Jakarta EE 10، تقدر تبدل script ديال build في نفس الـ commit. وإلا رجعتي لشي branch قديمة باش تصلح شي bug، الـ pipeline كيرجع بوحدو للنسخة اللي كانت خدامة مع داك الكود. هادشي كيمنع أن شي config جديدة تهرس لينا build ديال version قديمة ومستقرة.

## الشفافية و Review ديال الكود
حيت الـ pipeline ولا غير ملف، كيولي يدوز من Pull Request (PR) بحالو بحال أي كود آخر. إلا شي واحد بدل السيرفر من staging لـ production، غتبان ليك في الـ diff. هكذا كنتهناو من دوك التغييرات اللي كيداروا في الخفاء في الـ UI ومكيعرف حد علاش الـ deployment تبدل سلوكو.

## مثال تطبيقي: Pipeline ديال المشتريات
هاك مثال صغير ديال YAML كيفاش كيكون الـ build:

```yaml
# مثال توضيحي لـ config CI
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with: { java-version: '17', distribution: 'temurin' }
      - run: mvn clean verify
```
النتيجة: أي push كيدير هاد الخطوات بالترتيب. إلا `mvn verify` عطات erreur، الـ pipeline كيوقف، وهكا كنضمنو أن logic ديال الـ approval في الـ app مريكلة قبل ما نمشيو للـ deployment.

## غلط شائع: كتابة الـ Secrets في الكود
بزاف ديال الناس كيكتبو API keys ولا passwords ديال database نيشان في ملف YAML باش يسهلوا الخدمة.
**التصحيح:** خاصك تستعمل 'Secrets' اللي كاينين في tool CI. عيط ليهم غير بـ `${{ secrets.DB_PASSWORD }}`. هكا الـ logic كيبقى في الـ repo ولكن المعلومات الحساسة كتبقى مخبية.

## تمرين تطبيقي
إلا بغيتي تنقل project من GitHub لـ GitLab مثلاً، علاش غادي ينفعك أن الـ configuration كانت وسط الـ repo؟

**الجواب:** حيت عندك blueprint (خريطة) واضحة فيها كاع داكشي اللي محتاج الـ build (الـ version ديال JDK، commands ديال test)، وهادشي كيخليك تعاود تصاوب الـ pipeline في السيستم الجديد بسهولة.

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
