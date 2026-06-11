# Sipariş Modülü — Mimari Karar Belgesi
> Presserdiado / MatbaaPro — Sipariş Akışı, Baskı Özellikleri, Fiyatlandırma, PDF Dondurma, Operatör/Admin
> Tüm SeniorDev, ArtDirector, StudioCanvas, SecurityAuth komutlarında bu belge referans alınır.
> İlgili belge: `product-module-architecture.md` (ürün havuzu / medya)
> Son güncelleme: Mimari karar aşaması — implementasyon başlamadı.

---

## Bağlam: Sorun Tespiti

Sipariş başlangıçta **stüdyo içi bir buton** olarak tasarlanmıştı (Fiyat Detayları paneli → "Sipariş Ver"). Bu yanlış: gerçek web-to-print akışında sipariş, stüdyodan bağımsız bir süreçtir ve birden fazla giriş kapısı vardır.

| Giriş Kapısı | Akış | Pilot |
|---|---|---|
| Web sitesi → ürün/özellik seç → stüdyo (özellikler önceden seçili) → tasarla → sipariş | Ana akış | ✅ Pilotta |
| Web sitesi → ürün/özellik seç → hazır dosya yükle (stüdyosuz) | Alternatif akış | 🔲 Pilot sonrası (şema hazır) |
| Stüdyo içinden doğrudan sipariş | Yardımcı | ✅ Pilotta (ortak katmanı çağırır) |

**Temel ilke:** Baskı özellikleri + fiyatlandırma + sipariş oluşturma = **stüdyodan bağımsız paylaşılan katman.** Stüdyodaki buton bu katmanı *tetikler*, mantığı içinde tutmaz. Üç giriş kapısı da aynı fiyatlandırma servisini ve aynı sipariş API'sini çağırır.

---

## Pilot Kapsamı (Uçtan Uca İskelet)

```
Web sitesi (basit) → üye kayıt/giriş → broşür seç + baskı özellikleri
    ↓ (özellikler projeye aktarılır)
Stüdyo (özellikler önceden seçili) → tasarla → "Sipariş Ver"
    ↓
Fiyat hesabı (sabit tablo) → sipariş oluştur
    ↓
PDF dondur (Puppeteer RGB → MinIO)
    ↓
Admin/operatör listesi → PDF indir + durum yönetimi
```

Bu pilot, mimarinin bel kemiğini tek geçişte test eder: auth, ürün seçimi, özellik aktarımı, sipariş, PDF dondurma, operatör tarafı.

---

## Mevcut Hazır Altyapı (sıfırdan kurulmayacak)

| Modül | Durum | Not |
|---|---|---|
| Auth | ✅ HAZIR | `register`, `login`, `refresh`, `me` — JWT, `app.authenticate`. Web tarafında sadece **ekran** eklenecek. |
| Billing | ✅ HAZIR | `user_billing_profiles` — sipariş fatura profiline bağlanır. |
| Products | ✅ HAZIR | Ürün havuzu — sipariş kalemleri buradan beslenir. |
| Media | ✅ HAZIR | Logo/arka plan/şekil. |
| MinIO | ✅ AYAKTA | docker-compose'da kurulu. Dondurulmuş PDF buraya yazılır. |

---

## Veri Modeli

### Tablo 1: `orders` (sipariş başlığı)
```sql
id              VARCHAR(36) PRIMARY KEY
userId          VARCHAR(36) NOT NULL
orderNumber     VARCHAR(50) NOT NULL UNIQUE   -- insana okunur sipariş no (ör. PR-2026-00042)
status          ENUM('draft','submitted','in_production','shipped','completed','cancelled')
                                              DEFAULT 'submitted'   -- ÜRETİM akışı
paymentStatus   ENUM('none','pending','paid','refunded')
                                              DEFAULT 'none'        -- ÖDEME akışı (AYRI)
billingProfileId VARCHAR(36)                  -- user_billing_profiles.id (snapshot için aşağıya bak)
billingSnapshot JSON                          -- sipariş anındaki fatura bilgisi DONDURULUR
subtotal        DECIMAL(10,2) NOT NULL
discountTotal   DECIMAL(10,2) DEFAULT 0
taxTotal        DECIMAL(10,2) DEFAULT 0
grandTotal      DECIMAL(10,2) NOT NULL
currency        VARCHAR(3) DEFAULT 'TRY'
notes           TEXT
createdAt       DATETIME
updatedAt       DATETIME ON UPDATE CURRENT_TIMESTAMP
INDEX (userId, createdAt)
INDEX (status)
```

