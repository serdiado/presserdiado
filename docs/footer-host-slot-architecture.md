# Footer Host-Slot Mimarisi — Container Katmanı

> **Kod-temelli teknik referans.** Her teknik iddia kaynağıyla (`dosya:satır`) bağlanmıştır.
> Koddan doğrulanamayan ayrıntılar **[DOĞRULANMADI]** ile işaretlidir — tahmin yoktur.
>
> **Kapsam ayrımı (oku):** Bu belge footer'ın **container/host katmanını** anlatır — depolama,
> per-sayfa routing, tutarlılık sözleşmesi, çıktı-modu. Footer'ın İÇİNDEKİ motor (hücre ızgarası,
> merge/split, insert/delete, fractions, rich-text, scoped DOM id, atomik undo) **GridModule
> substrate'idir** ve [`grid-module-architecture.md`](./grid-module-architecture.md)'de anlatılır —
> burada **tekrarlanmaz**, oraya cross-ref edilir. Kısa kural: **bağımsızlık container'da, paylaşım
> substrate'te.**

---

## 1. Amaç ve İlke

### Footer nedir (yeni model)
Footer artık ayrı bir mini-sistem değil; **tam özellikli bir GridModule barındıran bir host-slot**'tur.
Ürün-slotlarındaki banner makinesini (`BannerSection`, izolasyon, `ContextualBar`/`CellPanel`,
`applyBannerMutation`/`updateSlotModuleData`, undo, `gridMutate`) **bütünüyle yeniden kullanır** — footer'a
özel hiçbir motor yoktur.

### Neden host-slot (motor fork değil)
İki yol tartışıldı:
- **A) Footer'a özel ayrı motor** (eski model genişletilir): kod ikiye katlanır, banner'daki her
  düzeltme footer'da elle tekrarlanmalı → **drift sınıfı** (sync-bug).
- **B) Host-slot — footer banner motorunu host'lar** ← SEÇİLDİ. Footer yalnız **container** sağlar
  (konum, yükseklik, görünürlük, global↔custom); İÇERİK motoru paylaşır. **Sıfır drift, en düşük
  gelecek-riski**: banner motoruna giren her özellik footer'a **bedava** akar.

> Bu, eski `template-module-architecture.md`'nin "footer'ı `page.slots`'a/slot-grid'e zorla sokmak
> çalışan sistemi bozar (ters yama)" uyarısına **aykırı değil — ona saygı gösterir**: host-slot
> footer'ı `page.slots`'a sokmaz, modülü `globalSettings.footerModule`'de (`page.slots` dışında) tutar
> → üç slot-grid süreci footer'ı yapısal görmez (aşağıda §2 = kanıt). Uyarı hâlâ doğru (`page.slots`'a
> sokmak yanlış olurdu); host-slot o yanlışı yapmadan motoru kendi container'ında host'lar. (O belge
> yine de güncel footer modelini taşımıyordu — drift düzeltmesinde güncellendi.)

---

## 2. Yapısal İzolasyon — Host-Slot'un Temel Gerekçesi

