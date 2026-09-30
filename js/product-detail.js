// ============================================================
// Atelier Noura — js/product-detail.js
// ============================================================

let currentProduct = null;
let currentImages = [];
let currentVariants = [];
let selectedColor = null;
let selectedSize = null;

function getSlug() {
  return new URLSearchParams(window.location.search).get("slug");
}

function matchingVariant() {
  if (currentVariants.length === 0) return null;
  return currentVariants.find(
    (v) => (v.color_ar || null) === selectedColor && (v.size || null) === selectedSize
  );
}

function renderProduct() {
  const p = currentProduct;
  const root = document.getElementById("product-detail-root");

  const colors = [...new Set(currentVariants.map((v) => v.color_ar).filter(Boolean))];
  const sizes = [...new Set(currentVariants.map((v) => v.size).filter(Boolean))];

  root.innerHTML = `
    <div class="pd-layout">
      <div>
        <div class="pd-gallery-main" id="pd-gallery-main">
          <img id="pd-main-image" src="${currentImages[0]?.image_url || p.main_image_url || ""}" alt="${escapeHtml(localizedField(p, "name"))}" />
        </div>
        <div class="pd-thumbs" id="pd-thumbs"></div>
      </div>
      <div>
        <h1>${escapeHtml(localizedField(p, "name"))}</h1>
        <div class="pd-price">
          <span>${formatPrice(p.price)}</span>
          ${p.compare_at_price ? `<span class="old-price">${formatPrice(p.compare_at_price)}</span>` : ""}
        </div>
        <p>${escapeHtml(localizedField(p, "description"))}</p>

        ${p.availability === "out_of_stock" ? `<p style="color:var(--color-error); font-weight:600;">${t("product.out_of_stock")}</p>` : ""}
        ${p.availability === "made_to_order" ? `<p style="color:var(--color-brown); font-weight:600;">${t("product.made_to_order")}</p>` : ""}

        <div class="pd-options">
          ${colors.length ? `
          <div>
            <label>${t("product.color")}</label>
            <div class="swatch-group" id="color-group">
              ${colors.map((c) => `<button type="button" class="swatch" data-color="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("")}
            </div>
          </div>` : ""}

          ${sizes.length ? `
          <div>
            <label>${t("product.size")}</label>
            <div class="swatch-group" id="size-group">
              ${sizes.map((s) => `<button type="button" class="swatch" data-size="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join("")}
            </div>
          </div>` : ""}

          <div class="form-group">
            <label>${t("product.quantity")}</label>
            <div class="qty-control">
              <button type="button" id="qty-minus">−</button>
              <span id="qty-value">1</span>
              <button type="button" id="qty-plus">+</button>
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-block" id="add-to-cart-btn" ${p.availability === "out_of_stock" ? "disabled" : ""}>
          ${t("product.add_to_cart")}
        </button>
        <p class="form-error" id="variant-error" style="display:none; margin-top:10px;"></p>
      </div>
    </div>`;

  renderThumbs();

  document.querySelectorAll("#color-group .swatch").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedColor = btn.dataset.color;
      document.querySelectorAll("#color-group .swatch").forEach((b) => b.classList.toggle("active", b === btn));
    });
  });
  document.querySelectorAll("#size-group .swatch").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedSize = btn.dataset.size;
      document.querySelectorAll("#size-group .swatch").forEach((b) => b.classList.toggle("active", b === btn));
    });
  });

  let qty = 1;
  const qtyValue = document.getElementById("qty-value");
  document.getElementById("qty-minus").addEventListener("click", () => {
    if (qty > 1) qtyValue.textContent = --qty;
  });
  document.getElementById("qty-plus").addEventListener("click", () => {
    qtyValue.textContent = ++qty;
  });

  document.getElementById("pd-gallery-main").addEventListener("click", (e) => {
    e.currentTarget.classList.toggle("zoomed");
  });

  document.getElementById("add-to-cart-btn").addEventListener("click", () => {
    const errorBox = document.getElementById("variant-error");
    errorBox.style.display = "none";

    if (colors.length > 0 && !selectedColor) {
      errorBox.textContent = t("product.color") + " *";
      errorBox.style.display = "block";
      return;
    }
    if (sizes.length > 0 && !selectedSize) {
      errorBox.textContent = t("product.size") + " *";
      errorBox.style.display = "block";
      return;
    }

    const variant = matchingVariant();
    const maxStock = variant ? variant.stock_quantity : p.stock_quantity;

    if (p.availability === "in_stock" && maxStock < qty) {
      errorBox.textContent = t("product.out_of_stock");
      errorBox.style.display = "block";
      return;
    }

    addToCart({
      productId: p.id,
      variantId: variant ? variant.id : null,
      nameAr: p.name_ar,
      nameFr: p.name_fr,
      price: p.price,
      imageUrl: currentImages[0]?.image_url || p.main_image_url,
      colorAr: selectedColor,
      size: selectedSize,
      quantity: qty,
      maxStock,
      availability: p.availability,
    });

    showToast(t("product.add_to_cart") + " ✓");
  });
}

function renderThumbs() {
  const thumbs = document.getElementById("pd-thumbs");
  const images = currentImages.length > 0 ? currentImages : [{ image_url: currentProduct.main_image_url }];
  thumbs.innerHTML = images
    .map((img, i) => `<img src="${img.image_url}" data-index="${i}" class="${i === 0 ? "active" : ""}" />`)
    .join("");

  thumbs.querySelectorAll("img").forEach((imgEl) => {
    imgEl.addEventListener("click", () => {
      document.getElementById("pd-main-image").src = imgEl.src;
      thumbs.querySelectorAll("img").forEach((i) => i.classList.remove("active"));
      imgEl.classList.add("active");
    });
  });
}

async function loadSimilarProducts(categoryId, excludeId) {
  const grid = document.getElementById("similar-grid");
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_visible", true)
    .neq("id", excludeId)
    .limit(4);

  if (error) return renderErrorState(grid);
  if (!data || data.length === 0) return renderEmptyState(grid, "");

  grid.innerHTML = data.map(productCardHtml).join("");
}

async function loadProductDetail() {
  const slug = getSlug();
  const root = document.getElementById("product-detail-root");
  if (!slug) return renderErrorState(root, t("common.error_generic"));

  renderLoadingState(root);

  const { data: product, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_visible", true)
    .single();

  if (error || !product) return renderErrorState(root, t("common.no_results"));

  currentProduct = product;
  selectedColor = null;
  selectedSize = null;

  const [{ data: images }, { data: variants }] = await Promise.all([
    supabaseClient.from("product_images").select("*").eq("product_id", product.id).order("sort_order"),
    supabaseClient.from("product_variants").select("*").eq("product_id", product.id).eq("is_active", true),
  ]);

  currentImages = images || [];
  currentVariants = variants || [];

  document.title = `${localizedField(product, "name")} — Atelier Noura`;
  renderProduct();
  loadSimilarProducts(product.category_id, product.id);
}

document.addEventListener("DOMContentLoaded", loadProductDetail);
document.addEventListener("languagechanged", () => {
  if (currentProduct) renderProduct();
});
