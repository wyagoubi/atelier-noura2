-- ============================================================
-- Atelier Noura — 03_functions.sql
-- دوال آمنة (RPC) تُنفَّذ داخل قاعدة البيانات:
-- بديل حماية "جهة الخادم" بما أن المشروع بدون Next.js.
-- شغّل بعد 02_rls_policies.sql
-- ============================================================

-- ------------------------------------------------------------
-- get_delivery_price: يحسب سعر التوصيل من الجداول فقط
-- (لا يثق الموقع أبدًا بسعر يرسله المتصفح)
-- ------------------------------------------------------------
create or replace function get_delivery_price(
  p_delivery_service_id uuid,
  p_wilaya_code integer,
  p_method text
) returns numeric
language plpgsql stable as $$
declare
  v_price numeric;
begin
  if p_method not in ('home','office') then
    raise exception 'طريقة توصيل غير صحيحة';
  end if;

  select case when p_method = 'home' then home_price else office_price end
  into v_price
  from delivery_prices
  where delivery_service_id = p_delivery_service_id
    and wilaya_code = p_wilaya_code
    and is_available = true;

  if v_price is null then
    raise exception 'سعر التوصيل لهذه الولاية غير محدد بعد، يرجى التواصل مع المتجر لتأكيد الطلب';
  end if;

  return v_price;
end;
$$;

grant execute on function get_delivery_price(uuid, integer, text) to anon, authenticated;

-- ------------------------------------------------------------
-- create_order: ينشئ الطلب كاملاً بمعاملة واحدة آمنة
-- - يعيد حساب كل الأسعار من قاعدة البيانات (لا يثق بالواجهة)
-- - يتحقق من توفر المخزون ويخصمه بشكل ذري (بدون تعارض عند تزامن طلبين)
-- - يمنع التكرار عبر idempotency_key
-- المدخل: JSON يحتوي بيانات الزبون وقائمة عناصر السلة (product_id, variant_id, quantity)
-- ------------------------------------------------------------
create or replace function create_order(
  p_customer_name text,
  p_customer_phone text,
  p_wilaya_code integer,
  p_commune_name text,
  p_delivery_method text,
  p_address_details text,
  p_notes text,
  p_delivery_service_id uuid,
  p_idempotency_key text,
  p_items jsonb   -- [{ "product_id": "...", "variant_id": "...", "quantity": 2 }, ...]
) returns table (order_id uuid, order_number text, total_amount numeric)
language plpgsql security definer as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_item jsonb;
  v_product products%rowtype;
  v_variant product_variants%rowtype;
  v_quantity integer;
  v_line_total numeric;
  v_subtotal numeric := 0;
  v_delivery_price numeric;
  v_total numeric;
  v_existing_order_id uuid;
