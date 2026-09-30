// ============================================================
// Atelier Noura — js/i18n.js
// نظام ترجمة بسيط: يبحث عن كل عنصر فيه data-i18n ويملأه بالنص
// المناسب حسب اللغة الحالية. اللغة تُحفظ في localStorage.
// ============================================================

const TRANSLATIONS = {
  ar: {
    "nav.home": "الرئيسية",
    "nav.products": "المنتجات",
    "nav.bags": "الحقائب",
    "nav.accessories": "الإكسسوارات",
    "nav.clothing": "الملابس",
    "nav.skirts": "التنانير",
    "nav.about": "من نحن",
    "nav.contact": "تواصلي معنا",
    "nav.faq": "الأسئلة الشائعة",
    "nav.search_placeholder": "ابحثي عن منتج...",
    "nav.cart": "السلة",
    "hero.cta": "اكتشفي المجموعة",
    "hero.tagline": "قطع مصنوعة بالخياطة اليدوية، بحب وتفصيل دقيق، من قلب الجزائر.",
    "home.new_arrivals": "وصل حديثًا",
    "home.best_sellers": "الأكثر طلبًا",
    "home.our_story": "قصتنا",
    "home.testimonials": "آراء زبائننا",
    "home.faq_title": "الأسئلة الشائعة",
    "product.add_to_cart": "أضيفي إلى السلة",
    "product.view_details": "عرض التفاصيل",
    "product.color": "اللون",
    "product.size": "المقاس",
    "product.quantity": "الكمية",
    "product.price": "السعر",
    "product.similar": "منتجات مشابهة",
    "product.new_badge": "جديد",
    "product.sale_badge": "تخفيض",
    "product.out_of_stock": "غير متوفر حاليًا",
    "product.made_to_order": "يُصنع حسب الطلب",
    "filters.category": "التصنيف",
    "filters.price": "السعر",
    "filters.availability": "التوفر",
    "filters.sort": "ترتيب حسب",
    "filters.all": "الكل",
    "cart.title": "سلة المشتريات",
    "cart.empty": "سلتك فارغة حاليًا",
    "cart.continue_shopping": "متابعة التسوق",
    "cart.subtotal": "المجموع",
    "cart.checkout": "إتمام الطلب",
    "cart.total_items": "عدد القطع",
    "cart.remove": "حذف",
    "checkout.title": "إتمام الطلب",
    "checkout.full_name": "الاسم الكامل",
    "checkout.phone": "رقم الهاتف",
    "checkout.wilaya": "الولاية",
    "checkout.commune": "البلدية",
    "checkout.delivery_method": "طريقة التوصيل",
    "checkout.home_delivery": "التوصيل إلى المنزل",
    "checkout.office_delivery": "الاستلام من المكتب",
    "checkout.address": "العنوان التفصيلي",
    "checkout.notes": "ملاحظات إضافية (اختياري)",
    "checkout.delivery_price": "سعر التوصيل",
    "checkout.total": "المبلغ الإجمالي",
    "checkout.agree_policy": "أوافق على سياسة الخصوصية وشروط الطلب",
    "checkout.submit": "تأكيد الطلب",
    "checkout.submitting": "جارٍ إرسال الطلب...",
    "checkout.select_wilaya_first": "اختاري الولاية أولاً",
    "success.title": "شكرًا لكِ، تم استلام طلبك!",
    "success.order_number": "رقم الطلب",
    "success.message": "سنتواصل معك قريبًا لتأكيد الطلب.",
    "success.back_home": "العودة إلى الرئيسية",
    "footer.contact": "تواصلي معنا",
    "footer.policies": "السياسات",
    "footer.privacy": "سياسة الخصوصية",
    "footer.delivery_policy": "التوصيل والاستبدال",
    "common.loading": "جارٍ التحميل...",
    "common.error_generic": "حدث خطأ، حاولي مرة أخرى",
    "common.no_results": "لا توجد نتائج",
  },
  fr: {
    "nav.home": "Accueil",
    "nav.products": "Produits",
    "nav.bags": "Sacs",
    "nav.accessories": "Accessoires",
    "nav.clothing": "Vêtements",
    "nav.skirts": "Jupes",
    "nav.about": "À propos",
    "nav.contact": "Contact",
    "nav.faq": "FAQ",
    "nav.search_placeholder": "Rechercher un produit...",
    "nav.cart": "Panier",
    "hero.cta": "Découvrir la collection",
    "hero.tagline": "Des pièces confectionnées à la main avec soin, depuis le cœur de l'Algérie.",
    "home.new_arrivals": "Nouveautés",
    "home.best_sellers": "Meilleures ventes",
    "home.our_story": "Notre histoire",
    "home.testimonials": "Avis clients",
    "home.faq_title": "Questions fréquentes",
    "product.add_to_cart": "Ajouter au panier",
    "product.view_details": "Voir les détails",
    "product.color": "Couleur",
    "product.size": "Taille",
    "product.quantity": "Quantité",
    "product.price": "Prix",
    "product.similar": "Produits similaires",
    "product.new_badge": "Nouveau",
    "product.sale_badge": "Promo",
    "product.out_of_stock": "Indisponible",
    "product.made_to_order": "Fait sur commande",
    "filters.category": "Catégorie",
    "filters.price": "Prix",
    "filters.availability": "Disponibilité",
    "filters.sort": "Trier par",
    "filters.all": "Tout",
    "cart.title": "Panier",
    "cart.empty": "Votre panier est vide",
    "cart.continue_shopping": "Continuer les achats",
    "cart.subtotal": "Sous-total",
    "cart.checkout": "Passer la commande",
    "cart.total_items": "Nombre d'articles",
    "cart.remove": "Supprimer",
    "checkout.title": "Finaliser la commande",
    "checkout.full_name": "Nom complet",
    "checkout.phone": "Numéro de téléphone",
    "checkout.wilaya": "Wilaya",
    "checkout.commune": "Commune",
    "checkout.delivery_method": "Mode de livraison",
    "checkout.home_delivery": "Livraison à domicile",
    "checkout.office_delivery": "Retrait au bureau",
    "checkout.address": "Adresse détaillée",
    "checkout.notes": "Remarques (facultatif)",
    "checkout.delivery_price": "Frais de livraison",
    "checkout.total": "Montant total",
    "checkout.agree_policy": "J'accepte la politique de confidentialité et les conditions",
    "checkout.submit": "Confirmer la commande",
    "checkout.submitting": "Envoi en cours...",
    "checkout.select_wilaya_first": "Sélectionnez d'abord la wilaya",
    "success.title": "Merci, votre commande est reçue !",
    "success.order_number": "Numéro de commande",
    "success.message": "Nous vous contacterons bientôt pour confirmer.",
    "success.back_home": "Retour à l'accueil",
    "footer.contact": "Contact",
    "footer.policies": "Politiques",
    "footer.privacy": "Politique de confidentialité",
    "footer.delivery_policy": "Livraison et retours",
    "common.loading": "Chargement...",
    "common.error_generic": "Une erreur est survenue, réessayez",
    "common.no_results": "Aucun résultat",
  },
};

