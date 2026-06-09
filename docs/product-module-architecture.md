# Ürün Modülü — Mimari Karar Belgesi
> Presserdiado / MatbaaPro — Kalıcı Ürün Havuzu, Medya Kütüphanesi, SKU↔Resim Eşleşmesi
> Tüm SeniorDev, ExcelLayout, ArtDirector komutlarında bu belge referans alınır.

---

## Bağlam: Mevcut Durum ve Sorun

Şu an stüdyoda üç ayrı "havuz" kavramı var, bu karmaşa yaratıyor:

| Alan | Gerçek İşlev | Durum |
|---|---|---|
| Sağ Panel → "Excel ile otomatik yerleştir" | Sıralı Excel'i slot→POS eşleştirip kanvasa dizer. DB'ye yazmaz. | **KALIR — dokunulmaz** |
| Sağ Panel → "Ürün havuzu" bölümü | Eski geçici havuz (Excel'den yüklenir, proje JSON'unda yaşır) | **TAMAMEN KALDIRILIR** |
| Sol Panel → "Bekleme Alanı" | Hücreden çıkarılan ürünleri geçici park etme — ürün havuzu değil | **KALIR — dokunulmaz** |
| Kullanıcı Paneli → Kalıcı Havuz | DB tabanlı, userId bazlı, tüm projelerde ortak | **KURULACAK** |

**Kaldırılacak UI elemanları** (Sağ Panel → Ürünler sekmesi):
- "Ürün havuzu" başlıklı bölümün tamamı
- "Ürün havuzu Excel'i yükle" dropzone
- "Dosya değiştir" butonu
- "Havuzu temizle" butonu
- "Ürün ekle" butonu
- "Ürün ara ve sürükle" arama kutusu
- Tümü / Kullanılan / Kalan filtreleri

Bu elemanların işlevi Parça 4'te DB'den beslenecek yeni bileşenle karşılanacak.

---

## Veri Modeli

### Tablo 1: `products` (kalıcı ürün havuzu)
```sql
id          VARCHAR(36) PRIMARY KEY   -- uuid
userId      VARCHAR(36) NOT NULL      -- sahip (izolasyon)
sku         VARCHAR(100) NOT NULL     -- benzersiz ürün kodu (userId bazlı)
name        VARCHAR(255) NOT NULL     -- ürün adı
price       DECIMAL(10,2)             -- fiyat (kuruş bazlı hesap için INT de olabilir)
category    VARCHAR(100)              -- kategori
unit        VARCHAR(50)               -- birim (adet, kg, lt...)
description TEXT                      -- açıklama
createdAt   DATETIME
updatedAt   DATETIME
UNIQUE KEY (userId, sku)              -- aynı kullanıcıda SKU tekrarlanamaz
```

### Tablo 2: `product_images` (ürün resimleri — SKU eşleşmeli)
```sql
id            VARCHAR(36) PRIMARY KEY
userId        VARCHAR(36) NOT NULL
sku           VARCHAR(100) NOT NULL   -- eşleşme anahtarı (products.sku ile)
imageKey      VARCHAR(500) NOT NULL   -- /uploads/userId/products/<uuid>.ext
fileName      VARCHAR(255)            -- kullanıcının yüklediği orijinal ad
sortOrder     INT DEFAULT 1           -- çoklu resim sırası
isTransparent BOOLEAN DEFAULT FALSE   -- PNG köşe piksel analizi sonucu
createdAt     DATETIME
INDEX (userId, sku)
```

### Tablo 3: `media_assets` (genel medya — logo, arka plan, şekil)
```sql
id          VARCHAR(36) PRIMARY KEY
userId      VARCHAR(36) NOT NULL
type        ENUM('logo','background','shape','other')
imageKey    VARCHAR(500) NOT NULL     -- /uploads/userId/media/<uuid>.ext
fileName    VARCHAR(255)
mimeType    VARCHAR(100)
size        INT                       -- byte
createdAt   DATETIME
INDEX (userId, type)
```

### Storage klasör düzeni
```
/uploads/{userId}/products/   → ürün resimleri
/uploads/{userId}/media/      → genel medya (logo/arka plan/şekil)
```

---

## Neden İki Ayrı Tablo (product_images + media_assets)?

- Ürün resimleri SKU eşleşmesi, sortOrder, isTransparent gibi ürüne özel mantık taşır
- Logo/arka plan serbest, eşleşmesiz — type ile ayrışır
- Tek tabloda ürün-özel kolonlar logo kayıtlarında boş kalır → kirli model
- İleride bir ürünün birden fazla resmi (galeri) veya resim ERP'den gelmesi durumunda ayrı tablo temiz kalır

---

## SKU ↔ Resim Eşleştirme Mimarisi

### Temel ilke
Resim dosyasının fiziksel adı önemsiz. Eşleşme DB'deki `product_images.sku` kolonunda tutulur.
Fiziksel ad: `<uuid>.<ext>` — sistem üretir, kullanıcı adlandırmasına bağımlılık yok.

### Akıllı eşleştirme (toplu yüklemede öneri motoru)
Kullanıcı resim yüklediğinde, sistem dosya adından SKU tahmini yapar:

| Dosya adı | Tahmin | Güven |
|---|---|---|
| `755BU.jpg` | `755BU` | Yüksek — dosya adı = SKU |
| `urun_755BU.jpg` | `755BU` | Yüksek — son `_`den sonrası |
| `755BU_01.jpg` | `755BU`, sıra 1 | Yüksek — `_NN` sıra eki |
| `urun_755BU_02.jpg` | `755BU`, sıra 2 | Yüksek |
| `IMG_001.jpg` | — | Düşük — elle atanmalı |
| `WhatsApp Image.jpg` | — | Düşük — elle atanmalı |