begin
  if p_customer_name is null or trim(p_customer_name) = '' then
    raise exception 'الاسم الكامل مطلوب';
  end if;
  if p_customer_phone is null or length(regexp_replace(p_customer_phone, '\D', '', 'g')) < 9 then
    raise exception 'رقم الهاتف غير صحيح';
  end if;
  if p_delivery_method not in ('home','office') then
    raise exception 'طريقة توصيل غير صحيحة';
  end if;
  if p_delivery_method = 'home' and (p_address_details is null or trim(p_address_details) = '') then
    raise exception 'العنوان التفصيلي مطلوب للتوصيل إلى المنزل';
  end if;
  if jsonb_array_length(p_items) = 0 then
    raise exception 'السلة فارغة';
  end if;

  -- منع التكرار: إن وُجد طلب بنفس المفتاح، أعد نتيجته بدل إنشاء طلب جديد
  if p_idempotency_key is not null then
    select id into v_existing_order_id from orders where idempotency_key = p_idempotency_key;
    if v_existing_order_id is not null then
      return query
        select o.id, o.order_number, o.total_amount from orders o where o.id = v_existing_order_id;
      return;
    end if;
  end if;

  v_delivery_price := get_delivery_price(p_delivery_service_id, p_wilaya_code, p_delivery_method);

  v_order_number := 'AN-' || to_char(now(), 'YYMMDD') || '-' || lpad(floor(random()*10000)::text, 4, '0');

  insert into orders (
    order_number, idempotency_key, customer_name, customer_phone, wilaya_code, commune_name,
    delivery_method, address_details, notes, delivery_service_id, delivery_price,
    items_subtotal, total_amount, status
  ) values (
    v_order_number, p_idempotency_key, trim(p_customer_name), trim(p_customer_phone), p_wilaya_code, p_commune_name,
    p_delivery_method, p_address_details, p_notes, p_delivery_service_id, v_delivery_price,
    0, 0, 'new'
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity is null or v_quantity < 1 then
      raise exception 'كمية غير صحيحة لأحد المنتجات';
    end if;

    -- قفل الصف لمنع تعارض التزامن بين طلبين في نفس اللحظة
    select * into v_product from products where id = (v_item->>'product_id')::uuid for update;
    if not found or v_product.is_visible = false then
      raise exception 'أحد المنتجات لم يعد متوفرًا';
    end if;

    if v_item->>'variant_id' is not null then
      select * into v_variant from product_variants where id = (v_item->>'variant_id')::uuid for update;
      if not found then
        raise exception 'خيار اللون/المقاس غير موجود';
      end if;
      if v_product.availability = 'in_stock' and v_variant.stock_quantity < v_quantity then
        raise exception 'الكمية المطلوبة من % غير متوفرة', v_product.name_ar;
      end if;
      if v_product.availability = 'in_stock' then
        update product_variants set stock_quantity = stock_quantity - v_quantity where id = v_variant.id;
      end if;
    else
      if v_product.availability = 'in_stock' and v_product.stock_quantity < v_quantity then
        raise exception 'الكمية المطلوبة من % غير متوفرة', v_product.name_ar;
      end if;
      if v_product.availability = 'in_stock' then
        update products set stock_quantity = stock_quantity - v_quantity where id = v_product.id;
      end if;
    end if;

    if v_product.availability = 'out_of_stock' then
      raise exception '% غير متوفر حاليًا', v_product.name_ar;
    end if;

    v_line_total := v_product.price * v_quantity;
    v_subtotal := v_subtotal + v_line_total;

    insert into order_items (
      order_id, product_id, variant_id, product_name_ar, product_name_fr,
      color_ar, size, unit_price, quantity, line_total
    ) values (
      v_order_id, v_product.id,
      case when v_item->>'variant_id' is not null then (v_item->>'variant_id')::uuid else null end,
      v_product.name_ar, v_product.name_fr,
      case when v_item->>'variant_id' is not null then v_variant.color_ar else null end,
      case when v_item->>'variant_id' is not null then v_variant.size else null end,
      v_product.price, v_quantity, v_line_total
    );
  end loop;

  v_total := v_subtotal + v_delivery_price;

  update orders set items_subtotal = v_subtotal, total_amount = v_total where id = v_order_id;

  insert into order_status_history (order_id, old_status, new_status)
  values (v_order_id, null, 'new');

  return query select v_order_id, v_order_number, v_total;
end;
$$;

grant execute on function create_order(text, text, integer, text, text, text, text, uuid, text, jsonb) to anon, authenticated;

-- ------------------------------------------------------------
-- admin_update_order_status: تغيير حالة الطلب + إعادة المخزون عند الإلغاء
-- ------------------------------------------------------------
create or replace function admin_update_order_status(
  p_order_id uuid,
  p_new_status text,
  p_cancel_reason text default null
) returns void
language plpgsql security definer as $$
declare
  v_old_status text;
  v_item order_items%rowtype;
begin
  if not is_admin() then
    raise exception 'غير مصرح';
  end if;

  select status into v_old_status from orders where id = p_order_id for update;
  if not found then
    raise exception 'الطلب غير موجود';
  end if;

  if p_new_status = 'cancelled' and v_old_status <> 'cancelled' then
    for v_item in select * from order_items where order_id = p_order_id
    loop
      if v_item.variant_id is not null then
        update product_variants set stock_quantity = stock_quantity + v_item.quantity
        where id = v_item.variant_id;
      else
        update products set stock_quantity = stock_quantity + v_item.quantity
        where id = v_item.product_id;
      end if;
    end loop;
  end if;

  update orders
  set status = p_new_status,
      cancel_reason = case when p_new_status = 'cancelled' then p_cancel_reason else cancel_reason end
  where id = p_order_id;

  insert into order_status_history (order_id, old_status, new_status, changed_by)
  values (p_order_id, v_old_status, p_new_status, auth.uid());
end;
$$;

grant execute on function admin_update_order_status(uuid, text, text) to authenticated;
