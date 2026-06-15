# Tema & Modül Sistemi — Mimari Belge

> Stüdyo "şablon/tema" sisteminin mimari referansı. Sipariş modülündeki
> `order-module-architecture.md` ile aynı rolü oynar: kararlar, veri modeli,
> kurallar burada tutulur; her oturumda Opus/Cline bunu okuyup bağlam alır.
>
> **Durum:** B1 (boş tema) tamamlandı ve commit'lendi (`b4b6744`). Şimdi
> "zengin tema" (dolu banner/footer + zemin + özel slot stilleri) inşa ediliyor.
> Belge bölümler ilerledikçe güncellenecek (order belgesi gibi).

---

## Amaç & vaat

Kullanıcı (veya sunumda biz) bir tema seçip uyguladığında, broşür **bitmiş**
olmalı — boş banner/footer alanlarıyla değil, dolu bir tasarımla. "Tema seç →
30 saniyede broşür hazır" vaadinin kanıtı bu. Yatırımcı sunumunun ana gösterisi:
ham broşür → tek tık → tasarım harikası.

**Tetikleyici gerçeklik (14.06.2026):** B1 ile tema uygulanınca grid + stil +
zemin geliyor ama üst banner ("SERBEST ALAN") ve alt footer BOŞ kalıyor — marka,
adres, slogan yok. Bu haliyle "broşür hazır" denemiyor. Bu belge o boşluğu kapatır.

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

**Sunum için kapsam daraltması:** Modüller şimdilik **admin'den değil, kod-içi**
tanımlanır — tıpkı `studioPresets.ts` gibi bir `studioModules.ts`. Dev aracıyla
tasarla → JSON al → dosyaya koy. Admin paneli + kullanıcının kendi modülünü
kaydetmesi = sunum sonrası (kullanıcı/admin görmüyor, minimum tut).

Paralel desen (tutarlılık):
- Temalar: `studioPresets.ts` + `listStudioPresets()` + dev "Preset Kopyala" → sonra admin/DB
- Modüller: `studioModules.ts` + `listStudioModules()` + dev "Modül Kopyala" → sonra admin/DB

---

## "Bitmiş broşür" için 4 eksik parça

Tema uygulanınca dolması gerekenler (şu an boş/eksik):
1. **Banner alanı** (üst "SERBEST ALAN") — dolu banner gelmeli (logo, slogan).
   B1 sadece boş alan işaretliyor. → Modül sistemi (B) ile çözülür.
2. **Footer** (alt boş bant) — dolu footer gelmeli (firma adı, adres, tel).
   "Modül gibi ama farklı yapı" (kullanıcı notu) — KEŞİF GEREKLİ.
3. **Özel slot stilleri** — vurgulu slotlar (kampanya: büyük, renkli). Geniş
   preset'e girecek (slot numarasına göre bağlanır, banner slotIndex semantiğinin kardeşi).