Tahmin algoritması: Levenshtein mesafesi ile DB'deki SKU listesine karşı skor hesaplanır.
Yüksek güven → otomatik eşleştir. Düşük güven → kullanıcıya öneri sun, onay iste.

### Eşleştirme önizleme adımı (zorunlu)
Toplu yüklemede "Kör yükleme" yapılmaz. Kullanıcı her zaman özet görür:
> "423 resimden 380'i otomatik eşleşti, 43'ü elle atanmalı"
→ Otomatikleri "Hepsini Onayla", geri kalanları tek tek ata.

### Şeffaflık kontrolü
PNG yüklendiğinde 4 köşe piksel analizi:
- Alfa kanalı yoksa veya tüm köşeler opaksa → `isTransparent = false` + UI'da ⚠️ uyarısı
- Uyarı engelleme değil, bilgilendirme — kullanıcı yine de yükleyebilir

---

## Kullanıcı Akışları

### Akış 1: İlk Kurulum (Wizard — yeni kullanıcı)
```
Adım 1 — Ürün Listeni Yükle
  → Harici Excel sürükle (herhangi format)
  → Kolon eşleştirme UI: "Hangi kolon SKU? Hangisi isim? Hangisi fiyat?"
  → Eşleştirme şablonu kaydedilebilir (bir sonraki seferde tekrar yapılmaz)
  → Önizleme: "500 ürün bulundu, 3 satırda hata var"
  → Onayla → products tablosuna yaz

Adım 2 — Ürün Resimlerini Yükle
  → Toplu sürükle (400-600 dosya)
  → Akıllı eşleştirme çalışır
  → Özet: "380 otomatik, 43 elle atanmalı"
  → Hızlı onay ekranı
  → Onayla → product_images tablosuna yaz

Adım 3 — Hazır
  → "Ürün havuzun kuruldu, tasarım yapmaya başla"
  → Stüdyoya yönlendir
```

### Akış 2: Tek Ürün Kartı (sonraki kullanım)
```
Kullanıcı Paneli → Ürün Listelerim → "+ Ürün Ekle"
  → SKU (zorunlu, userId bazlı unique)
  → Ürün Adı (zorunlu)
  → Fiyat, Kategori, Birim, Açıklama (opsiyonel)
  → Resim yükle (şeffaflık uyarısı)
  → Kaydet → products + product_images'a yaz
```

### Akış 3: Medya Kütüphanesi (resim yönetimi)
```
Kullanıcı Paneli → Medya Kütüphanesi
  ├── Ürün Resimleri sekmesi
  │     → Yüklü resimleri gör, SKU eşleşmelerini düzenle
  │     → Yeni resim yükle + eşleştir
  │     → Eşleşmemiş resimleri filtrele
  └── Medya sekmesi (logo / arka plan / şekil)
        → Yükle, type seç, kullan
```

### Akış 4: Stüdyoda Ürün Kullanımı (Parça 4'te yapılacak)
```
Stüdyo → Sağ Panel → Ürünler sekmesi
  ├── Excel ile otomatik yerleştir  ← MEVCUT, DOKUNULMAZ
  └── [Eski "Ürün havuzu" bölümü KALDIRILDI]
      Yerine gelecek (Parça 4):
      → DB'den arama + listeleme
      → Sürükle-bırak hücreye
      → "Ürün Havuzunu Yönet" → Kullanıcı Paneline link
```

---

## Uygulama Parçaları (öncelik sırası)

| Parça | İş | Ajan |
|---|---|---|
| **Parça 1** | DB migration: 3 tablo oluştur | SeniorDev |
| **Parça 2** | Tekil ürün CRUD endpoint + ürün kartı UI | SeniorDev + ArtDirector |
| **Parça 3** | Harici Excel import (kolon eşleştirme) | SeniorDev + ExcelLayout |
| **Parça 4** | Toplu resim yükleme + akıllı SKU eşleştirme | SeniorDev |
| **Parça 5** | Wizard (ilk kurulum akışı) | SeniorDev + ArtDirector |
| **Parça 6** | Medya Kütüphanesi UI | ArtDirector + SeniorDev |
| **Parça 7** | Stüdyo sağ panel: eski havuz kaldır, DB bağla | StudioCanvas + SeniorDev |

---

## Güvenlik Notları (SecurityAuth için)

- Her endpoint'te `userId` sahiplik kontrolü (IDOR'a karşı)
- `products`, `product_images`, `media_assets` sorgularında her zaman `WHERE userId = :userId`
- `/uploads/{userId}/` altındaki dosyalara doğrudan URL erişimi — ileride signed URL'e taşınacak
- SKU unique constraint `(userId, sku)` bazlı — farklı kullanıcılar aynı SKU'yu kullanabilir

---

## Açık Kararlar (pilot sonrasına bırakılan)

- ERP entegrasyonu: SKU listesi dışarıdan geldiğinde `products` tablosu kaynak olarak kalır, sadece import adaptörü değişir
- Signed URL: şu an `/uploads/` public — pilot sonrası S3 + signed URL'e geçişte `imageKey` yapısı değişmez, sadece URL üretim mantığı değişir
- Ürün galerisi (çoklu resim UI): `sortOrder` altyapısı hazır, sürükle-bırak sıralama UI'ı pilot sonrası
