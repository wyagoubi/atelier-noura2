// ============================================================
// Atelier Noura — js/config.js
// إعدادات عامة للموقع بأكمله.
//
// ⚠️ عند النشر: استبدلي القيمتين أدناه بقيم مشروعك في Supabase
// (Project Settings > API). مفتاح anon هذا مصمم ليكون علنيًا
// وآمن بشرط تفعيل RLS (تم تفعيله في 02_rls_policies.sql).
// لا تضعي أبدًا service_role key هنا أو في أي ملف JS.
// ============================================================

const APP_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT-REF.supabase.co",
  SUPABASE_ANON_KEY: "YOUR-ANON-PUBLIC-KEY",

  // أسماء الـ Buckets كما أُنشئت في Supabase Storage
  STORAGE_BUCKET_PRODUCTS: "product-images",
  STORAGE_BUCKET_ASSETS: "store-assets",

  DEFAULT_LANGUAGE: "ar",
  CURRENCY_LABEL_AR: "د.ج",
  CURRENCY_LABEL_FR: "DA",
};
