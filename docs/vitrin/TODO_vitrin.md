# Vitrin Epic — Turmatsan kataloğu → satışa hazır vitrin

> Vitrin epic'inin detay planı ve ilerleme takibi. Turmatsan'dan çıkarılan tüm veriler
> `docs/vitrin/turmatsan/` altında (kategori başına 1 JSON). Ana TODO'daki işaretçi:
> `docs/TODO.md` → "🟠 Vitrin epic".

## ⚡ STRATEJİ PİVOTU (2026-07-25) — TEK NİŞ: çok ürünlü broşür

> Kullanıcı kararı: piyasada yüzlerce online matbaa var; tek fark slot motoru (Excel→broşür).
> Vitrin artık genel matbaa kataloğu DEĞİL, tek işe odaklı landing: "Excel'ini yükle,
> broşürün dizilsin." Başka baskı ürünü SATILMAZ (kartvizit vb. vitrinden kaldırıldı).
> Uzun vade: #1 niş baskı geliriyle kanıtla → #2 slot motorunu matbaalara lisansla.
> Etiket ürünü (#3) rafta — talep gelirse.

- [x] **Odaklı landing yayında (kod)** — `StorefrontPage.tsx` komple yeniden yazıldı:
  - Tasarım: "Broşür + hassasiyet" (kullanıcı onaylı) — kağıt #FCFCFA, mürekkep #17161B, aktüel kırmızı #E4262B, etiket sarısı #FFD23F fiyat çipleri, cyan #00AEC2 kılavuzlar; Oswald (display/fiyat) + Inter (gövde) + IBM Plex Mono (Excel/veri). Scoped: `landing.css` (.pdl), app token'larına dokunmaz.
  - İmza: `HeroScene.tsx` — urunler.xlsx → kesim işaretli sayfa; satırlar sırayla flaşlar, cyan kılavuz-slotlar ürüne dönüşür, sarı fiyat çipleri oturur, "TAŞMA 3 MM" etiketi; "yeniden izle"; reduced-motion'da bitmiş kare.
  - Bölümler: hero → "Sadece bunu yapıyoruz" mürekkep bandı → 3 adım → İş Föyü (spec) → fiyat (BrochureConfigurator) → kimin için → kesim-çizgisi ayracı → SSS → kırmızı pilot bandı ("ilk 5 market") → sade footer.
  - Dürüstlük: sahte marka logoları + sahte "2.140 işletme" sayacı SİLİNDİ; yerine gerçek pilot daveti.
  - PARK (silinmedi): `/urun/:slug` route'u kapalı (App.tsx'te yorumlu), ProductDetailPage/VariantPicker/VariantWizard + tüm katalog API'si duruyor. Geri açmak = 1 import + 1 route.
  - `index.html` başlık/description Presserdiado'ya çevrildi. IBM Plex Mono font import'u eklendi.
  - Doğrulandı: typecheck temiz; tarayıcıda desktop + 578px + 375px (header sığması ve başlık satır-arası mobil için düzeltildi; footer marka kontrast düzeltildi). Not: pane'in bayat-frame'i "boş slot" yanılgısı verdi, DOM ölçümüyle çürütüldü.
