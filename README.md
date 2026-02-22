# بصيرة Baseera — SaaS مهني عربي (RTL)

منصة SaaS متكاملة للتوجيه المهني: تجربة مستخدم + لوحة إدارة، مبنية على Next.js + Supabase.

## المزايا
- مصادقة كاملة: تسجيل/دخول/نسيان كلمة المرور/إعادة تعيين.
- حماية المسارات: المستخدم غير المسجل يُوجّه إلى `/login`.
- تقييم احترافي:
  - شريط تقدم + رقم السؤال
  - حفظ تلقائي بعد كل إجابة (UPSERT)
  - استعادة التقييم غير المكتمل
  - تعطيل الإرسال حتى اكتمال الإجابات
- تقرير نتائج تفاعلي:
  - ملخص تنفيذي
  - عرض Big Five + RIASEC
  - أفضل 10 وظائف مع أسباب
  - تنزيل PDF + توليد بطاقة مشاركة SVG
- لوحة إدارة فعلية:
  - `/admin` مؤشرات سريعة
  - `/admin/versions`
  - `/admin/items`
  - `/admin/occupations`
  - `/admin/analytics` (مجهول الهوية)
- أمان البيانات:
  - RLS + تحقق ملكية على API
  - منع تعديل النسخ المنشورة (Trigger)

## الإعداد
1. أنشئ `.env.local` من `.env.example`.
2. نفّذ `db/schema.sql`.
3. (اختياري بقوة) نفّذ `db/seed.sql` لتجهيز النظام فورًا.

## التشغيل
```bash
npm ci
npm run test
npm run build
npm run dev
```

## CI / Lockfile
- مسار CI: `.github/workflows/ci.yml`.
- في بيئات الحظر الشبكي، استخدم `NPM_REGISTRY_URL` على CI.
- لتوليد lockfile في بيئة مسموح لها:
```bash
./scripts/generate-lockfile.sh
git add package-lock.json
```
