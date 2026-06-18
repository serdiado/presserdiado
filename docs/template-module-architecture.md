# Tema & Modül Sistemi — Mimari Belge

> Stüdyo "şablon/tema" sisteminin mimari referansı. Sipariş modülündeki
> `order-module-architecture.md` ile aynı rolü oynar: kararlar, veri modeli,
> kurallar burada tutulur; her oturumda bu belge okunup bağlam alınır.
> Bu belge yalnız mimari içerir; uygulama durumu / faz takibi burada tutulmaz.

---

## Amaç & vaat

Kullanıcı bir tema seçip uyguladığında, broşür **bitmiş** olmalı — boş
banner/footer alanlarıyla değil, dolu bir tasarımla. "Tema seç → 30 saniyede
broşür hazır" vaadinin kanıtı bu. Tema uygulanınca üst banner ve alt footer'ın
dolu gelmesi (marka, adres, slogan) bu belgenin kapattığı boşluktur.

---

## Temel mimari kararı: B — Tema iskelet + modüller ayrı

İki yaklaşım tartışıldı:
- **A) Tema her şeyi içinde taşır** (banner/footer içeriği temaya gömülü). Basit
  ama tema firma-özel olur, esnek değil.
- **B) Tema iskelet + modüller ayrı** ← SEÇİLDİ. Tema boş banner/footer *alanı*
  taşır; banner/footer *içeriği* ayrı "modül" olarak kaydedilir, ID ile çağrılır.
  Tema "şu ID'li modülü şu alana getir" der.

**Neden B:** İleride kullanıcı hem tema hem modül kaydedebilecek (zaten "Modüller"
ve boş "Modüllerim" bölümü bu yüzden vardı). Modülün temadan bağımsız, taşınabilir,
yeniden kullanılabilir olması doğru mimari. Banner'ı bir kez tasarla, birçok temada
kullan.

---

## Sıralama kararı: önce modül, sonra tema-bağlama

Bağımlılık kuralı: **referans alınan şey (modül), referans alan şeyden (tema) önce
var olmalı.** Tema modülü ID ile çağıracak; o ID'li modül önce var olmalı ki tema
çağırabilsin ve test edilebilsin. Tersi (önce tema modül-alır hale getir) boşluğa
bağlamak olur — test edilemez.

Modüller **admin'den değil, kod-içi** tanımlanır — tıpkı `studioPresets.ts` gibi
bir `studioModules.ts`. Dev aracıyla tasarla → JSON al → dosyaya koy. Admin paneli
+ kullanıcının kendi modülünü kaydetmesi ayrı/ileri epic.

Paralel desen (tutarlılık):
- Temalar: `studioPresets.ts` + `listStudioPresets()` + dev "Preset Kopyala" → sonra admin/DB
- Modüller: `studioModules.ts` + `listStudioModules()` + dev "Modül Kopyala" → sonra admin/DB

---

## Banner ve Footer AYRI yapılar

Banner ve footer mimari olarak temelden farklı. Zorla tek `StudioModule` modeline
sokmak YANLIŞ — footer'ı slot mimarisine çevirmek çalışan bir sistemi bozar (ters
yama). İkisi ayrı ele alınır, paralel desende: ikisi de "tema uygulanınca dolu
gelir" amacına kendi doğasına uygun yoldan hizmet eder.

| Konu | Banner | Footer |
|---|---|---|
| Taşıyıcı | `StudioSlot` (`role:'free'` + `moduleData`) | `globalSettings.footer` / `page.customFooter` |
| Yerleşim | Grid içi slot, `bannerAreas + slotIndex` | Sayfa altı sabit (page-bottom) |
| ModuleRegistry | Var (`banner`, UI adı "Tablo Alanı") | Yok |
| Scope | Slot instance (çok sayıda olabilir) | Global veya sayfa-özel |
| İç grid | Değişken `rows×cols` | Sabit 5 kolon |
| Preset'e girer mi | Alan evet, İÇERİK HAYIR (`moduleData` alınmıyor) | Global footer teorik evet, customFooter HAYIR |

Banner ve footer ortak `StudioModule` soyutlamasına oturmaz; ayrı ele alınır.
(İleride istenirse ortak bir "içerik bloğu" arayüzü düşünülebilir ama şimdi gereksiz risk.)

- **Banner:** zaten modül (`moduleData.type='banner'`, hücreli, serialize edilebilir).
  Preset banner **alanını** (`bannerAreas`) taşır, **içeriğini** (`moduleData`) taşımaz;
  dolu banner içeriği ayrı modül kütüphanesinden (`studioModules.ts` → `applyStudioModule`)
  gelir.
- **Footer:** `globalSettings.footer`'da; preset zaten `globalSettings` taşıdığı için
  footer teknik olarak preset'e girer. Footer sabit page-bottom olduğundan
  `footerAreas`/`slotIndex` GEREKMEZ — sadece içerik taşınır.

---

## Modül Kütüphanesi

