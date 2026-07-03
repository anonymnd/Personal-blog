---
title: "استعمال Git للتاريخ و GitHub للتعاون"
description: "الفرق بين Git المحلي و GitHub كخدمة استضافة من خلال مثال ديال دليل مجتمعي."
pubDate: 2026-10-08T20:48:00.000Z
translationKey: 236-git-vs-github
seriesOrder: 53
locale: ar
tags: ["deployment-devops","learning-series"]
draft: false
---

## الفرق بين Git و GitHub

بزاف ديال الناس كيسحاب ليهم Git و GitHub هوما نفس الحاجة، ولكن كاين فرق كبير. Git هو نظام (Distributed Version Control) كيكون منصب عندك فالمكينة (local). هو اللي كيتكلف باش يتبع التغييرات اللي كدير فالفيلات، ويخليك ترجع لنسخ قديمة، وتصاوب فروع (branches) باش تخدم على حوايج مختلفة بلا ما تخسر الخدمة الأصلية.

GitHub هو مجرد خدمة فالسحاب (cloud hosting) فين كنحطو هاد الـ repositories ديال Git. يعني تقدر تخدم بـ Git بوحدو بلا GitHub عادي جداً. حيت Git "distributed"، كل واحد خدام فالمشروع عندو نسخة كاملة من التاريخ (history) فالديسك ديالو. هادشي كيخليك تخدم offline: تقدر دير commit، تصاوب branch، وتشوف الـ logs واخا ما عندكش الأنترنيت. GitHub كيكون غير هو البلاصة فين كنجمعو الخدمة (remote) باش نشاركوها مع لخرين.

## علاش التاريخ (History) ماشي هو Backup

وخا Git كيسجل كلشي، راه ماشي بديل للـ backup. Git كيتتبع كيفاش تطور الكود، ولكن إلا تحرق ليك الديسك ديريكت أو مسحتي الدوسي `.git` بالغلط، غادي يمشي ليك كلشي. زيد عليها أن Git مصاوب للفيلات ديال التكست؛ إلا بقيتي كتحط فيه فيلات كبار (binary blobs)، غادي يولي الـ repository ثقيل بزاف لكل واحد دار ليه clone حيت خاصو يتيليشارجي التاريخ كامل.

## مثال تطبيقي: دليل المجتمع (Community Directory)

تخايل جوج متطوعين، Alice و Bob، خدامين على فيليه سميتو `directory.txt` فيه معلومات الاتصال ديال الناس.

### 1. البداية والـ Commit الأول
Alice بدات المشروع فالمكينة ديالها:

```bash
# توضيح: Alice كتصاوب المشروع local
git init -b main community-dir
cd community-dir
echo "Alice: 555-0101" > directory.txt
git add directory.txt
git commit -m "Initial directory setup"
```

### 2. الخدمة بـ Branches
Bob بغا يزيد قسم ديال "المحلات التجارية" ولكن ما بغاش يخسر الليستة الأصلية حتى يتأكد من الخدمة. داكشي علاش صاوب branch جديدة:

```bash
# توضيح: Bob كيصاوب فرع بوحدو
git checkout -b add-businesses
echo "Bakery: 555-0202" >> directory.txt
git add directory.txt
git commit -m "Add bakery contact"
```

### 3. مراجعة الفرق (Diff)
قبل ما يدمج الخدمة، Bob بغا يشوف بالضبط شنو زاد. هنا كنستعملو `diff`:

```bash
# توضيح: مقارنة التغييرات مع branch main
git diff main add-businesses
```
**شنو كتعني النتيجة:** غادي يبان ليه علامة `+` حدا "Bakery: 555-0202"، وهذا كيعني أن هاد السطر كاين فـ branch ديال Bob ولكن ما كاينش فـ main.

### 4. المزامنة مع Remote
باش يشاركو الخدمة، استعملو GitHub كـ remote:

```bash
# توضيح: ربط local بـ remote
git remote add origin https://github.com/user/community-dir.git
git push -u origin main
# Bob كيصيفط الـ branch ديالو
git push origin add-businesses
```

## النتائج ديال هاد الطريقة

حيت Bob خدم بـ branch، ما خسرش الليستة الأصلية. كون كان خدم ديريكت فـ `main` وغلط، كان غادي يخصو يقلب فالتاريخ باش يرجع لور. دابا، Alice تقدر دير `git fetch` باش تشوف شنو دار Bob، وتراجع الخدمة ديالو، وعاد تدمجها (merge) فـ `main` ملي تكون متأكدة.

## تمرين

فرّق جوج حالات. باش تحيد uncommitted working-tree edit، git restore config.json غالبا كترد من index؛ شوف git diff وgit diff --cached حيت staged content تقدر تختلف على HEAD. باش ترد committed version بوضوح، استعمل git restore --source=HEAD -- config.json من بعد ما تكون باغي تحيد هاد edit.

إلا الغلط ديجا committed وshared، git revert <commit> كتزيد inverse commit وتحافظ على history. لـ file وحدة من version قديمة، restore من commit معروفة وشوف diff ودير commit ديال correction. Restore ما كتلغيش commit قديمة بوحدها.

Bob خاصو clone ولا checkout shared متفقين عليها قبل branch steps؛ setup ما مبيناش. Git كتخزن committed snapshots ماشي كاع untracked ولا ignored files. Shallow/partial clones يقدرو ما فيهمش كاع history. Branch كتعاون isolation ولكن ما كتثبتش correctness بلا review.

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