- [x] **Revizyon 1 (kullanıcı geri bildirimi):** (a) Hero sahnesi artık KESİM MATI üzerinde (koyu ızgara `.pdl-stage`) — "arayüz gibi/tıklanır gibi" hissi kalktı, "gösterilen iş" okunuyor; sahne başlığında "ÖRNEK BROŞÜR · 6 ÜRÜN" + "yeniden izle" (oynatıcı çerçevesi). (b) Kırmızı "YERLEŞTİR" buton-görünümü → sessiz gri küçük-harf anlatım altyazısı "hücrelere yerleşiyor…" (nokta animasyonlu; kırmızı yalnız gerçek CTA'larda). (c) Gri kutular yerine 6 ürüne özel mini SVG illüstrasyon (tek aile: mürekkep kontur + kırmızı etiket bandı). (d) **TERMİNOLOJİ: sitede "slot" DENMEZ → "hücre"** (stüdyoyla tutarlı); "slot motoru" → "yerleşim motoru". Mobilde fiyat çipi satır kırması düzeltildi (whitespace-nowrap).
- [x] Landing metin onayı (kullanıcı, 2026-07-25): pilot vaadi "ilk broşür tasarımı bizden" → **"kurulum + eğitim ücretsiz"** (eskisi "bedava baskı" gibi anlaşılıyordu). SSS cevapları (teslim "2 iş günü", ödeme "havale/EFT") ONAYLANDI — canlıya çıkışta zaten geçerli olacak vaatler.
- [ ] Google Fonts bağımlılığı: prod öncesi self-host değerlendir (KVKK + hız).

> NOT: Aşağıdaki Faz 2/2b/2c bölümleri bu pivottan ÖNCEKİ genel-katalog işleridir.
> Kod park halinde; lisanslama (#2) fazında veya niş genişlerse geri açılır.

## Amaç ve strateji kararı

Stüdyo yalnız broşürde hazır olsa da vitrin **tam katalogla** satışa açılır. Bunu mümkün kılan:
`order_items.itemType = 'studio_design' | 'uploaded_file'` zaten şemada var. Her ürün tipine bir
**satış modu** atanır; stüdyo yeni bir üründe hazır oldukça o ürünün butonu "Dosyanı Yükle"den
"Stüdyoda Tasarla"ya döner — vitrine yeniden dokunulmaz.

| Satış modu | Anlamı | Altyapı durumu |
|---|---|---|
| `design` | Stüdyoda tasarla → sipariş | Çalışıyor (yalnız broşür) |
| `upload` | Baskıya hazır PDF yükle → sipariş | Şema hazır, **UI yok** (ana TODO 🔵 "uploaded_file UI") |
| `quote` | Teklif al formu | Yok — basit form + admin bildirimi |

**Telif kuralı:** Turmatsan'dan yalnız *veri* alınır (kategori, seçenek, ebat, gramaj, fiyat
referansı). Görsel ve tanıtım metni KOPYALANMAZ. Fiyatlar maliyet referansıdır; satış fiyatı
kendi marjımızla `pricing_rules`'a admin'den girilir (ana TODO 🎯 "Fiyatlandırma admin" notuyla uyumlu:
rakam koda gömülmez).

---

## Faz 1 — Turmatsan katalog verisini çıkar (veri, görsel değil)

> Format: kategori başına 1 JSON → `turmatsan/<slug>.json` (şema aşağıda).
> Kaynak URL deseni: `https://www.turmatsan.com/tr/Page/<slug>/` (slug'lar çıkarma sırasında doğrulanır).
> Parantez içi sayılar sitedeki "N Farklı Seçenek" değeridir.

**Online Matbaa Ürünleri:**
- [x] Kartvizit (21) — `turmatsan/kartvizit.json` — TAM (21 varyant, toptan fiyat + gerçek ebat 82x52mm doğrulandı)
- [x] Broşür (36) — `turmatsan/brosur.json` — TAM (36 varyant, toptan fiyat + gerçek ebatlar; kırım fiyatı ayrı → ekstra-urunler)
- [x] El İlanı / Afiş (20) — `turmatsan/el-ilani-afis.json` — TAM (toptan fiyat + gerçek ebatlar doğrulandı)
- [x] Magnet (2+1) — `turmatsan/magnet.json` — TAM (ebat 46x68mm + MAG3 cm² birim fiyat + 10.000+ kademesi bulundu)
- [~] İnsert (8) — `turmatsan/insert.json` — üye panelinde de kod dışında veri YOK → `quote` moduna alındı, kesinleştirmek için temsilciyle görüşülecek
- [x] Sunum Dosyası (9→10) — `turmatsan/sunum-dosyasi.json` — TAM (gerçek ebat 22.5x31cm; FAND kaldırılmış, yerine AVD500/AVD1000 "Avukat Dosyası" bulundu)
- [x] Etiket (6) — `turmatsan/etiket.json` — TAM (ebatlar bulundu; ETM/ETL'nin büyük boy etiket olduğu netleşti)
- [x] Karton Çanta (6) — `turmatsan/karton-canta.json` — TAM (üye 'Çantalar' bölümünde CNT1-4+kraft tam tablo bulundu; `quote`→`upload` moduna yükseltildi)
- [x] Antetli Kağıt (6) — `turmatsan/antetli-kagit.json` — TAM
- [x] Zarf (3) — `turmatsan/zarf.json` — TAM (iki-kademeli taban+ilave fiyat yapısı + ek ücretler bulundu)
- [x] Bloknot (23+7) — `turmatsan/bloknot.json` — TAM (50'lik cilt = 50 yaprak; küp bloknot NKKB-250/500-adet kodlarıyla + kutu ek ücretleriyle netleşti)
- [x] Oto Paspas (3) — `turmatsan/oto-paspas.json` — TAM
- [x] Makbuz (8) — `turmatsan/makbuz.json` — TAM (ebatlar + "1 Asıl 1 Suret" karbonsuz kağıt yapısı + M3/M4 farkının ebat olduğu netleşti)
- [x] İmsakiye — `turmatsan/imsakiye.json` — üye panelinde de BOŞ → `quote` + sezonluk kesinleşti
- [x] Takvim — `turmatsan/takvim.json` — üye panelinin 15 kategorilik listesinde bile YOK → `quote` + sezonluk kesinleşti
- [x] Ekstra Ürünler (12) — `turmatsan/ekstra-urunler.json` — TAM, toptan fiyatlarla (bağımsız ürün DEĞİL: kırım/yapıştırma ek hizmetleri)

**Diğer Ürünler (teklif usulü — `quote` modu, üye panelinde de yok → kesinleşti):**
- [x] Katalog — `turmatsan/katalog.json`
- [x] Dergi — `turmatsan/dergi.json`
- [x] Kutu (14) — `turmatsan/kutu.json` — TAM (üye 'Ürün Kutuları' bölümünde KT1-14 tam tablo bulundu; `quote`→`upload` moduna yükseltildi)
- [x] Çanta Katalog — `turmatsan/canta-katalog.json` — ürün değil PDF model kataloğu; karton çanta akışına referans

**Üye panelinde keşfedilen YENİ kategoriler (kamuya açık menüde yoktu):**
- [x] Amerikan Servis (3) — `turmatsan/amerikan-servis.json` — servis/tepsi kağıdı, niş ürün; vitrine eklenip eklenmeyeceğine karar ver
- [x] Kapı Askı Broşürleri (3) — `turmatsan/kapi-aski-brosur.json`
- [x] Notluk (1) — `turmatsan/notluk.json`

**Faz 1 TAMAMLANDI** — 24 JSON dosyası, toptan (üye) fiyatlarıyla doğrulanmış ~150 varyant. Kalan tek gerçek boşluk: İnsert (bkz. not) ve `4BK170U` kodunun toptan fiyatı (sayfada boş görünüyor, siparişte teyit edilecek).

### Nasıl toplandı (özet)
Kullanıcı Chrome'da turmatsan üye hesabına giriş yaptı, "Claude in Chrome" bu oturum üzerinden
`hesap/index.php?goster=fiyat-listesi` (kırmızı "Fiyat Listesi" butonu) sayfasını okudu — bu tek
sayfa neredeyse tüm kategorilerin toptan fiyatını + gerçek ebatlarını içeriyordu. Eksik kalanlar
(İnsert, İmsakiye, Takvim, Ekstra Ürünler) için üye panelindeki "Ürünler" sekmeleri ayrı ayrı
kontrol edildi. **Not:** İnsert ürün kartına tıklayınca "Sepete At" butonu çıktı; yanlışlıkla
tıklandı ama fiyat/ebat modalı açmadı — sepete gerçekten eklenip eklenmediği belirsiz, ödeme
alanlarına dokunulmadı, sepet daha sonra boş görüldü. Kontrol etmek istersen `Sepetim` sekmesine
bakabilirsin.

### Önemli düzeltmeler (herkese açık veriden farklı çıkan gerçekler)
- **Broşürde "A7/A5/A4/A3" turmatsan'ın iç kodu — gerçek ISO ölçüsü DEĞİL.** Üstelik üç farklı
  ürün ailesi (Standart 115gr / Pro 128gr / Selefonlu-CBS 200gr) aynı etiketi kullanıp FARKLI
  gerçek cm ölçüsü taşıyor (`brosur.json` → `variantGroups`). Stüdyo/vitrin ebat seçiminde isme
  değil gerçek cm değerine göre eşleştirme yapılmalı.
- **Kartvizit gerçek ebadı 82x52mm** (85x55 standart varsayımı yanlıştı).
- **Afiş bitmiş ebadı 34x49 / 49x69 cm** (perakende sayfası 35x50/50x70 nominal ölçü veriyordu).
- **Zarf ve Amerikan Servis gibi bazı ürünlerde fiyat "taban + ilave adet birim fiyatı" şeklinde
  iki kademeli** — düz "adet × birim fiyat" değil; `pricing_rules`'a bu yapıyla girilmeli.

## Faz 2 — Seed + vitrin dinamikleştirme — ✅ TAMAMLANDI

- [x] **Paket-fiyat modeli** — `pricing_rules.quantity` kolonu eklendi (migration `0007`): NULL = birim-fiyat kuralı (brochure pilotu aynen), dolu = PAKET kuralı (yalnız o adette eşleşir, `basePrice` = paketin toplam satış fiyatı). `pricing.service` her iki modeli destekler; paket kuralı aynı komboda birim kuralından spesifiktir. Turmatsan'ın "hazır paket varyant" satış modeli birebir bu.
- [x] **Satış modu + açıklama** — `product_types.sale_mode` (design/upload/quote) ve `description` kolonları eklendi.
- [x] **JSON → seed** — `apps/api/src/db/seed-turmatsan.ts` (`npm run db:seed:turmatsan`): 20 ürün, 103 seçenek, 179 paket kuralı; idempotent; `brochure`'a dokunmaz. **Satış fiyatı** `docs/vitrin/pricing.config.json`'dan üretilir (retailFirst: turmatsan perakendesi varsa o; yoksa toptan × marj, yukarı yuvarlama) — rakam koda gömülü değil, marjı değiştir + seed'i tekrar çalıştır. Kalıcı çözüm yine admin "Fiyatlandırma" ekranı.
- [x] **Katalog API** — `GET /catalog/product-types` (vitrin grid'i) + `GET /catalog/product-types/:key/packages` (geçerli adet listeleri); options endpoint'i productType'a saleMode/description/configSchema ekler.
- [x] **Vitrin grid'i DB'den** — `StorefrontPage` statik `PRODUCTS` silindi; 21 ürün API'den (ana TODO 🟡 "Vitrin ürün grid'i" maddesi kapandı). Legacy `a3-roll-fold-6p` bootstrap satırı pasifleştirildi (silinemez: 10 proje + 4 sipariş kalemi FK bağlı).
- [x] **Ürün detay sayfası** — `/urun/:slug` (public): seçenekler + paket-adet dropdown'ı (`cilt` gibi birim etiketli) + canlı fiyat + satış moduna göre CTA (design→sihirbaz, upload→"Yakında", quote→teklif paneli). `PrintOptionsSelector`'a geriye-uyumlu `quantityChoices`/`quantityUnit`/`categoryLabels` prop'ları eklendi; stüdyo/sihirbaz akışları etkilenmedi (brochure quote regresyonu doğrulandı).
- Doğrulama: typecheck (api+web) temiz; curl ile ürün listesi/paketler/quote (kartvizit 350+KDV=420, el ilanı 4000 adet, geçersiz adet reddi, brochure kademe indirimi) + tarayıcıda vitrin grid'i, kartvizit/bloknot/katalog detay sayfaları canlı doğrulandı.

## Faz 2c — Sunum modeli kararı: veri şekli → UI (GÜNCEL YÖN)

> Kritik kavrayış (kullanıcı): Turmatsan **sabit paket** satıyor, bağımsız seçenek değil.
> "300gr Bristol" onlarda tek şekilde var; "çift yön / oval kesim / laklı" AYRI ürünler (kendi
> fiyatlarıyla). 21 sabit paketi 8 bağımsız eksenmiş gibi göstermek YAPAY karmaşıklık üretti
> (Bristol Sıvama seç → tek varyant → her şey otomatik dolar). Karar: **arayüzü verinin şekline
> uydur.** Bundle ürün → sade kart seçici; gerçek matris ürün (broşür) → sihirbaz.

- [x] **Kartvizit → sade kart seçici (`presentation: 'picker'`)** — 8 adımlı sihirbaz kaldırıldı.
  - Turmatsan segmentlerine (EKO/LAK/VİP/FAN) göre gruplu kart grid'i; her kart = 1 ürün: ad + özellik + KDV-dahil fiyat. Tıkla→seç, sağ "Ürününüz" panelinde fiyat.
  - Seed: `ui.presentation='picker'` + `metadata.group` (KARTVIZIT_GROUPS). facets/attrs artık kartvizite yazılmıyor.
  - API: `packages` endpoint'ine `basePrice`+`taxRate` eklendi (kart fiyat etiketi; bağlayıcı fiyat yine `/pricing/quote`).
  - Web: `VariantPicker.tsx`; `ProductDetailPage` `picker | klasik` (2 mod). Fiyat kart etiketi = quote ile birebir (₺420 doğrulandı).
  - **Sihirbaz altyapısı SAKLI, silinmedi:** `VariantWizard.tsx` + `variantFacets.ts` + `kartvizit.json`'daki `facets`/`attrs` duruyor — broşür gibi GERÇEK matris ürün için hazır (o zaman `presentation:'wizard'`).

### Sunum modu seçim kuralı (ürün başına)
- `picker` — varyantlar sabit paket, aralarında ortogonal eksen yok (kartvizit, sunum dosyası, magnet, etiket…). Sade kart grid.
- `wizard` — varyantlar gerçek matris (her eksen bağımsız, tüm kombinasyonlar mevcut): **broşür** (kağıt hattı × ebat × adet). Sıralı sekmeli sihirbaz.
- klasik `PrintOptionsSelector` — çok-kademeli/adet-bazlı basit upload'lar (şimdilik bloknot/makbuz/kutu burada).

### Açık: kartvizit kürasyonu (kullanıcı isteği "sınırlayarak")
- [ ] 21 kartın hepsi mi kalsın, yoksa daraltalım mı? Kullanıcı canlı grid üzerinden hangilerinin gizleneceğine karar verecek (gizleme = varyanta `active:false` bayrağı / seed filtresi; kolay).

## Faz 2b — Bağımlı özellik seçicileri (facet ayrıştırma) — [ARŞİV: picker'a geçildi]

> Sorun: turmatsan varyantları "hazır paket" (NK = 250gr Bristol + tek yön + parlak selefon).
> Tek "Kart Tipi" dropdown'u yerine kategori kategori (malzeme/gramaj/yüz/…) bağımlı seçiciler
> istendi ("İnce" ayrım kararı) — "Bristol seçilince 560g görünmesin".
> Çözüm: her varyantı özelliklere ayır (`attrs`), geçerli değerler gerçek varyant listesinden
> türetilir (co-occurrence). Fiyat/altyapı DEĞİŞMEZ — attrs yalnız sunum katmanı, fiyat yine
> paket kuralı (`paperTypeKey`=code, quantity). Çözüm tek varyanta indiğinde fiyat çıkar.

- [x] **Kartvizit pilotu (İnce, 8 eksen) — sıralı sekmeli sihirbaz (FlyerAlarm deseni)** — malzeme/gramaj/yüz/selefon/lak/yaldız/kesim/arka.
  - Veri: `turmatsan/kartvizit.json` → `facets[]` (adım SIRASI) + her 21 varyantta `attrs` (tuple benzersiz: NK/NKA arka ile, A-SEK/AC-SEK yaldız yönü ile ayrışır).
  - Seed: `configSchema.ui.facets` + `print_options.metadata.attrs` (generic yol; diğer ürünler de JSON'a `facets`+`attrs` ekleyince otomatik alır).
  - **UX kararı (kullanıcı):** üstte numaralı sekmeler, karta tıkla→sonraki adıma geç, geri dönüp değiştir→sonrakiler sıfırlanır. **SIRALI (prefix) bağımlılık:** adım i yalnız ÖNCEKİ adımlarla kısıtlanır — simetrik DEĞİL. Böylece "gramaj seçince malzeme daralması" sorunu (kullanıcı şikayeti) çözüldü.
  - Web: `variantFacets.ts` (reachableForStep/setStepSelection/firstUnsetStep — prefix motoru), `VariantWizard.tsx` (sekme+kart+otomatik ilerleme), `ProductDetailPage` sağ "Ürününüz" özet+fiyat paneli. Eski simetrik `VariantFacetSelector.tsx` + `applyFacetChange` SİLİNDİ.
  - Doğrulandı (tarayıcı): Bristol→gramajda 560 gizli ✓; **gramaj seçince malzeme SIFIRLANMADI** ✓; Malzeme'yi Kuşe'ye değiştirince gramaj+sonrası sıfırlanıp yeniden filtrelendi (350/400) ✓; Kuşe 400→CYML4 otomatik çözülüp Toplam ₺720 ✓.
- [x] **Broşür → gerçek matris + turmatsan-kalibreli fiyat — TAMAMLANDI (2026-07-25)**
  - Model: kartvizit gibi "hazır paket" DEĞİL — gerçek bağımsız eksen matrisi (kullanıcı kararı: "bağımsız matris"). Turmatsan'ın broşürde sunmadığı kombinasyonlar (200gr kaplamasız, mat selefon, tek yön, çoğu ebat) kullanıcı isteğiyle ("matbaada ne olması gerekiyorsa öyle düzenle") formül-tabanlı türetildi, 3 gerçek turmatsan referans noktasına (115gr=1,50 / 128gr=2,00 / 200gr+parlak=2,90 TL, A4/1000adet) kalibre edildi.
  - Eksenler: **Ebat** A3/A4/A5/A6/A7 (Presserdiado'nun kendi seti + A7 — gerçek ISO 74×105mm, turmatsan'ın "A7" iç kodundan FARKLI) · **Kırım** 7 tip (değişmedi) · **Kağıt** tek değer "Kuşe" · **Gramaj** 115/128/200 (turmatsan) · **Renk** Renkli Tek Yön / Renkli Çift Yön (turmatsan'da siyah-beyaz broşür yok) · **Kaplama** Yok/Mat/Parlak Selefon (turmatsan) · **Cilt** kaldırıldı (kategori boş — PrintOptionsSelector boş kategoriyi hiç render etmiyor).
  - **Yeni çapraz-eksen bağımlılığı (genel mekanizma):** `print_options.metadata` içine `{requires:{kategori:değer}}` / `{excludes:{...}}` yazılabiliyor; `PrintOptionsSelector` bu metadata'ya göre listeyi daraltıyor + geçersiz kalan seçimi otomatik ilk geçerliye düşürüyor (useEffect). Broşürde kullanım: Kırım=Yok→Renk yalnız Tek Yön; Kırım≠Yok→Renk yalnız Çift Yön.
  - **Kritik güvenlik düzeltmesi:** aynı requires/excludes metadata'sı `pricing.service.ts`'e de eklendi (`assertOptionDependencies`) — UI-only filtre yeterli değildi, doğrudan API isteğiyle geçersiz kombinasyon (ör. Kırım=Yok+Çift Yön) fiyat alabiliyordu. Artık backend de reddediyor (tek gerçek kaynak ilkesiyle tutarlı).
  - Fiyat formülü (`apps/api/src/db/seed.ts`): `A4_BASE_BY_WEIGHT × COATING_MULT × sizeMultiplier(alan oranı, küçük ebatta taban-maliyet primi) × SIDES_MULT(tek yön -%20) × 1,10(500-adet taban primi)`; `QUANTITY_TIERS` turmatsan Standart hattının gerçek indirim eğrisinden (%0/%9/%21/%39/%41 @ 500/1000/2000/5000/10000). 90 kural formülden üretiliyor (5×3×3×2), el yazımı değil.
  - Adet: sabit liste 500/1000/2000/5000/10000 (`BROCHURE_QUANTITY_CHOICES`), turmatsan'ın düzensiz kademeleri yerine.
  - Stüdyo/sihirbaz etkisi: `wizard.config.json` + `NewStudioWizard.tsx` PaperIcon map'ine A7 eklendi (mevcut A3-A6 ikon deseni aritmetik olarak devam ettirildi). Diğer her şey `useCatalogOptions`/config üzerinden dinamik geldiği için stüdyo tarafında ek değişiklik gerekmedi.
  - Doğrulandı: seed (21 seçenek, 90 kural) + typecheck (api+web) + API (A4/200gr/parlak/1000adet ≈ turmatsan'ın 2,90 TL referansına ~%0,4 fark; geçersiz kombinasyon 400/ValidationError) + tarayıcı (Kırım↔Renk canlı geçiş, adet/ebat dropdown içerikleri, Cilt satırının hiç görünmediği).
  - **DÜZELTME (aynı gün) — kâr marjı unutulmuştu:** İlk sürümde `A4_BASE_BY_WEIGHT` turmatsan'ın TOPTAN (maliyet) fiyatı doğrudan satış fiyatı olarak kullanılmıştı (marj YOK — kullanıcı fark etti). `docs/vitrin/pricing.config.json`'a `brochureMarginMultiplier: 1.7` eklendi (kullanıcı kararı: %70 — diğer ürünlerden (`marginDefault`=1.4/%40) yüksek çünkü broşür fiyatı tasarım stüdyosunu da içeriyor, salt baskı değil). `seed.ts` artık bu config'i okuyup maliyetin üzerine açıkça uyguluyor (`A4_BASE_BY_WEIGHT_COST` olarak yeniden adlandırıldı, "maliyet" olduğu koda da yazıldı). Doğrulandı: A4/200gr/parlak/1000adet artık ~4,96 TL/adet (maliyet 2,91×1,7≈4,95 ile tutarlı) + tarayıcıda canlı fiyat teyidi.
- [ ] **Kalan upload ürünlerine facet** — her ürünün JSON'una `facets`+`attrs` ekle (bloknot: cilt-türü/ebat/kapak; makbuz: renk/ebat/cilt; kutu: ölçü; vb.). Altyapı hazır, ürün başına veri işi.

## Faz 3 — Ürün başına satış modu

- [ ] `product_types`'a satış modu alanı (`design | upload | quote`) — metadata/config içinde de olabilir, karar Faz 2'de.
- [ ] `upload` akışı UI: dosya yükle → baskı seçenekleri → sipariş (ana TODO 🔵 "uploaded_file UI" maddesini kapatır).
- [ ] `quote` akışı: basit form (ürün + ölçü + adet + iletişim) → admin'e düşer.
- [ ] Vitrin kartlarında mod rozetleri ("Tasarla" / "Dosyanı Yükle" / "Teklif Al"), "yakında" rozeti gerçek duruma bağlanır.

## Faz 4 — Ürün görselleri

- [ ] Turmatsan görselleri kullanılmaz. Seçenekler: (a) tema-önizleme JPG hattına benzer kendi mockup üretimi, (b) tek tip placeholder seti ile yayına gir, gerçek çekimler sonra.
- [ ] Kategori ikonları: `docs/ikon-set/products/` mevcut seti genişletilebilir (şu an 4 ikon var).

---

## Veri şeması (`turmatsan/<slug>.json`)

```json
{
  "category": "kartvizit",
  "categoryLabel": "Kartvizit",
  "sourceUrl": "https://www.turmatsan.com/tr/Page/kartvizit/",
  "fetchedAt": "2026-07-24",
  "status": "complete | partial",
  "suggestedSaleMode": "design | upload | quote",
  "pricingAxes": ["ebat", "kağıt/gramaj", "işlem (selefon/lak/yaldız)", "adet kademesi"],
  "notes": "serbest notlar (ör. tüm fiyatlar 1000 adet içindir)",
  "variants": [
    {
      "code": "NK",
      "name": "Tek Yön Renkli",
      "size": null,
      "material": "250 gr Bristol",
      "processes": ["Parlak Selefon"],
      "sides": "tek | çift",
      "quantity": 1000,
      "wholesaleTRY": 210.0,
      "retailRefTRY": 350.0
    }
  ]
}
```

- `wholesaleTRY` = turmatsan ÜYE/toptan fiyatı — **gerçek maliyet referansımız**, marj kararının tabanı.
- `retailRefTRY` = eski perakende fiyatı — yalnız karşılaştırma amaçlı, maliyet olarak KULLANILMAZ.
- `costRefTRY` (eski alan adı) yalnız hâlâ üye verisiyle doğrulanmamış birkaç dosyada (insert, kısmi
  quote-usulü dosyalar) kalıntı olarak durabilir — o dosyalarda `null` veya perakende referansıdır.
- Alan uymadığında `null` bırak + `notes`'a yaz; şemayı şişirme.
- Bazı kategorilerde fiyat düz "adet × birim" değil, **taban fiyat + ilave-adet birim fiyatı**
  şeklinde iki kademeli (zarf, amerikan servis, karton çanta) — bunlar `wholesalePerExtraNTRY`
  gibi ek alanlarla modellendi, dosya bazında değişebilir.

## Bağlantılı ana-TODO maddeleri

- 🎯 "Fiyatlandırma admin" — fiyat *yapısını* öğrenme notu → Faz 1 bunu veriyle karşılar.
- 🟡 "Katalog seed-driven → admin-driven" epic'i — Faz 2 seed üretimi bu epic'in seed tarafını doldurur; admin CRUD ekranları o epic'te kalır.
- 🔵 "Hazır dosya yükleyerek sipariş (uploaded_file UI)" → Faz 3'te kapanır.
- 🔵 "Tedarikçi/matbaa yönetimi" — ilk tedarikçi Türmatsan; bu epic'in verisi ileride vendor modeline taban olur.
