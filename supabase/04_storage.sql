-- ============================================================
-- Atelier Noura — 04_storage.sql
-- إعداد Supabase Storage وسياسات رفع/حذف الصور
-- ============================================================
-- ملاحظة: يجب أولاً إنشاء Bucket باسم "product-images" من
-- لوحة Supabase (Storage > New bucket)، واختيار "Public bucket".
-- بعد إنشائه، شغّل هذا الملف لإضافة سياسات الوصول عليه.

-- قراءة عامة للصور (bucket عام أصلاً، لكن نضيف السياسة للوضوح والتوافق)
create policy "public read product images bucket"
on storage.objects for select
using (bucket_id = 'product-images');

-- رفع الصور: للمسؤولة فقط
create policy "admin upload product images"
on storage.objects for insert
with check (bucket_id = 'product-images' and is_admin());

-- تعديل/استبدال الصور: للمسؤولة فقط
create policy "admin update product images"
on storage.objects for update
using (bucket_id = 'product-images' and is_admin())
with check (bucket_id = 'product-images' and is_admin());

-- حذف الصور: للمسؤولة فقط
create policy "admin delete product images"
on storage.objects for delete
using (bucket_id = 'product-images' and is_admin());

-- نفس المبدأ لـ bucket شعار/صور المتجر العامة (Hero، الشعار...)
-- أنشئ Bucket باسم "store-assets" (عام أيضًا) ثم شغّل ما يلي:

create policy "public read store assets"
on storage.objects for select
using (bucket_id = 'store-assets');

create policy "admin manage store assets insert"
on storage.objects for insert
with check (bucket_id = 'store-assets' and is_admin());

create policy "admin manage store assets update"
on storage.objects for update
using (bucket_id = 'store-assets' and is_admin())
with check (bucket_id = 'store-assets' and is_admin());

create policy "admin manage store assets delete"
on storage.objects for delete
using (bucket_id = 'store-assets' and is_admin());
