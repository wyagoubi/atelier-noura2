// ============================================================
// Atelier Noura — js/products.js
// ============================================================

let allCategories = [];

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function loadCategoryFilters() {
  const { data } = await supabaseClient.from("categories").select("*").eq("is_active", true).order("sort_order");
  allCategories = data || [];
  const wrap = document.getElementById("category-filters");
  const activeSlug = getQueryParam("category");

  wrap.innerHTML = allCategories
    .map(
      (c) => `
      <label class="checkline">
        <input type="checkbox" class="cat-checkbox" value="${c.slug}" ${activeSlug === c.slug ? "checked" : ""} />
        ${escapeHtml(localizedField(c, "name"))}
      </label>`
    )
    .join("");
}

async function loadProducts() {
  const grid = document.getElementById("products-grid");
  renderLoadingState(grid);

  const selectedCats = Array.from(document.querySelectorAll(".cat-checkbox:checked")).map((el) => el.value);
  const priceMin = document.getElementById("price-min").value;
  const priceMax = document.getElementById("price-max").value;
  const inStockOnly = document.getElementById("filter-in-stock").checked;
  const sort = document.getElementById("sort-select").value;
  const search = document.getElementById("search-input").value.trim();

  let query = supabaseClient.from("products").select("*").eq("is_visible", true);

  if (selectedCats.length > 0) {
    const catIds = allCategories.filter((c) => selectedCats.includes(c.slug)).map((c) => c.id);
    query = query.in("category_id", catIds);
  }
  if (priceMin) query = query.gte("price", priceMin);
  if (priceMax) query = query.lte("price", priceMax);
  if (inStockOnly) query = query.neq("availability", "out_of_stock");
  if (search) query = query.or(`name_ar.ilike.%${search}%,name_fr.ilike.%${search}%`);

  if (sort === "price_asc") query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) return renderErrorState(grid, t("common.error_generic"), loadProducts);
  if (!data || data.length === 0) return renderEmptyState(grid, t("common.no_results"));

  grid.innerHTML = data.map(productCardHtml).join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadCategoryFilters();
  await loadProducts();

  document.getElementById("apply-filters").addEventListener("click", loadProducts);
  document.getElementById("sort-select").addEventListener("change", loadProducts);

  let searchTimer;
  document.getElementById("search-input").addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadProducts, 400);
  });
});

document.addEventListener("languagechanged", async () => {
  await loadCategoryFilters();
  await loadProducts();
});