**Kritik kararlar:**
- `status` (üretim) ile `paymentStatus` (ödeme) **ayrı alan** — asla aynı enum'a gömülmez. Sepet+ödeme geldiğinde dağılmaması için.
- `billingSnapshot` JSON: fatura profili sonradan değişebilir/silinebilir; sipariş anındaki bilgi dondurulur (yasal/üretimsel kanıt). `billingProfileId` sadece referans/iz için tutulur.

### Tablo 2: `order_items` (sipariş kalemleri)
```sql
id              VARCHAR(36) PRIMARY KEY
orderId         VARCHAR(36) NOT NULL          -- orders.id (cascade delete)
projectId       VARCHAR(36)                   -- bağlı tasarım projesi (varsa)
itemType        ENUM('studio_design','uploaded_file') DEFAULT 'studio_design'
productTypeKey  VARCHAR(100)                  -- product_types.slug snapshot (string, FK DEĞİL — sipariş anında dondurulur)
                                              -- Baskı özellikleri (sipariş anında DONDURULUR):
quantity        INT NOT NULL DEFAULT 1
size            VARCHAR(50)                   -- 'A3', 'A4' (projeden gelir)
foldType        VARCHAR(50)                   -- 'half-fold' vb. (projeden gelir)
paperType       VARCHAR(100)                  -- 'kuşe-mat' (pilotta varsayılan)
paperWeight     VARCHAR(50)                   -- '115gr'
colorMode       VARCHAR(50)                   -- '4+4'
coating         VARCHAR(100)                  -- 'yok'
binding         VARCHAR(100)                  -- 'yok'
printOptions    JSON                          -- ileride genişleyecek serbest alan
unitPrice       DECIMAL(10,2) NOT NULL        -- sipariş anındaki birim fiyat DONDURULUR
lineTotal       DECIMAL(10,2) NOT NULL
productionPdfKey VARCHAR(500)                 -- MinIO object key — dondurulmuş baskı PDF'i
previewImageKey VARCHAR(500)                  -- opsiyonel küçük önizleme
createdAt       DATETIME
INDEX (orderId)
INDEX (projectId)
```

**Kritik kararlar:**
- Pilotda **1 sipariş = 1 kalem (1 proje)**, ama şema çok-kalemli. Sepet geldiğinde refactor gerekmez.
- Baskı özellikleri kalemde **dondurulur** (fiyat gibi). Ürün/proje sonradan değişse bile sipariş sabit kalır.
- `unitPrice`/`lineTotal` sipariş anındaki değerle yazılır — fiyat tablosu değişse bile tutar korunur.

### Katalog + Fiyatlandırma Sistemi (admin yönetir — tek kaynak)

> Bu, dağınık bir fiyat tablosu değil; **konfigüre edilebilir katalog**tur. "Neyin seçilebilir olduğu" ve "ne kadar tuttuğu" tek yerde tutulur. Hem web sitesi hem stüdyo bu katalogdan beslenir; admin paneli bu tabloları yönetir (ekle/çıkar/düzenle).
>
> **İki katman ayrımı (karıştırma):**
> - **Veri katmanı** (bu tablolar): neler seçilebilir + fiyat. Admin'in yönettiği tek kaynak.
> - **Sunum katmanı** (`PrintOptionsSelector` bileşeni): bu veriyi okuyup seçim UI'si gösterir. Web ve stüdyo aynı bileşeni kullanır.

