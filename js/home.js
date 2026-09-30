// ============================================================
// Atelier Noura — js/home.js
// يجلب كل محتوى الصفحة الرئيسية من Supabase مباشرة.
// لا توجد أي بيانات وهمية هنا: كل قسم يعرض حالة تحميل/فراغ/خطأ
// واضحة إن لم تتوفر بيانات فعلية بعد.
// ============================================================

async function loadStoreSettings() {
  const { data, error } = await supabaseClient
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) return;

  const heroImg = document.getElementById("hero-image");
  if (heroImg) {
    heroImg.src = data.hero_image_url || "";
    heroImg.alt = "Atelier Noura";
    if (!data.hero_image_url) heroImg.closest(".hero-image").style.display = "none";
  }

  const aboutText = document.getElementById("store-about-text");
  if (aboutText) {
    const text = localizedField(data, "about");
    if (text) {
      aboutText.textContent = text;
    } else {
      document.getElementById("story-section").style.display = "none";
    }
  }

  if (!data.show_testimonials) {
    document.getElementById("testimonials-section").style.display = "none";
  } else {
    loadTestimonials();
  }
}

async function loadCategories() {
  const grid = document.getElementById("category-grid");
  const { data, error } = await supabaseClient
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) return renderErrorState(grid, t("common.error_generic"), loadCategories);
  if (!data || data.length === 0) return renderEmptyState(grid);

  grid.innerHTML = data
    .map(
      (cat) => `
      <a class="category-card" href="products.html?category=${cat.slug}">
        <img src="${cat.image_url || ""}" alt="${escapeHtml(localizedField(cat, "name"))}" loading="lazy" />
        <span>${escapeHtml(localizedField(cat, "name"))}</span>
      </a>`
    )
    .join("");
}

async function loadProductSection(containerId, filterFn) {
  const grid = document.getElementById(containerId);
  let query = supabaseClient.from("products").select("*").eq("is_visible", true).limit(8);
  query = filterFn(query);
  const { data, error } = await query;

  if (error) return renderErrorState(grid, t("common.error_generic"), () => loadProductSection(containerId, filterFn));
  if (!data || data.length === 0) return renderEmptyState(grid);

  grid.innerHTML = data.map(productCardHtml).join("");
}

async function loadTestimonials() {
  const grid = document.getElementById("testimonials-grid");
  const { data, error } = await supabaseClient
    .from("testimonials")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    document.getElementById("testimonials-section").style.display = "none";
    return;
  }

  grid.innerHTML = data
    .map(
      (tst) => `
      <div class="product-card" style="padding:18px;">
        <p style="font-style:italic;">"${escapeHtml(localizedField(tst, "content"))}"</p>
        <strong>${escapeHtml(tst.customer_name)}</strong>
      </div>`
    )
    .join("");
}

async function loadFaqs() {
  const list = document.getElementById("faq-list");
  const { data, error } = await supabaseClient
    .from("faqs")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (error) return renderErrorState(list, t("common.error_generic"), loadFaqs);
  if (!data || data.length === 0) return renderEmptyState(list);

  list.innerHTML = data
    .map(
      (f) => `
      <details style="margin-bottom:12px; border-bottom:1px solid var(--color-beige); padding-bottom:12px;">
        <summary style="cursor:pointer; font-weight:600;">${escapeHtml(localizedField(f, "question"))}</summary>
        <p style="margin-top:8px;">${escapeHtml(localizedField(f, "answer"))}</p>
      </details>`
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  loadStoreSettings();
  loadCategories();
  loadProductSection("new-arrivals-grid", (q) => q.eq("is_new", true));
  loadProductSection("best-sellers-grid", (q) => q.eq("is_featured", true));
  loadFaqs();
});

document.addEventListener("languagechanged", () => {
  loadCategories();
  loadProductSection("new-arrivals-grid", (q) => q.eq("is_new", true));
  loadProductSection("best-sellers-grid", (q) => q.eq("is_featured", true));
  loadFaqs();
});