4. **Sayfa zemini** — çalışıyor (canvas'ta render ediliyor) ama `exportPresetFromState`
   almıyor (`CatalogPage.background` `globalSettings` dışında). Export'a eklenecek.

---

## Bölümlü plan (her biri ayrı, sırayla, test her bölüm sonrası)

### Bölüm 1 — Footer + banner yapısı keşfi  ⬅ SIRADAKİ
"Modül gibi ama farklı" footer tam ne? Mevcut banner modülü nasıl çalışıyor
(`role:'free'` + banner modülü)? İkisi ortak bir "modül" kavramına oturur mu,
yoksa ayrı mı ele alınmalı? Footer'ın veri yapısı (`StudioFooterCell`?) ne tutuyor?
→ Modül veri modelini tasarlamadan önce bu netleşmeli.

### Bölüm 2 — Modül veri modeli + sistem modülleri
`StudioModule` tipi (banner/footer içeriği taşıyan, ID'li). `studioModules.ts`
(kod-içi sistem modülleri). `listStudioModules()`. Dev "Modül Kopyala" aracı
(`exportModuleFromState` benzeri).

### Bölüm 3 — Tema → modül referansı
`StudioPreset`'e "şu alana şu ID'li modül" alanı. `applyPreset` modülü çağırıp
alana yerleştirir. Tema uygulanınca banner/footer DOLU gelir.

### Bölüm 4 — Geniş preset: zemin + özel slot stilleri
`StudioPreset`'e sayfa zeminleri (`pageBackgrounds`) + `isCustom` slot stilleri
(slot numarasına göre). `exportPresetFromState` + `applyPreset` bunları taşır.
Bağlama: banner `slotIndex` semantiğiyle aynı (sayfa-içi sıralı slot indeksi).

### Bölüm 5 — Gerçek şablon + modül üretimi
Dev araçlarıyla 2-3 TAM-BİTMİŞ güzel şablon tasarla (dolu banner/footer + zemin +
özel slotlar). `studioPresets.ts` + `studioModules.ts`'e koy. Sunumun asıl malzemesi.

---

## Ertelenenler (sunum sonrası — kullanıcı/admin görmüyor)

- **Admin'den tema/modül yönetimi** — CRUD, DB tablosu, listeleme. Kod-içi → DB
  geçişi için `listStudioPresets()`/`listStudioModules()` soyutlaması zaten hazır.
- **Kullanıcının kendi temasını/modülünü kaydetmesi** (gerçek B2) — DB, userId,
  kaydet/listele/sil.
- **Sekmeli "Şablonlar" UI** — soldaki Temalar bölümü sekmeli olacak: "Temalar,
  Tablo Alanı, Alt Bilgi, Hücre" gibi. Altyapı çalışınca UI güzelleştirmesi.
- **Modül ID ile kullanıcı modül kütüphanesi** ("Modüllerim").

---

## Korunan kurallar (mevcut B1 + proje geneli)

- `productPool` (kalıcı ürün havuzu) asla silinmez — tema/grid ne yaparsa yapsın.
- Stil = slota bağlı, içerik = ürüne bağlı (ayrı eksenler, çakışmaz).
- Tek-kaynak overflow: tasarıma sığmayan ürün → bekleme havuzu (hem tema hem Excel).
- Fiyat kutusu tek kanonik model (Model 1: `colors.priceBg` vb.) — `priceSettings`
  sadece konum. (Commit `3e11c21`.)
- Native confirm yasak → ConfirmModal. Hardcode hex yok, token-bazlı. primary sadece CTA.
- slotIndex semantiği: export ↔ apply AYNI ("sayfa-içi sıralı slot indeksi").
- Tek saveState → tek undo adımı.

---

## Açık sorular (bölümler ilerledikçe cevaplanacak)

- [ ] Footer "farklı yapı" tam ne? Banner modülüyle ortak model olur mu? (Bölüm 1)
- [ ] Modül içeriği nasıl serialize edilir (metin, görsel, QR, iç grid)? (Bölüm 2)
- [ ] Bir tema birden çok modül alanı taşıyabilir mi (banner + footer + ara bantlar)? (Bölüm 3)
- [ ] Özel slot stili + modül aynı slotta çakışır mı? (Bölüm 3-4)

---

## Bölüm 1 keşif sonucu (güncellendi) — Banner ve Footer AYRI yapılar

**En kritik bulgu:** Banner ve footer mimari olarak temelden farklı. Zorla tek
`StudioModule` modeline sokmak YANLIŞ — footer'ı slot mimarisine çevirmek çalışan
bir sistemi bozar (ters yama). Doğru yaklaşım: **ikisini ayrı ele al, paralel
desende** — ikisi de "tema uygulanınca dolu gelir" amacına hizmet eder ama kendi
doğalarına uygun yoldan.

| Konu | Banner | Footer |
|---|---|---|
| Taşıyıcı | `StudioSlot` (`role:'free'` + `moduleData`) | `globalSettings.footer` / `page.customFooter` |
| Yerleşim | Grid içi slot, `bannerAreas + slotIndex` | Sayfa altı sabit (page-bottom) |
| ModuleRegistry | Var (`banner`, UI adı "Tablo Alanı") | Yok |
| Scope | Slot instance (çok sayıda olabilir) | Global veya sayfa-özel |
| İç grid | Değişken `rows×cols` | Sabit 5 kolon |
| Preset'e girer mi | Alan evet, İÇERİK HAYIR (`moduleData` alınmıyor) | Global footer teorik evet, customFooter HAYIR |

**Açık soru #1 CEVABI:** Banner ve footer ortak `StudioModule` soyutlamasına
oturmuyor. Ayrı ele alınacak. (İleride istenirse ortak bir "içerik bloğu" arayüzü
düşünülebilir ama şimdi gereksiz risk.)

### Banner — asıl iş burada
- Banner zaten modül (`moduleData.type='banner'`, hücreli, serialize edilebilir).
- Eksik: preset banner **alanını** taşıyor (`bannerAreas`) ama **içeriğini**
  (`moduleData`) taşımıyor. `applyBannerAreas` sadece `role:'free'` açıyor,
  moduleData set etmiyor → tema uygulanınca banner BOŞ.
- **Düzeltme:** preset banner alanına `moduleData` (içerik) da koy; apply ederken
  alanı açıp içeriği de yerleştir.

### Footer — daha kolay
- Footer zaten `globalSettings.footer`'da → preset zaten `globalSettings` taşıyor
  → footer teknik olarak zaten preset'e girebiliyor. Eksik: hazır preset'lerde
  dolu footer tanımı yok. Yani "yeni mekanizma" değil, "preset'e dolu footer koy."
- **Footer için `footerAreas`/`slotIndex` GEREKMEZ** — footer sabit page-bottom,
  zaten her sayfada var. Sadece içeriği (FooterSettings) preset taşımalı.

### İki gizli bug (düzeltilecek)
1. **Preset export banner içeriğini kaçırıyor:** `exportPresetFromState` her
   `role:'free'` slotu banner alanı sayıyor ama `moduleData.type==='banner'` var mı
   bakmıyor, içeriği almıyor. → Dolu banner export edilince içerik kaybolur.
2. **customFooter tuzağı:** Kullanıcı footer'ı inline düzenleyince `globalSettings.footer`
   değil `page.customFooter` değişiyor; preset export `customFooter` almıyor.
   → Inline düzenlenen footer export'ta kaybolur. Export hangi footer'ı (global mi
   custom mu) alacağına karar vermeli.

---

## Revize plan (Bölüm 1 sonrası)

Banner ve footer ayrı olduğu için bölümler netleşti:

### Bölüm 2 — Banner içeriğini preset'e taşı
`StudioPresetBannerArea`'ya `moduleData` (banner içeriği) ekle. `applyBannerAreas`
alanı açarken içeriği de yerleştirsin. `exportPresetFromState` banner alanının
`moduleData`'sını da çıkarsın (gizli bug #1 düzeltilir — sadece gerçek banner'lı
free slotları al, içeriğiyle).

### Bölüm 3 — Footer içeriğini preset'e taşı
Preset'in `globalSettings.footer`'ı dolu footer taşıyabilsin. Export ederken hangi
footer alınacak (global vs custom) netleştir (gizli bug #2). Footer sabit konumda,
alan işaretlemeye gerek yok — sadece içerik.

### Bölüm 4 — Geniş preset: zemin + özel slot stilleri
(Değişmedi) `pageBackgrounds` + `isCustom` slot stilleri, slot numarasına göre.

### Bölüm 5 — Gerçek şablon + modül üretimi
(Değişmedi) Dev araçlarıyla tam-bitmiş güzel şablonlar. Banner/footer dolu,
zemin + özel slotlar dahil.

**Not — "modül kaydetme" (B yaklaşımı) yeniden konumlandı:** Keşif gösterdi ki
banner zaten slot-modülü; "modül kütüphanesi + ID" sistemi (kullanıcının banner'ı
ayrı kaydedip yeniden kullanması) sunum için GEREKMİYOR. Sunum için yeterli olan:
preset'in banner+footer içeriğini taşıması (Bölüm 2-3). Kullanıcının kendi modülünü
kaydetmesi ("Modüllerim") → sunum sonrası, gerçek B2. Yani sunum kapsamı, baştaki
"modül-önce" sıralamasından daha DAR: preset içeriği taşısın yeter, ayrı modül
kütüphanesi şart değil.

---

## KARAR GÜNCELLEMESİ (kullanıcı, 14.06.2026) — Modül kütüphanesi TAM kurulacak

Önceki "sunum için modül kütüphanesi gerekmiyor, preset-içeriği yeter" daralması
GERİ ALINDI. Kullanıcının kararı: bu bölüm geçici çözümle değil, **tam** kurulacak.

**Gerekçe (aciliyet değil, vizyon):** Slotlara yerleştirilebilir modüller, ürünün
gerçek tasarım esnekliğini gösteriyor — "neden ben"in kalbi. Yatırımcıya bu mantığı
(modülü istediğin slota koy, sınırsız tasarım) göstermek, geçici banner doldurmaktan
çok daha güçlü. Bu sefer "tam yap" doğru: gösterilecek olan şey bu esneklik.

**Önceliklendirme (kullanıcı):**
- **Slota yerleştirilebilir modüller = YÜKSEK öncelik.** Asıl değer burada. Tasarım
  esnekliğinin kanıtı. Modül kütüphanesi (oluştur/kaydet/yeniden kullan) tam kurulacak.
- **Footer = DÜŞÜK öncelik.** Önemli değil, hafif geçilecek.

**Bu kararın sıralama etkisi:**
1. **ÖNCE: stüdyodaki mevcut hatalar giderilecek** (kullanıcı birkaç hata gördü).
   Bozuk zemin üstüne modül sistemi kurulmaz. (Hatalar kullanıcıdan gelecek.)
2. **SONRA: modül kütüphanesi keşfi** — mevcut banner/moduleData/ModuleRegistry
   yapısının "kütüphane"ye nasıl genişleyeceği. Açık sorular: modül nerede saklanır,
   nasıl ID alır, kütüphane UI'ı nasıl, slota nasıl sürüklenir, kullanıcı modülü mü
   sistem modülü mü ayrımı. Bunlar keşfedilmeden mimari yazılmayacak (tahmin değil).
3. **SONRA: mimari tasarım** keşfe dayalı eklenecek.

Yani modül kütüphanesi artık "sunum sonrası ertelenen" değil, **şimdi yapılacak ana
iş.** Footer ise hafif kalacak. Belge, hatalar + keşif geldikçe modül-kütüphanesi
teknik tasarımıyla güncellenecek.
