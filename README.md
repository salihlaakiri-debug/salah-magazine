# السُّدفة — Al-Sudfeh Magazine

مجلة أدبية عربية. Literary Arabic magazine.

**الموقع:** [al-sudfeh.vercel.app](https://al-sudfeh.vercel.app)

---

## التقنيات — Tech Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Framework        | Next.js 16 (Turbopack), React 19    |
| Language         | TypeScript                          |
| Styling          | Tailwind CSS v4                     |
| Database         | Supabase (PostgreSQL)               |
| Auth             | Supabase Auth (Google OAuth + Email)|
| Storage          | Supabase Storage (profiles, images) |
| Hosting          | Vercel                              |
| Testing          | Vitest                              |
| Fonts            | Noto Naskh Arabic, Noto Kufi Arabic, Amiri |

---

## الأقسام — Sections

- شعر (Poetry)
- قصة (Story)
- نثر (Prose)
- مقالات (Articles)
- تأملات (Reflections)

---

## البدء — Getting Started

### المتطلبات — Prerequisites

- Node.js 20+
- npm
- Supabase project (or access to the existing one)

### التثبيت — Install

```bash
npm install
cp .env.example .env.local  # ثم املأ المتغيرات
```

### التطوير — Development

```bash
npm run dev    # http://localhost:3000
npm run build  # بناء الإنتاج
npm run lint   # التحقق من الأخطاء
npm test       # تشغيل الاختبارات
```

### قاعدة البيانات — Database

يتم تشغيل التهيئة الكاملة لقاعدة البيانات عبر ملف واحد:

1. افتح Supabase SQL Editor
2. شغّل `supabase/migrations/012_consolidated.sql`

هذا الملف الواحد يشمل كل الجداول، الفهارس، صلاحيات RLS، التوابع، المحفزات، وأوعية التخزين.

---

## المتغيرات البيئية — Environment Variables

انظر `.env.example` لجميع المتغيرات المطلوبة.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | Service role key (server-side only) |
| `NEXT_PUBLIC_SITE_URL` | ✓ | Deployment URL for redirects |
| `SMTP_HOST` | | SMTP server for branded emails |
| `SMTP_PORT` | | SMTP port |
| `SMTP_USER` | | SMTP username |
| `SMTP_PASS` | | SMTP password |
| `EMAIL_FROM` | | Sender email address |

---

## الهيكلة — Project Structure

```
src/
├── proxy.ts                  # Middleware (rate limiting, security headers)
├── app/                      # Next.js App Router pages
│   ├── (auth)/               # Auth pages (login, register, forgot/reset password)
│   ├── admin/                # Admin dashboard (articles, comments, users, etc.)
│   ├── api/                  # API routes (auth, contact, newsletter, track-view)
│   ├── auth/callback/        # Google OAuth callback
│   └── ...                   # Pages: about, archive, bookmarks, contact, dashboard,
│                              #   profile/[username], search, section/[slug],
│                              #   settings, submit, tag/[slug], work/[id], writers
├── components/               # React components
│   ├── AuthProvider.tsx      # Auth context + Google OAuth
│   ├── Comments.tsx          # Comments section (nested replies)
│   ├── LikeButton.tsx        # Like/unlike
│   ├── BookmarkButton.tsx    # Bookmark/unbookmark
│   ├── NotificationsBell.tsx # Realtime notifications
│   ├── WorkCard.tsx          # Article card with author link
│   ├── RichEditor.tsx        # Content editor
│   ├── ToastProvider.tsx     # Toast notifications
│   └── ...
├── lib/                      # Utilities
│   ├── supabase.ts           # Client-side Supabase (lazy proxy)
│   ├── supabase-server.ts    # Server-side Supabase client
│   ├── supabase-data.ts      # Server data helpers (enrichArticles)
│   ├── validation.ts         # Input validation
│   ├── rate-limit.ts         # DB-backed rate limiting
│   ├── email.ts              # Email sending (nodemailer)
│   ├── types.ts              # TypeScript types
│   ├── tags.ts               # Tag CRUD
│   ├── notify.ts             # Notification helpers
│   └── toast.ts              # Toast system
└── __tests__/                # Vitest tests
    ├── validation.test.ts
    ├── components.test.tsx
    └── setup.ts
```

---

## المميزات — Features

- ✓ نظام حسابات مع Google OAuth
- ✓ مقالات مع أقسام وتصنيفات
- ✓ نظام تعليقات مع ردود متسلسلة
- ✓ إعجابات، إشارات مرجعية، متابعة
- ✓ إشعارات فورية (Realtime)
- ✓ لوحة تحكم للمشرف
- ✓ رسائل إخبارية (Newsletter)
- ✓ صفحة ملف شخصي مع إحصائيات
- ✓ وضع القراءة
- ✓ جدول المحتويات
- ✓ RSS Feed, Sitemap, JSON-LD
- ✓ PWA
- ✓ دعم كامل للغة العربية (RTL)
- ✓ وضع مظلم/فاتح
- ✓ حماية CSP، تقييد الطلبات، التحقق من المدخلات

---

## الترخيص — License

All rights reserved.

---

## النشر التلقائي إلى Vercel — Auto Deploy to Vercel

لجعل أي تغيير يظهر مباشرة على الموقع المنشور في Vercel عند الدفع إلى الفرع الرئيسي (`main`)، اتبع الخطوات التالية:

1. اربط المستودع الخاص بك بـ Vercel عبر لوحة تحكم Vercel أو فعّل Git integration.
2. أضف أسرار GitHub التالية في إعدادات المستودع (`Settings > Secrets > Actions`):
    - `VERCEL_TOKEN` — توكن الوصول الشخصي من حساب Vercel (من `Account > Tokens`).
    - `VERCEL_ORG_ID` — معرف المؤسسة/الفريق في Vercel.
    - `VERCEL_PROJECT_ID` — معرف المشروع في Vercel.

3. يوجد سير عمل جاهز في `.github/workflows/vercel-deploy.yml` سيبني المشروع ثم ينشره إلى Vercel عند كل `push` إلى `main`.

بدائل:
- لا تريد استخدام GitHub Actions؟ استخدم ربط Git التلقائي من Vercel (Recommended) بحيث يقوم Vercel بالنشر على كل دفعة إلى الفرع المرتبط.
- تنفّذ نشر يدوي سريع عبر Vercel CLI:

```bash
# تثبيت Vercel CLI
npm i -g vercel

# نشر سريع (سيطلب توكن أو يمكنك تمريره كمتغير بيئة)
vercel --prod --token $VERCEL_TOKEN
```

ملاحظة: عمليات النشر التلقائي تحتاج إعداداً بسيطاً للأسرار في GitHub أو الربط المباشر مع Vercel؛ بعد إتمام ذلك سيظهر أي تغيير تقرره ودمجه في `main` مباشرةً على الموقع المباشر.
