# atelier-noura2
atelier-noura/
├── index.html
├── products.html
├── product.html
├── cart.html
├── checkout.html
├── order-success.html
├── contact.html
├── about.html
├── faq.html
├── privacy.html
├── delivery-policy.html
├── admin-login.html
├── admin/
│   ├── dashboard.html
│   ├── products.html
│   ├── orders.html
│   ├── categories.html
│   ├── delivery.html
│   └── settings.html
├── css/
│   ├── main.css      (المتغيرات، الألوان، الخطوط، RTL/LTR)
│   └── admin.css
├── js/
│   ├── config.js       (رابط ومفتاح Supabase العام)
│   ├── supabase-client.js
│   ├── i18n.js          (الترجمة ar/fr + حفظ اللغة)
│   ├── cart.js          (سلة تُحفظ في localStorage)
│   ├── ui.js            (تنبيهات، تحميل، حركات)
│   ├── header-footer.js
│   ├── home.js
│   ├── products.js
│   ├── product-detail.js
│   ├── checkout.js
│   └── admin/
│       ├── auth-guard.js
│       ├── dashboard.js
│       ├── products.js
│       ├── orders.js
│       ├── categories.js
│       ├── delivery.js
│       └── settings.js
├── supabase/
│   ├── 01_schema.sql        (الجداول والعلاقات والفهارس)
│   ├── 02_rls_policies.sql  (سياسات الأمان)
│   ├── 03_functions.sql     (دوال RPC الآمنة: إنشاء الطلب، حساب التوصيل)
│   ├── 04_storage.sql       (سياسات تخزين الصور)
│   └── 05_seed.sql          (الولايات 58 + تصنيفات أولية فقط)
├── .gitignore
└── README.md
