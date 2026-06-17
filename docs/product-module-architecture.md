# Ürün Modülü — Mimari Karar Belgesi
> Presserdiado / MatbaaPro — Kalıcı Ürün Havuzu, Medya Kütüphanesi, SKU↔Resim Eşleşmesi
> Tüm SeniorDev, ExcelLayout, ArtDirector, StudioCanvas komutlarında bu belge referans alınır.
> Kapsam: Kalıcı ürün havuzu, medya kütüphanesi ve SKU↔resim eşleştirme mimarisi.
> Bu belge mimari kararları tanımlar; uygulama durumu / proje planlaması burada tutulmaz.

---

## Bağlam: Bileşen Yerleşimi

| Alan | İşlev |
|---|---|
| Stüdyo Sağ Panel → "Excel ile otomatik yerleştir" | Sıralı Excel'i POS→slot eşleştirip kanvasa dizer; DB'ye yazmaz. |
| Stüdyo Sağ Panel → "Ürün Havuzu" | DB'deki kalıcı ürünleri (birincil resimleriyle) arar, listeler ve hücreye sürüklemeyi sağlar. |
| Stüdyo Sol Panel → "Bekleme Alanı" | Hücreden çıkarılan ürünleri geçici park etme alanı. |
| Kullanıcı Paneli → Kalıcı Havuz | DB tabanlı, userId bazlı ürün havuzu. |

---

## Veri Modeli

### Tablo 1: `products` (kalıcı ürün havuzu) ✅ MEVCUT
```sql
id          VARCHAR(36) PRIMARY KEY
userId      VARCHAR(36) NOT NULL
sku         VARCHAR(100) NOT NULL
name        VARCHAR(500) NOT NULL       -- 500 olarak korundu (veri kesilme riski)
price       DECIMAL(10,2)
category    VARCHAR(100)
unit        VARCHAR(50)
description TEXT
createdAt   DATETIME
updatedAt   DATETIME ON UPDATE CURRENT_TIMESTAMP
UNIQUE KEY (userId, sku)
```

### Tablo 2: `product_images` (ürün resimleri — SKU eşleşmeli) ✅ MEVCUT
```sql
id            VARCHAR(36) PRIMARY KEY
userId        VARCHAR(36) NOT NULL
sku           VARCHAR(100)                -- nullable: henüz eşleşmemiş (SKU'suz) resim kaydı olabilir
imageKey      VARCHAR(500) NOT NULL
fileName      VARCHAR(255)
sortOrder     INT DEFAULT 1
isTransparent BOOLEAN DEFAULT FALSE
createdAt     DATETIME
INDEX (userId, sku)
```

> **Birincil resim kuralı:** Bir SKU'nun birincil resmi = en düşük `sortOrder`'lı kayıt (eşitlikte en eski `createdAt`). Stüdyo ürün havuzu ve ürün listeleri tek resim gerektiğinde bu kuralla seçer. Tek resimli SKU'larda sıra alanı gizli/kilitli olacak.

### Tablo 3: `media_assets` (genel medya — logo, arka plan, şekil) ✅ MEVCUT
```sql
id          VARCHAR(36) PRIMARY KEY
userId      VARCHAR(36) NOT NULL
type        ENUM('logo','background','shape','other')
imageKey    VARCHAR(500) NOT NULL
fileName    VARCHAR(255)
mimeType    VARCHAR(100)
size        INT
createdAt   DATETIME
INDEX (userId, type)
```

### Storage klasör düzeni
```
/uploads/{userId}/products/   → ürün resimleri
/uploads/{userId}/media/      → genel medya (logo/arka plan/şekil)
```

---

## Neden İki Ayrı Tablo?

- Ürün resimleri: SKU eşleşmesi, sortOrder, isTransparent — ürüne özel mantık
- Genel medya: serbest, eşleşmesiz — type ile ayrışır
- Tek tabloda ürün-özel kolonlar logo kayıtlarında boş kalır → kirli model
- ERP entegrasyonunda ayrı tablo temiz kalır

---

## SKU ↔ Resim Eşleştirme Mimarisi

### Temel ilke
Resim dosyasının fiziksel adı önemsiz. Eşleşme DB'deki `product_images.sku` kolonunda tutulur.
Fiziksel ad: `<uuid>.<ext>` — sistem üretir.

### Dosya adından SKU çıkarımı + tam eşleşme

Toplu yüklemede her dosya adından bir SKU adayı çıkarılır, sonra bu aday DB'deki SKU listesiyle **yalnızca tam eşleşme** (normalize edilmiş; büyük/küçük harf duyarsız) kuralıyla eşleştirilir.

**Aday çıkarımı** — uzantı atılır; sondaki `_NN` / `-NN` sıra eki atılır; son `_` / `-` segmenti aday alınır:

