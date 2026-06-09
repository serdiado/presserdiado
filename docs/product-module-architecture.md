# Ürün Modülü — Mimari Karar Belgesi
> Presserdiado / MatbaaPro — Kalıcı Ürün Havuzu, Medya Kütüphanesi, SKU↔Resim Eşleşmesi
> Tüm SeniorDev, ExcelLayout, ArtDirector, StudioCanvas komutlarında bu belge referans alınır.
> Son güncelleme: Parça 1-3 tamamlandı, Parça 7 kısmen tamamlandı.

---

## Bağlam: Mevcut Durum

| Alan | Gerçek İşlev | Durum |
|---|---|---|
| Sağ Panel → "Excel ile otomatik yerleştir" | Sıralı Excel'i slot→POS eşleştirip kanvasa dizer. DB'ye yazmaz. | ✅ KALIR — dokunulmaz |
| Sağ Panel → "Ürün havuzu" bölümü | Eski geçici havuz | ✅ KALDIRILDI (Parça 7 kısmi) |
| Sol Panel → "Bekleme Alanı" | Hücreden çıkarılan ürünleri geçici park etme | ✅ KALIR — dokunulmaz |
| Kullanıcı Paneli → Kalıcı Havuz | DB tabanlı, userId bazlı | ✅ KURULDU (Parça 1-3) |

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
sku           VARCHAR(100) NOT NULL
imageKey      VARCHAR(500) NOT NULL
fileName      VARCHAR(255)
sortOrder     INT DEFAULT 1
isTransparent BOOLEAN DEFAULT FALSE
createdAt     DATETIME
INDEX (userId, sku)
```

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

### Akıllı eşleştirme (toplu yüklemede öneri motoru)

| Dosya adı | Tahmin | Güven |
|---|---|---|
| `755BU.jpg` | `755BU` | Yüksek — dosya adı = SKU |
| `urun_755BU.jpg` | `755BU` | Yüksek — son `_`den sonrası |
| `755BU_01.jpg` | `755BU`, sıra 1 | Yüksek — `_NN` sıra eki |
| `urun_755BU_02.jpg` | `755BU`, sıra 2 | Yüksek |
| `IMG_001.jpg` | — | Düşük — elle atanmalı |
| `WhatsApp Image.jpg` | — | Düşük — elle atanmalı |

Tahmin algoritması: Levenshtein mesafesi ile DB'deki SKU listesine karşı skor hesaplanır.

### Eşleştirme önizleme adımı (zorunlu)
Toplu yüklemede kör yükleme yapılmaz:
> "423 resimden 380'i otomatik eşleşti, 43'ü elle atanmalı"

### Şeffaflık kontrolü
PNG yüklendiğinde client-side canvas ile 4 köşe piksel analizi:
- Opak köşeler → `isTransparent = false` + UI'da ⚠️ uyarısı
- Uyarı engelleme değil, bilgilendirme

---

## Kullanıcı Akışları

### Akış 1: İlk Kurulum (Wizard — yeni kullanıcı) — Parça 5'te yapılacak
```
Adım 1 — Ürün Listeni Yükle
  → Harici Excel sürükle (ExcelImportModal — ✅ HAZIR)
  → Kolon eşleştirme + önizleme + onayla → products tablosuna yaz

