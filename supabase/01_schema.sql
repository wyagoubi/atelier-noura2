-- ============================================================
-- Atelier Noura — 01_schema.sql
-- الجداول والعلاقات والفهارس والقيود
-- شغّل هذا الملف أولاً في Supabase SQL Editor
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1) admin_profiles: يربط مستخدم Supabase Auth بصلاحية إدارية
-- ------------------------------------------------------------
create table if not exists admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2) categories: التصنيفات
-- ------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null,
  name_fr text not null,
  description_ar text,
  description_fr text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3) products: المنتجات
-- ------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete restrict,
  slug text not null unique,
  name_ar text not null,
  name_fr text not null,
  description_ar text,
  description_fr text,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2) check (compare_at_price is null or compare_at_price >= price),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  availability text not null default 'in_stock'
    check (availability in ('in_stock', 'out_of_stock', 'made_to_order')),
  is_new boolean not null default false,
  is_featured boolean not null default false,
  is_visible boolean not null default true,
  has_variants boolean not null default false,
  main_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_visible on products(is_visible);
create index if not exists idx_products_featured on products(is_featured);
create index if not exists idx_products_new on products(is_new);

-- ------------------------------------------------------------
-- 4) product_images: صور إضافية للمنتج (بترتيب قابل للتعديل)
-- ------------------------------------------------------------
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product on product_images(product_id);

-- ------------------------------------------------------------
-- 5) product_variants: الألوان/المقاسات ومخزون كل توليفة
-- ------------------------------------------------------------
create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  color_ar text,
  color_fr text,
  size text,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(product_id, color_ar, size)
);

create index if not exists idx_variants_product on product_variants(product_id);

-- ------------------------------------------------------------
-- 6) delivery_zones: الولايات الجزائرية الـ58 (والبلديات لاحقًا كنص JSON بسيط)
-- ------------------------------------------------------------
create table if not exists wilayas (
  code integer primary key,      -- 01 .. 58
  name_ar text not null,
  name_fr text not null
);

create table if not exists communes (
  id uuid primary key default gen_random_uuid(),
  wilaya_code integer not null references wilayas(code) on delete cascade,
  name_ar text not null,
  name_fr text not null
);

create index if not exists idx_communes_wilaya on communes(wilaya_code);

-- ------------------------------------------------------------
-- 7) delivery_services: شركات التوصيل
-- ------------------------------------------------------------
create table if not exists delivery_services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default true,
  estimated_days_min integer,
  estimated_days_max integer,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 8) delivery_prices: سعر التوصيل لكل شركة/ولاية/طريقة استلام
-- ------------------------------------------------------------
create table if not exists delivery_prices (
  id uuid primary key default gen_random_uuid(),
  delivery_service_id uuid not null references delivery_services(id) on delete cascade,
  wilaya_code integer not null references wilayas(code) on delete cascade,
  home_price numeric(10,2) check (home_price is null or home_price >= 0),
  office_price numeric(10,2) check (office_price is null or office_price >= 0),
  is_available boolean not null default true,
  updated_at timestamptz not null default now(),
  unique(delivery_service_id, wilaya_code)
);

create index if not exists idx_delivery_prices_wilaya on delivery_prices(wilaya_code);

-- ------------------------------------------------------------
-- 9) orders: الطلبات
-- ------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  idempotency_key text unique, -- لمنع الطلبات المكررة بسبب النقر المتكرر
  customer_name text not null,
  customer_phone text not null,
  wilaya_code integer not null references wilayas(code),
  commune_name text not null,
  delivery_method text not null check (delivery_method in ('home', 'office')),
  address_details text,
  notes text,
  delivery_service_id uuid references delivery_services(id),
  delivery_price numeric(10,2) not null default 0,
  items_subtotal numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null default 0,
  status text not null default 'new'
    check (status in ('new','pending_confirmation','confirmed','preparing','shipped','delivered','cancelled')),
  cancel_reason text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_wilaya on orders(wilaya_code);
create index if not exists idx_orders_created on orders(created_at desc);
create index if not exists idx_orders_phone on orders(customer_phone);

-- ------------------------------------------------------------
-- 10) order_items: عناصر الطلب (نسخة ثابتة وقت الشراء)
-- ------------------------------------------------------------
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  product_name_ar text not null,
  product_name_fr text not null,
  color_ar text,
  size text,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(10,2) not null check (line_total >= 0)
);

create index if not exists idx_order_items_order on order_items(order_id);

-- ------------------------------------------------------------
-- 11) order_status_history: سجل تغييرات حالة الطلب
-- ------------------------------------------------------------
create table if not exists order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 12) store_settings: إعدادات المتجر العامة (سجل واحد فقط)
-- ------------------------------------------------------------
create table if not exists store_settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null default 'Atelier Noura',
  logo_url text,
  hero_title_ar text,
  hero_title_fr text,
  hero_subtitle_ar text,
  hero_subtitle_fr text,
  hero_image_url text,
  about_ar text,
  about_fr text,
  show_testimonials boolean not null default true,
  contact_email text,
  contact_phone text,
  facebook_url text,
  instagram_url text,
  privacy_policy_ar text,
  privacy_policy_fr text,
  delivery_return_policy_ar text,
  delivery_return_policy_fr text,
  updated_at timestamptz not null default now()
);

insert into store_settings (id, store_name)
values (1, 'Atelier Noura')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 13) testimonials: آراء الزبائن
-- ------------------------------------------------------------
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  content_ar text,
  content_fr text,
  rating integer check (rating between 1 and 5),
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 14) faqs: الأسئلة الشائعة
-- ------------------------------------------------------------
create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question_ar text not null,
  question_fr text,
  answer_ar text not null,
  answer_fr text,
  sort_order integer not null default 0,
  is_visible boolean not null default true
);

-- updated_at trigger عام
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_categories_updated on categories;
create trigger trg_categories_updated before update on categories
for each row execute function set_updated_at();

drop trigger if exists trg_products_updated on products;
create trigger trg_products_updated before update on products
for each row execute function set_updated_at();

drop trigger if exists trg_orders_updated on orders;
create trigger trg_orders_updated before update on orders
for each row execute function set_updated_at();

drop trigger if exists trg_delivery_prices_updated on delivery_prices;
create trigger trg_delivery_prices_updated before update on delivery_prices
for each row execute function set_updated_at();

drop trigger if exists trg_store_settings_updated on store_settings;
create trigger trg_store_settings_updated before update on store_settings
for each row execute function set_updated_at();
