---
title: "استعمال Consistent Hashing باش تنقص تحراك الداتا بين الـ Partitions"
description: "شرح مفصل على الـ hash rings و virtual nodes باش تنقص الـ cache misses ملي كتزيد nodes فـ cluster."
pubDate: 2026-10-08T14:48:00.000Z
translationKey: 217-what-is-consistent-hashing
seriesOrder: 47
locale: ar
tags: ["system-design","learning-series"]
draft: false
---

## المشكل ديال Modulo Hashing

فـ modulo hash(key) % N، الانتقال من3 لـ4 nodes كيبدل بزاف assignments. مع uniform hashes ونفس ترتيب nodes، تقريبا3/4 ديال keys كيتحركو، ماشي كلشي حرفيا. فقدان warm cache تقدر تزيد backend work حسب traffic وTTL وmiss handling. Consistent hashing كتحد reassignment ملي membership كتبدل.
## كيفاش كيخدم Consistent Hashing

الـ Consistent hashing كيحيد هاد الارتباط بين عدد الـ nodes وكيفاش كنوزعو الداتا. بلاصة ما نستعملو array عادي، كنتخيلو الـ hash space بحال شي خاتم (Hash Ring).

1. **الخاتم (The Ring)**: تخيل أرقام من 0 حتى لـ 2³² − 1. ملي كتوصل للآخر، كترجع للبداية.
2. **وضع الـ Nodes**: كل node كانديرو ليها hash (مثلا على حساب IP ديالها) ونحطوها فـ نقطة معينة فهاد الخاتم.
3. **توزيع الـ Keys**: باش نعرفو شكون الـ node لي شادة key معينة، كانديرو ليها hash باش نلقاو بلاصتها فـ الخاتم، ومن بعد كنمشيو مع اتجاه عقارب الساعة حتى كنلقاو أول node. هاديك هي الـ node لي مسؤولة عليها.

## حل مشكل الـ Hotspots بـ Virtual Nodes

إلا حطينا كل node غير مرة وحدة، غادي يكون توزيع الداتا ما متساويش. تقدر node وحدة تولي هازة 60% ديال الداتا و node أخرى هازة غير 10%.

باش نحل هاد المشكل، كنستعملو **Virtual Nodes (vnodes)**. بلاصة ما نحطو `Node A` مرة وحدة، كنحطوها مثلا 100 مرة بـ seeds مختلفين (مثلا `hash("NodeA-1")`, `hash("NodeA-2")`). هادشي كيخلي الـ nodes يتفرقو مزيان فـ الخاتم، وباش إلا تزادت node أو تحيدات، الداتا كتوزع بالتساوي على كاع الـ nodes لي بقاو، ماشي غير على الجار ديالها.

## مثال تطبيقي: زيادة Node فـ Thumbnail Cache

نتخيلو خاتم بسيط من 0 حتى لـ 1000. عندنا 3 ديال الـ nodes فهاد البلايص:
- Node 1: 100
- Node 2: 400
- Node 3: 700

**التوزيع فـ الأول:**
- Key A (Hash 50) $ightarrow$ Node 1 (حيت هي الأولى فـ اتجاه عقارب الساعة من 50)
- Key B (Hash 200) $ightarrow$ Node 2 (من 200، الأولى هي 400)
- Key C (Hash 500) $ightarrow$ Node 3 (من 500، الأولى هي 700)
- Key D (Hash 800) $ightarrow$ Node 1 (كنكملو الدورة ونلقاو 100)

**زدنا Node 4 فـ البلاصة 450:**
- Key A (50) $ightarrow$ باقة فـ Node 1
- Key B (200) $ightarrow$ باقة فـ Node 2
- Key C (500) $ightarrow$ باقة فـ Node 3
- Key D (800) $ightarrow$ باقة فـ Node 1

بان ليك والو ما تحرك؟ نشوفو key لي غاتحرك:
- Key E (Hash 410): فـ الأول كانت كتمشي لـ Node 3 (700). دابا، ملي كنمشيو من 410 فـ اتجاه عقارب الساعة، كنلقاو Node 4 (450) هي الأولى.

**المنطقة لي تحركت (Moved Interval):**
غير الـ keys لي كاينين ما بين (400, 450] هما لي تحولو من Node 3 لـ Node 4. كاع الـ keys لخرين بقاو فـ بلاصتهم. فـ Modulo hashing، تقريبا كاع الداتا كانت غاتحرك، ولكن هنا غير 1/(N + 1) ديال الداتا لي كتبدل بلاصتها فـ المعدل.

## النواقص والـ Trade-offs

الـ Consistent hashing كينقص تحراك الداتا ولكن ما كيحيدوش بمرة. إلا طاحت شي node، كاع الداتا ديالها كتمشي للـ node لي موراها. إلا ما كانوش عندك vnodes كافيين، هادشي يقدر يطيح حتى الـ node لي موراها حيت غاتولي عليها Charge كبيرة (Cascading failure).

حاجة أخرى، الـ client أو الـ load balancer خاصو يكون عارف الـ topology ديال الخاتم. إلا كان كل client عندو رؤية مختلفة على الخاتم (مثلا فـ وقت الـ deployment)، غادي يصيفطو الـ requests لـ nodes مختلفين، وهادشي كيدير cache misses.

## تمرين

**السيناريو**: عندك خاتم (0-100) فيه nodes فـ 20، 50، و 80. زدتي node جديدة فـ البلاصة 60.
1. شكون الـ node لي كانت شادة الـ keys لي فـ المجال 51-60؟
2. شكون الـ node لي شادهم دابا؟
3. إلا تحيدات الـ node لي فـ 50، شكون الـ node لي غاتورث الداتا ديالها؟

**الجواب**:
1. Node 80 (حيت كانت هي الأولى فـ اتجاه عقارب الساعة من 51-60).
2. Node 60.
3. Node 60 (أو Node 80 إلا ما كانتش 60).


مع N nodes عندهم نفس capacity، إضافة node موزعة مزيان كتحرك تقريبا1/(N+1) ديال uniform keys فالمتوسط؛ toy ring هنا كتحرك interval المحددة ديالها. Virtual nodes كتحسن balance احتماليا، ماشي perfectly وما كتصلحش hot key وحدة. Positions افتراضيين بزاف يقدرو يقسمو load ديال physical node فاشلة على successors مختلفين. Replication وmembership coordination قرارات أخرى.