#### Tablo 3: `product_types` (ürün tipleri) — ⚠️ MEVCUT STUDIO TABLOSU YENİDEN KULLANILIR
```
Bu tablo SIFIRDAN kurulmaz. Studio'da zaten var ve projects + system_templates
ona FK ile bağlı. Studio kolonları (slug, dimensions, bleedMm, defaultGrid,
configSchema, basePriceTable, category, active, sortOrder) KORUNUR — yıkıcı
değişiklik studio'yu kırar. Katalog rolü mevcut kolonlarla karşılanır:
```
| Belgedeki kavram | Mevcut tabloda karşılığı | Not |
|---|---|---|
| `key` (unique) | `slug` (unique) | Redundant `key` kolonu EKLENMEZ — slug üstlenir |
| `name` | `name` | Var |
| `isActive` | `active` | Mevcut kolon kullanılır |
| `sortOrder` | `sortOrder` | Var |
| (eksik) | `createdAt` / `updatedAt` | EKLENİR (non-breaking) |

**Kritik kararlar:**
- Tek-kaynak ilkesi: ikinci bir ürün-tipi tablosu yaratılmaz. Studio + katalog aynı tabloyu paylaşır.
- Belgeden tek sapma: kolon adları `slug`/`active` (belgede `key`/`isActive` deniyordu). Gerekçe: studio'yu bozmamak. Sonraki parçalar (S2 seed, S5 selector) `slug`/`active` adlarını kullanır.
- Pilotda: `brochure` slug'lı kayıt aktif. Katalog/etiket/kartvizit `active=false`.

#### Tablo 4: `print_options` (seçenek katalogu)
```sql
id              VARCHAR(36) PRIMARY KEY
productTypeId   VARCHAR(36) NOT NULL          -- product_types.id (FK — mevcut studio tablosu)
category        ENUM('size','fold','paper_type','paper_weight','color_mode','coating','binding')
key             VARCHAR(100) NOT NULL         -- 'A3', 'kuse_mat', '115gr', '4plus4'
label           VARCHAR(255) NOT NULL         -- 'A3', 'Kuşe Mat', '115 gr', 'Renkli Çift Yön (4+4)'
affectsDesign   BOOLEAN DEFAULT FALSE         -- TRUE ise stüdyoda değişimi tasarımı bozar (size/fold)
metadata        JSON                          -- ebat için {width,height,unit} gibi ek veri
isActive        BOOLEAN DEFAULT TRUE
sortOrder       INT DEFAULT 0
createdAt       DATETIME
updatedAt       DATETIME ON UPDATE CURRENT_TIMESTAMP
INDEX (productTypeId, category, isActive)
```
**Kritik kararlar:**
- `category` ENUM ile seçenek türleri ayrışır; admin her kategoriye ekleme yapar.
- `affectsDesign`: ebat/kırım gibi tasarımı bozan seçeneklerde `TRUE`. Stüdyoda bunlar değiştirilirken `ConfirmModal` uyarısı tetiklenir (bkz. Özellik Aktarımı bölümü). Tek kaynaktan kontrol — UI'da hardcode değil.
- `metadata` JSON: ebadın gerçek ölçüsü, kağıdın açıklaması vb. esnek alan.

