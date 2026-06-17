# Sipariş Modülü — Mimari Karar Belgesi
> Presserdiado / MatbaaPro — Sipariş Akışı, Baskı Özellikleri, Fiyatlandırma, PDF Dondurma, Operatör/Admin
> Tüm SeniorDev, ArtDirector, StudioCanvas, SecurityAuth komutlarında bu belge referans alınır.
> İlgili belge: `product-module-architecture.md` (ürün havuzu / medya)
> Bu belge mimari kararları tanımlar; uygulama durumu / proje planlaması burada tutulmaz.

---

## Bağlam: Sorun Tespiti

Sipariş başlangıçta **stüdyo içi bir buton** olarak tasarlanmıştı (Fiyat Detayları paneli → "Sipariş Ver"). Bu yanlış: gerçek web-to-print akışında sipariş, stüdyodan bağımsız bir süreçtir ve birden fazla giriş kapısı vardır.

| Giriş Kapısı | Akış |
|---|---|
| Web sitesi → ürün/özellik seç → stüdyo (özellikler önceden seçili) → tasarla → sipariş | Ana akış |
| Web sitesi → ürün/özellik seç → hazır dosya yükle (stüdyosuz) | Alternatif akış (şema hazır) |
| Stüdyo içinden doğrudan sipariş | Yardımcı (ortak katmanı çağırır) |

**Temel ilke:** Baskı özellikleri + fiyatlandırma + sipariş oluşturma = **stüdyodan bağımsız paylaşılan katman.** Stüdyodaki buton bu katmanı *tetikler*, mantığı içinde tutmaz. Üç giriş kapısı da aynı fiyatlandırma servisini ve aynı sipariş API'sini çağırır.

---

## Sipariş Akışı (Uçtan Uca İskelet)

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

Mimarinin bel kemiği: auth, ürün seçimi, özellik aktarımı, sipariş, PDF dondurma, operatör tarafı.

---

## Mevcut Hazır Altyapı (sıfırdan kurulmayacak)

