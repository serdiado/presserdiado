# Katalog-Admin Modülü — Mimari Karar Belgesi
> Presserdiado / MatbaaPro — Katalog yönetimi (product_types / print_options / pricing_rules), fiyat motoru, Excel toplu fiyat girişi, katalog→stüdyo entegrasyon haritası.
> İlgili belgeler: `order-module-architecture.md` (şema kararları — tablolar/kolonlar orada tanımlı, burada tekrarlanmaz), `template-module-architecture.md`, `product-module-architecture.md`.
> Bu belge yalnız **mimari karar ve sınır** taşır. Uygulama durumu, faz ilerlemesi, operasyonel adımlar (golden-snapshot prosedürü, SEED_FORCE kullanımı), Excel kolon başlıkları, UI/buton ayrıntıları ve bug notları **burada tutulmaz → `docs/TODO.md`**.

---

## 1. Amaç & Kapsam

Katalog (ürün tipleri, baskı seçenekleri, fiyat kuralları) bugün `apps/api/src/db/seed.ts` içinde hardcode. Şema baştan tam kurulu (bkz. `order-module-architecture.md`); eksik olan **admin CRUD yönetimi** ve **ölçeklenebilir toplu fiyat girişi**. Bu belge, katalogun seed-driven'dan admin-driven'a taşınmasının mimari kararlarını ve katalog katmanının stüdyo/sipariş zinciri içindeki sınırını tanımlar.

**Kapsar:** katalog-admin backend modülü, fiyat motorunun determinizm/birim kararları, referans bütünlüğü, Excel import mimari şekli, CREATE semantiği, katalog↔stüdyo dikişi, katman haritası.

**Kapsamaz (implementasyon detayı → `docs/TODO.md`):** Excel kolon başlıkları/dosya formatı, form/buton yerleşimi, golden-snapshot alma prosedürü, SEED_FORCE kullanım mekaniği, tier hücre kodlaması.

---

## 2. Üç Katman (yayın sırası: katalog → şablon → entegrasyon)

Sınır cümlesi: **katalog, "veri var ve sorgulanabilir"de biter.** Geometriye, seçicilere ve şablon içeriğine dokunmaz.

