---
title: "كيفاش تبني JWT Authentication Flow بحدود ثقة واضحة"
description: "شرح مفصل على كيفاش تخرج tokens، تفيريفيي signature، وتجيري cycle de vie ديال access و refresh tokens فـ application ديال fitness."
pubDate: 2026-10-08T10:48:00.000Z
translationKey: 199-authentication-vs-authorization
seriesOrder: 43
locale: ar
tags: ["security","learning-series"]
draft: false
---

## موديل الثقة Stateless

Fitness API هنا كتستعمل access tokens موقّعين، instances يقدرو يتحققو منهم بلا session محلية لكل request. JWT ما كتفرضش هاد architecture: refresh-token records ولا revocation checks ولا permissions الحالية يقدرو يزيدو state. HMAC كتشترك فـ secret؛ asymmetric signature كتستعمل public key فالتحقق وprivate signing key غير عند issuer.

Signature كتحمي integrity ماشي confidentiality. Claims بـ base64url يقدر يقراهم اللي عندو token. حذف نسخة client ما كيبطلش نسخة مسروقة؛ expiry قصيرة كتحد window ولكن ماشي immediate revocation.
## حدود الثقة (Trust Boundary)

باش متخليش شي ثغرة، خاصك تفيريفيي structure و claims ديال token قبل ما تيق فـ المعلومات اللي لداخل. الـ JWT ملي كديكوديه كيكون غير string Base64؛ مكيوليش sécurisé حتى كتفيريفيي السينياتور.

### خطوات الفيريفيكاسيون الضرورية
1. **التأكد من Algorithm**: خاص `alg` header يكون هو اللي كتسناه (مثلا HS256). هادشي باش تحبس هجمات "alg: none" فين الكليان كيقول للسيرفر بلي token ممسينيش.
2. **تفيريفيي Signature**: كتستعمل secret key باش تعاود تحسب HMAC وتقارنو مع السينياتور اللي جا فـ token.
3. **تاريخ انتهاء الصلاحية (`exp`)**: أي token فات الوقت ديالو خاصو يترفض.
4. **المصدر (`iss`) والجهة المستهدفة (`aud`)**: تأكد بلي token خرج من السيرفر ديالك وموجه للـ API ديال app fitness ديالك.

## مثال تطبيقي: Cycle de Vie ديال App Fitness

السيناريو: مستخدم بغا يشوف التاريخ ديال التمارين ديالو. غنخدمو بـ جوج tokens: **Access Token** قصير (15 دقيقة) و **Refresh Token** طويل (7 أيام).

### 1. شكل الـ Tokens

**Claims ديال Access Token:**
- `sub`: "user_123"
- `iss`: "fitness-auth-service"
- `aud`: "fitness-api"
- `exp`: 1715000000
- `scope`: "workout:read"

**Refresh Token:** كيكون غير UUID عشوائي ومخبي فـ DB مربوط بالمستخدم والجهاز ديالو.

### 2. كيفاش كيدوز الطلب (Java Illustrative)

غنديرو `JwtAuthenticationFilter` اللي كيشد أي request غادية لـ `/api/workouts`.

```java
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Optional;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final TokenProvider tokenProvider;

    public JwtAuthenticationFilter(TokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        // هنا فين كاينة حدود الثقة: كنفييريفيو signature, exp, iss, و aud
        Optional<UserPrincipal> principal = tokenProvider.validateAndParseToken(token);

        if (principal.isPresent()) {
            // كنحطو authentication فـ security context لهاد request
            SecurityContextHolder.getContext().setAuthentication(principal.get().getAuthentication());
        }

        filterChain.doFilter(request, response);
    }
}
```

### 3. تسيير الـ Lifecycle

- **طلب التاريخ**: الكليان كيصيفط Access Token → الفلتر كيفيريفيه → الطلب كيدوز.
- **سالي الوقت (Expiry)**: الـ Access Token كيسالي. السيرفر كيرجع 401 Unauthorized. الكليان مكيطلبش login من جديد، ولكن كيصيفط **Refresh Token** لـ endpoint `/auth/refresh`.
- **لوجيك الـ Refresh**: السيرفر كيشوف واش Refresh Token كاين فـ DB وما محيدش. إلا كان مزيان، كيعطيه Access Token جديد.
- **الخروج (Logout)**: السيرفر كيمسح Refresh Token من DB. واخا Access Token يقدر يبقى خدام شي دقائق، المستخدم مكيقدرش ياخد واحد جديد، وهكدا كتسالي session.

## حالات الفشل والنتائج

- **تسرب الساروت (Secret Leak)**: إلا تسرق secret key، أي واحد يقدر يصاوب tokens بسميت أي مستخدم (`sub`) ويدخل لحسابو.
- **نسيان `exp`**: إلا مفيريفيتيوش الوقت، token مسروق كيولي ساروت أبدي للحساب.
- **الثقة فـ Claims بلا فيريفيكاسيون**: إلا خدمتي بـ `jwt.getClaims()` قبل `jwt.verify()`، يقدر أي واحد يبدل ID ديالو فـ payload والسيرفر غيتعامل معاه على أساس أنه داك المستخدم.

## تمرين

**السيناريو**: كتدير audit لـ app ديال fitness. الديفلوبور داير JWT واحد كيبقى خدام 30 يوم. وملي المستخدم كيورك على "Logout"، app كدير `localStorage.removeItem('token')`.

1. علاش هادشي ماشي sécurisé كفاية؟
2. كيفاش الطريقة ديال جوج tokens (Access/Refresh) كتحل مشكل الـ revocation بلا ما ترجع كل API call stateful؟

**الجواب**:
1. حيت مسح token من عند الكليان مكيحيدوش من السيرفر. إلا شي حد سرق token (بـ XSS مثلا)، يقدر يبقى خدام بيه 30 يوم حيت السيرفر كيشوف غير السينياتور والوقت، مكيشوفش واش session باقة كاينة.
2. ملي كنخدمو بـ Access Token قصير (مثلا 15 دقيقة)، الوقت اللي يقدر يستغل فيه شي حد token مسروق كيكون صغير بزاف. و Refresh Token كيكون فـ DB؛ ملي كدير logout وكتمسحو من DB، السيرفر مكيقدرش يعطي Access Token جديد، وهكدا كنحبسو الوصول بمجرد ما يسالي الـ token القصير.

Filter غير excerpt توضيحية. Register فالبلاصة الصحيحة فـ SecurityFilterChain وحمي route، وربط invalid authentication بـ401 مع challenge ونقي context. استعمل JWT decoder maintained بلا HMAC comparison يدوية. فرض exp وiss وaud وalgorithms المتوقعين وtime claims مناسبين قبل استعمال sub وscopes. Refresh كتحتاج expiry وrevocation فـ server وopaque values عشوائيين آمنين وstorage محمية وrotation وreuse handling. UUID صالحة غير إلا تولدت بـ randomness cryptographic كافية. Authentication ما كتسمحش بوحدها تشوف workout ديال user آخر.

## باش تزيد تفهم

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
