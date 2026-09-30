-- ============================================================
-- Atelier Noura — 02_rls_policies.sql
-- سياسات الأمان (Row Level Security)
-- شغّل بعد 01_schema.sql
-- ============================================================

-- دالة مساعدة: هل المستخدم الحالي مسؤولة؟
create or replace function is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from admin_profiles where id = auth.uid()
  );
$$;

-- ------------------------------------------------------------
-- admin_profiles
-- ------------------------------------------------------------
alter table admin_profiles enable row level security;

create policy "admin can read own profile"
on admin_profiles for select
using (id = auth.uid());

-- لا يوجد insert/update/delete من الواجهة إطلاقًا — يتم إنشاء الحساب يدويًا (انظر README)

-- ------------------------------------------------------------
-- categories: قراءة عامة للنشطة فقط، وكل شيء للمسؤولة
-- ------------------------------------------------------------
alter table categories enable row level security;

create policy "public read active categories"
on categories for select
using (is_active = true or is_admin());

create policy "admin manage categories"
on categories for all
using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- products
-- ------------------------------------------------------------
alter table products enable row level security;

create policy "public read visible products"
on products for select
using (is_visible = true or is_admin());

create policy "admin manage products"
on products for all
using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- product_images
-- ------------------------------------------------------------
alter table product_images enable row level security;

create policy "public read product images"
on product_images for select
using (
  exists (select 1 from products p where p.id = product_id and (p.is_visible = true or is_admin()))
);

create policy "admin manage product images"
on product_images for all
using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- product_variants
-- ------------------------------------------------------------
alter table product_variants enable row level security;

create policy "public read variants"
on product_variants for select
using (
  exists (select 1 from products p where p.id = product_id and (p.is_visible = true or is_admin()))
);

create policy "admin manage variants"
on product_variants for all
using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- wilayas / communes: قراءة عامة، كتابة للمسؤولة فقط
-- ------------------------------------------------------------
alter table wilayas enable row level security;
create policy "public read wilayas" on wilayas for select using (true);
create policy "admin manage wilayas" on wilayas for all using (is_admin()) with check (is_admin());

alter table communes enable row level security;
create policy "public read communes" on communes for select using (true);
create policy "admin manage communes" on communes for all using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- delivery_services
-- ------------------------------------------------------------
alter table delivery_services enable row level security;

create policy "public read active delivery services"
on delivery_services for select
using (is_active = true or is_admin());

create policy "admin manage delivery services"
on delivery_services for all
using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- delivery_prices
-- ------------------------------------------------------------
alter table delivery_prices enable row level security;

create policy "public read delivery prices"
on delivery_prices for select
using (is_available = true or is_admin());

create policy "admin manage delivery prices"
on delivery_prices for all
using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- orders: الزبون لا يقرأ أي طلب عبر الواجهة مباشرة (فقط عبر RPC وقت الإنشاء)
-- المسؤولة فقط تقرأ/تعدّل الطلبات
-- ------------------------------------------------------------
alter table orders enable row level security;

create policy "admin read orders"
on orders for select
using (is_admin());

create policy "admin update orders"
on orders for update
using (is_admin()) with check (is_admin());

-- لا توجد سياسة insert عامة: الإنشاء يتم حصريًا عبر دالة create_order (security definer)

-- ------------------------------------------------------------
-- order_items
-- ------------------------------------------------------------
alter table order_items enable row level security;

create policy "admin read order items"
on order_items for select
using (is_admin());

-- ------------------------------------------------------------
-- order_status_history
-- ------------------------------------------------------------
alter table order_status_history enable row level security;

create policy "admin read history"
on order_status_history for select
using (is_admin());

create policy "admin insert history"
on order_status_history for insert
with check (is_admin());

-- ------------------------------------------------------------
-- store_settings: قراءة عامة، تعديل للمسؤولة
-- ------------------------------------------------------------
alter table store_settings enable row level security;

create policy "public read settings"
on store_settings for select
using (true);

create policy "admin update settings"
on store_settings for update
using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- testimonials
-- ------------------------------------------------------------
alter table testimonials enable row level security;

create policy "public read visible testimonials"
on testimonials for select
using (is_visible = true or is_admin());

create policy "admin manage testimonials"
on testimonials for all
using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- faqs
-- ------------------------------------------------------------
alter table faqs enable row level security;

create policy "public read visible faqs"
on faqs for select
using (is_visible = true or is_admin());

create policy "admin manage faqs"
on faqs for all
using (is_admin()) with check (is_admin());