- **Layer 1 — Katalog (PİLOT, bu epic):** product_types + print_options + pricing_rules tam CRUD + Excel fiyat importu. Sahiplik: *ne var, ne kadar*. Çıkış kontratı: katalog-options API + pricing API. Yeni ürün burada **yaratılır ama atıl kalır** (§8).
- **Layer 2 — Şablonlar:** atıl `system_templates` tablosunun aktivasyonu (productTypeId-bağlı, DB-driven şablon) + canlı şablonların frontend→DB migrasyonu. Bugün `system_templates` **tamamen kullanılmıyor**; canlı şablonlar frontend-only (kod-sabiti `BrochureTemplate` + `StudioPreset` + localStorage özel şablonlar).
- **Layer 3 — Entegrasyon:** stüdyonun DB'ye flip'i (tasarım-kaynaklarının frontend sabitlerinden DB'ye geçişi) + frontend kaynaklarının emekliye ayrılması (retire) + localStorage→sunucu kalıcılığı. Burada katalog uçtan-uca erişilebilir/tasarlanabilir hale gelir.

---

## 3. Dört Invariant

Tüm katalog-admin tasarımının kabul kriteri. Belgenin geri kalanı bu dördünü gerçekler.

1. **Tek doğrulanmış yazma yolu.** Her yazım `catalog-admin.service` validator'larından geçer (§5/B1). Admin CRUD ve (gelecekte) Excel import aynı yolu paylaşır.
   *İstisna (dürüstçe):* `seed.ts` **trusted-bootstrap**'tır ve validator'ı baypas eder — küratörlü, güvenilir veri. Bu bilinçli bir istisnadır; tek-yazma-yolunun yakınsaması (seed'in de validator'dan geçmesi) Layer 1 sonrası değerlendirilir.
2. **Deterministik okuma yolu.** Aynı girdi → aynı kural → aynı fiyat. Specificity birincil; eşitlikte tie-break deterministik. **Locus = uygulama döngüsü (`pricing.service`), SQL değil** — skor SQL'de hesaplanamadığından determinizm SQL satır sırasına bırakılmaz (§6/A3).
3. **Sessizce yok etme yok.** Referanslı/dolu veri sessizce kaybolmaz: silme birincil olarak soft-delete; referanslı hard-delete → 409; seed reset yerine bootstrap-guard (§10); Excel hep-ya-hiç (§11).
4. **Dürüst temsil.** UI, kontrol etmediğini ediyormuş gibi göstermez (dekoratif alanlar dürüst etiketlenir — affectsDesign §9, atıl ürün §8). Doğrulama, değerin **şeklini değil anlamını** zorlar (taxRate birim-aralığı §6/A2).

---

## 4. Veri Modeli / Zincir Haritası

Kolon/tip tanımları `order-module-architecture.md`'de — burada yalnız **referans alanları ve bağ türleri**:

```
product_types (id PK, slug UNIQUE)
   │  ▲ giriş noktası slug ile çözülür (pricing.service, print-catalog, frontend)
   ├──< print_options (productTypeId → FK)            : katalog listesi + tasarım-kilit kaynağı
   ├──< pricing_rules  (productTypeId → FK;
   │        sizeKey/paperTypeKey/… = print_options.key'e STRING referans, FK DEĞİL) : fiyat
   │
   ├─ (ölçü+kırım → çalışma alanı)  : bugün DB'den DEĞİL → frontend wizard.config.json;
   │                                   gelecekte print_options.metadata (§9 dikiş)
   │
   ├─ şablon : system_templates (productTypeId FK + canvasData JSON) ATIL;
   │           canlı = frontend (BrochureTemplate kod / StudioPreset / localStorage)
   │
   ├──< projects (userId FK, productTypeId FK, canvasData JSON = template+grid+ürün+printOptions snapshot)
   │
   └──< orders / order_items
           (order_items.productTypeKey = slug STRING; option key'leri + printOptions JSON
            + unitPrice/lineTotal DONDURULMUŞ — fiyat kuralı sonradan değişse de sipariş etkilenmez)
```

**Bağ türü kararı:** product_type bağları gerçek UUID FK; pricing_rules→print_options bağı **string-key** (FK değil) — bu, §5/K2 referans bütünlüğü kararlarının sebebidir.

---

## 5. Backend Kararları

**K1 — Ayrı `catalog-admin` modülü.** CRUD `pricing.service`'e EKLENMEZ; o fiyat hesaplama **sıcak yolu** ve runtime kontratı korunur. `print-catalog.service` salt-okunur public katmandır (CRUD orada değil). Yeni modül guard çiftini (`authenticate` + `authorizeAdmin`) mevcut admin route kalıbından devralır.

**K2 — String-key referans bütünlüğü.** pricing_rules, print_options'a string key ile bağlı (FK yok) → bir option silinince/key değişince ona referans veren kural sessizce eşleşmez olur. Kararlar:
- print_options'ta **`key` salt-okunur** (PATCH label/affectsDesign/metadata/isActive/sortOrder düzenler; key değişecekse sil+yeni ekle).
- **Silme:** referanslıysa **409**; **birincil işlem soft-delete** (isActive=false).
- **Health:** orphan kural (key→eksik/pasif option) + ambiguous-pair (§12) raporlanır.
- **Benzersizlik:** `product_types.slug` DB-unique (mevcut). **Öneri (onay bekliyor):** `(productTypeId + category + key)`'i uygulama-katmanı kontrolünden **DB unique constraint**'e yükselt — seed-bypass dahil tüm yolları kapatır, invariant #1'i veritabanı seviyesinde garantiler. Faz-0(d) checkpoint'inde karara bağlanır; **blocker değil**.

**B1 — İş doğrulaması service'te tek doğruluk kaynağı.** Zod yalnız **şekil/tip** doğrular; tier monotonluğu/benzersizliği, key varlığı, kombinasyon benzersizliği, fiyat/oran aralıkları `catalog-admin.service` validator'larında. Bu, admin CRUD ile Excel importer'ın aynı doğrulamayı paylaşmasının (invariant #1) mimari önkoşuludur.

---

## 6. Fiyat Motoru

`pricing.service` **değişmez** — tek istisna A3 tamamlaması.

**A3 — Deterministik tie-break.** Specificity skoru uygulama döngüsünde hesaplanır (NULL-olmayan eşleşen kriter sayısı); SQL tek başına specificity'yi sıralayamaz. Karar: specificity **birincil** kalır; eşit skorda tie-break döngüde **açıkça** `createdAt ASC`, eşit createdAt'te `id ASC`. Determinizm SQL satır sırasına bırakılmaz (invariant #2). **Kabul kapısı: golden-snapshot diff = 0** (mevcut küratörlü seed'de tie yok → çıktı birebir korunmalı; davranış-koruyucu).

**A2 — taxRate birimi.** taxRate **yüzde** olarak saklanır ve motor `taxBase × rate / 100` uygular. Doğrulama şekil-regex değil, **birime uygun aralık** (`0 ≤ rate ≤ 100`); fiyat alanları `≥ 0`. Service katmanında (B1). Gerekçe: `0.20` gibi oran-sanısı 100× sapma üretir; anlamı zorlamak şekli zorlamaktan farklıdır (invariant #4).

---

## 7. Frontend

**K3 — AdminLayout context'i genişletilmez.** Mevcut admin veri context'i siparişe özeldir; katalog onunla ilgisiz. Katalog sayfaları verisini ayrı bir `useCatalogAdmin` hook'undan çeker. Form deseni mevcut admin sayfalarının ruhuna sadıktır (native input/select; ek form/modal kütüphanesi getirilmez). Para verisi yazımları **sunucu-onaylı** sergilenir (invariant #4 — §14'te erteleme notu yok; ilke burada sabit).

---

## 8. CREATE & Atıl-Ürün

product_type **CREATE açık** ve **zararsız**: yeni bir ürün katalog/fiyat API'larına otomatik akar ama hiçbir seçici yüzeyde görünmez (yüzeyler bugün slug/whitelist'e pinli) → stüdyoya ulaşamaz → kırılacak akış yok. Hiçbir yüzey "tüm product_types"i gezip belirli bir ürün şekli varsaymaz. **slug-unique dışında guard gerekmez.**

**"Atıl vs kullanılabilir" kriteri** = ürünün stüdyo wiring'i var mı: (i) geometri kaynağı (bugün config.json, gelecekte print_options.metadata) ve (ii) kullanılabilir şablon. Admin UI bu durumu **dürüst etiketler** (invariant #4): wiring yoksa ürün "yayında değil / atıl" gösterilir. Bu bir guard değil, temsildir. `configSchema`/`dimensions`/`defaultGrid` alanları runtime'da tüketilmediğinden (§9) formda zorunlu değildir; sane default yeterlidir.

---

## 9. İkili-Kaynak Dikişi (Layer 1 ↔ 3)

Tasarımı belirleyen geometri bugün **iki kaynakta**: bu, katalog katmanının stüdyoyla en kritik sınırıdır ve tek bir desenle yönetilir.

- **Frontend = bugünün gerçeği:** kanvas geometrisi `wizard.config.json`'dan (paperSize mm, foldType pageCount/pageOrder) üretilir; tasarım-kilidi `STUDIO_LOCKED_CATEGORIES = ['size','fold']` sabitinden gelir (DB `affectsDesign`'dan değil).
- **DB = stage edilen gelecek:** `print_options.metadata` **yapısal** taşır — size→`{widthMm,heightMm}`, fold→`{pageCount,pageOrder}` (pageOrder bugün DB'de yok; Layer 1'de yakalanır); tasarım-etkisi `affectsDesign` bayrağıyla.
- **Layer 3 = flip + retire:** stüdyo geometri/kilidi DB'den okur, frontend sabit kaynakları emekliye ayrılır.

