---
title: "الفرق بين Authentication و Authorization"
description: "دليل بسيط باش تفرق بين التأكد من الهوية (Authentication) وبين الصلاحيات ديال الدخول (Authorization)."
pubDate: 2026-10-14T22:48:00.000Z
translationKey: 199-authentication-vs-authorization
locale: ar
tags: ["software-engineering","security","learning-series"]
draft: false
---

تخيل راسك باغي تدخل لواحد الشركة كبيرة ومؤمنة. السيكيريتي فالباب كيطلب منك لاكارط ناسيونال باش يعرف شكون أنت؛ هادي هي Authentication. ملي كتدخل، كتحاول تحل باب ديال السيرفورات ولكن البادج ديالك كيحل غير باب الكافيتيريا؛ هادي هي Authorization.

## شنو الفرق الأساسي؟
الـ Authentication (AuthN) هي العملية باش كنتأكدو بلي المستخدم هو فعلاً الشخص اللي كيقول أنا هو. هنا كنركزو على الهوية، بحال فاش كتخدم المودباس أو البصمة. أما الـ Authorization (AuthZ)، فهي اللي كتقرر شنو مسموح لهاد المستخدم يدير. هنا كنركزو على الصلاحيات (Permissions).

## كيفاش كتخدم فالتطبيقات دابا
فالتطبيقات ديال Java (بحال Jakarta EE)، كنخدمو بزاف بـ JWT (JSON Web Tokens). ملي كيدير المستخدم Login، السيرفر كيتأكد من الهوية ديالو وكيعطيه واحد التوكن (Token). هاد التوكن كيكون فيه معلومات بحال ID ديال المستخدم والدور ديالو (مثلاً `ROLE_MANAGER`). السيرفر مكيحتاجش يسول لاباز دو دوني فكل طلب، حيت كيتحقق غير من السينييتور (Signature) ديال التوكن باش يعرف واش تبدل أو لا.

## مثال ديال تطبيق ديال المشتريات (Procurement)
نفترضو عندنا سيستيم ديال طلبات السلعة:
- **Authentication**: المستخدم كيدخل الإيميل والمودباس. السيستيم كيتحقق من المودباس (بـ BCrypt أو Argon2id) وكيخليه يدخل.
- **Authorization**:
    - **Requester**: يقدر يصاوب طلب، ولكن ميمكنش يوافق عليه.
    - **Manager**: يقدر يشوف الطلبات ديال الفريق ديالو ويضغط على 'Approve'.
    - **Buyer**: هو اللي كيأكد بلي السلعة تطلبات (Ordered).
إلا حاول Requester يعيط لـ `/api/approve` غيطلع ليه خطأ `403 Forbidden` حيت معندوش الصلاحية، وخا هو أصلاً مكونيكتي (Authenticated).

## غلط شائع: التيقة فالتوكن بلا فيريفيكاسيون
بزاف ديال المطورين كيغلطو ملي كيديكوديو (decode) الـ JWT وكيتيقو فالمعلومات اللي فيه بلا ما يتأكدو من السينييتور. أي واحد يقدر يبدل الدور ديالو من `USER` لـ `ADMIN` إلا مكنتيش كتحقق من السينييتور، والـ issuer، و تاريخ انتهاء الصلاحية (expiration).

## تمرين تطبيقي
سيناريو: واحد المستخدم مكونيكتي عادي، ولكن ملي بغا يمسح واحد السطر من لاباز طلع ليه '403 Forbidden'. واش هاد المشكل ديال Authentication ولا Authorization؟

**الجواب**: هادا مشكل ديال Authorization. حيت المستخدم راه مكونيكتي (Authenticated)، ولكن معندوش الحق (Authorization) باش يمسح.

## باش تزيد تفهم

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
