-- ============================================================
-- Atelier Noura — 05_seed.sql
-- بيانات أولية: الولايات الـ58 + شركة توصيل افتراضية معطّلة الأسعار
-- + تصنيفات مبدئية (كما طلب الملف الأصلي: "تصنيفات فقط عند الحاجة")
-- ============================================================

insert into wilayas (code, name_ar, name_fr) values
(1,'أدرار','Adrar'),(2,'الشلف','Chlef'),(3,'الأغواط','Laghouat'),(4,'أم البواقي','Oum El Bouaghi'),
(5,'باتنة','Batna'),(6,'بجاية','Béjaïa'),(7,'بسكرة','Biskra'),(8,'بشار','Béchar'),
(9,'البليدة','Blida'),(10,'البويرة','Bouira'),(11,'تمنراست','Tamanrasset'),(12,'تبسة','Tébessa'),
(13,'تلمسان','Tlemcen'),(14,'تيارت','Tiaret'),(15,'تيزي وزو','Tizi Ouzou'),(16,'الجزائر','Alger'),
(17,'الجلفة','Djelfa'),(18,'جيجل','Jijel'),(19,'سطيف','Sétif'),(20,'سعيدة','Saïda'),
(21,'سكيكدة','Skikda'),(22,'سيدي بلعباس','Sidi Bel Abbès'),(23,'عنابة','Annaba'),(24,'قالمة','Guelma'),
(25,'قسنطينة','Constantine'),(26,'المدية','Médéa'),(27,'مستغانم','Mostaganem'),(28,'المسيلة','M''Sila'),
(29,'معسكر','Mascara'),(30,'ورقلة','Ouargla'),(31,'وهران','Oran'),(32,'البيض','El Bayadh'),
(33,'إليزي','Illizi'),(34,'برج بوعريريج','Bordj Bou Arréridj'),(35,'بومرداس','Boumerdès'),(36,'الطارف','El Tarf'),
(37,'تندوف','Tindouf'),(38,'تيسمسيلت','Tissemsilt'),(39,'الوادي','El Oued'),(40,'خنشلة','Khenchela'),
(41,'سوق أهراس','Souk Ahras'),(42,'تيبازة','Tipaza'),(43,'ميلة','Mila'),(44,'عين الدفلى','Aïn Defla'),
(45,'النعامة','Naâma'),(46,'عين تموشنت','Aïn Témouchent'),(47,'غرداية','Ghardaïa'),(48,'غليزان','Relizane'),
(49,'تيميمون','Timimoun'),(50,'برج باجي مختار','Bordj Badji Mokhtar'),(51,'أولاد جلال','Ouled Djellal'),
(52,'بني عباس','Béni Abbès'),(53,'عين صالح','In Salah'),(54,'عين قزام','In Guezzam'),
(55,'تقرت','Touggourt'),(56,'جانت','Djanet'),(57,'المغير','El M''Ghair'),(58,'المنيعة','El Meniaa')
on conflict (code) do nothing;

-- شركة توصيل افتراضية واحدة (يدوية) — المسؤولة تضبط أسعارها لاحقًا من لوحة الإدارة
insert into delivery_services (name, is_active, estimated_days_min, estimated_days_max)
select 'التوصيل الافتراضي', true, 2, 5
where not exists (select 1 from delivery_services);

-- تصنيفات أولية فقط (كما ورد في المتطلبات: الحقائب، الإكسسوارات، الملابس، التنانير)
insert into categories (slug, name_ar, name_fr, sort_order, is_active) values
('bags', 'الحقائب', 'Sacs', 1, true),
('accessories', 'الإكسسوارات', 'Accessoires', 2, true),
('clothing', 'الملابس', 'Vêtements', 3, true),
('skirts', 'التنانير', 'Jupes', 4, true)
on conflict (slug) do nothing;

-- ملاحظة مهمة: لم نُدرج أي بلديات (communes) أو منتجات تجريبية.
-- البلديات الكاملة لكل ولاية (أكثر من 1500 بلدية) ستُضاف عبر ملف بيانات
-- منفصل (commune_data.sql) في جزء لاحق لتفادي إطالة هذا الملف بلا داعٍ،
-- وسأنبهك صراحة عند تسليمه. لا تُدخلي أي منتج حقيقي إلا من لوحة الإدارة.