function getCurrentLanguage() {
  return localStorage.getItem("an_lang") || APP_CONFIG.DEFAULT_LANGUAGE;
}

function setLanguage(lang) {
  localStorage.setItem("an_lang", lang);
  applyLanguage();
}

function t(key) {
  const lang = getCurrentLanguage();
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || key;
}

function applyLanguage() {
  const lang = getCurrentLanguage();
  const dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });

  document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
  });

  document.dispatchEvent(new CustomEvent("languagechanged", { detail: { lang } }));
}

// دالة مساعدة: إظهار الاسم أو الوصف المناسب للغة من صف قاعدة بيانات
function localizedField(row, fieldBase) {
  const lang = getCurrentLanguage();
  return row[`${fieldBase}_${lang}`] || row[`${fieldBase}_ar`] || "";
}

function formatPrice(amount) {
  const lang = getCurrentLanguage();
  const label = lang === "ar" ? APP_CONFIG.CURRENCY_LABEL_AR : APP_CONFIG.CURRENCY_LABEL_FR;
  const num = Number(amount || 0).toLocaleString(lang === "ar" ? "ar-DZ" : "fr-DZ");
  return lang === "ar" ? `${num} ${label}` : `${num} ${label}`;
}

document.addEventListener("DOMContentLoaded", applyLanguage);