### Belkemiği kavram: TİP ≠ ÖRNEK
- **Modül TİPİ** (`ModuleRegistry`: banner) = "boş zemin" / yetenek tanımı
  ("banner ne yapabilir, varsayılan boş datası ne"). Mevcut yapı, AYRI kalır.
- **Modül ÖRNEĞİ** (kütüphane = `studioModules.ts`) = "hazır dolu tasarım"
  (renk/logo/yazı dolu). Kütüphanede TİP değil ÖRNEK durur ("Kırmızı Kampanya
  Banner'ı", boş "banner" değil).
- Kullanıcı örneği slota sürükler → dolu içerik KLONLANIR → kendi logosunu/yazısını
  değiştirir.
- KRİTİK: `ModuleRegistry`'yi doğrudan kütüphaneye büyütme → tip ile örnek karışır.

### İki slot-içi modül tipi (footer AYRI)
- **Banner/tablo modülü:** `role:'free'` slotta, ürün verisi YOK, serbest hücreli
  tasarım (`moduleData.type='banner'`).
- **Ürün-sunuş modülü:** `role:'product'` KALIR, ürün verisi BAĞLI kalır
  (resim/ad/fiyat kopmaz); sunuş yapısı mevcut `isCustom`/`customSettings` katmanı
  üstüne özelleşir. YENİ KATMAN DEĞİL.
- **Footer:** sayfa-tabanlı (`globalSettings.footer`/`page.customFooter`), slot değil,
  kütüphane DIŞI; ortak contract'a zorlanmaz. Düşük öncelik.

### Kapsam — kod-içi sistem modülleri
- **Sistem modülleri kod-içi:** `studioModules.ts` (presetler gibi), dev export
  aracıyla üretilir. Admin/DB'ye geçiş ters değil — aynı veri yapısı, kaynak değişir
  (`listStudioModules()` soyutlaması).
- **Kullanıcı modülü kaydetme ayrı epic:** kullanıcı kaydetmeyeceği sürece saklama
  altyapısı (DB/API/localStorage) GEREKMEZ. Gerçek kullanıcı-kaydetme epic'inde DB
  ile (localStorage değil) tutarlı kurulur.

### Contract — `StudioModule` (discriminated union)
**Konum:** `apps/web/src/features/studio/modules/types.ts` (shared DEĞİL — `moduleData`
web-only `BannerModuleData`'ya bağlandığı için; shared'a koymak ya
`unknown`'a düşürür ya da çekirdek tiplerini taşımayı gerektirir). Payload
`slotRole`'a göre **tip seviyesinde** ayrışır:
- `FreeStudioModule`: `slotRole:'free'`, `type:NonNullable<ModuleType>`,
  `moduleData:AnyModuleData` (ZORUNLU), `customSettings?:never`.
- `ProductStudioModule`: `slotRole:'product'`, `type:'product-presentation'`,
  `customSettings:DeepPartial<CatalogSettings>` (ZORUNLU), `moduleData?:never`.
- Ortak: `StudioModuleBase` (`id,name,description?,thumbnail?,source:'system'`).
- `ModuleType` (`'banner'|null`) KİRLENMEZ; `product-presentation` yalnız
  union'da. Ürün-sunuş YENİ KATMAN değil — mevcut `isCustom`/`customSettings` üstüne.

### Davranış kararları
- **Dolu slota drop:** free kolu içeriği KOŞULSUZ ezer — bilinçli karar, onay yok,
  undo tek adımda kurtarır.
- **Runtime guard:** product'ta `!customSettings` / free'de `!moduleData` → erken
  return (`saveState`'ten ÖNCE). Union ile çift güvence.
- **Drop branch:** `studioModuleId` `handleDrop`'un EN BAŞINDA, koşulsuz `return`
  (diğer key'ler/role-check öncesi). Tek undo: `applyStudioModule` inline mutasyon
  (`toggleSlotRole`/`setSlotModule` çağırmaz — ikisi de saveState'li).

---

## Korunan kurallar (proje geneli)

- `productPool` (kalıcı ürün havuzu) asla silinmez — tema/grid ne yaparsa yapsın.
- Stil = slota bağlı, içerik = ürüne bağlı (ayrı eksenler, çakışmaz).
- Tek-kaynak overflow: tasarıma sığmayan ürün → bekleme havuzu (hem tema hem Excel).
- Fiyat kutusu tek kanonik model (Model 1: `colors.priceBg` vb.) — `priceSettings`
  sadece konum.
- Native confirm yasak → ConfirmModal. Hardcode hex yok, token-bazlı. primary sadece CTA.
- slotIndex semantiği: export ↔ apply AYNI ("sayfa-içi sıralı slot indeksi").
- Tek saveState → tek undo adımı.

---

## Ertelenenler (ayrı/ileri epic'ler)

- **Admin'den tema/modül yönetimi** — CRUD, DB tablosu, listeleme. Kod-içi → DB
  geçişi için `listStudioPresets()`/`listStudioModules()` soyutlaması zaten hazır.
- **Kullanıcının kendi temasını/modülünü kaydetmesi** (gerçek B2) — DB, userId,
  kaydet/listele/sil.
- **Sekmeli "Şablonlar" UI** — soldaki Temalar bölümü sekmeli olacak: "Temalar,
  Tablo Alanı, Alt Bilgi, Hücre" gibi. Altyapı çalışınca UI güzelleştirmesi.
- **Modül ID ile kullanıcı modül kütüphanesi** ("Modüllerim").

---

## Gelecek epic'ler

> - **Serbest Tasarım Alanı** — slot-içi Canva tarzı, hareketli resim/yazı
>   kutucukları olan modül tipi. Ayrı epic. İşlevini şimdilik Tablo Alanı
>   (banner) karşılıyor; bu aşamaya sızdırılmıyor.
> - **Birleşik Resim Seçici** — `ImagePickerPopover` şu an yalnızca
>   sayfa/kanvas zemini (`CatalogPage.background`) için kullanılıyor. Modül-içi
>   hücre resmi (`BannerCellData` — `imageMode` / `imagePosX` / `imagePosY` /
>   `imageScale`), ürün-sunuş modülleri ve diğer resim ekleme alanları hâlâ
>   kendi eski upload yollarını kullanıyor. Hedef: tüm resim ekleme alanlarını
>   tek `ImagePickerPopover` deneyimine taşımak. Başlamadan önce kapsam (hangi
>   alanlar) ve veri modeli farkları (sayfa background vs modül cell data)
>   çıkarılmalı.
> - **Katmanlı Zemin / Gradient-Opacity** — `CatalogPage.background.type` şu
>   an discriminated union (`'color' | 'image'`); renk ve resim aynı anda
>   compose edilmiyor, resim eklenince renk replace ediliyor. `imageOpacity`
>   kanvas üstünde tek skaler, alttaki renge karışmıyor. Gradient-opacity
>   (resmin bir kenardan şeffaflaşıp alttaki renge geçişi) için şema
>   genişletilmeli (`type` union'ı `colorLayer` + `imageLayer` gibi ayrı
>   alanlara bölünmeli), renderer iki katmanı compose edecek şekilde
>   değiştirilmeli, opacity tek skaler yerine gradient-config'e çevrilmeli.
>   Geniş kapsamlı, ayrı epic.

---

## Bilinen mimari sınırlar

Mevcut mimarinin bilinçli bırakılan sınırları:

- **Resim seçici parçalı yapı:** `ImagePickerPopover` yalnız sayfa/kanvas zemini
  (`CatalogPage.background`) için bağlı. Banner hücre resimleri
  (`BannerCellData.imageMode` / `imagePosX` / `imagePosY` / `imageScale`),
  ürün-sunuş modülleri ve diğer resim girişleri ayrı/eski upload akışlarında.
  Tek deneyim için yukarıdaki **Birleşik Resim Seçici** epic'i gerekir.
- **Zemin compositing sınırı:** `CatalogPage.background.type` şu an
  `'color' | 'image'` union'ı. Renk + resim aynı anda compose edilmiyor;
  resim gelince renk replace oluyor ve `imageOpacity` yalnız tek skaler olarak
  uygulanıyor. Gradient-opacity ve alttaki renge karışım için yukarıdaki
  **Katmanlı Zemin / Gradient-Opacity** epic'i gerekir.
- **Preset slot-stili taşımıyor:** `StudioPreset` `settings + bannerAreas +
  pageBackgrounds` taşır. Sayfa zemini (`pageBackgrounds`, pageNumber bazlı,
  export ↔ apply aynı semantik) preset ile taşınır. Slot-bazlı özel stiller
  (`isCustom`/`customSettings`) preset'e dahil DEĞİL — slota özel tasarımın tema
  ile taşınması açık gelecek-iş.
- **Yarım bırakılmış modül-kütüphane iskeleleri (kullanılmıyor):** localStorage
  `userModules.ts`, `user_modules` DB tablosu, `Slot.tsx` `newUserModuleData` drop
  alıcısı ve boş "Modüllerim" UI — "ileride lazım" diye atılmış, hiçbiri bağlı
  değil. Gerçek kullanıcı-modülü epic'ine kadar DOKUNULMAZ/görmezden gelinir
  ("tamamlamaya" çalışmak dağınıklığı büyütür).

**Modül-drop yolları (hizalı):** İki giriş noktası var — (1) `newModuleType` drop
("Boş Modüller" panelindeki "Tablo Alanı" / Serbest Hücre kartı) ve (2) `studioModuleId`
→ `applyStudioModule` ("Hazır Tasarımlar" modülleri); ikisi de
[Slot.tsx](../apps/web/src/features/studio/canvas/Slot.tsx) `handleDrop`'tan geçer.
Her iki yol da AYNI desene hizalı: rol dönüşümü + `slot.id` hedefleme + `saveState(true)`
(forced) tek `setSlotModule`/`applyStudioModule` çağrısı içinde yapılır; tek fark giriş
noktasıdır.