#### Tablo 5: `pricing_rules` (fiyat kuralları)
```sql
id              VARCHAR(36) PRIMARY KEY
productTypeId   VARCHAR(36) NOT NULL          -- product_types.id
sizeKey         VARCHAR(100)                  -- print_options.key referansları (esnek eşleşme)
paperTypeKey    VARCHAR(100)
paperWeightKey  VARCHAR(100)
colorModeKey    VARCHAR(100)
coatingKey      VARCHAR(100)
bindingKey      VARCHAR(100)
basePrice       DECIMAL(10,2) NOT NULL        -- birim baz fiyat
setupFee        DECIMAL(10,2) DEFAULT 0
quantityTiers   JSON                          -- [{min:100, discountPct:8}, ...] adet indirimleri
taxRate         DECIMAL(5,2) DEFAULT 20.00    -- KDV %
isActive        BOOLEAN DEFAULT TRUE
createdAt       DATETIME
updatedAt       DATETIME ON UPDATE CURRENT_TIMESTAMP
INDEX (productTypeId, isActive)
```
**Kritik kararlar:**
- Fiyat kuralı, seçenek kombinasyonuna göre eşleşir. Boş (NULL) alan "bu kritere bakma" demek → admin geniş veya dar kural yazabilir.
- Pilotda **seed veriyle** doldurulur (birkaç broşür kombinasyonu). Fiyat hesabı çalışır.
- Fiyatlandırma servisi bu tabloyu okur; hesap mantığı **tek yerde** (paylaşılan katman). Backend'de yeniden hesaplanır — frontend tutarına güvenilmez.
- **`setupFee` pilotda hep 0 (karar):** Aracı kurum modeli + dijital baskı → kalıp/hazırlık ücreti yok. `setupFee` kolonu ileride (ofset baskı / hazırlık ücretli ürünler) kullanılmak üzere şemada kalır, ama pilot seed'inde tüm kurallarda `0`. (Not: en spesifik kural kazandığından, setupFee'yi yalnızca catch-all'a koymak boyut belirten siparişlerde gölgelenir; bu yüzden pilotda hepsi 0.)

#### Pilot / Admin sınırı (kritik)
- Pilotda bu üç tablo (`product_types`, `print_options`, `pricing_rules`) **seed veriyle** doldurulur. Sipariş akışı bu seed üzerinden uçtan uca çalışır.
- **Admin yönetim UI'si (katalog + fiyat CRUD) ayrı epic.** Şema baştan tam kurulduğu için admin geldiğinde sadece CRUD ekranı eklenir — şema değişmez.
- Bu, "zemini doğru kur, parça parça aktive et" felsefesi: tablolar tam, seed ile başlar, admin yönetimi sonra.

### Storage düzeni (MinIO)
```
bucket: presserdiado-orders
  {userId}/{orderId}/production.pdf   → dondurulmuş baskı PDF'i
  {userId}/{orderId}/preview.png      → opsiyonel önizleme
```
- DB'ye **object key** (relative) yazılır; indirme anında signed URL üretilir.
- `imageKey` pattern'iyle tutarlı. Pilotda basit erişim, signed URL pilot sonrası.

---

## Paylaşılan Katman: Baskı Özellikleri + Fiyatlandırma

Stüdyodan bağımsız modül. Katalog tablolarından beslenir, üç çağıran (pilotda 2 aktif):

```
   Katalog (admin yönetir): product_types · print_options · pricing_rules
                              │
                              ▼
┌─────────────────────────────────────────────┐
│   PrintOptionsSelector (ortak bileşen)        │
│   + Pricing servisi (katalogdan hesaplar)     │
│   + Sipariş oluşturma API'si                  │
└─────────────────────────────────────────────┘
        ▲              ▲                ▲
   Web sitesi      Stüdyo buton    Dosya yükleme
   (✅ pilot)      (✅ pilot)      (🔲 sonra)
```

