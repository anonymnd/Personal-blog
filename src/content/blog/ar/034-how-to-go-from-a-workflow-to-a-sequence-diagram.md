---
title: "كيفاش تحول Workflow لـ Sequence Diagram"
description: "تعلم كيفاش ترد عملية بيزنس (Business Process) لـ diagramme de séquence باش تعرف كيفاش كيتواصلو objects ديال السيستيم."
pubDate: 2026-10-08T01:48:00.000Z
translationKey: 034-how-to-go-from-a-workflow-to-a-sequence-diagram
locale: ar
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

تخيل عندك workflow ديال شراء (procurement) : واحد كيصيفط demande، manager كياپروفيها، ومن بعد buyer كيدوز commande. هاد الطريق ساهلة للفهم ديال الناس ديال البيزنس، ولكن developers كيتحيرو شكون هما components لي خاصهم يهضرو مع بعضياتهم وبالتريب. الـ workflow كيوريك *شنو* كيوقع، ولكن الـ sequence diagram كيوريك *كيفاش* الـ objects ديال السيستيم كيتعاونو باش يطبقو داكشي.

## تحديد المشاركين (Participants)
باش تبدا، خاصك تحدد الـ Lifelines. فـ workflow كيكون عندك roles (بحال Demandeur, Manager). فـ sequence diagram، كنردوهم actors و system objects. مثلا فـ application ديال الشراء، الـ lifelines غيكونوا هما: `User` (Actor), `RequestController`, `ApprovalService`, و `OrderRepository`.

## ترتيب الأحداث (Chronology)
الـ workflows غالبا كيكونوا على شكل swimlanes. باش تحولهم، تبع الـ flow من الفوق لتحت ورد كل خطوة لـ message. إلا كان الـ workflow كيقول « Manager كياپروفي demande»، فـ sequence diagram خاصنا نرسمو سهم من الـ actor `Manager` لـ method سميتها `ApprovalService.approve(requestId)`، وهادي هي لي غتغير الحالة (status) فـ base de données.

## مثال تطبيقي: Approval ديال الشراء
نشوفو الخطوة ديال « Manager كياپروفي demande »:
1. **Actor**: Manager $ightarrow$ **Object**: `ApprovalController` (Message: `postApproval(id)`)
2. **Object**: `ApprovalController` $ightarrow$ **Object**: `ApprovalService` (Message: `validateAndApprove(id)`)
3. **Object**: `ApprovalService` $ightarrow$ **Object**: `RequestEntity` (Message: `setStatus('APPROVED')`)

النتيجة: الـ status ديال الطلب كيتبدل، وكتصيفط confirmation لـ UI ديال الـ Manager.

## غلط شائع: تخلط Logic مع Messages
بزاف ديال الناس كيديرو decisions ديال البيزنس (مثلا « إلا كان الثمن كبر من 1000 درهم ») كـ message. الـ sequence diagram خاصو يوري غير *العيطة* (call) لـ method لي فيها الـ logic، ماشي الـ logic راسو. بلاصة ما تسمي message `CheckIfAmountIsHigh` دير `ApprovalService.verifyLimit(request)`.

## تمرين تطبيقي
**السيناريو**: واحد requester كيصيفط demande جديدة. رسم هادشي بـ 3 ديال lifelines: `Requester`, `RequestController`, و `RequestDatabase`.

**الجواب**: الـ `Requester` كيصيفط `submit(data)` لـ `RequestController` لي بدورو كيعيط لـ `save(request)` فـ `RequestDatabase`.


## باش تزيد تفهم

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
