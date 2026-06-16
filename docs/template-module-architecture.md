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

---

## MODÜL SİSTEMİ — kesinleşen kapsam (15.06.2026, keşif + kullanıcı kararları sonrası)

Grid refactor bitti (commit'li). Cline keşfi modül sisteminin mevcut durumunu çıkardı:
çalışan bir çekirdek var ama etrafında yarım bırakılmış dağınık parçalar (tutarsız).
Aşağıdaki kapsam, kavramsal karmaşayı çözüp sunum için minimal/tutarlı bir kütüphane kurar.

### Keşfin ortaya koyduğu karmaşa
"Modül" kelimesi 3 farklı şeyi kastediyordu, karışmış:
1. **Modül TİPİ/factory** (`ModuleRegistry.banner/pizza`) — "ne tür, boş zemini ne" (yetenek)
2. **Proje-içi instance** (slottaki `moduleData`) — "bu slotta duran banner" (örnek)
3. **Yarım kütüphane altyapısı** — localStorage helper + DB tablosu + drop alıcısı + boş "Modüllerim" UI, hiçbiri bağlı değil ("ileride lazım" diye kurulmuş, yarım kalmış)

### Yaklaşım: "tutarlı yeniden kurma" (sil-baştan değil, revizyon değil)
Grid'deki desenin aynısı: çalışan çekirdeği KORU, dağınık yarım parçaları TEMİZLE/görmezden gel,
üstüne TUTARLI kütüphane katmanı kur.
- **Koru:** `role:'free' + moduleType + moduleData`, render branch'leri, banner editor, drag-drop alıcısı (çalışıyor).
- **Görmezden gel (sunum sonrası):** localStorage `userModules.ts`, DB `user_modules` tablosu, `newUserModuleData` drop alıcısı, boş "Modüllerim" UI. DOKUNMA, "tamamlamaya" çalışma.

### Belkemiği kavram: TİP ≠ ÖRNEK
- **`ModuleRegistry`** = TİPLER (banner, ürün-sunuş). "Boş zemin", yetenek tanımı. AYRI kalır.
- **Kütüphane** (`studioModules.ts`) = ÖRNEKLER. Rengi/logosu/yazısı dolu hazır tasarımlar.
- Bir kütüphane örneği: `{ id, name, type, moduleData (dolu içerik), source }` — tipe referans + dolu data.
- KRİTİK: `ModuleRegistry`'yi doğrudan kütüphaneye büyütme → tip ile örnek karışır (keşif madde 10 uyarısı).
- Kullanıcı kütüphaneden örneği slota sürükler → dolu içerik KLONLANIR → kendi logosunu/yazısını değiştirir.

### İki slot-içi modül tipi (footer ayrı)
1. **Banner/tablo modülü:** `role:'free'` slotta, serbest içerik (Excel-gibi hücreli). Zaten var.
2. **Ürün-sunuş modülü:** `role:'product'` slotta — VERİ BAĞLANTISI KORUNUR. "Var olan slot yapısının
   tasarlanmış hali" (çoklu resim/fiyat, açıklama vb). YENİ KATMAN YOK — mevcut özel-ayarlı-slot
   (`isCustom`/`customSettings`) + ürün-veri mekanizmasını kullanır. Tip tanımı "hangi slot rolünde
   yaşar" bilgisini taşımalı (banner→free, ürün-sunuş→product).
3. **Footer:** AYRI yapı (sayfa-tabanlı, `globalSettings.footer`/`page.customFooter`). Kütüphane DIŞI,
   düşük öncelik, dokunulmuyor.

### Kapsam kararları (kullanıcı onayı 15.06.2026)
- **Sistem modülleri: kod-içi** (`studioModules.ts`, presetler gibi, dev export aracıyla). Admin paneli
  SONRA (ileri vade, ters değil — aynı veri, kaynak değişir).
- **Kullanıcı modülü kaydetme: KAPSAM DIŞI** (sunum sonrası). Dolayısıyla **DB + API + localStorage
  ŞİMDİ YOK.** (B+C tutarlılığı: kullanıcı kaydetmeyecekse saklama altyapısı gereksiz. DB/API gerçek
  kullanıcı-modülü epic'inde, o zaman DB ile — localStorage değil.)
- **Hedef:** kütüphanede hazır dolu tasarımlar — en az 3 banner + 3 özel alan/liste + 3 ürün-sunuş.
  Kullanıcı slota sürükler → dolu gelir → sadece kendi logosunu/yazısını değiştirir.
- **Yeni modül tipi (serbest resim+yazı "mini Canva") şimdilik gerek yok** — ileride kolayca eklenir.

### Sıralı plan (önerilen — Opus tasarım/plan yapacak, sonra aşamalı uygula)
1. **Kütüphane veri modeli:** `StudioModule` contract (`{id, name, type, moduleData, source:'system'}`),
   `studioModules.ts` (kod-içi sistem modülleri), `listStudioModules()`. Tip ≠ örnek ayrımı netleşir.
2. **"Modüller" UI (sağ panel):** kütüphaneyi listele (sistem modülleri), kart → slota sürükle.
   Mevcut drag-drop alıcısını kullan; örnek slota düşünce dolu `moduleData` klonlanır.
3. **Ürün-sunuş modülü tipi:** `role:'product'` + veri-bağlı + özel sunuş. Mevcut özel-slot mekanizması üstüne.
4. **Dev export aracı:** mevcut slottaki modülü `studioModules.ts` formatında dışa aktar ("Modül Kopyala"
   benzeri, preset export gibi).
5. **Hazır tasarımları üret:** dev araçla 3+3+3 dolu modül tasarla, `studioModules.ts`'e koy.
6. **(Tema entegrasyonu — ayrı/sonra):** tema preset'i hangi slota hangi modül ID'si referansı taşısın
   (geniş preset). Bu, modül kütüphanesi kurulduktan SONRA.

---

## MODÜL KÜTÜPHANESİ — KARARLAR (15.06.2026, kullanıcıyla netleşti)

Grid refactor bitti (commit'li). Şimdi modül kütüphanesi. Keşif (Cline) mevcut
durumu çıkardı: çalışan bir çekirdek (`role:'free'+moduleType+moduleData`, render
branch'leri, banner editor, drag-drop alıcısı) VAR; ama etrafında YARIM bırakılmış
dağınık parçalar var (localStorage helper bağlı değil, DB tablosu API'siz, drop
alıcısı göndereni yok, "Modüllerim" UI boş, `free-design` hayaleti). Bunlar "ileride
lazım olur" diye atılmış temelsiz iskeleler — tutarlı tasarımdan gelmiyor.

### Yaklaşım: "tutarlı yeniden kurma" (sil-baştan DEĞİL, revizyon DEĞİL)
Grid'deki desenin aynısı: çalışan çekirdeği KORU, dağınık yarım parçaları
TEMİZLE/görmezden gel, üstüne TUTARLI kütüphane katmanı kur. Çekirdek sağlam
(atma); dağınığın üstüne yama yapma (tutarlı mimariyle bağla).

### Belkemiği kavram: TİP ≠ ÖRNEK (en kritik ayrım)
Keşfin yakaladığı tehlike: `ModuleRegistry`'yi doğrudan "kütüphane"ye büyütmek
kavramları karıştırır. İkisi AYRI kalır:
- **Modül TİPİ** (`ModuleRegistry`: banner, ürün-sunuş) = "boş zemin" / yetenek
  tanımı. "Banner ne yapabilir, varsayılan boş datası ne." Mevcut yapı.
- **Modül ÖRNEĞİ/PRESET'i** (kütüphane = `studioModules.ts`) = "hazır dolu tasarım"
  (renk/logo/yazı/çerçeve dolu). Kütüphanede TİP değil ÖRNEK durur ("Kırmızı
  Kampanya Banner'ı", boş "banner" değil).
- Bir örnek = `{ id, name, type, moduleData(dolu), source }`; tipe referans verir +
  dolu içerik taşır. Kullanıcı örneği slota koyunca dolu hali klonlanır, sadece
  kendi logosunu/yazısını değiştirir.

### İki slot-içi modül tipi (footer AYRI)
- **Banner/tablo modülü** (#2): `role:'free'` slotta yaşar, ürün verisi YOK, serbest
  hücreli tasarım. Mevcut `moduleData.type='banner'`.
- **Ürün-sunuş modülü** (#1): `role:'product'` KALIR, ürün verisi BAĞLI kalır
  (resim/ad/fiyat kopmaz), ama sunuş yapısı özelleşir (çoklu resim/fiyat, açıklama).
  YENİ KATMAN DEĞİL: mevcut "özel ayarlı slot" (`isCustom`+`customSettings`)
  mekanizması + ürün verisi üstüne "farklı sunuş şablonu." Kullanıcı kararı: yeni
  ayar sistematiği/katman İSTEMİYOR — en basit/kestirme yol. Genel ayar tema ile
  gelir; özel slot = "var olan slot yapısının tasarlanmış hali."
- Modül tipi tanımına "hangi slot rolünde yaşar" (`free` vs `product`) bilgisi girer.
- **Footer**: sayfa-tabanlı, slot değil, kütüphane DIŞI. Ortak contract'a zorlanmaz
  (banner'a benzetmek ters yama olur — grid'deki ilkeyle aynı). Düşük öncelik.

### Kapsam — SADECE kod-içi sistem modülleri (sunum için)
- **Sistem modülleri:** Kod-içi `studioModules.ts` (presetler gibi), dev export
  aracıyla. Sen tasarlarsın → kod çıkarırsın → dosyaya koyarsın. Admin'e ileride
  geçişe ters değil (aynı veri yapısı, kaynak kod→DB değişir).
- **KAPSAM DIŞI (sunum sonrası):** Kullanıcı modülü kaydetme, DB, API, localStorage.
  Kullanıcı kaydetmeyeceğine göre saklama altyapısı (DB/API) GEREKMEZ. "İleride
  lazım" diye şimdi kurmak = bu dağınıklığı yaratan zihniyet; aynı tuzağa düşme.
  Gerçek kullanıcı-kaydetme epic'inde DB ile (localStorage değil) tutarlı kurulur.
- **Dağınık yarım parçalara DOKUNMA:** localStorage helper (`userModules.ts`),
  mevcut `user_modules` DB tablosu, `Slot.tsx` `newUserModuleData` drop alıcısı,
  boş "Modüllerim" UI. Şimdilik görmezden gel; sunum sonrası tutarlı bağlanır.

### Sunum hedefi (somut)
Kütüphanede hazır, dolu tasarımlar: ~3 banner + ~3 özel alan (liste vb.) + ~3
ürün-sunuş tasarımı + ~3 tam tema. "Tema seç + modül yerleştir → 2 tıkta dolu
broşür" şovu. Yeni modül tipi tasarımına şimdilik gerek yok (banner + ürün-sunuş
yeter); ileride kolay eklenir.

### Sıradaki adım: mimari tasarım (Opus, keşif sonrası)
Bu kararlarla Opus'a tasarım/plan yaptır: TİP≠ÖRNEK contract'ı (`StudioModule`
shared tipi, `source:'system'`, tipe referans), `studioModules.ts` + listeleme,
kütüphane UI (sağ panel "Hazır Modüller" — gerçek sistem modüllerini göstersin),
slota klonlama (örnek → slot instance, dolu data kopyalanır), dev export aracı.
Aşamalı + her aşama test (grid disiplini). Act'e geçmeden plan onayı.

---

## MODÜL KÜTÜPHANESİ — ONAYLI PLAN + UYGULAMA DURUMU (15.06.2026)

Opus tasarımı + kullanıcı review'ı (2 tur) sonrası onaylandı. Tam plan:
`~/.claude/plans/salt-okuma-tasar-m-act-e-piped-avalanche.md`.

### Contract — `StudioModule` (discriminated union)
**Konum:** `apps/web/src/features/studio/modules/types.ts` (shared DEĞİL — `moduleData`
web-only `BannerModuleData|PizzaModuleData`'ya bağlandığı için; shared'a koymak ya
`unknown`'a düşürür ya da çekirdek tiplerini taşımayı gerektirir). Payload
`slotRole`'a göre **tip seviyesinde** ayrışır:
- `FreeStudioModule`: `slotRole:'free'`, `type:NonNullable<ModuleType>`,
  `moduleData:AnyModuleData` (ZORUNLU), `customSettings?:never`.
- `ProductStudioModule`: `slotRole:'product'`, `type:'product-presentation'`,
  `customSettings:DeepPartial<CatalogSettings>` (ZORUNLU), `moduleData?:never`.
- Ortak: `StudioModuleBase` (`id,name,description?,thumbnail?,source:'system'`).
- `ModuleType` (`'banner'|'pizza'|null`) KİRLENMEZ; `product-presentation` yalnız
  union'da. Ürün-sunuş YENİ KATMAN değil — mevcut `isCustom`/`customSettings` üstüne.

### Davranış kararları (review)
- **Dolu slota drop:** free kolu içeriği KOŞULSUZ ezer — bilinçli karar, onay yok
  (sunum akışı), undo tek adımda kurtarır.
- **Runtime guard:** product'ta `!customSettings` / free'de `!moduleData` → erken
  return (`saveState`'ten ÖNCE). Union ile çift güvence.
- **Drop branch:** `studioModuleId` `handleDrop`'un EN BAŞINDA, koşulsuz `return`
  (diğer key'ler/role-check öncesi). Tek undo: `applyStudioModule` inline mutasyon
  (`toggleSlotRole`/`setSlotModule` çağırmaz — ikisi de saveState'li).

### Aşamalar
- **Aşama 1 ✅** — `StudioModule` union (`modules/types.ts`) + `studioModules.ts`
  (`listStudioModules()` + 1 product tohum) + barrel export. Bağlanmadı.
  typecheck + lint temiz.
- **Aşama 2 ✅ kod** — `applyStudioModule` action (iki kol + guard saveState'ten
  ÖNCE, tek saveState, inline mutasyon) + `Slot.tsx` `studioModuleId` drop branch
  (handleDrop EN BAŞINDA, koşulsuz return). `listStudioModules` store'a DOĞRUDAN
  dosyadan import (barrel değil — modules/index→BannerSection→store döngüsünü kırar).
  typecheck temiz, eklenen kod lint temiz. **Canlı tek-undo testi:** kullanıcıyla
  ekranda doğrulanacak (konsoldan id ver → dolu insin → Ctrl+Z TEK adım).
- **Aşama 3 ✅ kod** — `Sidebar.tsx` `ModulesPanel`: "Hazır Modüller" → "Boş
  Modüller" relabel (ModuleCard/newModuleType davranışı değişmedi); YENİ "Hazır
  Tasarımlar" bölümü `listStudioModules()` ile beslenir, `LibraryModuleCard`
  → `setData('studioModuleId', m.id)`. `studioModules.ts`'e 1 banner tohum
  (`module-banner-marka`, FreeStudioModule, 1×2 dolu). "Modüllerim"/`free-design`/
  `footer-area` hayaletlerine dokunulmadı. typecheck + lint temiz. **Canlı test:**
  banner kartı sürükle → dolu banner; "Boş Modüller" hâlâ boş ekliyor; tek Ctrl+Z.
- **Aşama 4 ✅ kod** — Ürün-sunuş kolu (minimal placeholder ile doğrulandı): product
  slota sürükle → sarı zemin, ürün resmi/ad/fiyat BAĞLI kalır; role/product değişmez.
  **Bonus bug yakalandı + düzeltildi:** art arda iki ayrık işlem (clear + apply) tek
  undo adımına çöküyordu. Kök sebep — `history.store.ts` `saveState` 800ms zaman-
  cooldown'ı ikinci saveState'i düşürüyordu (force dalı dahil `lastSavedTime`'ı
  KOŞULSUZ güncelliyordu). Dar fix: (1) `lastSavedTime` yalnız force'suz dalda ilerler
  (forced ayrık işlemler coalesce penceresini kirletmez), (2) `applyStudioModule` →
  `saveState(true)`. 4 senaryo geçti: tek apply=1 undo, clear+apply=2 undo, kaydırma
  ötelenmiyor, slider coalesce korundu. Latent force'suz↔force'suz coalesce (hızlı
  ürün+ürün) bilinçli KAPSAM DIŞI (ayrı iş). Gerçek ürün-sunuş içeriği Aşama 5/6.
- **Aşama 5 ✅ kod** — Dev "Modül Kopyala": `exportModuleFromState()` AYRI dosyada
  (`modules/exportStudioModule.ts` — studioModules.ts store'a import edilemez, döngü;
  bu leaf dosya yalnız TopBar'dan çağrılır). Seçili slot rolüne göre `FreeStudioModule`
  (moduleData) / `ProductStudioModule` (customSettings, `stripTransientSettings`'li) /
  null+toast. Buton `TopBar.tsx` "Dosya" menüsünde "Preset Kopyala (dev)" deseniyle
  (DEV gate, JSON→clipboard+console, toast). typecheck + lint temiz. Canlı: Test A
  round-trip, Test B içerik-doğruluğu (alan-alan), Test C Marka Bandı yol doğrulaması.
  **Round-trip bug bulundu + düzeltildi:** export'lanan banner cell'leri 4 alanı
  (`imageMode/imagePosX/imagePosY/imageScale`) taşımıyordu çünkü `bannerInit` onları
  hiç üretmiyor; `BannerCellData` ise zorunlu istiyordu → tipli yapıştırmada ts2739.
  Kök: tip aşırı-katı (BannerSection zaten `?? 0/100`, `=== 'free'/'cover'` ile
  opsiyonel okuyor). Fix: 4 alan `types.ts`'te opsiyonel (`?`). Export değil tip
  yanlıştı; `bannerInit`/render/strip'e dokunulmadı.
  **Test C bug bulundu + düzeltildi (çift-undo):** banner varken tek Ctrl+Z iki işlemi
  geri alıyordu. Kök sebep `applyStudioModule`/saveState DEĞİL (onlar sağlam) —
  `BannerSection` kendi global `keydown→undo` listener'ı ekliyordu; app-level TopBar
  handler'ıyla çakışıp her Ctrl+Z'de `undo()` İKİ KEZ çalışıyordu (mount-bazlı, banner
  durduğu sürece). Fix: BannerSection'daki redundant listener kaldırıldı (TopBar
  Ctrl+Z'yi zaten karşılıyor). Hücre-düzenleme davranışı korundu; redo dalı zaten yoktu.
  **Senaryo 4 (Y1) — edit-modu Ctrl+Z (önceden var olan eksik, bizim regresyon DEĞİL):**
  banner hücresi metin düzenlerken Ctrl+Z tüm modülü siliyordu. Üç bağımsız eksiğin
  birleşimi: TopBar handler edit-context bilmiyordu (`preventDefault`+blind undo),
  banner metni saveState yazmıyor (geçmişe girmiyor), çift-undo zaten kapatılmıştı.
  Fix (Y1, tek dosya TopBar.tsx): keydown handler'a metin-alanı guard'ı —
  `document.activeElement` contentEditable/input/textarea ise erken çık (native
  text-undo'ya bırak, app-undo çağırma). Edit-dışı davranış değişmedi. Y2 (banner
  metnini saveState'e bağlamak) bilinçli ertelendi (updateSlotModuleData geniş kullanım).
- **Aşama 6** — Export aracıyla ~3 banner + ~3 özel + ~3 ürün-sunuş üret + regresyon.

### Bilinen sınır / ertelenmiş iş — eski modül-drop yolu temizliği

Aşama 4 canlı testinde çıktı. **Şimdi çözülmüyor; bilinçli ertelendi** (sunum sonrası,
KOD DEĞİŞİKLİĞİ YOK). İki bug da **ESKİ modül-drop yollarında** — bizim Aşama 1-4
`applyStudioModule` yolu (studioModuleId → "Hazır Tasarımlar") TEMİZ, etkilenmez.
Onlara Aşama 1-4'te dokunulmadı.

**Hangi yol "eski":** `newModuleType` drop — "Boş Modüller" panelindeki "Tablo Alanı"
kartı ([Slot.tsx](../apps/web/src/features/studio/canvas/Slot.tsx) `handleDrop`,
`toggleSlotRole('free')` + `setSlotModule`). Bizim yol (`studioModuleId` →
`applyStudioModule`) bu daldan ÖNCE, `saveState(true)` + hedef = drop `slot.id`.

**Bulgu 1 — undo birleşmesi (yalnız cooldown DEĞİL).**
- *Belirti:* `newModuleType` drop'u 800ms'den FAZLA bekledikten sonra da bir önceki
  işlemle tek Ctrl+Z'ye yapışabiliyor → salt cooldown teşhisi bu yol için EKSİK.
- *Kök sebep (kod incelemesi):* `newModuleType` dalı `saveState`'i tutarsız yazıyor.
  `toggleSlotRole` yalnız `selectedSlotIds` doluysa `saveState` çağırır
  (catalog.store.ts:1145-1146); `setSlotModule` `saveState`'i **rol-check'inden ÖNCE**
  çağırır ama drop hedefi `free` değilse erken döner (:1185) → ya boş/yanlış snapshot
  ya hiç snapshot. Cooldown bunun üstüne binince ayrı adım yazılmıyor.
- *Not (doğrulanacak):* Canlı testte "Marka Bandı" da listelendi; ama o
  `applyStudioModule` (saveState(true)) yolundan gider — beklenen: ETKİLENMEZ. Marka
  Bandı gerçekten birleşiyorsa AYRI bir sorun, ayrıca incelenmeli.

**Bulgu 2 — drop hedefi yanlış slot.**
- *Belirti:* Bir slot SEÇİLİYKEN "Tablo Alanı"nı BAŞKA slota bırakınca modül bırakılan
  yere değil yanlış yere gidiyor.
- *Kök sebep (kod incelemesi):* `toggleSlotRole` hedefi `useUIStore.selectedSlotIds`'ten
  alır (catalog.store.ts:1144,1149), drop'un `slot.id`'sinden DEĞİL → SEÇİLİ slot free'ye
  çevrilir. `setSlotModule(…, slot.id, …)` doğru hedefe gider ama o slot hâlâ `product`
  olduğundan erken döner (:1185) → modül hiç yerleşmez; görünür etki seçili slotta olur.
- *Beklenen:* Modül hangi slota bırakıldıysa O slota (drop `slot.id`). Bizim
  `applyStudioModule` zaten böyle (drop `slot.id`).

**Çözüm yönü (gelecek iş — "eski modül-drop yolu temizliği"):**
- Bulgu 1: ayrık işlemleri sistematik force'lamak (geniş (b) audit: ~10+ `saveState`
  çağrı yerini denetle, ayrıkları `saveState(true)`, sürekli slider/picker'ları
  force'suz bırak) + `setSlotModule`'ün saveState'ini rol-check'ten SONRAya almak.
- Bulgu 2: `newModuleType` drop yolunu hedefi `slot.id`'den alacak şekilde düzeltmek
  (seçimden bağımsız), `applyStudioModule` desenine hizalamak.
- **Risk/öncelik:** DÜŞÜK — sunum sonrası. Normal-hız kullanımda nadir; **veri kaybı
  yok**. (Bulgu 2 sunumda kafa karıştırıcı olabilir ama yalnız eski "Boş Modüller"
  yolunda; "Hazır Tasarımlar" şovu temiz.)