- Seçenekler **katalogtan** okunur (hardcode değil). Admin ekler/çıkarır, üç çağıran da otomatik görür.
- Fiyat hesap fonksiyonu **tek yerde** yaşar. Frontend anlık gösterim + backend doğrulama aynı kuralı kullanır.
- **Güvenlik:** Fiyat backend'de yeniden hesaplanır ve doğrulanır. Frontend'den gelen tutara asla güvenilmez (sipariş oluştururken `pricing_rules`'tan tekrar hesapla, uyuşmazsa reddet).

---

## Özellik Aktarımı: Web → Stüdyo + Ortak Seçim Bileşeni

Kullanıcı web'de broşür + A3 + kağıt seçtiğinde bu seçim stüdyoya taşınmalı.

**Ortak bileşen kararı (kesinleşti):** Baskı özelliği seçimi tek bir paylaşılan bileşene çıkarılır (`PrintOptionsSelector`). Bu bileşen katalog tablolarından (`product_types`, `print_options`, `pricing_rules`) beslenir, fiyatı hesaplar. **Üç yer de aynı bileşeni kullanır:**
- **Web sitesi** → kullanıcı tüm özellikleri seçer
- **Stüdyo seçim modalı** → web'den gelindiyse değerler önceden dolu; sadece "hücre yapılı / serbest tasarım" sorusu eklenir
- **Stüdyo içi "özellikleri değiştir"** → aynı bileşen açılır (A4 2 kırım → A4 tek kırım senaryosu)

Tek kaynak. (Daha önceki "proje adı tek-kaynak refactor" ile aynı felsefe — iki ayrı seçim sistemi yazmak "yama yok" kuralının ihlali olurdu.)

**Karar:** Baskı özellikleri **taslak/proje ile birlikte** taşınır. Web sitesi seçimi yapıp bir taslak oluşturur, stüdyo açılırken bu veriyi okur ve "Sipariş Ver" anında kalem olarak dondurur.

**Tasarımı etkileyen değişim (kritik):** Ebat/kırım değişimi tasarımı bozar (hücre düzeni, sayfa yapısı). Hangi seçeneğin tasarımı bozduğu **UI'da hardcode edilmez** — `print_options.affectsDesign` alanından okunur (tek kaynak). `affectsDesign = TRUE` olan bir seçenek değiştirilmek istendiğinde:
> `ConfirmModal` uyarısı: "Bu değişiklik mevcut yerleşimi etkileyecek, devam edilsin mi?" (mevcut `isDirty` + `ConfirmModal` pattern'i)

Onaylanınca hem kanvas yeniden düzenlenir hem bağlı sipariş özellikleri güncellenir.

---

## PDF Dondurma

- **Üretim:** Backend render (Puppeteer/Playwright). `html2canvas-pro` thumbnail için kalır; baskı PDF'i için **kullanılmaz** (raster, CMYK yok, baskı kalitesi tutmaz).
- **Pilot:** Yüksek-DPI **RGB** PDF. Vektör metin, tutarlı çıktı.
- **CMYK pilota girmez.** Doğru CMYK (ICC profil, rich black, bleed, overprint) ayrı boru hattı (Ghostscript + preflight) — sonraki epic.
- **Dondurma zamanı:** Sipariş oluşturma anında PDF üretilir, MinIO'ya yazılır, `productionPdfKey` kaydedilir. Sonradan tasarım değişse bile sipariş PDF'i sabit.

---

## Admin / Operatör Tarafı

**Karar:** Tam admin paneli **şimdi kurulmaz** (roller, yetkiler, üretim akışı, denetim = ayrı büyük epic). Bunun yerine kullanıcı panelindeki pattern tekrarlanır: **görsel iskelet tam kurulur, bölümler parça parça aktive edilir.**

- Admin route + layout (sidebar, **gerçek korumalı erişim**) → tam kurulur.
- Menü: Siparişler (✅ aktif), Üretim / Kullanıcılar / Fiyatlandırma / Raporlar (🔲 placeholder).
- **Siparişler** → basit liste aktif: sipariş no, kullanıcı, durum, tutar, PDF indir, durum değiştir.
- Claude Design ile iskelet tasarlanabilir (kullanıcı paneli gibi), entegrasyon en sona.

**Güvenlik:** Erişim kontrolü placeholder OLAMAZ. Admin route'u baştan gerçekten korumalı (rol/yetki kontrolü), iskelet pasif olsa bile. Aksi halde güvenlik açığı placeholder olarak kalır.

---

## Onaylanmış UI Referansları (Claude Design)

> Claude Design tarafından, mevcut proje kodları (token sistemi) bilinerek üretilmiş tasarımlar. Token kurallarına uygun (primary sadece CTA, nötr renkler). Kod çıktısı **entegrasyon anında** (S6/S7) ilgili ajana verilecek; şu an referans olarak kayıt altında.

### Referans 1 → Web Sitesi (S6)
**"UI Kit · Web-to-Print Sitesi"** — Marketing & sipariş sayfası.
- İçerik: hero ("Tarayıcıda tasarla, 48 saatte kapına gelsin"), ürün grid, canlı fiyat konfigüratörü önizlemesi, "1. Ürün Seçimi → Ne basacaksınız?" akışı (Broşür / Katalog / Etiket / Kartvizit kartları).
- Nav: Ürünler, Fiyat Hesapla, Nasıl Çalışır, Şablonlar, Kurumsal, Giriş Yap, **Sipariş Ver** (CTA).
- **Pilot aktivasyonu:** Yalnızca **Broşür** aktif. Katalog/Etiket/Kartvizit görsel olarak durur ama katalogtan `isActive=false` gelir (placeholder). Tasarım vizyonu tam, aktivasyon kademeli.

### Referans 2 → Yönetici Paneli (S7)
**"UI Kit · Yönetici Paneli"** — koyu sol nav + kontrol paneli + sipariş listesi + detay drawer + üretim kanban.
- İçerik: sol nav (Kontrol Paneli, Siparişler, Üretim, Baskı İşleri, Baskı Kontrolü, Kargo, Ürünler, Fiyatlandırma, Şablonlar, Müşteriler, Faturalar, Raporlar, Ekip/Yetkiler, Sistem Ayarları), sipariş listesi tablosu, sipariş detay drawer'ı (zaman çizelgesi, "İş Emrini Üret", "Baskı Kontrolü", "Müşteriye Mesaj", "Sipariş İptal Et").
- **Pilot aktivasyonu (KRİTİK):** Bu tasarım tam admin vizyonudur — hepsini canlandırmak ayrı büyük epic. Pilotda **görsel iskelet tam** kurulur ama yalnızca şunlar **gerçekten çalışır:** Siparişler listesi, durum değiştir, PDF indir, sipariş detay görüntüleme. Üretim kanban, Baskı Kontrolü, Kargo, "İş Emrini Üret", Fiyatlandırma yönetimi, Müşteriler vb. → görsel placeholder, pasif. (Kullanıcı panelindeki kademeli aktivasyon pattern'i.)
- **Uyarı:** Tasarımın zenginliği tuzak; hepsini aktive etmeye çalışmak pilotu aylara yayar. İskeleti kur, sipariş listesini aktive et, gerisi sonraki epic'ler.

---

## Uygulama Parçaları (önerilen sıra)

| Parça | İş | Ajan | Bağımlılık |
|---|---|---|---|
| **S1** | DB: `orders`, `order_items`, `product_types`, `print_options`, `pricing_rules` migration + Drizzle schema | SeniorDev — **Opus** | — |
| **S2** | Katalog seed (broşür + ebat/kağıt/renk seçenekleri + fiyat kuralları) + Pricing servisi + fiyat hesap (backend doğrulamalı) | SeniorDev — **Opus** | S1 |
| **S3** | Sipariş oluşturma API (`POST /orders`) + fatura snapshot + sahiplik kontrolü | SeniorDev — **Opus** | S1, S2 |
| **S4** | PDF dondurma (Puppeteer RGB → MinIO) + `productionPdfKey` | SeniorDev — **Opus** | S3 |
| **S5** | `PrintOptionsSelector` ortak bileşeni (katalogtan beslenir) + stüdyo "Sipariş Ver" entegrasyonu + `affectsDesign` uyarısı | ArtDirector + SeniorDev | S2, S3 |
| **S6** | Web sitesi (basit): kayıt/giriş ekranı (mevcut auth) + broşür seçim (`PrintOptionsSelector`) + özellik → stüdyoya aktarım | ArtDirector + SeniorDev | S2, S5 |
| **S7** | Admin panel iskeleti (korumalı) + aktif basit sipariş listesi (indir + durum) | ArtDirector + SeniorDev | S3, S4 |

### Önerilen öncelik
```
S1 → S2 → S3 → S4   (backend bel kemiği — sipariş gerçekten oluşur ve PDF donar)
        ↓
S5 → S6             (giriş kapıları — stüdyo + web)
        ↓
S7                  (operatör tarafı — gerçek veriyle entegre)
```
> Admin paneli **en son** entegre edilir: arkasındaki veri/API hazır olunca gerçek veriyle çalışır. Tasarım (Claude Design) paralel hazırlanabilir, entegrasyon sona kalır.

---

## Güvenlik Notları (SecurityAuth)

- Her sipariş endpoint'inde `userId` sahiplik kontrolü (IDOR). `WHERE userId = :userId`.
- **Fiyat backend'de yeniden hesaplanır** — frontend'den gelen tutara güvenilmez.
- Operatör/admin endpoint'leri ayrı yetki seviyesi ister (normal kullanıcı erişemez). Admin route baştan korumalı.
- `orderNumber` tahmin edilebilir olmamalı veya erişim sadece sahibine/admine açık olmalı (sıralı no + sahiplik kontrolü yeterli).
- MinIO objeleri pilotda erişim kontrollü; signed URL pilot sonrası.
- Fatura bilgisi `billingSnapshot` ile dondurulur — profil silinse de sipariş bütünlüğü korunur.

---

## Açık Kararlar (implementasyon öncesi netleşecek)

- **Stüdyoda özellik düzenleme sınırı:** ✅ ÇÖZÜLDÜ — `print_options.affectsDesign` tek kaynak. `TRUE` olanlar (ebat/kırım) değiştirilirken `ConfirmModal` uyarısı, diğerleri serbest düzenlenir.
- **`orderNumber` formatı:** `PR-YYYY-NNNNN` mi, başka şema mı? Sıra kaynağı (DB sequence / sayaç tablosu)?
- **Taslak sipariş (draft):** ✅ ÇÖZÜLDÜ — Seçenek B. Web'de seçilen baskı özellikleri **proje meta'sında** (`project.printOptions` JSON) taşınır. `draft` order OLUŞMAZ. Sipariş yalnızca "Sipariş Ver" anında `orders` + `order_items` olarak doğar ve özellikler o anda dondurulur. Gerekçe: yarım siparişlerin `orders` tablosunu kirletmemesi + mevcut proje-kaydetme altyapısına (`useProjectSave`) oturması. Not: `orders.status` ENUM'ındaki `draft` değeri ileride (sepet/ödeme epic'i) kullanılmak üzere şemada kalır, pilotta üretilmez.
- **KDV ve indirim kaynağı:** `pricing_rules.taxRate` ve `quantityTiers` pilotda sabit; admin yönetimi sonra.
- **Logout / şifre sıfırlama:** Auth'ta yok. Logout = frontend token temizleme (pilotta yeterli). Şifre sıfırlama sonraya.
- **CMYK boru hattı:** Ghostscript + ICC + preflight — sipariş modülünden sonra ayrı epic.
- **Hazır dosya yükleyerek sipariş:** `order_items.itemType='uploaded_file'` şemada hazır; UI pilot sonrası.

---

## S1 Notu — Mevcut Şemayla Uyumlama (uygulama sırasında keşfedildi)

Belge yazılırken DB'nin mevcut hali tam görünmüyordu. S1 implementasyonunda grep ile iki çakışma bulundu ve çözüldü:

1. **`orders` (eski tablo):** Eski tek-kalemli tasarım (printConfig, commissionRate, printerId...) hiçbir serviste kullanılmıyordu → belgedeki yeni yapıyla **değiştirildi**. Eski `printerId` FK migration'da düşürüldü.
2. **`product_types` (studio tablosu):** Studio'ya bağlı, projects + system_templates FK veriyor → **yıkıcı değiştirme yapılmadı.** Mevcut tablo katalog olarak yeniden kullanıldı (bkz. Tablo 3). Belgeden sapma: `slug`=key, `active`=isActive. Studio'yu bozmamak için.
