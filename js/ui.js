// ============================================================
// Atelier Noura — js/ui.js
// أدوات واجهة عامة تُستخدم في كل الصفحات: تنبيهات، حالات تحميل/فراغ/خطأ
// ============================================================

function showToast(message, type = "success") {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = "toast show" + (type === "error" ? " error" : "");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function renderLoadingState(container, message) {
  container.innerHTML = `
    <div class="state-box">
      <div class="spinner" role="status" aria-label="${message || t('common.loading')}"></div>
      <p>${message || t("common.loading")}</p>
    </div>`;
}

function renderErrorState(container, message, onRetry) {
  container.innerHTML = `
    <div class="state-box">
      <p>${message || t("common.error_generic")}</p>
      ${onRetry ? '<button class="btn btn-outline" id="retry-btn">↻</button>' : ""}
    </div>`;
  if (onRetry) {
    container.querySelector("#retry-btn").addEventListener("click", onRetry);
  }
}

function renderEmptyState(container, message) {
  container.innerHTML = `<div class="state-box"><p>${message || t("common.no_results")}</p></div>`;
}

function productCardHtml(p) {
  const badges = [];
  if (p.is_new) badges.push(`<span class="badge badge-new">${t("product.new_badge")}</span>`);
  if (p.compare_at_price) badges.push(`<span class="badge badge-sale">${t("product.sale_badge")}</span>`);
  const unavailable = p.availability === "out_of_stock";

  return `
    <div class="product-card">
      <a href="product.html?slug=${p.slug}" class="product-card-image">
        <div class="product-card-badges">${badges.join("")}</div>
        <img src="${p.main_image_url || ""}" alt="${escapeHtml(localizedField(p, "name"))}" loading="lazy" />
      </a>
      <div class="product-card-body">
        <a href="product.html?slug=${p.slug}" class="product-card-name">${escapeHtml(localizedField(p, "name"))}</a>
        <div class="product-card-price">
          <span>${formatPrice(p.price)}</span>
          ${p.compare_at_price ? `<span class="old-price">${formatPrice(p.compare_at_price)}</span>` : ""}
        </div>
        ${unavailable ? `<span style="color:var(--color-error); font-size:0.82rem;">${t("product.out_of_stock")}</span>` : ""}
        <div class="product-card-actions">
          <a href="product.html?slug=${p.slug}" class="btn btn-outline">${t("product.view_details")}</a>
        </div>
      </div>
    </div>`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
