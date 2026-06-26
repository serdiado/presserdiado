# Sağ Tık Menüsü — Mimari Belge

> Durum: UYGULANDI · 8 dal canlı (veri-driven registry göçü tamam).
> Kapsam: Stüdyo kanvasındaki tüm sağ tık (context menu) davranışları.
> İlgili kod: `apps/web/src/features/studio/contextMenu/` (registry — `menuRegistry.ts` =
> `MENU_ACTIONS`+`buildMenu`, `menuContext.ts` = `resolveMenuContext`, `ContextMenu.tsx` = renderer),
> `apps/web/src/features/studio/canvas/Page.tsx` (menüyü mount eder + bağlamı çözer),
> `apps/web/src/features/studio/contextual/ContextualBar.tsx` (hızlı bar — dil ortaklığı, ortak resolver),
> `apps/web/src/stores/studio/catalog.store.ts` (action'lar).

---

## 1. Temel Model — İki Katman

Menü iki mantıksal katmandan oluşur:

- **KALICI katman:** Seçim ne olursa olsun anlamlı olan, her bağlamda aynı yerde
  duran aksiyonlar. Pratikte yalnızca **Stil Kopyala / Yapıştır**. Desteklemeyen
  bağlamda **gizlenir** (uygulamada `visible:false`; pasif/disabled-render mekanizması — `MenuAction.enabled`
  + renderer'ın `disabled:opacity-40`'ı — mevcut ama ŞU AN kullanılmıyor).
- **BAĞLAMSAL katman:** Seçili öğenin tipine göre belirir / kaybolur. Sekiz dal.

Karar: KALICI katmana Geri Al / İleri Al **konmaz** — üst barda mevcut, tekrar
gereksiz. Çoğalt **konmaz** — slotlu grid mimarisine uymaz (serbest kanvas metaforu).

---

## 2. Sıralama Formülü (TASARIM İLKESİ — tüm dallara uygulanır)

Sektör standardı (Figma, Canva, Office, Adobe) sağ tık sıralaması: **alaka + sıklık
+ tehlike** üçlüsü. Yukarıdan aşağıya akış:

```
┌─ GRUP 1: Oluştur / Ekle      → en sık, pozitif, ileri yönlü (Modül Ekle, Ürün Ekle)
├─ GRUP 2: Düzenle / Dönüştür  → mevcut içeriği değiştirir, yok etmez (Birleştir, Ayır, Değiştir, Özel/Genel)
├─────────── divider ───────────
├─ GRUP 3: Stil / Pano         → yardımcı, her bağlamda aynı konumda (Stil Kopyala/Yapıştır)
├─────────── divider ───────────
└─ GRUP 4: Yıkıcı              → geri-dönüşü-zor, EN ALTTA, parmağın doğal düştüğü yerden uzak
```

Kurallar:
- **Tutarlılık > optimizasyon.** Aynı aksiyon her dalda aynı görece konumda. Kullanıcı
  bir kez öğrenince her bağlamda aynı yerde bulur.
- **3–4 grup, divider ile ayrık.** Çok divider parçalar, az divider yığar.
- **Yıkıcı her zaman en altta** — refleks tıkla yanlışlıkla silme riskini azaltır.

---

## 3. Renk Kuralı

> Kırmızı **yalnızca gerçekten geri-dönüşü-zor** eylemlerde kullanılır.
> Havuz veya undo (Ctrl+Z) güvencesi olan hiçbir eylem kırmızı değildir.

- **Kırmızı:** ŞU AN **hiç kırmızı kalem YOK.** ("Varsayılana Sıfırla" dahil her kalemin
  Ctrl+Z/havuz güvencesi var → kuralın kendisi gereği nötr.)
- **Nötr (kırmızı DEĞİL):** Hücreyi Boşalt (havuza gider), Modülü Kaldır (ürün hücresine
  döner), Sil (Ctrl+Z var), **Varsayılana Sıfırla** (`resetFooterToDefault` Ctrl+Z ile geri
  alınır). Hepsinin geri dönüşü olduğu için kırmızı enflasyonu yapılmaz.

(Renk Sistemi dokümanı ile uyumlu: kırmızı = yıkıcı aksiyon + hata; vurgu/dekorasyon değil.)

---

## 4. İsimlendirme İlkesi

Etiketler kısa + acemi-anlaşılır. Soyut kavram (özel/genel ayar) kısa etiket +
hızlı bar tooltip ile çözülür; her şey etikete sıkıştırılmaz. Hızlı bar ile sağ tık
**aynı kelime ailesini** paylaşır (birebir aynı string şart değil — toggle vs tek-satır
farkı nedeniyle zaten mümkün değil).

**Stil kopyala/yapıştır yüzey-spesifiktir.** Etiket genel "Stil Kopyala" değil, hangi yüzey
olduğunu söyler: **Zemin Stili / Hücre Stili / Alt Bilgi Stili**. Gerekçe: her yüzeyin ayrı
panosu var; genel "Stil Yapıştır" neyin yapışacağını söylemez (zemin stili sanıp hücre stili
yapıştırma riski). Kural: bir yüzeyin "Yapıştır"ı YALNIZ o yüzeyin menüsünde ve YALNIZ o
yüzeyden kopyalanmışsa görünür → panolar karışmaz.

---

## 5. Dallar (sıralı, isimli, renk-kararlı)

### Dal 1 — Boş slot (ürün rolü, içi boş)
```
Modül Ekle
Ürün Ekle
Hücreleri Birleştir        (çoklu seçimde aktif)
Özel Ayar Yap              (hücre genelse) / Genele Dön (hücre özelse)
─────────────
Hücre Stili Kopyala
Hücre Stili Yapıştır
```
Yıkıcı yok — boş hücrede silinecek içerik yok.

### Dal 2 — Ürünlü slot
```
Modül Ekle
Ürünü Değiştir
Hücreleri Birleştir        (çoklu seçimde aktif)
Özel Ayar Yap / Genele Dön
─────────────
Hücre Stili Kopyala
Hücre Stili Yapıştır
─────────────
Hücreyi Boşalt             (güvenli — kırmızı DEĞİL)
```

### Dal 3 — Birleşik slot
```
Modül Ekle
Ürünü Değiştir
Hücreleri Ayır
Özel Ayar Yap / Genele Dön
─────────────
Hücre Stili Kopyala
Hücre Stili Yapıştır
─────────────
Hücreyi Boşalt             (içi doluysa aktif — güvenli)
```
Not: "Hücreyi Boşalt" birleşimi BOZMAZ; yalnız içeriği havuza atar. Ayırma ayrı aksiyon.

**Birleştirme içerik kuralı (anchor kazanır):** Birleştirmede sağ-tıklanan (anchor) hücrenin
içeriği korunur, diğerlerininki elden çıkar. **İlke: ürün asla yok edilmez (havuza atılır),
modül yok edilebilir (sessizce silinir).** Yani anchor modüllü + diğer ürünlü → modül kalır,
ürün havuza; anchor ürünlü + diğer modüllü → ürün kalır, modül silinir. Çoklu seçimde de aynı:
anchor kalır, diğer ürünlerin hepsi havuza, modüller silinir. (`mergeSelected` + `captureProductToPool`.)

### Dal 4 — Modül / banner slot (free rolü, modüllü)
```
Ürün Hücresi Yap          (modül kaldırılır → boş ürün hücresine döner)
─────────────
Hücre Stili Kopyala
Hücre Stili Yapıştır
```
Özel/Genel YOK — modüllü hücre zaten özel ayarlıdır. **"Modülü Değiştir" YOK** (kasıtlı kaldırıldı):
tek modül-tip var, hazır modüller uzun liste olacak → sağ-tıkta tek-tık modül-tipi seçimi liste
uzayınca anlamsızlaşır; modül değiştirme **kütüphaneden** yapılır. "Modülü Kaldır" işlevi kodda
**"Ürün Hücresi Yap"** etiketiyle (`slot-urun-hucresi` = `toggleSlotRole('product')`) — hızlı bar ile
aynı kelime (§4 dil ortaklığı).

### Dal 5 — Footer hücre (seçim modu)
```
Özel Ayar Yap / Genele Dön
─────────────
Varsayılana Sıfırla        (nötr — Ctrl+Z geri alır)
```
Davranış: toggle = `forkPageFooter`/`revertPageFooter` (custom↔global). "Varsayılana Sıfırla":
custom footer'da o sayfayı (`resetFooterToDefault(pageNumber)`) onaysız sıfırlar; **global footer'da
ONAY diyaloğu** ister (`resetFooterToDefault('global')` TÜM global footer'ları etkiler → sürpriz kayıp
önlenir). Her iki yol da Ctrl+Z ile geri alınır → kırmızı DEĞİL.
(Alt Bilgi Stili Kopyala/Yapıştır YOK — §6 "ertelenmiş" notu: footer stili canlı düzenlenir, ayrı clipboard yok.)

### Dal 6 — Footer/banner edit modu (izole, iç hücre)
```
Üste satır ekle
Alta satır ekle
Sola sütun ekle
Sağa sütun ekle
─────────────
Hücreleri Birleştir        (çoklu seçimde aktif — cellIds ≥ 2)
Hücreleri Ayır             (birleşik hücrede aktif — isMerged)
Satırı sil                 (son satırda GİZLİ — visible: rows>1, disabled DEĞİL)
Sütunu sil                 (son sütunda GİZLİ — visible: cols>1)
İçeriği Temizle            (text+image gider; yapı+stil durur — Ctrl+Z; kırmızı DEĞİL)
```
**SÜPERSET (taşıma):** lokal `#banner-ctx-menu` (satır/sütun ekle-sil) registry'ye taşındı **+**
Birleştir/Ayır + İçeriği Temizle eklendi. **Banner ve footer ORTAK yüzey** (`BannerSection`) —
footer-only değil; aynı menü ürün-alanı banner modülünde de çıkar. **Action paritesi birebir:**
`insertBannerRow/Column`, `deleteBannerRow/Column` anchor (sağ-tıklanan hücre) `sr/sc` ile çağrılır
(eski lokal menü ile aynı flat-index ÷ cols). **§2:** G1(ekle)+G2(Birleştir/Ayır) bitişik → TEK divider
(sil bloğu önünde); tek/birleşmemiş hücrede G2 boş → `ekle | İçeriği Temizle`. **"Düzenle" YOK** —
çift-tık zaten hücre-içi metin düzenlemeye geçer (`setEditingCellId`, lokal state; registry'den köprü
maliyeti gereksiz). **İçeriği Temizle = `clearBannerCells`** (YALNIZ içerik; stil korunur → "Boşalt"
değil, banner cell'de havuz yok). §3 NÖTR: hepsi Ctrl+Z ile geri alınır → hiç kırmızı yok.
(Alt Bilgi Stili Kopyala/Yapıştır YOK — §6 "ertelenmiş" notu.)

### Dal 7 — Sayfa zemini (kind:'pageBg')
```
Zemin Rengi               (hızlı bardaki renk seçici açılır)
Zemin Görseli             (hızlı bardaki görsel seçici açılır)
─────────────
Zemin Stili Kopyala
Zemin Stili Yapıştır
```
Genel/Özel YOK — zeminde mod sistemi henüz yok (ayrı epic). Yıkıcı yok.
**Renk/Görsel köprüsü:** Picker'lar (`ColorOpacityPicker`/`ImagePickerPopover`) trigger-anchored
popover; registry `run()` bir popover'ı imperatif AÇAMAZ → `ui.store` `bgPickerToOpen` sinyali ile
hızlı bardaki picker kendi düğmesine anchor'lı açılır (kullanıcı hızlı bara basmış gibi; tek-atış,
opt-in `openSignal` prop'u yalnız `BackgroundMode`'a). **"Zemin Ayarları" sağ-tıkta YOK** (kullanıcı
yalnız Renk/Görsel istedi; yan panel hızlı bardaki "Ayarlar"da — `setSidebarState('design','background')`).

### Dal 8 — Metin-edit modu (hücre içi metin düzenleme aktif)
```
Kes / Kopyala / Yapıştır  → tarayıcının NATIVE clipboard menüsü (custom menü DEĞİL)
```
Metin imleci aktifken sağ tık → **tarayıcının kendi clipboard menüsü** açılır. Kapsam:
**banner hücresi**, **footer cell-edit** (tek `BannerSection` noktası) **ve ürün adı/fiyat**
metin düzenleme. Registry'ye descriptor EKLENMEZ, custom menü/clipboard kodu YOKTUR (Yol A).
Native menü kapatması (preventDefault) yalnız yapısal/izolasyon/slot menüsü içindir; **metin
imleci aktifken kasıtlı olarak native menüye izin verilir** → `stopPropagation` ile üst
registry menüsü kesilir, `preventDefault` ÇAĞRILMAZ. Karar tek-kaynak saf yüklemlerde:
banner/footer → `modules/bannerContextMenu.ts` (`bannerCtxAction`); ürün adı/fiyat →
`canvas/textEditNativeMenu.ts` (`isRightClickInActiveTextEdit`, DOM-target kapsamı).

---

## 6. Action Eşleştirme

| Aksiyon | Store action | Durum |
|---|---|---|
| Modül Ekle | `setSlotModule()` (rol dönüşümünü kendi yapar) | VAR |
| Ürün Ekle / Ürünü Değiştir | `setSidebarState('products')` | VAR |
| Ürün Hücresi Yap (Dal 4) | `toggleSlotRole('product')` (modül kaldırılır → ürün hücresi) | VAR |
| Hücreleri Birleştir | `mergeSelected()` | VAR |
| Hücreleri Ayır (slot) | `unmergeSlot()` | VAR |
| Özel Ayar Yap / Genele Dön (slot, Dal 1/2/3) | `toggleSlotCustomSettings()` (sağ-tık `slot-ozel-genel` + hızlı bar toggle) | VAR |
| Özel Ayar Yap / Genele Dön (footer) | `forkPageFooter()` / `revertPageFooter()` *(setPageFooterMode değil — fork/revert override yaratır/siler)* | VAR |
| Hücre Stili Kopyala/Yapıştır | `copySlotSettings` / `pasteSlotSettings` | VAR |
| Alt Bilgi Stili Kopyala/Yapıştır | — *(ayrı clipboard action'ı yok — **ertelendi**, aşağıdaki nota bkz.)* | ⏸ |
| Zemin Stili Kopyala/Yapıştır | `copyBackground` / `pasteBackground` | VAR |
| Footer/banner Birleştir / Ayır | `mergeBannerCells(slotId, cellIds)` / `splitBannerCell(slotId, anchorCellId)` | VAR |
| Footer/banner Satır/Sütun ekle | `insertBannerRow/Column(slotId, anchorRow/anchorCol [+1])` | VAR |
| Footer/banner Satır/Sütun sil | `deleteBannerRow/Column(slotId, anchorRow/anchorCol)` *(son satır/sütunda gizli)* | VAR |
| Footer/banner Düzenle | çift-tık → `enterIsolation` / hücre-içi `setEditingCellId` — **menüde DEĞİL** | VAR |
| Footer/banner İçeriği Temizle | `clearBannerCells(slotId, cellIds)` (Del tuşu **+** sağ-tık "İçeriği Temizle") | VAR |
| Zemin Rengi / Görseli (sağ-tık) | `openBgPicker('color'/'image')` köprüsü → hızlı-bar picker'ı açılır | VAR |
| Zemin Ayarları | `setSidebarState('design','background')` — **hızlı bar "Ayarlar"; sağ-tıkta YOK** | VAR |
| Kes / Kopyala / Yapıştır (metin) | native Clipboard API (tarayıcı menüsü — registry'ye girmez) | ✅ |
| **Hücreyi Boşalt** | **`clearSlotToPool()`** | 🆕 |
| **Varsayılana Sıfırla** | **`resetFooterToDefault(scope)`** — custom: pageNumber (onaysız); global: 'global' (onay-gate) | VAR |

> **Footer hücre action'ları = banner motoru (host-slot).** Footer kendi merge/split/clear
> motorunu taşımaz; `mergeBannerCells` / `splitBannerCell` / `clearBannerCells` footer-slot id'sini
> alır, `resolveModuleSlot` ile `globalSettings.footerModule`'e yönlenir (footer-farkındalığı tek
> kaynakta — `footerSlot.ts`). Bu yüzden Dal 6'da ayrı footer-cell action'ı YOK.
>
> **Ertelenmiş — Footer Stil Kopyala/Yapıştır:** Footer banner motorunu paylaştığı ve stil
> *canlı* düzenlendiği için ayrı bir footer-stil clipboard action'ı (eski `copyFooterSettings`/
> `pasteFooterSettings` — 2c'de silindi) bugün YOK. Bu yüzden Dal 5 ve Dal 6'dan çıkarıldı. Karar:
> tüm menü dalları bitince zaman kalırsa **ayrı epic** olarak değerlendirilir; Aşama 2 kapsamı değil.

---

## 7. Yeni / Kaldırılan Action'lar (Aşama 1 — menüden ÖNCE)

Uygulama sırası: **önce action altyapısı, sonra menü.** Menü bu action'ları çağırır.

### Yazılacak (🆕)
1. **`clearSlotToPool(pageNumber, slotId)`**
   - Ürün havuza (`tempProductPool`) gider, slot boşalır, ürün hücresi olarak kalır.
   - Mevcut `clearSlot` + `moveSlotToTempPool` ikilisini birleştirir.
2. **`resetFooterToDefault(scope: number | 'global')`**
   - `scope='global'` → global footer `defaultFooterModule()` + `initialGlobalSettings.footer`.
   - `scope=pageNumber` → sayfanın `footerOverride`'ı aynı varsayılana sıfırlanır, `footerMode='custom'` kalır.

### Kaldırılacak (🗑️)
- **`clearSlot`** action'ı → yerini `clearSlotToPool` alır.
- **"Serbest Alan Yap / Serbest Alana Çevir"** → sağ tık + ContextualBar'dan kaldırılır.
  Gerekçe: modül ekleme akışı zaten `if (role !== 'free') toggleSlotRole('free')` ile
  otomatik serbest alan yapıyor (hem sürükle-bırak hem menü yolu). Kullanıcının elle
  "serbest alan yap" demesine hiçbir senaryoda gerek yok — iç mekanik gizlenir.
  *(Sağ panel `CellPanel.tsx` "Hücre Yapısı" SegmentedControl'ü ayrı UX kararıdır;
  uygulama anında ele alınır.)*

### Tek-Action Birleştirme Kuralı (KRİTİK)
Tüm "Hücreyi Boşalt" çağrıları — sağ tık, ContextualBar, sağ panel — **tek action**
(`clearSlotToPool`) kullanır. Şu an `clearSlot` ürünü YOK EDİYOR (yanlış davranış);
düzeltme sonrası her yer havuza atar. Tek yerden değişiklik → her yer birden değişir.
Etiket her yüzeyde aynı: **"Hücreyi Boşalt"** (ContextualBar da hizalandı — eski "Temizle" kalktı).

### Havuza-atma tek kaynağı (kapandı)
`clearSlotToPool` + `setSlotModule` + `mergeSelected` ortak "ürün yakala → SKU filter →
`originalPage`/`originalSlotId` prepend" mantığını **`captureProductToPool(pool, product,
pageNumber, slotId)`** saf helper'ında paylaşır (set() yapmaz → çağıran kendi atomik
set()'inde kullanır; `mergeSelected` çoklu ürünü fold'lar). Akış farkı (`setActivePages`
vs `recalculateLayout`) sayfa-yazımında, havuz transformu saf → helper temiz çıktı.

---

## 8. Mimari Hedef — Veri-Driven Menü (UYGULANDI)

Eskiden menü `selection.type`'a göre JSX içinde elle if/else dallarıyla yazılırdı; her yeni tip elle
dal açmayı gerektirir, tutarsızlık riski taşırdı.

**Uygulanan model:** her aksiyon bir veri tanımı (`MenuAction` descriptor) —
`{ id, label, icon?, group, danger?, visible, run }` (`menuRegistry.ts`). `buildMenu(ctx)` mevcut
bağlama göre filtreler/gruplar; `ContextMenu.tsx` render eder. Yeni aksiyon = `MENU_ACTIONS`'a bir
satır; JSX'e dokunma. Tutarlılık (renk §3, divider §2, sıra) `GROUP_BLOCK` + `MENU_DANGER_ALLOWLIST`'ten
OTOMATİK. Bu, `ModuleRegistry` ve token sisteminin deseni: **tek tanım kaynağı, render onu yorumlar.**

---

## DOKUNMA (invariant'lar + izolasyon sınırları)

- **Renk kuralı invariant:** Kırmızı yalnızca geri-dönüşü-zor eylemde. Yeni yıkıcı
  aksiyon eklenince varsayılan NÖTR; kırmızı için "havuz/undo yok mu?" testi geçilmeli.
  Mekanizma HAZIR ama ŞU AN KULLANILMIYOR: ContextMenu.tsx `descriptor.danger` → kırmızı render,
  `MENU_DANGER_ALLOWLIST` (boş) test-invariant'ı zorlar. İlk gerçek kırmızı kalem geldiğinde
  `danger:true` + allowlist'e id BİRLİKTE eklenir (§3 testi bunu kilitler).
- **Sıralama formülü invariant:** Oluştur → Dönüştür → [div] → Stil → [div] → Yıkıcı.
  Yeni aksiyon doğru gruba girer; yıkıcı her zaman en altta.
- **Tek-action invariant:** "Hücreyi Boşalt" her yerde `clearSlotToPool` (etiket de hizalı —
  ContextualBar dahil). Asla ikinci bir "boşalt" action'ı türetilmez. `clearSlot` geri eklenmez.
- **Serbest alan gizli kalır:** Modül ekleme otomatik `free` dönüşümü yapar; kullanıcıya
  "serbest alan yap" aksiyonu SUNULMAZ.
- **Metin dalı izolasyonu:** Dal 8 registry'ye GİRMEZ; metin-edit'te native tarayıcı menüsü
  kullanılır — custom menü/descriptor/clipboard kodu YOKTUR (Yol A). Yalnız `stopPropagation` ile
  üst registry menüsü kesilir, `preventDefault` çağrılmaz (native menü açılsın). Store'a/persist'e girmez.
- **Hızlı bar ↔ sağ tık dil ortaklığı:** Aynı kavram aynı kelime ailesiyle. Biri
  değişince diğeri gözden geçirilir.
- **Footer "Hücreyi Boşalt" ≠ "Ayır":** İçerik temizleme birleşimi bozmaz; ayrı aksiyonlar.
- **Stil panosu yüzey-spesifik:** Zemin / Hücre / Alt Bilgi panoları AYRI. Her menü yalnız
  kendi yüzeyinin "Yapıştır"ını ve yalnız o yüzeyden kopyalanmışsa gösterir. Zemin panosu Hücre
  menüsünde (veya tersi) ASLA görünmez → genel "Stil Yapıştır" muğlaklığı (yanlış-yüzey yapıştırma) kapanır.
