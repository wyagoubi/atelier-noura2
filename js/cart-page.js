// ============================================================
// Atelier Noura — js/cart-page.js
// ============================================================

function renderCartPage() {
  const root = document.getElementById("cart-root");
  const cart = getCart();

  if (cart.length === 0) {
    root.innerHTML = `
      <div class="state-box">
        <p>${t("cart.empty")}</p>
        <a href="products.html" class="btn btn-primary">${t("cart.continue_shopping")}</a>
      </div>`;
    return;
  }

  const { totalItems, subtotal } = getCartTotals();

  root.innerHTML = `
    <div class="cart-layout">
      <div id="cart-items"></div>
      <div class="summary-box">
        <div class="summary-row"><span>${t("cart.total_items")}</span><strong>${totalItems}</strong></div>
        <div class="summary-row"><span>${t("cart.subtotal")}</span><strong>${formatPrice(subtotal)}</strong></div>
        <a href="checkout.html" class="btn btn-primary btn-block">${t("cart.checkout")}</a>
        <a href="products.html" class="btn btn-outline btn-block" style="margin-top:10px;">${t("cart.continue_shopping")}</a>
      </div>
    </div>`;

  const itemsRoot = document.getElementById("cart-items");
  itemsRoot.innerHTML = cart
    .map(
      (item, idx) => `
      <div class="cart-item" data-idx="${idx}">
        <img src="${item.imageUrl || ""}" alt="${escapeHtml(item.nameAr)}" />
        <div>
          <div>${escapeHtml(localizedField({ name_ar: item.nameAr, name_fr: item.nameFr }, "name"))}</div>
          <div class="cart-item-meta">
            ${item.colorAr ? `${t("product.color")}: ${escapeHtml(item.colorAr)}` : ""}
            ${item.size ? ` — ${t("product.size")}: ${escapeHtml(item.size)}` : ""}
          </div>
          <div class="cart-item-meta">${formatPrice(item.price)}</div>
          <div class="qty-control">
            <button type="button" class="qty-dec">−</button>
            <span>${item.quantity}</span>
            <button type="button" class="qty-inc">+</button>
          </div>
        </div>
        <div style="text-align:end;">
          <div>${formatPrice(item.price * item.quantity)}</div>
          <button type="button" class="remove-item" style="background:none;border:none;color:var(--color-error);cursor:pointer;font-size:0.85rem;">${t("cart.remove")}</button>
        </div>
      </div>`
    )
    .join("");

  itemsRoot.querySelectorAll(".qty-inc").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      updateCartItemQuantity(cart[i].productId, cart[i].variantId, cart[i].quantity + 1);
    });
  });
  itemsRoot.querySelectorAll(".qty-dec").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      updateCartItemQuantity(cart[i].productId, cart[i].variantId, cart[i].quantity - 1);
    });
  });
  itemsRoot.querySelectorAll(".remove-item").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      removeFromCart(cart[i].productId, cart[i].variantId);
    });
  });
}

document.addEventListener("DOMContentLoaded", renderCartPage);
document.addEventListener("cartchanged", renderCartPage);
document.addEventListener("languagechanged", renderCartPage);
