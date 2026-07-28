# قوالب البريد الإلكتروني - السُّدفة

انسخ HTML من الملفات أدناه إلى Supabase Dashboard → Authentication → Email Templates.

## الروابط في لوحة Supabase

1. اذهب إلى https://supabase.com/dashboard/project/pbxibeppcnnmrxhrmanf/auth/templates
2. انقر على كل قالب وانسخ محتوى الملف المقابل

## القوالب المتوفرة

- `reset-password.html` — استعادة كلمة المرور
- `confirmation.html" — تأكيد التسجيل
- `email-change.html` — تغيير البريد الإلكتروني

## متغيرات Supabase المستخدمة

| المتغير | الوصف |
|---------|-------|
| `{{ .SiteURL }}` | رابط الموقع |
| `{{ .ConfirmationURL }}` | رابط التأكيد |
| `{{ .Email }}` | البريد الإلكتروني للمستخدم |
| `{{ .Token }}` | رمز التأكيد |
| `{{ .RedirectTo }}` | رابط إعادة التوجيه |