**Iraksama teşhisi** (DB metadata ile frontend config aynı mı) bir **Layer 3 aracıdır**; bugün ikisi seed'de tutarlı olduğundan flip davranış-nötrdür. Layer 1'in görevi yalnız metadata'yı yapısal ve eksiksiz **yakalamak** (serbest-JSON değil) — böylece Layer 3 tek-kaynağa indirebilir (invariant #2 ruhu).

---

## 10. Seed & Veri Sahipliği

**B2 — Reset değil bootstrap-guard.** Katalog admin-yönetimli olunca seed'in delete+rewrite davranışı admin verisini sessizce siler (invariant #3 ihlali). Karar: seed **boşsa tohumlar**; "boş" birimi = **product_types** (bir ürün tipinin print_options'ı varsa onun yeniden-yazımı atlanır). Dev reset yalnız **açık bir kaçış-kapısıyla** mümkündür ve **prod'da (NODE_ENV=production) reddedilir + gürültülü loglanır** (kapının adı/mekaniği → `docs/TODO.md`). seed, trusted-bootstrap istisnasıdır (invariant #1).

---

## 11. Excel Import (Layer 1 — Faz 7-8)

Mimari şekil:
- **Tek yönlü** (Excel → panel); panel → Excel senkron yok.
- **Yalnız `pricing_rules`'a yazar**; product_types/print_options elle tanımlanır, importer **var olmayan referansları yaratmaz**.
- **Tanınmayan referans → satır-bazlı red** (hangi satır/alan eşleşmedi); referanslar doğru kategoride **aktif** print_option olmalı.
- **Hep-ya-hiç** (tek `db.transaction`; bir satır bile hatalıysa hiçbiri yazılmaz).
- **Önizleme adımı** (x geçerli / y hatalı raporu → kullanıcı onayı → yaz).
- **B1 validator'larını reuse eder** (invariant #1) + duplikat-kombinasyon reddi (§12/A3).