| Modül | Not |
|---|---|
| Auth | `register`, `login`, `refresh`, `me` — JWT, `app.authenticate`. |
| Billing | `user_billing_profiles` — sipariş fatura profiline bağlanır. |
| Products | Ürün havuzu — sipariş kalemleri buradan beslenir. |
| Media | Logo/arka plan/şekil. |
| MinIO | docker-compose'da kurulu. Dondurulmuş PDF buraya yazılır. |

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
- `orderNumber` üretimi: format `PR-YYYY-NNNNN` (yıl + 5 haneli sıfır-pad sıra). Sayaç **yıllık sıfırlanır** — o yılın `PR-YYYY-%` kayıtlarının max'ı +1, yılın ilk siparişinde 1. Eşzamanlılık: numara üretimi transaction içinde, yılın son numarası `SELECT … FOR UPDATE` ile kilitlenir; `order_number` UNIQUE ihlalinde sınırlı **retry** (max'ı yeniden okuyup yeni numara hesaplar). Sabit-genişlikli sıfır-pad olduğundan sözlüksel sıralama = sayısal sıralama.
- Taslak (`draft`) sipariş **oluşturulmaz.** Sipariş yalnızca "Sipariş Ver" anında `orders` + `order_items` olarak doğar; özellikler o anda dondurulur. Sipariş öncesinde web'de seçilen baskı özellikleri ayrı bir `draft` kaydı yerine projenin `canvasData.catalog.printOptions` alanında taşınır (yarım siparişler `orders` tablosunu kirletmez). `status` ENUM'undaki `draft` değeri ileride (sepet/ödeme epic'i) için şemada durur, pilotta üretilmez.

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
- Belgeden tek sapma: kolon adları `slug`/`active` (belgede `key`/`isActive` deniyordu). Gerekçe: studio'yu bozmamak. Seed ve seçim bileşeni `slug`/`active` adlarını kullanır.
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
- `affectsDesign`: ebat/kırım gibi tasarımı bozan seçeneklerde `TRUE`. Bu seçenekler stüdyoda **salt-okunur/kilitli**: değerler aktif tasarımdan (wizard seçimi) türetilir, seçim bileşeninde `disabled` + kilit ikonuyla gösterilir (stüdyoda değiştirme/relayout yok). `affectsDesign` katalogdan okunur (UI'da hardcode değil) — tek kaynak.
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
- **Platform aracı kurum modeli + dijital baskı → kalıp/hazırlık ücreti yok (`setupFee = 0`).** Şema esnek `setupFee` kolonunu korur (ileride ücret gerekirse), seed kararı 0'dır.

#### Katalog / Admin sınırı
- Bu üç tablo (`product_types`, `print_options`, `pricing_rules`) tek kaynaktır; veri seed veya admin CRUD ile girilebilir, şema aynı kalır.
- **Katalog + fiyat yönetimi (admin CRUD) ayrı bir katmandır.** Şema baştan tam kurulduğu için yönetim UI'si eklendiğinde sadece CRUD ekranı gelir — tablolar değişmez.

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

Stüdyodan bağımsız modül. Katalog tablolarından beslenir, üç çağıran kullanır:

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
```

- Seçenekler **katalogtan** okunur (hardcode değil). Admin ekler/çıkarır, üç çağıran da otomatik görür.
- Fiyat hesap fonksiyonu **tek yerde** yaşar. Frontend anlık gösterim + backend doğrulama aynı kuralı kullanır.
- **Güvenlik:** Fiyat backend'de yeniden hesaplanır ve doğrulanır. Frontend'den gelen tutara asla güvenilmez (sipariş oluştururken `pricing_rules`'tan tekrar hesapla, uyuşmazsa reddet).
- **Integer-cent aritmetiği:** Tüm fiyat hesabı kuruş (integer cent) üzerinden yapılır; para asla float ile tutulmaz. Dönüşüm ve yuvarlama tek noktada (`toCents`/`fromCents`) — finansal doğruluk kararı.

---

## Özellik Aktarımı: Web → Stüdyo + Ortak Seçim Bileşeni

Kullanıcı web'de broşür + A3 + kağıt seçtiğinde bu seçim stüdyoya taşınmalı.

**Ortak bileşen kararı (kesinleşti):** Baskı özelliği seçimi tek bir paylaşılan bileşene çıkarılır (`PrintOptionsSelector`). Bu bileşen katalog tablolarından (`product_types`, `print_options`, `pricing_rules`) beslenir, fiyatı hesaplar. **Üç yer de aynı bileşeni kullanır:**
- **Web sitesi** → kullanıcı tüm özellikleri seçer
- **Stüdyo seçim modalı** → web'den gelindiyse değerler önceden dolu; sadece "hücre yapılı / serbest tasarım" sorusu eklenir
- **Stüdyo içi "özellikleri değiştir"** → aynı bileşen açılır (A4 2 kırım → A4 tek kırım senaryosu)

Tek kaynak. (Daha önceki "proje adı tek-kaynak refactor" ile aynı felsefe — iki ayrı seçim sistemi yazmak "yama yok" kuralının ihlali olurdu.)

**Karar:** Baskı özellikleri **taslak/proje ile birlikte** taşınır. Web sitesi seçimi yapıp bir taslak oluşturur, stüdyo açılırken bu veriyi okur ve "Sipariş Ver" anında kalem olarak dondurur.

**Adet (quantity):** Sihirbazda seçilen adet de aynı yolla taşınır (`StudioCanvasData.catalog.quantity`): stüdyoya aktarılır, kullanıcı stüdyoda değiştirebilir, sipariş anında dondurulur. Adet bilgisi olmayan eski projeler için `DEFAULT_QUANTITY` guard'ı devreye girer.

**Tasarımı etkileyen değişim (kritik):** Ebat/kırım değişimi tasarımı bozar (hücre düzeni, sayfa yapısı). Hangi seçeneğin tasarımı bozduğu **UI'da hardcode edilmez** — `print_options.affectsDesign` alanından okunur (tek kaynak). `affectsDesign = TRUE` olan seçenekler (ebat/kırım) stüdyoda **kilitli** tutulur: `PrintOptionsSelector`'da `disabled` + kilit ikonu, değerler `wizardSelection`'dan türetilir. Stüdyoda değiştirme akışı ve relayout **yok** (sonraki epic). Diğer seçenekler serbest düzenlenir.

---

## PDF Dondurma

> Sipariş PDF'i, stüdyodaki mevcut export altyapısını yeniden kullanır (sıfırdan render kurulmaz): Üst bar → "Dışa Aktar" (`DownloadMenu.tsx`) → `POST /export` → backend `exportCatalog` (`export.service.ts`) → Puppeteer `/print-view` (`PrintView.tsx`, UI'siz, mm-tabanlı) render → `page.pdf()` → `pdf-lib` ile forma birleştirme. Dondurma servisi aynı zinciri çağırır.

- **Üretim:** Mevcut `exportCatalog` backend render'ı kullanılır (Puppeteer + `/print-view` + pdf-lib). `html2canvas-pro` bu zincirde değil (sadece thumbnail).
- **Renk uzayı — RGB (doğrulandı):** Kod incelendi; mevcut zincirde CMYK dönüşümü YOK (ne ICC, ne Ghostscript, ne PDF/X). Chromium `page.pdf()` çıktısı RGB. (Not: Illustrator/Acrobat'ta "CMYK" görünmesi, araçların SWOP simülasyonu/gösterim modundan kaynaklanıyordu — dosya gerçekte RGB.) Pilot RGB ile ilerler.
- **CMYK ayrı epic:** Gerçek CMYK (ICC profil, rich black, bleed, overprint, PDF/X) ileride `export.service.ts`'e eklenecek bir preflight/dönüşüm adımı (Ghostscript). Dondurma mekanizmasını değiştirmez — sadece üretilen PDF'in renk uzayını. RGB→CMYK geçişi izole bir iyileştirme.
- **300 DPI notu:** Mevcut PDF yolu `deviceScaleFactor: 2`; PNG/JPEG yolu `3.125` (300/96). PDF için net 300 DPI garantisi CMYK epic'iyle birlikte ele alınacak.

### Dondurma servisi tetikten AYRI (kritik karar)
PDF dondurma, bir tetik anına sabitlenmez — **çağrılabilir bağımsız servis** olarak kurulur:
- `freezeOrderPdf(orderId)`: siparişin verisinden PDF üretir (`exportCatalog`), MinIO'ya yazar, `productionPdfKey`'i günceller. İdempotent olmalı (tekrar çağrılırsa üzerine yazar/atlar).
- **Mevcut tetik:** Sipariş oluşturma akışı (`createOrder` sonrası) bu servisi çağırır — ödeme akışı henüz devrede değil.
- **Tetik taşınabilir:** Ödeme onayı (`paymentStatus='paid'`) veya operatör "İş Emrini Üret" butonu. Servis aynı kalır, yalnızca *çağıran yer* değişir. Gerekçe: ödemeyen sipariş için boşuna PDF üretip MinIO'da yer kaplamamak.
- Bu, "zemini doğru kur, tetiği sonra taşı" felsefesi: mekanizma bir kez yazılır, tetikleme noktası esnek kalır.

### Storage
- Dondurulan PDF MinIO'ya yazılır (bkz. Storage düzeni: `presserdiado-orders` bucket, `{userId}/{orderId}/production.pdf`).
- DB'ye object key (`productionPdfKey`) yazılır; indirme anında signed URL. Pilotta basit erişim, signed URL sonrası.

---

## Admin / Operatör Tarafı

**Karar:** Tam admin paneli **şimdi kurulmaz** (roller, yetkiler, üretim akışı, denetim = ayrı büyük epic). Bunun yerine kullanıcı panelindeki pattern tekrarlanır: **görsel iskelet tam kurulur, bölümler parça parça aktive edilir.**

- Admin route + layout (sidebar, **gerçek korumalı erişim**) → tam kurulur.
- Menü kademeli aktive edilir: bazı modüller gerçek çalışır, geri kalanı görsel placeholder olarak durur (kullanıcı panelindeki desenle aynı).
- Sipariş yönetimi basit liste olarak çalışır: sipariş no, kullanıcı, durum, tutar, PDF indir, durum değiştir.
- Claude Design ile iskelet tasarlanabilir (kullanıcı paneli gibi), entegrasyon en sona.

**Güvenlik:** Erişim kontrolü placeholder OLAMAZ. Admin route'u baştan gerçekten korumalı (rol/yetki kontrolü), iskelet pasif olsa bile. Aksi halde güvenlik açığı placeholder olarak kalır.

---

## Güvenlik Notları (SecurityAuth)

- Her sipariş endpoint'inde `userId` sahiplik kontrolü (IDOR). `WHERE userId = :userId`.
- **Fiyat backend'de yeniden hesaplanır** — frontend'den gelen tutara güvenilmez. Tek fiyat kaynağı `POST /pricing/quote`'tur; frontend'de fiyat hesabı yoktur (yerel fiyat hesaplayıcı bulunmaz).
- Operatör/admin endpoint'leri ayrı yetki seviyesi ister (normal kullanıcı erişemez). Admin route baştan korumalı.
- `orderNumber` tahmin edilebilir olmamalı veya erişim sadece sahibine/admine açık olmalı (sıralı no + sahiplik kontrolü yeterli).
- MinIO objeleri pilotda erişim kontrollü; signed URL pilot sonrası.
- Fatura bilgisi `billingSnapshot` ile dondurulur — profil silinse de sipariş bütünlüğü korunur.

---

## Açık Kararlar (implementasyon öncesi netleşecek)

- **KDV ve indirim kaynağı:** `pricing_rules.taxRate` ve `quantityTiers` pilotda sabit; admin yönetimi sonra.
- **Logout / şifre sıfırlama:** Auth'ta yok. Logout = frontend token temizleme. Şifre sıfırlama sonraya.
- **CMYK boru hattı:** Ghostscript + ICC + preflight — sipariş modülünden sonra ayrı epic.
- **Hazır dosya yükleyerek sipariş:** `order_items.itemType='uploaded_file'` şemada hazır; UI sonra.
