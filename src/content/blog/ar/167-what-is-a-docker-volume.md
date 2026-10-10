---
title: "كيفاش تحافظ على الداتا ديال Container باستخدام Volumes و Backups"
description: "شرح مفصل على كيفاش كتعامل Docker مع الداتا ديال PostgreSQL، والفرق بين restart، replacement و مسح الـ volumes."
pubDate: 2026-10-08T05:48:00.000Z
translationKey: 167-what-is-a-docker-volume
seriesOrder: 38
locale: ar
tags: ["docker","learning-series"]
draft: false
---

## الفرق بين Writable Layer و Persistent Volumes

ملي كيخدم شي container، كيدير واحد الطبقة ديال الكتابة (writable layer) فوق image اللي هي read-only. أي حاجة تكتات هنا—بحال logs ديال PostgreSQL—كتكون كاينة غير مادام داك container خدام. إلا درتي stop و start، هاد الطبقة كتبقى. ولكن إلا مسحتي container (`docker rm`) أو عاودتيه بـ Compose، هاد الطبقة كتمشي و الداتا ديالك كتمسح.

باش نتفاداو هاد المشكل، كنخدمو بـ **Named Volumes**. الـ volume هو واحد الدوسي كيسيرو Docker فـ host (الماشين ديالك) و كيكون مرتبط بـ container. الفرق هو أن الـ volume كيبقى واخا تمسح الـ container.

## مثال تطبيقي: الداتا ديال PostgreSQL 15

فـ PostgreSQL 15، الداتا كتكون فـ `/var/lib/postgresql/data`. غنشوفو 3 ديال الحالات باستعمال volume سميتو `pgdata`.

### Setup (مثال توضيحي)
```yaml
services:
  db:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: securepassword

volumes:
  pgdata:
```

### الحالة 1: Restart
**شنو كانديرو:** `docker compose stop` و موراها `docker compose start`.
**النتيجة:** الـ process ديال الـ container كيحبس و كيعاود يخدم. الـ writable layer و الـ volume بجوج بقاو. الداتا ديالك مأمنة.

### الحالة 2: Replacement
**شنو كانديرو:** `docker compose up -d` مورا ما بدلتي شي environment variable أو حدثتي version ديال image.
**النتيجة:** Docker كيمسح الـ container القديم و كيدير واحد جديد. الـ writable layer كتمسح، ولكن الـ container الجديد كيركب (mount) نفس الـ volume `pgdata`. PostgreSQL كيلقى الداتا ديالو فـ `/var/lib/postgresql/data` و كيكمل من فين وقف.

### الحالة 3: Destruction
**شنو كانديرو:** `docker compose down -v`.
**النتيجة:** هاد `-v` كتقول لـ Docker يمسح حتى الـ named volumes اللي كاينين فـ Compose. الـ volume `pgdata` كيتمسح من الـ host. واخا تخدم `up` مرة أخرى، الداتا غتكون خاوية حيت السورس تمسح.

## الـ Backups و كيفاش نتأكدو منها

Named volume هي storage اللي خدامة، ماشي copy ثانية ولا history ديال recovery. حذف table ولا corruption كيأثرو على هاد data. استعمل backup مناسبة للـ DB وتأكد من restore. الأمثلة بـ Compose service names وPOSIX shell وmy_catalog موجودة. ما تديرش TTY مع dump redirected.

```bash
docker compose exec -T db pg_dump -U postgres my_catalog > catalog_backup.sql
# Restore project منفصلة ومؤقتة:
docker compose -p restore -f compose.restore.yml exec -T db \
  psql -U postgres -d my_catalog -v ON_ERROR_STOP=1 < catalog_backup.sql
```

Restore project خاصها volume أخرى وtarget DB فارغة تصاوبها قبل. راجع exit statuses وrows ممثلين وconstraints وapplication reads؛ نفس count بوحدها ما كافياش. pg_dump كتنسخ DB وحدة، ماشي كاع cluster roles ولا كاع operational recovery needs.
## تمرين

**سؤال:** عندك database ديال production خدامة بـ named volume. درتي `docker compose down` (بلا `-v`)، حدثتي الـ image لـ version جديدة، و درتي `docker compose up -d`. واش الداتا غتكون كاينة؟ و إلا درتي موراها `docker compose down -v` شنو غيوقع؟

**الجواب:** اه، الداتا غتكون كاينة حيت `docker compose down` مكيمسحش الـ named volumes؛ الـ container الجديد غيركب الـ volume اللي كان ديجا كاين. ولكن إلا درتي `docker compose down -v` غيتمسح الـ volume نهائياً من الـ host و غتضيع الداتا كاملة.

خلي نفس Compose project وvolume identity فاختبار recreation. stop/start كيوقف process ويعاود يبداها، ماشي pause/unpause. PostgreSQL major upgrade خاصها migration مدعومة، ماشي غير image جديدة مع data directory قديمة. down -v ما كتحيدش external volumes.

## باش تزيد تفهم

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