Kanonik mantıksal kolonların DB kolonlarına eşlenmesi mimari karardır; tam kolon başlıkları/dosya formatı/tier hücre kodlaması implementasyon detayıdır → `docs/TODO.md`.

---

## 12. Health & Doğrulama

- **Tutulan (ucuz, O(kural)):** orphan kural (key→eksik/pasif option) + **ambiguous-pair** (aynı productTypeId + aynı 6 key kombinasyonu → muğlak eşleşme; manuel form ve Excel commit reddeder, health raporlar) + aktif catch-all yokluğu kontrolü.
- **Ertelenen:** gerçek **coverage-gap** (her satılabilir kombinasyonun spesifik kuralı var mı) — kombinatoryal patlama, anlamsız. **catch-all kasıtlı güvenlik ağıdır**; eşleşmeyen kombinasyon ona düşer. Excel devreye girince yeniden değerlendirilir.
- **Quote-regression:** her backend fazından sonra golden-snapshot diff (fiyat çıktısı beklenmedik değişmemeli).

---

## 13. Fazlama (Layer 1)

Her faz tek başına test edilebilir; her backend fazından sonra quote-regression diff.

- **Faz 0 — DEĞİŞMEZ SIRA:** (a) mevcut kodda golden-snapshot **baseline** al → (b) A3 döngü tie-break uygula → (c) **diff = 0** doğrula (kabul kapısı) → (d) bu belge + dört invariant + `(productTypeId+category+key)` DB unique constraint kararı.
  *Sıra zorunluluğu:* A3, baseline'dan **önce** değişirse baseline kirlenir ve kabul kapısı anlamını yitirir.
  *Checkpoint:* Faz-0(d) belgesi, Faz 1 feature koduna geçmeden **birlikte okunur** (ucuz, anlaşılan kontrol noktası); DB-unique-constraint önerisi orada karara bağlanır (blocker değil).
- **Faz 1** — product_types CRUD (CREATE dahil, §8).
- **Faz 2** — print_options CRUD (benzersizlik + silme 409 + yapısal metadata).
- **Faz 3** — pricing_rules CRUD + health.
- **Faz 4-6** — frontend (Ürünler / Baskı Seçenekleri / Fiyatlandırma).
- **Faz 7-8** — Excel importer backend + frontend (§11).

---

## 14. Ertelenenler (gerekçeyle)

- **Coverage-gap tespiti** — kombinatoryal; catch-all güvenlik ağı yeterli; Excel'le yeniden değerlendirilir.
- **Fiyat değişiklik audit trail** — pilotta değil; kim/ne zaman değiştirdi ileride.
- **metadata serbest-JSON editörü** — metadata tüketici-spesifik/yapısal; serbest-form malformed risk taşır (§9) → yapısal editör ertelenir.
- **Sunucu-onaylı fiyat yazımı** — ilke §7'de sabit; ayrıntılı pesimist-UI uygulaması impl. detayı.
- **localStorage → sunucu kalıcılığı** — Layer 2/3 (özel şablonlar bugün localStorage'da).
- **Şablon migrasyonu** — `system_templates` aktivasyonu + frontend şablonların DB'ye taşınması Layer 2.