Footer modülü `globalSettings.footerModule`'de yaşar — **`page.slots` DIŞINDA**
([`footerSlot.ts:1-6`](../apps/web/src/stores/studio/footerSlot.ts#L1-L6)). Bu, üç slot-grid sürecinin
footer'ı **yapısal olarak görmemesini** sağlar:

| Süreç | Neyi iterler | Footer'a etkisi |
|---|---|---|
| `recalculateLayout` | yalnız `page.slots` (greedy reflow) | **görünmez** — footer dizide yok |
| `reconcileGrid` (`grid-engine`) | yalnız `page.slots` | **görünmez** |
| `_fillSlotsFromPool` | yalnız `role==='product'` slotlar | **görünmez** — footer dizide yok |

> **Kanıtlanan davranış (canlı gate, Evre 1a):** ürün-dizme / Excel doldurma footer'a akmaz; sayfa
> grid'i 4×4→az küçülünce footer shrink/silinmez; "Sayfa başına alan" footer'dan etkilenmez. Footer
> bu üç sürece görünmez olduğu için **filtre/atlama gereği YOK** — yapısal yokluk yeterli. Maliyet
> lookup funnel'larına kayar → footer-farkındalığı **tek soyutlamada** (`footerSlot.ts`) toplanır (§4).

---

## 3. Depolama Modeli

### Üç alan
| Alan | Konum | Anlam |
|---|---|---|
| `globalSettings.footerModule` | `CatalogSettings` (global) | **Global footer** GridModule (`BannerModuleData`). Tüm sayfalarca paylaşılan tek içerik. Tip `unknown` (shared), web `as BannerModuleData` — `StudioSlot.moduleData` paterni. |
| `CatalogPage.footerOverride?` | per-sayfa | `{ module: unknown; heightMm: number }` — o sayfanın **özel** footer'ı (fork sonrası). |
| `CatalogPage.footerMode` | per-sayfa | `'global' \| 'custom' \| 'hidden'` — **yalnız görünürlük** taşır (companion). |

### Tek semantik kaynak: `footerOverride` VARLIĞI
**"Custom" demek = `page.footerOverride != null`** — `footerMode` DEĞİL
([`footerSlot.ts:8-10,30-33`](../apps/web/src/stores/studio/footerSlot.ts#L8-L33)). Tüm
çözümleme/yazma/yükseklik yolları override-varlığını okur; override yokken global'e düşer.
`footerMode` yalnız `'hidden'` ayrı bilgisini taşır + custom/global ile **tutarlı companion** olarak
güncellenir (§6). Bu, "iki ayrı boolean drift eder" sınıfını kökten önler: routing **tek** olguya
(varlık) bakar.

> **Default-if-absent guard:** eski projeler / ilk init `footerModule` taşımayabilir → her resolve
> `defaultFooterModule()`'e düşer ([`footerSlot.ts:59-67`](../apps/web/src/stores/studio/footerSlot.ts#L59-L67))
> → render çökmez. `defaultFooterModule` = tek-satır 5-sütun, `defaultBannerCell` tabanlı
> ([`footerSlot.ts:40-52`](../apps/web/src/stores/studio/footerSlot.ts#L40-L52)).

---

## 4. `footerSlot.ts` Primitifleri — Footer-Farkındalığı TEK KAYNAK

Saf modül (store/UI'a bağımlı değil → cycle yok). catalog + history store ve render **bundan beslenir**;
funnel'lara `if-isFooter` / `'footer-slot-'` prefix erişimi **sızmaz**.

### Id şeması
- `footerSlotId(pageNumber)` → `` `footer-slot-${pageNumber}` `` ([:19](../apps/web/src/stores/studio/footerSlot.ts#L19)) — **per-sayfa benzersiz stabil** (cellDomId scope'u için zorunlu; çoklu-modül DOM çakışmasını önler — bkz. grid-module §5 scoped DOM id).
- `isFooterSlotId(id)` ([:22](../apps/web/src/stores/studio/footerSlot.ts#L22)) — funnel'ların sorduğu predikat.
- `footerPageNumber(id)` ([:25-26](../apps/web/src/stores/studio/footerSlot.ts#L25-L26)) — id'den sayfa no (inline parse YOK; tek yer).

### Çözümleme (okuma)
| Primitif | İmza | Ne yapar |
|---|---|---|
| `footerOverrideOf` | `(page) → FooterOverride \| null` | "custom" tek kaynağı; override varlığı ([:31-33](../apps/web/src/stores/studio/footerSlot.ts#L31-L33)) |
| `footerWriteTarget` | `(page) → 'global' \| 'page'` | override varsa `'page'`, yoksa `'global'` ([:36-38](../apps/web/src/stores/studio/footerSlot.ts#L36-L38)) |
| `resolveFooterModule` | `(page, gs) → BannerModuleData` | override.module ?? gs.footerModule ?? default ([:59-67](../apps/web/src/stores/studio/footerSlot.ts#L59-L67)) |
| `resolveFooterHeight` | `(page, gs) → number` | override.heightMm ?? gs.footer.heightMm ([:73-80](../apps/web/src/stores/studio/footerSlot.ts#L73-L80)) |
| `synthFooterSlot` | `(pageNumber, pages, gs) → StudioSlot` | Geçici `StudioSlot` sarmalı: `role:'free'`, `moduleType:'banner'`, `moduleData=resolveFooterModule` ([:87-104](../apps/web/src/stores/studio/footerSlot.ts#L87-L104)) |
| `resolveModuleSlot` | `(slotId, pages, gs) → { pageNumber, moduleData } \| null` | **footer dalı:** footer-slot id → pageNumber + footer modül; değilse `page.slots` ([:116-131](../apps/web/src/stores/studio/footerSlot.ts#L116-L131)) |

`synthFooterSlot` `role:'free'` taşıdığından `isIsolatableModule` predikatından **geçer** — izolasyon
predikatını genişletmeye gerek yok (bkz. [`module-isolation-architecture.md`](./module-isolation-architecture.md)).

### Yazma (4 writer — global + per-sayfa)
| Primitif | Hedef | Ne yapar |
|---|---|---|
| `mergeFooterModule` | **global** | `gs.footerModule`'e deepMerge (merge ENJEKTE edilir — defaults↔footerSlot cycle'ı önler) ([:137-144](../apps/web/src/stores/studio/footerSlot.ts#L137-L144)) |
| `setFooterModule` | **global** | `gs.footerModule`'ü tam değiştir (izolasyon restore — snapshot atlar) ([:147-152](../apps/web/src/stores/studio/footerSlot.ts#L147-L152)) |
| `mergePageFooterModule` | **per-sayfa** | `page.footerOverride.module`'e deepMerge ([:158-166](../apps/web/src/stores/studio/footerSlot.ts#L158-L166)) |
| `setPageFooterModule` | **per-sayfa** | `page.footerOverride.module`'ü tam değiştir ([:169-172](../apps/web/src/stores/studio/footerSlot.ts#L169-L172)) |

> **Tek-kaynak ilkesi:** çağıranların hiçbiri `footerModule` / `footerOverride` alanına ya da
> `'footer-slot-'` prefix'ine doğrudan dokunmaz; hepsi bu primitiflerden geçer. Inline id-parse yok.

---

## 5. Funnel'lar — Tek Soyutlamanın Tüketicileri

GridModule'ün her okuma/yazma funnel'ı, footer'ı **footerSlot primitifleri üzerinden** ücretsiz
devralır. Ortak akış: **footer-slot-id → pageNumber → footerMode/override-aware route**
(custom → `page.footerOverride`, değilse → global).

### `updateSlotModuleData` — yazım router'ı
[`catalog.store.ts:1244-1258`](../apps/web/src/stores/studio/catalog.store.ts#L1244-L1258): footer-slot
id ise → `footerWriteTarget(page)` okur → `'page'` ise `mergePageFooterModule(p, u, deepMerge)`, değilse
`mergeFooterModule(gs, u, deepMerge)`. Footer-slot değilse normal `page.slots` yazımı. Tüm modül-data
yazımının **TEK funnel'ı** (bkz. grid-module §4).

### `applyBannerMutation` / `clearBannerCells` / `setBannerFractions` — modül çözümleme
[`catalog.store.ts:1290,1328`](../apps/web/src/stores/studio/catalog.store.ts#L1290) +
[:354](../apps/web/src/stores/studio/catalog.store.ts#L354): hepsi `resolveModuleSlot(slotId, getActivePages(), globalSettings)`
ile sayfayı + modülü çözer (çağıran pageNumber bilmez). Footer-farkındalığı resolver'da — funnel'a
if-isFooter sızmaz.

### `history.store` — izolasyon snapshot/restore (ikinci linchpin)
[`history.store.ts:47-73`](../apps/web/src/stores/studio/history.store.ts#L47-L73):
- **SNAPSHOT (okuma):** footer-slot ise `synthFooterSlot(...)` → izolasyon snapshot'ı footer modülünü alır.
- **RESTORE (yazma):** footer-slot ise `footerWriteTarget(page)` route → `'page'` ise `setPageFooterModule`, değilse `setFooterModule`.

> Bu funnel kapsanmasaydı footer izolasyon-undo kırılırdı — bu yüzden snapshot+restore footer-aware.

### Evrimsel ayrım: 2a-i threading vs 2a-ii fork
- **2a-i** ([`658ad50`](#)): yukarıdaki funnel'lara **page-context threading** (resolve/write `page`
  parametresi alır) eklendi — **davranış-nötr**. `footerWriteTarget` o aşamada **daima `'global'`**
  döner (hiçbir sayfada override yok) → eski global davranış birebir. Per-sayfa dallar **dormant** ama
  hazır.
- **2a-ii** ([`a7299db`](#)): fork action'ları (`forkPageFooter`...) `footerOverride` **yaratır** →
  aynı funnel'lar **otomatik per-sayfa** hedefe gider. **Sıfır ek kablaj** — 2a-i'nin döşediği yol
  aktifleşir.

---

## 6. Tutarlılık Sözleşmesi

`forkPageFooter`/`revertPageFooter`/`showPageFooter`/`setPageFooterMode` `footerOverride` ↔ `footerMode`
ikilisini **daima tutarlı** tutar. Hepsi `withHistoryBatch` + ilk iç `saveState(true)` ile sarılı (raw
`setActivePages` history tetiklemez → pre-state açıkça yakalanır → **tek Ctrl+Z**)
([`catalog.store.ts:599-680`](../apps/web/src/stores/studio/catalog.store.ts#L599-L680)).

| Eylem | `footerOverride` | `footerMode` | Not |
|---|---|---|---|
| **fork** ([:604-624](../apps/web/src/stores/studio/catalog.store.ts#L604-L624)) | `{ module: clone(global), heightMm: gs.footer.heightMm }` | `'custom'` | **`clone` = `structuredClone`** referans-izolasyon ŞART: override.module global ile hiçbir iç referans (cells/renk) paylaşmaz → çapraz mutasyon yok |
| **revert** ([:626-638](../apps/web/src/stores/studio/catalog.store.ts#L626-L638)) | `undefined` (SİL) | `'global'` | tutarlı: override-yok ⟺ global. Ctrl+Z geri getirir |
| **gizle** (`setPageFooterMode(...,'hidden')`) | **korunur** | `'hidden'` | override hayatta kalır (custom içerik kaybolmaz) |
| **göster** ([:640-653](../apps/web/src/stores/studio/catalog.store.ts#L640-L653)) | korunur | `p.footerOverride ? 'custom' : 'global'` | mode override-varlığından **türetilir** (sabit 'global' değil) → "custom ama gizli" Göster'de custom'a döner |

> **Değişmez:** routing **varlık** okur (`footerOverrideOf`); `footerMode` yalnız `'hidden'` ayrı
> bilgisini taşır. Bu yüzden mode ile override "çatışamaz" — göster, mode'u varlıktan yeniden türetir.

### Yükseklik
`setFooterHeight` ([:655-680](../apps/web/src/stores/studio/catalog.store.ts#L655-L680)): `footerWriteTarget`
`'page'` ise yalnız o sayfanın `override.heightMm`'i; değilse `gs.footer.heightMm` (tüm global sayfaları
etkiler — `resolveFooterHeight` global dalıyla tutarlı). Clamp `[5, 60]` mm.

---

## 7. Düzenleme — Substrate'ten Miras (2a-i kazanımı)

Footer **kendi düzenleme makinesi taşımaz.** `footerOverride` oluşur olmaz funnel'lar otomatik
per-sayfa hedefe yöneldiği için, GridModule'ün TÜM düzenleme yetenekleri footer'a **sıfır ek kablaj**
ile akar:

- **Hücre seçimi / lasso / merge / split / insert-delete / resize / fractions** → grid-module §3,§5
  (footer host'unda birebir, çünkü `synthFooterSlot` normal bir `role:'free'` slot).
- **İzolasyon (düzenle = izolasyon):** çift-tık → `enterFooterEdit` → `enterIsolation(synthFooterSlot)`;
  yerel history yığını, çıkışta tek global adım. `role:'free'` → `isIsolatableModule` geçer.
- **Rich-text + run/cell renk** → grid-module §5 (run-vs-cell karar mantığı). **Footer hücre-seviyesi
  run-override** (renk/font/kalınlık/altı-üstü çizili) `clearRunForSurface` footer-aware düzeltmesiyle
  çalışır ([`8d5f90a`](#)).
- **Undo:** substrate'in `withHistoryBatch` + `updateSlotModuleData('discrete')` atomik-undo'su
  (grid-module §4).

### Container-seviyesi host davranışı (footer'a özel, render)
[`FooterRenderer.tsx`](../apps/web/src/features/studio/canvas/FooterRenderer.tsx): host konumu
(`bottom:5mm`, `left/right` margin, `resolveFooterHeight` ile yükseklik —
[:95-101](../apps/web/src/features/studio/canvas/FooterRenderer.tsx#L95-L101)); `footerMode==='hidden'`
→ hayalet mod (içerik render yok, dashed-iz + "Göster" — [:114-135](../apps/web/src/features/studio/canvas/FooterRenderer.tsx#L114-L135));
tek-tık → seç (ürün-slot deseni, [:155-162](../apps/web/src/features/studio/canvas/FooterRenderer.tsx#L155-L162));
çift-tık → `enterFooterEdit` ([:163-168](../apps/web/src/features/studio/canvas/FooterRenderer.tsx#L163-L168));
seçili çerçeve = `outline: 2px solid var(--color-blue-500)` (ürün-modül outline mirror'ı);
düzenleme-dışı `pointer-events-none` (cell olay yutmaz, çift-tık host'a ulaşır), düzenlemede `auto`
([:170-174](../apps/web/src/features/studio/canvas/FooterRenderer.tsx#L170-L174)). İçine
`<BannerSection instanceData={footerModule} slotId={slotId} pageNumber={pageNumber} />` mount edilir
([:173](../apps/web/src/features/studio/canvas/FooterRenderer.tsx#L173)) — kendi hücre-render döngüsü YOK.

---

## 8. Çıktı-Modu (Önizleme / Export) — Tek Mekanizma (2d)

Önizleme **düz, non-interaktif bir "jpg" gibi** olmalı = export ile birebir. Tek-mekanizma dört
parçadan oluşur ([`c7a6741`](#)):

### 8.1 `data-hide-on-export` — TEK marker (4 yol uniform tüketir)
Editör-only görsel chrome (toolbar, sayfa-etiketi, seçim-tutamaçları, hayalet-iz) bu **tek marker**'ı
taşır; **dört çıktı yolu** aynı marker'ı tüketir:

| Yol | Mekanizma | Kaynak |
|---|---|---|
| Önizleme (CSS) | `.preview-mode [data-hide-on-export] { display:none !important }` | [`index.css:314-316`](../apps/web/src/index.css#L314-L316) |
| JPG export | `onclone` → `querySelectorAll('[data-hide-on-export]').forEach(remove)` | [`StudioPage.tsx:131-132`](../apps/web/src/features/studio/StudioPage.tsx#L131-L132) |
| Thumbnail | `onclone` → aynı strip bloğu | [`thumbnailCapture.ts:51`](../apps/web/src/lib/thumbnailCapture.ts#L51) |
| Print (PDF) | `.print-mode [data-hide-on-export] { display:none !important }` | [`PrintView.tsx:97`](../apps/web/src/features/print-view/PrintView.tsx#L97) |

Footer marker noktaları: hayalet-iz + "Göster" butonu + toolbar + sayfa-etiketi
([`FooterRenderer.tsx:105,118,126,182`](../apps/web/src/features/studio/canvas/FooterRenderer.tsx#L105)).

### 8.2 Non-interaktiflik gate (override-defeating + scroll-safe)
[`index.css:310-313`](../apps/web/src/index.css#L310-L313):
```css
.preview-mode, .preview-mode * { pointer-events: none !important; }
```
`!important` wildcard, içerik subtree'sindeki açık `pointer-events-auto` (Slot içerik-wrapper/ad/fiyat/
görsel/badge) **VE** `#canvas` inline `pointer-events:auto`'yu (Canvas.tsx) yener → metin-seçimi +
footer-tık + edit-entry + hover-toolbar mount **hepsi biter**. Scroll/pan `#studio-canvas-root`'ta
(`.preview-mode` DEĞİL, kardeş scroll-wrapper) → **korunur**; gate scroll-wrapper'da değil **içerikte**.
`.preview-mode { user-select: none }` ([:302-304](../apps/web/src/index.css#L302-L304)) "kopyalanamaz"
hissi verir, scroll'u etkilemez.

### 8.3 Temiz preview-state (giriş anında)
[`ui.store.ts:135-145`](../apps/web/src/stores/studio/ui.store.ts#L135-L145): `setPreviewMode(true)` →
`exitIsolation()` (izolasyon commit) + `clearSelection()` + `editingContent:null`. Seçim/edit chrome'u
(footer outline + her seçim-chrome'u) preview'a **kökten sızmaz** (seçim yok → outline yok).

---

## 9. 2c — Eski Footer-Cell Sistemi Temizliği

Host-slot geçişi tamamlanınca eski footer-cell mini-sistemi tümüyle kaldırıldı ([`90bfafe`](#),
9 dosya, +21/−1075). Greenfield → migrasyon yok.

**Linchpin (dormancy kanıtı):** `selection.type==='footerCell'` **hiç SET edilmiyordu** (yalnız
type-union üyesi + `===` karşılaştırmaları) → footerCell-gated TÜM UI + action **unreachable** →
tek olguya dayanarak silindi. Kaldırılanlar: `StudioFooterCell` tipi, `updatePageFooterCells`/
`updateFooterSettings`/`merge`/`unmerge`/`copy`/`paste` store action'ları, `FooterContainerMode`/
`FooterCellMode` (ContextualBar), `FooterPanel` (CellPanel), `'footerCell'` SelectionType, legacy
`customFooter`/`footerText`/`footerLogo` normalizer migration. `FooterSettings` → `{ heightMm }`'e
indirildi. **Load-safe:** eski alanlar zarifçe yok sayılır (crash yok). Footer artık **tümüyle
host-slot modelinde**.

---

## 10. Öğrenimler / Değişmez İlkeler

1. **Container ↔ substrate ayrımı:** Footer'ın bağımsızlığı container'da (konum, yükseklik,
   görünürlük, global↔custom); paylaşım substrate'te (GridModule motoru). Container katmanı motoru
   asla kopyalamaz → drift yok.
2. **Existence-gating > footerMode-gating:** "custom" tek semantik kaynağı `footerOverride` **varlığı**;
   `footerMode` yalnız `'hidden'` + tutarlı companion. İki ayrı boolean drift'ini kökten önler.
3. **Host-slot drift'i önler:** motor fork yerine substrate paylaşımı → banner'a giren her özellik
   (run/cell renk, merge, fractions, resize) footer'a bedava akar; ayrı bakım yükü yok.
4. **Tek-kaynak footer-farkındalığı:** `footerSlot.ts` — funnel'lara `if-isFooter` / prefix-parse
   sızmaz; saf modül (cycle yok), catalog+history+render buradan beslenir.
5. **Yapısal izolasyon > runtime filtre:** footer `page.slots` dışında olduğu için üç slot-grid
   sürecine görünmez — atlanacak filtre bile gerekmez (§2).

### Commit zinciri (footer arkı)
```
de4b9d2  feat(studio): host-slot render-only (Evre 1a)
d81fab1  feat(studio): tam GridModule host-slot (Evre 1, global)
f240ae6  feat(studio): footer modül-seçili ayar yüzeyi (FreeSlotMode + BannerPanel)
8d5f90a  fix(studio):  footer hücre-seviyesi run override (clearRunForSurface footer-aware)
658ad50  refactor(studio): footer çözümleme/yazma → page-context (2a-i, davranış-nötr)
a7299db  feat(studio): footer per-sayfa custom fork (2a-ii)
af04e79  fix(studio):  footer toolbar/yükseklik input UX + seçim çerçevesi
c7a6741  fix(studio):  önizleme/export sadakati — tek mekanizma (2d)
90bfafe  refactor(studio): eski footer-cell kodu temizliği (2c, host-slot sonrası dormant)
```

---

## DOKUNMA (yapısal izolasyonun bütün amacı)
`recalculateLayout`, `reconcileGrid`, `_fillSlotsFromPool` üç süreci ve item-4 dosyaları
(`packages/grid-engine/src/reconcile.ts`, `apps/web/.../reconcileGrid.test.ts`) **footer'dan
etkilenmez ve footer için değişmemeli** — footer `page.slots` dışında. Bu üçten birine dokunma ihtiyacı
doğarsa yapısal izolasyon başarısız demektir (kırmızı bayrak).

---

*Bu belge `footerSlot.ts`, `catalog.store.ts`, `history.store.ts`, `FooterRenderer.tsx`, `ui.store.ts`,
`index.css`, `StudioPage.tsx`, `thumbnailCapture.ts`, `PrintView.tsx` koduna dayanır. Substrate (motor)
için [`grid-module-architecture.md`](./grid-module-architecture.md). Kod değiştikçe güncellenmelidir.*