| Dosya adı | SKU adayı |
|---|---|
| `755BU.jpg` | `755BU` |
| `urun_755BU.jpg` | `755BU` |
| `755BU_01.jpg` | `755BU` |
| `urun_755BU_02.jpg` | `755BU` |
| `IMG_001.jpg` | `IMG` (DB'de yoksa eşleşmez → elle atanır) |
| `WhatsApp Image.jpg` | `WhatsApp Image` (eşleşmez → elle atanır) |

**Yalnızca tam eşleşme — bilinçli karar.** Levenshtein / bulanık öneri **kullanılmaz**: kısa SKU kodlarında (ör. `0022A` ↔ `1022`) bulanık öneri yanıltıcıdır ve kullanıcının yanlış onayına yol açar. Aday DB'de birebir bulunmazsa resim "eşleşmedi" kalır; SKU'su elle atanır veya SKU'suz kaydedilir.

> Sıra eki (`_NN`) yalnızca adayı temizlemek için atılır; `sortOrder` ondan türetilmez — SKU başına DB'deki mevcut max + oturum içi sıra ile hesaplanır.

### Eşleştirme önizleme adımı (zorunlu)
Toplu yüklemede kör yükleme yapılmaz:
> "423 resimden 380'i otomatik eşleşti, 43'ü elle atanmalı"

### Şeffaflık kontrolü
PNG yüklendiğinde client-side canvas ile 4 köşe piksel analizi:
- Opak köşeler → `isTransparent = false` + UI'da ⚠️ uyarısı
- Uyarı engelleme değil, bilgilendirme

---

## Kullanıcı Akışları

### Akış 1: İlk Kurulum (Wizard — yeni kullanıcı)
```
Adım 1 — Ürün Listeni Yükle
  → Harici Excel sürükle (ExcelImportModal)
  → Kolon eşleştirme + önizleme + onayla → products tablosuna yaz

Adım 2 — Ürün Resimlerini Yükle
  → Toplu sürükle (ProductImageUploadModal)
  → Tam eşleşme + elle düzeltme + özet → product_images tablosuna yaz

Adım 3 — Hazır
  → "Ürün havuzun kuruldu, tasarım yapmaya başla"
  → Stüdyoya yönlendir
```

### Akış 2: Tekil Ürün Kartı
```
Kullanıcı Paneli → Ürün Listelerim → "+ Ürün Ekle"
  → SKU, isim, fiyat, kategori, birim, açıklama
  → Kaydet → products tablosuna yaz
  NOT: Tekil karta resim yükleme alanı sonraya bırakıldı
```

### Akış 3: Medya Kütüphanesi
```
Kullanıcı Paneli → Medya Kütüphanesi (şu an "Dosyalarım")
  ├── Ürün Resimleri sekmesi
  │     → Toplu resim yükle + tam eşleşmeli SKU eşleştirme
  │     → Yüklü resimleri gör, SKU eşleşmelerini düzenle
  │     → Eşleşmemiş resimleri filtrele
  └── Medya sekmesi (logo / arka plan / şekil)
        → Yükle, type seç, kullan
```

### Akış 4: Stüdyoda Ürün Kullanımı
```
Stüdyo → Sağ Panel → Ürünler sekmesi
  ├── Excel ile otomatik yerleştir
  └── Ürün Havuzu
      → DB'den arama + listeleme
      → Sürükle-bırak hücreye
      → "Ürün Havuzunu Yönet" → Kullanıcı Paneline link
```

### Akış 5: Excel Import
```
Kullanıcı Paneli → Ürün Listelerim → "Excel'den İçe Aktar"
  → ExcelImportModal: dosya yükle → kolon eşleştir → önizle → import
  → POST /api/v1/products/bulk
  → "X eklendi, Y atlandı" özeti
```

---

## API Endpoint'leri

| Method | Path | Açıklama |
|---|---|---|
| GET | `/api/v1/products` | Kullanıcı ürün listesi |
| GET | `/api/v1/products/with-images` | Stüdyo havuzu: ürün + birincil resim (en düşük sortOrder) |
| POST | `/api/v1/products` | Tekil ürün ekle |
| PATCH | `/api/v1/products/:id` | Ürün güncelle |
| DELETE | `/api/v1/products/:id` | Ürün sil (cascade: product_images) |
| POST | `/api/v1/products/bulk` | Toplu ürün ekle (max 1000) |
| DELETE | `/api/v1/products/bulk` | Toplu ürün sil (max 100, cascade: product_images) |
| GET | `/api/v1/product-images` | Kullanıcı resim listesi |
| GET | `/api/v1/product-images/by-sku/:sku` | SKU'ya ait resimler |
| POST | `/api/v1/product-images` | Resim kaydı oluştur + SKU ata |
| PATCH | `/api/v1/product-images/:id/sku` | Resmin SKU eşleşmesini ata / kaldır |
| DELETE | `/api/v1/product-images/:id` | Resim sil |
| DELETE | `/api/v1/product-images/bulk` | Toplu resim sil (max 100) |
| GET | `/api/v1/media-assets` | Medya listesi (type filtreli) |
| POST | `/api/v1/media-assets` | Medya yükle |
| POST | `/api/v1/media-assets/:id/assign-to-product` | Medyayı ürün resmi olarak SKU'ya kopyala |
| DELETE | `/api/v1/media-assets/:id` | Medya sil |

---

## Güvenlik Notları (SecurityAuth için)

- Her endpoint'te `userId` sahiplik kontrolü (IDOR koruması)
- Tüm sorgularda `WHERE userId = :userId`
- `/uploads/{userId}/` şu an public — pilot sonrası signed URL'e taşınacak
- SKU unique: `(userId, sku)` — farklı kullanıcılar aynı SKU'yu kullanabilir

---

## Açık Kararlar (pilot sonrasına)

- ERP entegrasyonu: `products` tablosu kaynak kalır, sadece import adaptörü değişir
- Signed URL: `imageKey` yapısı değişmez, sadece URL üretim mantığı değişir
- Ürün galerisi çoklu resim UI: `sortOrder` altyapısı hazır, sürükle-bırak yeniden sıralama UI sonraya
- Tekil ürün kartına resim yükleme alanı: sonraya bırakıldı
- Resim sıra yönetimi (sortOrder swap UI): sonraya bırakıldı (birincil resim kuralı için bkz. Veri Modeli → `product_images`)