Adım 2 — Ürün Resimlerini Yükle
  → Toplu sürükle (MediaUploadModal — Parça 4'te yapılacak)
  → Akıllı eşleştirme + özet + onayla → product_images tablosuna yaz

Adım 3 — Hazır
  → "Ürün havuzun kuruldu, tasarım yapmaya başla"
  → Stüdyoya yönlendir
```

### Akış 2: Tekil Ürün Kartı ✅ HAZIR
```
Kullanıcı Paneli → Ürün Listelerim → "+ Ürün Ekle"
  → SKU, isim, fiyat, kategori, birim, açıklama
  → Kaydet → products tablosuna yaz
  NOT: Resim yükleme alanı Parça 4 sonrası eklenecek
```

### Akış 3: Medya Kütüphanesi — Parça 4+6'da yapılacak
```
Kullanıcı Paneli → Medya Kütüphanesi (şu an "Dosyalarım")
  ├── Ürün Resimleri sekmesi
  │     → Toplu resim yükle + akıllı SKU eşleştirme
  │     → Yüklü resimleri gör, SKU eşleşmelerini düzenle
  │     → Eşleşmemiş resimleri filtrele
  └── Medya sekmesi (logo / arka plan / şekil)
        → Yükle, type seç, kullan
```

### Akış 4: Stüdyoda Ürün Kullanımı — Parça 7'de tamamlanacak
```
Stüdyo → Sağ Panel → Ürünler sekmesi
  ├── Excel ile otomatik yerleştir  ← MEVCUT, DOKUNULMAZ ✅
  └── Ürün Havuzu [KALDIRILDI ✅]
      Yerine gelecek (Parça 7):
      → DB'den arama + listeleme
      → Sürükle-bırak hücreye
      → "Ürün Havuzunu Yönet" → Kullanıcı Paneline link
```

### Akış 5: Excel Import ✅ HAZIR
```
Kullanıcı Paneli → Ürün Listelerim → "Excel'den İçe Aktar"
  → ExcelImportModal: dosya yükle → kolon eşleştir → önizle → import
  → POST /api/v1/products/bulk
  → "X eklendi, Y atlandı" özeti
```

---

## Uygulama Parçaları (güncel durum)

| Parça | İş | Ajan | Durum |
|---|---|---|---|
| **Parça 1** | DB migration: 3 tablo | SeniorDev | ✅ TAMAMLANDI |
| **Parça 2** | Tekil ürün CRUD + UI | SeniorDev + ArtDirector | ✅ TAMAMLANDI |
| **Parça 3** | Harici Excel import | SeniorDev + ExcelLayout | ✅ TAMAMLANDI |
| **Parça 6A** | Medya Kütüphanesi iskelet: "Dosyalarım"→"Medya Kütüphanesi", sekmeli yapı | ArtDirector + SeniorDev — Gemini | ⏳ SIRADA |
| **Parça 4** | Toplu resim yükleme + akıllı SKU eşleştirme (Medya Kütüphanesi → Ürün Resimleri sekmesi) | SeniorDev — **Opus** | ⏳ SIRADA |
| **Parça 5** | Wizard (ilk kurulum akışı) | SeniorDev + ArtDirector — **Opus** | ⏳ SIRADA |
| **Parça 6B** | Medya sekmesi tamamla (logo/arka plan/şekil) | ArtDirector + SeniorDev — Gemini | ⏳ SIRADA |
| **Parça 7** | Stüdyo sağ panel: DB'den beslenen ürün havuzu | StudioCanvas + SeniorDev | 🔄 KISMI |

### Güncel öncelik sırası
```
Parça 6A → Medya Kütüphanesi iskelet (Gemini)
    ↓
Parça 4  → Toplu resim yükleme + SKU eşleştirme (Opus)
    ↓
Parça 5  → Wizard (Opus)
    ↓
Parça 6B → Medya sekmesi tamamla (Gemini)
    ↓
Parça 7  → Stüdyo DB bağlantısı (Gemini + Opus)
```

---

## Mevcut API Endpoint'leri

| Method | Path | Durum | Açıklama |
|---|---|---|---|
| GET | `/api/v1/products` | ✅ | Kullanıcı ürün listesi |
| POST | `/api/v1/products` | ✅ | Tekil ürün ekle |
| PATCH | `/api/v1/products/:id` | ✅ | Ürün güncelle |
| DELETE | `/api/v1/products/:id` | ✅ | Ürün sil (cascade: product_images) |
| POST | `/api/v1/products/bulk` | ✅ | Toplu ürün ekle (max 1000) |
| GET | `/api/v1/product-images` | 🔲 iskelet | Kullanıcı resim listesi |
| GET | `/api/v1/product-images/:sku` | 🔲 iskelet | SKU'ya ait resimler |
| POST | `/api/v1/product-images` | 🔲 iskelet | Resim yükle + SKU ata |
| DELETE | `/api/v1/product-images/:id` | 🔲 iskelet | Resim sil |
| GET | `/api/v1/media-assets` | 🔲 iskelet | Medya listesi |
| POST | `/api/v1/media-assets` | 🔲 iskelet | Medya yükle |
| DELETE | `/api/v1/media-assets/:id` | 🔲 iskelet | Medya sil |

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
- Ürün galerisi çoklu resim UI: `sortOrder` altyapısı hazır, sürükle-bırak UI sonraya
- Tekil ürün kartına resim yükleme alanı: Parça 4 sonrası eklenecek
