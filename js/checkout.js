// ============================================================
// Atelier Noura — js/checkout.js
// السعر النهائي وسعر التوصيل يُحسبان داخل قاعدة البيانات عبر
// دالة create_order وget_delivery_price (03_functions.sql) —
// هذا الملف لا يحسب السعر النهائي بنفسه، يعرض فقط تقديرًا للزبونة
// قبل الإرسال، والمصدر الحقيقي للحقيقة هو قاعدة البيانات.
// ============================================================

let activeDeliveryService = null;
let currentDeliveryPrice = null;

async function loadWilayas() {
  const { data } = await supabaseClient.from("wilayas").select("*").order("code");
  const select = document.getElementById("f-wilaya");
  select.innerHTML =
    `<option value="">—</option>` +
    (data || []).map((w) => `<option value="${w.code}">${localizedField(w, "name")}</option>`).join("");
}

async function loadCommunes(wilayaCode) {
  const wrap = document.getElementById("commune-wrap");
  const { data } = await supabaseClient.from("communes").select("*").eq("wilaya_code", wilayaCode).order("name_ar");

  if (data && data.length > 0) {
    wrap.innerHTML = `
      <select id="f-commune" class="form-control" required>
        <option value="">—</option>
        ${data.map((c) => `<option value="${escapeHtml(localizedField(c, "name"))}">${escapeHtml(localizedField(c, "name"))}</option>`).join("")}
      </select>`;
  } else {
    // لا توجد بلديات مُدخلة لهذه الولاية بعد في لوحة الإدارة: حقل نصي كبديل
    wrap.innerHTML = `<input type="text" id="f-commune" class="form-control" required placeholder="${t("checkout.commune")}" />`;
  }
}

async function loadActiveDeliveryService() {
  const { data } = await supabaseClient.from("delivery_services").select("*").eq("is_active", true).limit(1).single();
  activeDeliveryService = data || null;
}

async function recalculateDelivery() {
  const wilayaCode = document.getElementById("f-wilaya").value;
  const method = document.getElementById("f-method").value;
  const deliveryLabel = document.getElementById("sum-delivery");

  if (!wilayaCode || !activeDeliveryService) {
    deliveryLabel.textContent = "—";
    currentDeliveryPrice = null;
    return;
  }

  const { data, error } = await supabaseClient.rpc("get_delivery_price", {
    p_delivery_service_id: activeDeliveryService.id,
    p_wilaya_code: Number(wilayaCode),
    p_method: method,
  });

  if (error) {
    deliveryLabel.textContent = t("checkout.select_wilaya_first");
    currentDeliveryPrice = null;
  } else {
    currentDeliveryPrice = data;
    deliveryLabel.textContent = formatPrice(data);
  }
  updateTotals();
}

function updateTotals() {
  const { subtotal } = getCartTotals();
  document.getElementById("sum-subtotal").textContent = formatPrice(subtotal);
  const total = subtotal + (currentDeliveryPrice || 0);
  document.getElementById("sum-total").textContent = currentDeliveryPrice === null ? "—" : formatPrice(total);
}

function renderSummaryItems() {
  const cart = getCart();
  document.getElementById("summary-items").innerHTML = cart
    .map(
      (item) => `
      <div class="summary-row">
        <span>${escapeHtml(localizedField({ name_ar: item.nameAr, name_fr: item.nameFr }, "name"))} × ${item.quantity}</span>
        <span>${formatPrice(item.price * item.quantity)}</span>
      </div>`
    )
    .join("");
}

function getOrCreateIdempotencyKey() {
  let key = sessionStorage.getItem("an_checkout_key");
  if (!key) {
    key = crypto.randomUUID();
    sessionStorage.setItem("an_checkout_key", key);
  }
  return key;
}

async function handleSubmit(e) {
  e.preventDefault();
  const errorBox = document.getElementById("checkout-error");
  errorBox.style.display = "none";
  const submitBtn = document.getElementById("submit-btn");

  const cart = getCart();
  if (cart.length === 0) return;

  const method = document.getElementById("f-method").value;
  const communeEl = document.getElementById("f-commune");

  submitBtn.disabled = true;
  submitBtn.textContent = t("checkout.submitting");

  const { data, error } = await supabaseClient.rpc("create_order", {
    p_customer_name: document.getElementById("f-name").value,
    p_customer_phone: document.getElementById("f-phone").value,
    p_wilaya_code: Number(document.getElementById("f-wilaya").value),
    p_commune_name: communeEl.value,
    p_delivery_method: method,
    p_address_details: document.getElementById("f-address").value,
    p_notes: document.getElementById("f-notes").value,
    p_delivery_service_id: activeDeliveryService ? activeDeliveryService.id : null,
    p_idempotency_key: getOrCreateIdempotencyKey(),
    p_items: cart.map((c) => ({
      product_id: c.productId,
      variant_id: c.variantId,
      quantity: c.quantity,
    })),
  });

  if (error) {
    errorBox.textContent = error.message || t("common.error_generic");
    errorBox.style.display = "block";
    submitBtn.disabled = false;
    submitBtn.textContent = t("checkout.submit");
    return;
  }

  const result = Array.isArray(data) ? data[0] : data;
  sessionStorage.removeItem("an_checkout_key");
  clearCart();
  window.location.href = `order-success.html?order=${result.order_number}&total=${result.total_amount}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const cart = getCart();
  if (cart.length === 0) {
    document.getElementById("checkout-empty").style.display = "block";
    document.getElementById("checkout-form").style.display = "none";
    return;
  }

  renderSummaryItems();
  await loadWilayas();
  await loadActiveDeliveryService();
  updateTotals();

  document.getElementById("f-wilaya").addEventListener("change", async (e) => {
    document.getElementById("f-commune") && (document.getElementById("commune-wrap").innerHTML = "");
    if (e.target.value) await loadCommunes(Number(e.target.value));
    await recalculateDelivery();
  });

  document.getElementById("f-method").addEventListener("change", () => {
    const isHome = document.getElementById("f-method").value === "home";
    document.getElementById("address-fieldset").style.display = isHome ? "block" : "none";
    document.getElementById("f-address").required = isHome;
    recalculateDelivery();
  });

  document.getElementById("checkout-form").addEventListener("submit", handleSubmit);
});
