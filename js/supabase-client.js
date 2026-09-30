// ============================================================
// Atelier Noura — js/supabase-client.js
// نسخة واحدة من عميل Supabase تُستخدم في كل الملفات.
// يعتمد على مكتبة supabase-js المحمّلة عبر CDN في كل صفحة HTML
// قبل هذا الملف:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
// ============================================================

const supabaseClient = window.supabase.createClient(
  APP_CONFIG.SUPABASE_URL,
  APP_CONFIG.SUPABASE_ANON_KEY
);

// دالة مساعدة لبناء رابط صورة عام داخل bucket معيّن
function getPublicImageUrl(bucket, path) {
  if (!path) return null;
  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  return data ? data.publicUrl : null;
}
