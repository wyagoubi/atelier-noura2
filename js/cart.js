// ============================================================
// Atelier Noura — js/cart.js
// السلة تُحفظ في localStorage فتبقى عند تحديث الصفحة أو التنقل.
// الكميات النهائية والأسعار يُعاد التحقق منها والتحكم بها لاحقًا
// من جهة قاعدة البيانات (دالة create_order) وقت إرسال الطلب.
// ============================================================

const CART_KEY = "an_cart_v1";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  document.dispatchEvent(new CustomEvent("cartchanged", { detail: { cart } }));
}

// item: { productId, variantId, nameAr, nameFr, price, imageUrl, colorAr, size, quantity, maxStock, availability }
function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(
    (c) => c.productId === item.productId && c.variantId === item.variantId
  );

  if (existing) {
    const newQty = existing.quantity + item.quantity;
    existing.quantity =
      item.availability === "made_to_order"
        ? newQty
        : Math.min(newQty, item.maxStock ?? newQty);
  } else {
    cart.push({
      ...item,
      quantity:
        item.availability === "made_to_order"
          ? item.quantity
          : Math.min(item.quantity, item.maxStock ?? item.quantity),
    });
  }
  saveCart(cart);
}

function updateCartItemQuantity(productId, variantId, quantity) {
  const cart = getCart();
  const item = cart.find((c) => c.productId === productId && c.variantId === variantId);
  if (!item) return;
  if (quantity < 1) {
    removeFromCart(productId, variantId);
    return;
  }
  item.quantity =
    item.availability === "made_to_order" ? quantity : Math.min(quantity, item.maxStock ?? quantity);
  saveCart(cart);
}

function removeFromCart(productId, variantId) {
  const cart = getCart().filter(
    (c) => !(c.productId === productId && c.variantId === variantId)
  );
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function getCartTotals() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);
  const subtotal = cart.reduce((sum, c) => sum + c.quantity * c.price, 0);
  return { totalItems, subtotal };
}

function updateCartBadge() {
  const { totalItems } = getCartTotals();
  document.querySelectorAll(".cart-count").forEach((badge) => {
    badge.textContent = totalItems;
    badge.classList.add("bump");
    setTimeout(() => badge.classList.remove("bump"), 250);
  });
}

document.addEventListener("DOMContentLoaded", updateCartBadge);
