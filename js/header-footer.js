// ============================================================
// Atelier Noura — js/header-footer.js
// يُدرج الترويسة والتذييل داخل أي صفحة تحتوي على
// <div id="site-header"></div> و <div id="site-footer"></div>
// هذا يضمن تطابق الترويسة/التذييل في كل صفحات الموقع الـ19.
// ============================================================

function renderHeader() {
  const el = document.getElementById("site-header");
  if (!el) return;
  el.innerHTML = `
    <header class="site-header">
      <div class="container">
        <a href="index.html" class="logo">Atelier Noura</a>

        <nav class="main-nav" id="main-nav">
          <a href="index.html" data-i18n="nav.home">الرئيسية</a>
          <a href="products.html" data-i18n="nav.products">المنتجات</a>
          <a href="about.html" data-i18n="nav.about">من نحن</a>
          <a href="contact.html" data-i18n="nav.contact">تواصلي معنا</a>
          <a href="faq.html" data-i18n="nav.faq">الأسئلة الشائعة</a>
        </nav>

        <div class="header-actions">
          <div class="lang-switch">
            <button data-lang="ar">AR</button>
            <button data-lang="fr">FR</button>
          </div>
          <a href="cart.html" class="icon-btn" aria-label="${t("nav.cart")}">
            🛍️ <span class="cart-count">0</span>
          </a>
          <button class="mobile-nav-toggle" id="mobile-nav-toggle" aria-label="القائمة">☰</button>
        </div>
      </div>
    </header>`;

  el.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.getAttribute("data-lang")));
  });

  const toggle = el.querySelector("#mobile-nav-toggle");
  const nav = el.querySelector("#main-nav");
  toggle.addEventListener("click", () => nav.classList.toggle("open"));

  applyLanguage();
  updateCartBadge();
}

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;
  el.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div>
          <h4>Atelier Noura</h4>
          <p style="color: var(--color-beige); font-size: 0.88rem;" id="footer-tagline"></p>
        </div>
        <div>
          <h4 data-i18n="footer.contact">تواصلي معنا</h4>
          <a href="contact.html" data-i18n="nav.contact">تواصلي معنا</a>
          <a href="faq.html" data-i18n="nav.faq">الأسئلة الشائعة</a>
        </div>
        <div>
          <h4 data-i18n="footer.policies">السياسات</h4>
          <a href="privacy.html" data-i18n="footer.privacy">سياسة الخصوصية</a>
          <a href="delivery-policy.html" data-i18n="footer.delivery_policy">التوصيل والاستبدال</a>
        </div>
        <div id="footer-social">
          <h4>Social</h4>
        </div>
      </div>
      <div class="footer-bottom">&copy; <span id="footer-year"></span> Atelier Noura</div>
    </footer>`;
  document.getElementById("footer-year").textContent = new Date().getFullYear();
  applyLanguage();
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
});
document.addEventListener("languagechanged", () => {
  renderHeader();
  renderFooter();
});
