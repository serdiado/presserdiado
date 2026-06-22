# GridModule Mimarisi — Hazır Modüllerin Atası

> **Kod-temelli teknik referans.** Her teknik iddia kaynağıyla (`dosya:satır`) bağlanmıştır.
> Koddan doğrulanamayan ayrıntılar **[DOĞRULANMADI]** ile işaretlidir — tahmin yoktur.

---

## 1. Amaç ve Konum

### GridModule nedir
**GridModule**, bir sayfa slot'unun *içinde* yaşayan **hücre-tabanlı mini ızgara motorudur**. Bir
tasarım değil, motordur: içine ne konduğuna göre **tablo**, **fiyat listesi**, **resimli ürün
kartı** veya **banner** olur. Hazır (preset) modüllerin **atasıdır** — gelecekteki hazır
tasarımların neredeyse hepsi bunun üstüne kurulur.

### Motor ↔ Şablon ayrımı (belgenin omurgası)
- **Motor (GridModule):** Hücre ızgarası + satır/sütun ekle-sil + birleştir/ayır + oransal
  boyutlandırma. İçerikten bağımsız. Çekirdeği saf fonksiyon: [`gridMutate.ts`](../apps/web/src/features/studio/modules/gridMutate.ts).
- **Şablon (Banner, Fiyat Listesi, …):** Motor üstüne kurulu **hazır içerik/stil**. "Banner" =
  motorun belirli bir doldurulmuş hâli. Şablonlar `StudioModule` olarak tutulur ([`types.ts:76-91`](../apps/web/src/features/studio/modules/types.ts#L76-L91)).

### İsimlendirme
- **Teknik ad:** `GridModule` (motor).
- **UI adı:** "Tablo Alanı" — yalnız **mevcut arayüz etiketi**, geçicidir, değişebilir; motorun
  adı değildir. Kodda `ModuleType = 'banner' | null` ([`shared/studio.ts:190`](../packages/shared/src/types/studio.ts#L190); `modules/types.ts` yalnız import eder) ve `label: 'Tablo Alanı'` ([`module-registry.ts:27`](../apps/web/src/stores/studio/module-registry.ts#L27)).
- **Not:** Kod tabanında tipler/dosyalar tarihsel olarak hâlâ `banner` öneki taşır
  (`BannerModuleData`, `BannerSection`, `clearBannerCells` …). Bu belge motoru `GridModule`,
  veri tipini `BannerModuleData` (koddaki adıyla) olarak anar.

### İki iç-içe ızgara: slot-grid ≠ GridModule
Karıştırılmaması gereken **iki ayrı ızgara sistemi** vardır:

| | **Slot-grid (sayfa düzeni)** | **GridModule (modül içi)** |
|---|---|---|
| Kapsam | Sayfanın `rows×cols` slot yerleşimi | Tek bir slot'un İÇİNDEKİ hücre ızgarası |
| Veri | `CatalogPage.slots: StudioSlot[]` | `slot.moduleData: BannerModuleData` |
| Konum | `gridPosition` (greedy reflow, `recalculateLayout`) | `idx = row*cols + col` (implicit, row-major) |
| Motor | `packages/grid-engine` (`reconcileGrid`) | `apps/web/.../modules/gridMutate.ts` |

GridModule bir slot'a `moduleData` alanı üzerinden bağlanır: `free` rollü slot
`moduleType: 'banner'` + `moduleData: BannerModuleData` taşır ([`module-registry.ts:27`](../apps/web/src/stores/studio/module-registry.ts#L27); slot tipi
`StudioSlot.moduleType/moduleData` — `packages/shared/src/types/studio.ts:212-213`). Yani GridModule,
slot-grid'in bir hücresinin içine gömülü kendi mini-grid'idir.

### Motorun host'ları (bu motoru kim barındırır)
Bu motor "ata"dır; iki host'u vardır:
1. **Ürün/free slotlar** — `page.slots` içindeki `role:'free'` slot (yukarıda anlatıldı).
2. **Footer** — footer artık aynı motorun ikinci host'udur. Modül `globalSettings.footerModule`'de
   (`page.slots` DIŞINDA) yaşar; render/edit anında `synthFooterSlot` ile bir `role:'free'`
   `StudioSlot` sentezlenir → motorun TÜM yetenekleri (merge/split, insert/delete, fractions,
   rich-text, izolasyon, atomik undo) footer'a değişiklik gerektirmeden akar. Footer-farkındalığı
   tek soyutlamada (`footerSlot.ts`) toplanır; bu belgedeki funnel'lar (`updateSlotModuleData`,
   `applyBannerMutation`, `history.findActiveSlot`) footer'ı oradan devralır. Detay (depolama,
   per-sayfa fork, routing, çıktı-modu): [`footer-host-slot-architecture.md`](./footer-host-slot-architecture.md).

---

## 2. Veri Modeli

### `BannerModuleData` (modül kökü)
[`types.ts:36-49`](../apps/web/src/features/studio/modules/types.ts#L36-L49):
```ts
interface BannerModuleData {
  type: 'banner';
  rows: number;
  cols: number;
  cells: BannerCellData[];          // düz row-major dizi: idx = row*cols + col
  colFractions?: number[];          // opsiyonel, uzunluk = cols (fr-tabanlı)
  rowFractions?: number[];          // opsiyonel, uzunluk = rows
  bgColor: ColorValue;
  containerBorder: { color: { c: string; o: number }; width: number };
  radius: BorderRadiusData;
  shadow: ShadowData;
}
```

### `BannerCellData` (tam field listesi)
[`types.ts:15-34`](../apps/web/src/features/studio/modules/types.ts#L15-L34):
```ts
interface BannerCellData {
  id: string;
  text: string;
  colSpan: number;
  rowSpan: number;
  hidden: boolean;
  mergedInto: string | null;
  font: TypographyData;
  padding: SpacingData;
  bgColor: ColorValue;
  border: BorderData;
  image: string | null;
  imageMode?: 'contain' | 'cover' | 'free';   // opsiyonel — render savunmalı okur
  imagePosX?: number;
  imagePosY?: number;
  imageScale?: number;
}
```

### Merge alanları — anlam + invariant
- **Anchor (birleşmenin sahibi):** `mergedInto === null` ve `(colSpan > 1 || rowSpan > 1)`
  ([`gridMutate.ts:107`](../apps/web/src/features/studio/modules/gridMutate.ts#L107)).
- **Kapsanan token:** `hidden: true`, `mergedInto: anchorId`, `colSpan/rowSpan = 1`. İçeriksizdir;
  içerik anchor'da yaşar. Render'da gizli hücreler atlanır.
- **Invariant:** `cs × rs` boyutlu bir merge'in tam `cs*rs − 1` gizli token'ı vardır. Tüm motor
  işlemleri bu sayıyı korur (token-count invariant, §3).
- **Konum implicit:** Hücrenin (row, col)'u dizi indeksinden gelir (`idx = row*cols + col`); ayrı
  konum alanı yoktur. (Slot-grid'in `gridPosition`'ından farkı — §1.)

### `defaultBannerCell` — tek-kaynak nötr hücre
[`gridMutate.ts:60-89`](../apps/web/src/features/studio/modules/gridMutate.ts#L60-L89). Stil mirası YOK: yeni hücre her zaman kanonik nötr
varsayılan (beyaz zemin, 0-genişlik border, varsayılan font/padding). **Hem** `makeCell` ([`gridMutate.ts:90-92`](../apps/web/src/features/studio/modules/gridMutate.ts#L90-L92))
**hem** `bannerInit` ([`module-registry.ts:15`](../apps/web/src/stores/studio/module-registry.ts#L15)) buradan beslenir → ikisi drift edemez (tek-kaynak).
> Tarihsel hata (düzeltildi): eski `makeCell(ref, id)` komşu hücreden `bgColor/border` miras
> alıyordu → eklenen satır/sütun komşunun zeminini/çerçevesini kapıyordu. Çözüm: stil mirası
> kaldırıldı, `defaultBannerCell` tek-kaynak yapıldı.

### Fractions — oransal (fr) boyutlandırma
[`fractions.ts`](../apps/web/src/features/studio/modules/fractions.ts):
- `colFractions?/rowFractions?` **opsiyonel** (`undefined` = eşit-bölü). Eski modüller
  migration'sız açılır.
- `materializeFractions(arr, count)` ([`fractions.ts:22-28`](../apps/web/src/features/studio/modules/fractions.ts#L22-L28)): render/okuma için; yoksa eşit-bölü, varsa
  uzunluğa uydurulmuş dizi döner. **Sonuç asla store'a yazılmaz** (read-only backward-compat) —
  eski modül dokunulmadıkça `undefined` kalır.
- `insertFraction`/`removeFraction` ([`fractions.ts:34-66`](../apps/web/src/features/studio/modules/fractions.ts#L34-L66)): pozisyonel ekle/çıkar (`undefined`-koruyan;
  gridMutate insert/delete tarafından kullanılır).
- `FRACTION_MIN = 0.1` ([`fractions.ts:6`](../apps/web/src/features/studio/modules/fractions.ts#L6)): her fraction'ın asgari payı (drag/sayısal clamp).
- **`BANNER_DIM_MIN = 1` / `BANNER_DIM_MAX = 20`** ([`fractions.ts:9-10`](../apps/web/src/features/studio/modules/fractions.ts#L9-L10)): satır/sütun sayısı clamp
  sınırları, **tek-kaynak** — üç panel buradan okur (eskiden üç ayrı kopya vardı, sync-bug
  sınıfıydı; konsolide edildi).

---

## 3. Motor: `gridMutate.ts`

### Saflık / izolasyon
- **Yalnız** `./types` (tip) ve `./fractions` import eder ([`gridMutate.ts:10-11`](../apps/web/src/features/studio/modules/gridMutate.ts#L10-L11)) — store/UI/DOM
  bağımlılığı YOK → import döngüsü yok, Vitest'lenebilir.
- Tüm yapısal op'lar **`GridState → GridState`** saf dönüş; girdiyi mutate etmez.
  `GridState = { cells, rows, cols, colFractions?, rowFractions? }` ([`gridMutate.ts:13-19`](../apps/web/src/features/studio/modules/gridMutate.ts#L13-L19)).

### API (14 export fonksiyon — koddan)
| Fonksiyon | İmza | Ne yapar |
|---|---|---|
| `nextCellId` | `(cells) → string` | Çakışmayan benzersiz `banner-inst-N` id ([:35](../apps/web/src/features/studio/modules/gridMutate.ts#L35)) |
| `defaultBannerCell` | `(id) → BannerCellData` | Kanonik nötr hücre (tek-kaynak) ([:60](../apps/web/src/features/studio/modules/gridMutate.ts#L60)) |
| `makeCell` | `(id) → BannerCellData` | `defaultBannerCell` sarmalı ([:90](../apps/web/src/features/studio/modules/gridMutate.ts#L90)) |
| `getMergeBoxes` | `(cells, cols) → MergeBox[]` | Anchor'lar + (r,c,cs,rs) ([:103](../apps/web/src/features/studio/modules/gridMutate.ts#L103)) |
| `colBoundarySegments` | `(boxes, rows, j) → {start,end}[]` | Sütun boundary j'nin merge-dışı satır aralıkları ([:143](../apps/web/src/features/studio/modules/gridMutate.ts#L143)) |
| `rowBoundarySegments` | `(boxes, cols, i) → {start,end}[]` | Satır boundary i'nin merge-dışı sütun aralıkları ([:161](../apps/web/src/features/studio/modules/gridMutate.ts#L161)) |
| `normalizeMerges` | `(s) → GridState` | Merge tutarlılık + dangling-önleme güvenlik ağı ([:183](../apps/web/src/features/studio/modules/gridMutate.ts#L183)) |
| `insertColumn` | `(s, atCol) → GridState` | Per-satır insert (row-major doğru remap) ([:223](../apps/web/src/features/studio/modules/gridMutate.ts#L223)) |
| `deleteColumn` | `(s, atCol) → GridState` | Per-satır remove (cols>1 guard) ([:254](../apps/web/src/features/studio/modules/gridMutate.ts#L254)) |
| `insertRow` | `(s, atRow) → GridState` | Satır bloğu ekle ([:286](../apps/web/src/features/studio/modules/gridMutate.ts#L286)) |
| `deleteRow` | `(s, atRow) → GridState` | Satır bloğu sil (rows>1 guard) ([:311](../apps/web/src/features/studio/modules/gridMutate.ts#L311)) |
| `mergeCells` | `(s, cellIds) → GridState` | Bounding-box → anchor + hidden token ([:336](../apps/web/src/features/studio/modules/gridMutate.ts#L336)) |
| `splitCell` | `(s, anchorId) → GridState` | Dissolve (anchor + üyeler 1×1) ([:370](../apps/web/src/features/studio/modules/gridMutate.ts#L370)) |
| `resizeGridTo` | `(s, rows, cols) → GridState` | Hedefe dek tail insert/delete döngüsü ([:382](../apps/web/src/features/studio/modules/gridMutate.ts#L382)) |

(+ `GridState`, `MergeBox` interface'leri.)

### Kritik invariant'lar
1. **Zero-mutation (undo korunur):** `newCells`'e konan her hücre ya taze `makeCell` ya da mevcut
   hücrenin spread klonu (`{...cell}`) — asla doğrudan referans. Span/hidden/mergedInto değişimi
   spread-override ile. Gerekçe: aliaslı nesneyi mutate etmek store state / undo snapshot'ını bozar
   → Ctrl+Z kırılır. (Saflık testleri bunu garantiler — aşağıda.)
2. **`normalizeMerges` = dangling-önleme:** "anchor yok" = "X artık `span>1` geçerli anchor değil"
   (sadece "cell var mı" değil). Box'ları grid sınırına clamp eder → kapsanan gözeleri
   `hidden+mergedInto` yapar → `mergedInto=X` olan göze X geçerli anchor değilse VEYA X'in box'ı
   dışındaysa **dissolve** ([:183-221](../apps/web/src/features/studio/modules/gridMutate.ts#L183-L221)). Her op sonunda çağrılır → kenar durumlar yutulur, dangling
   asla kalmaz.
3. **İki-eksen mirror:** `insertColumn`/`deleteColumn` ile `insertRow`/`deleteRow` birebir simetrik
   (sütun ekseni ↔ satır ekseni).
4. **Token-count invariant:** Her op `cs*rs − 1` gizli token sayısını korur.

### Resize segmentasyonu (merge-aware)
`colBoundarySegments`/`rowBoundarySegments` ([:143-180](../apps/web/src/features/studio/modules/gridMutate.ts#L143-L180)) bir sütun/satır boundary'sinin merge'e
**iç olmadığı** (gerçek kenar) bitişik aralıkları döndürür. BannerSection resize handle'larını bu
aralıklara segmentler → merge'in yuttuğu iç boundary'lerde handle/cursor çıkmaz (§5).

### Vitest kapsamı
[`gridMutate.test.ts`](../apps/web/src/features/studio/modules/gridMutate.test.ts) — **41 test** (12 describe bloğu). Kapsam: sütun/satır insert-delete remap (item-10
fix), merge genişleme/küçülme/dissolve (iki eksen), anchor silme, dangling-yokluğu (fuzz), fraction
senkronu, mergeCells/splitCell, resizeGridTo, boundary segmentleri, primitive'ler. **Saflık
testleri:** 8 op için `structuredClone` ön-kopya + op sonrası `toEqual` ([`gridMutate.test.ts:159-179`](../apps/web/src/features/studio/modules/gridMutate.test.ts#L159-L179)) →
girdi mutate edilmediği (zero-mutation invariant) kanıtlanır.

---

## 4. Store Entegrasyonu

### Banner action'ları (9 — koddan)
[`catalog.store.ts:281-311`](../apps/web/src/stores/studio/catalog.store.ts#L281-L311) (imza) + implementasyon:
- **Yapısal (7, `applyBannerMutation` üzerinden):** `insertBannerColumn`, `deleteBannerColumn`,
  `insertBannerRow`, `deleteBannerRow`, `setBannerGridSize`, `mergeBannerCells`, `splitBannerCell`
  ([`catalog.store.ts` ~1339-1360](../apps/web/src/stores/studio/catalog.store.ts#L1339); insertBannerColumn :1339, setBannerGridSize :1347).
- **İçerik (2, kendi sarmalı):** `clearBannerCells` (seçili hücrelerde içeriği temizle, yapı/stil
  korunur) ve `setBannerFractions` (oransal boyut yaz) — aynı atomik-undo paterni.

### `applyBannerMutation` sarmalayıcı akışı
[`catalog.store.ts` (Store tipi tanımından sonra)](../apps/web/src/stores/studio/catalog.store.ts):
```
sayfayı slot'tan çöz → BannerModuleData oku → saf motoru çağır (mutate fn) →
withHistoryBatch(() => updateSlotModuleData(pageNumber, slotId, {cells,rows,cols,colFractions?,rowFractions?}, 'discrete'))
```
- Fraction `undefined` ise `updates`'e KONMAZ → deepMerge eski modülün `undefined`'ını korur
  (fraction'sız modül regresyon yaşamaz).
- `withHistoryBatch` ([`history.store.ts:153`](../apps/web/src/stores/studio/history.store.ts#L153); arayüz :96): atomik işlem penceresi — batch içindeki ilk iç-save
  forced çeker, sonrakiler bastırılır → izolasyon-içi (`pushIsolationSnapshot`) ve izolasyon-dışı
  (`'discrete'` → `saveState(true)`) rotalarda **tek Ctrl+Z**.
- `updateSlotModuleData` ([`catalog.store.ts:1227`](../apps/web/src/stores/studio/catalog.store.ts#L1227); footer-branch :1244-1258): tüm modül-data yazımının TEK funnel'ı;
  deepMerge (diziler wholesale-replace); izolasyon-bilinçli.

### Üç yüzey — tek-kaynak (kopya mantık yok)
Satır/sütun boyut değişimi üç yüzeyden de **aynı store action'larını** çağırır; kendi mantığını
kopyalamaz:
- **Hızlı Bar** (`ContextualBar.tsx` `FreeSlotMode`) → `setBannerGridSize`; `BannerCellMode` merge/
  split butonları → `mergeBannerCells`/`splitBannerCell`.
- **Sağ Panel** (`CellPanel.tsx`) → `setBannerGridSize` + fraction inputları `setBannerFractions`.
- **`BannerSettingsPanel.tsx`** → `setBannerGridSize`.
> Tarihsel: üç `resizeGrid` kopyası + üç inline default-cell üretimi vardı (duplikasyon). Hepsi
> tek motor + tek action'a indirgendi; senkron otomatik.

---

## 5. Render ve Etkileşim

[`BannerSection.tsx`](../apps/web/src/features/studio/modules/BannerSection.tsx):
- **CSS Grid + span:** Container `display:grid`; `gridTemplateColumns/Rows` fr'lerden
  (`minmax(0, ${f}fr)`); her görünür hücre `gridColumn/Row: span N`. Gizli hücreler render
  edilmez (`cells.filter(c => !c.hidden)`).
- **Scoped DOM id (tek-kaynak):** `cellDomId(slotId, cellId) → `banner-${slotId}-${cellId}``
  ([`bannerDom.ts:6`](../apps/web/src/features/studio/modules/bannerDom.ts#L6)). Render + tüm lookup (lasso kesişimi, click-outside, blur-commit, run-color
  köprüsü, ContextualBar `resolveCellEl`) buradan geçer. **Gerekçe:** `bannerInit` her modüle aynı
  `banner-inst-0..15` cell id'lerini verdiğinden, slotId kapsaması olmadan sayfada 2+ modülde DOM
  id'leri çakışır → global `getElementById` yanlış modülü bulur (lasso bozulur). slotId kapsaması
  benzersizleştirir.
- **Rich-text entegrasyonu (Cat-1 mirası):** Her hücre `contentEditable` katmanı taşır;
  `./richText`'ten `setActiveRange/sanitizeRichText/isRangeWithinElement` kullanılır
  ([`BannerSection.tsx:7-12`](../apps/web/src/features/studio/modules/BannerSection.tsx#L7-L12)). Run-level renk köprüsü: `selectionchange`'de hücre-içi seçim singleton'a
  yazılır (`setActiveRange`); ContextualBar `BannerCellMode` `dispatchTextSetting` ile bunu okur,
  `resolveCellEl` hücreyi `cellDomId` üzerinden bulur. Hücre-seviyesi font: panellerde
  `TypographyPicker` → `updateSelectedCells({ font })`.
- **Run-vs-cell karar mantığı** ([`ContextualBar.tsx:51-92`](../apps/web/src/features/studio/contextual/ContextualBar.tsx#L51-L92)): `dispatchTextSetting`, `inSel` bayrağını hesaplar —
  yakalanmış singleton (`getActiveSession`) **ve** canlı seçim (`window.getSelection`) **ikisi de**
  non-collapsed ve bu hücrenin editable'ı içinde olmalı ([`:58-66`](../apps/web/src/features/studio/contextual/ContextualBar.tsx#L58-L66)). `inSel` true ve ayarın
  `apply`'ı bir `Range` döndürürse → **RUN-level**: hücre-içi metin aralığına uygulanır,
  re-segmentasyon yapılır, `commitRun` ile sanitize edilmiş HTML yazılır, aktif range yeniden
  kurulur ([`:75-82`](../apps/web/src/features/studio/contextual/ContextualBar.tsx#L75-L82)). Aksi halde → **CELL-level**: `applyCell(res)` (= `updateSelectedCells({ font })`)
  tüm hücreye uygulanır; run-capable property ise container patch + bu hücredeki run-override'ları
  `clearRun` ile temizler (atomik, tek Ctrl+Z) ([`:83-92`](../apps/web/src/features/studio/contextual/ContextualBar.tsx#L83-L92)). Özet: **aktif hücre-içi seçim (non-collapsed
  range) varsa run-level, yoksa cell-level.**
- **Seçim / isolation / lasso:**
  - Seçim `useUIStore`: `{ type:'bannerCell', ids:string[], parentId:slotId }` (çoklu seçim).
  - Modüle giriş = **izolasyon** (çift-tık → `enterIsolation`): yerel history yığını; çıkışta tek
    global adım olarak commit.
  - **Lasso:** sol-tık sürükle ile çoklu hücre seçimi; container `onMouseMove/Up/Leave` (React
    prop'ları, document listener değil); `commitLasso` `getBoundingClientRect` kesişimiyle eşleşen
    hücreleri seçer. Drag-out (modül dışına bırakma) seçimi korunur: `markDragGesture`/
    `consumeDragGesture` (`editorChrome.ts`) lasso jestini de kapsar → `#canvas` click `clearSelection`'ı
    atlar.
  - **Sağ-tık menüsü:** Hücreye sağ-tık → satır/sütun ekle-sil; `createPortal` ile body'ye
    (transform'lu `#canvas` içindeki fixed/clip sorununu aşar); tıklanan hücrenin `(sr,sc)`'sine
    göre store action'larını çağırır. Escape katmanlı (menü açıksa `stopPropagation` ile yalnız
    menüyü kapatır, kapalıysa izolasyondan çıkar).
  - **Resize handle'ları:** Sınır tutamaçları yalnız izolasyon modunda; merge-aware segmentli
    (`colBoundarySegments`/`rowBoundarySegments`) → merge içinde cursor yok. Drag store'a yalnız
    mouseup'ta yazar (tek snapshot).

---

## 6. Yeni Hazır Modül Türetme Checklist'i

Yeni bir hazır modül (şablon) eklerken **GridModule pattern'ini izle**:

**REUSE et (yeniden yaz değil):**
- [ ] **Motor:** Yapısal mutasyonları `gridMutate.ts` saf fonksiyonlarıyla yap (insert/delete/
      merge/split/resize). Merge mantığını elle yazma.
- [ ] **Nötr hücre:** `defaultXCell` tek-kaynak deseni (`defaultBannerCell` gibi) — hem init hem
      makeCell oradan beslensin (drift yok). Inline default-cell üretme.
- [ ] **Store sarmalayıcı:** `applyXMutation` paterni — sayfa çöz → motor → `withHistoryBatch` +
      `updateSlotModuleData(..., 'discrete')`. Atomik undo'yu elle kurma.
- [ ] **Scoped DOM id:** `cellDomId(slotId, cellId)` tek-kaynak; render + tüm lookup buradan.
      Scope'suz `getElementById` kullanma.
- [ ] **Atomik undo:** `withHistoryBatch` ile sar.
- [ ] **Yüzeyler tek-kaynak:** Tüm UI yüzeyleri aynı store action'larını çağırsın; kopya
      `resizeGrid`/mantık yazma.

**YAPMA (bilinen anti-patternler):**
- Merge mantığını yüzeyde inline yazmak (undo bug'ı, duplikasyon).
- Inline default-cell (stil sızıntısı + drift).
- Scope'suz DOM id (çoklu-modül çakışması).
- Kopya `resizeGrid` / clamp sabiti (sync-bug sınıfı).

**Bilinen tuzaklar (operasyonel):**
- **`oklch` renkler → `html2canvas-pro`:** Tailwind v4 tasarım token'ları `oklch()` renk değeri
  üretir; standart `html2canvas` `oklch()` parse edemez (canvas'a çizemez) → proje hem thumbnail
  hem JPG export yolunda **`html2canvas-pro`** kullanır (tek standart). Zincir: thumbnail
  [`thumbnailCapture.ts:1`](../apps/web/src/lib/thumbnailCapture.ts#L1) (`import html2canvas from 'html2canvas-pro'`; gerekçe yorumu [`:8-12`](../apps/web/src/lib/thumbnailCapture.ts#L8-L12)
  — "oklch/lab/color() destekler, Tailwind v4 token'ları oklch") · JPG export
  [`StudioPage.tsx:109`](../apps/web/src/features/studio/StudioPage.tsx#L109) (`handleDownloadJPG` [`:103`](../apps/web/src/features/studio/StudioPage.tsx#L103) içinde dinamik `import('html2canvas-pro')`).
- **Gemini token-dışı Tailwind class halüsinasyonu** **[OPERASYONEL NOT]**: Otomatik üretimde
  token-dışı (tasarım sistemine ait olmayan) Tailwind sınıfları uydurulabilir; yalnız tanımlı
  token'ları kullan.

---

## 7. Değişmez İlkeler

1. **Tek-kaynak (single source of truth):** Duplikasyon = sync-bug sınıfı. `defaultBannerCell`,
   `cellDomId`, `BANNER_DIM_MIN/MAX`, tek `gridMutate` motoru, tek `applyBannerMutation` — hepsi
   bu ilkenin örneği. Üç kopya `resizeGrid`/üç clamp sabiti/inline default-cell hep tek-kaynağa
   konsolide edildi.
2. **Root-cause, workaround yok:** Semptomu maskeleme; kök-nedeni düzelt (örn. lasso çakışması →
   scoped id; stil sızıntısı → mirassız nötr hücre).
3. **Saf motor + ince store sarmalayıcı ayrımı:** Geometri/merge mantığı saf, test edilebilir
   motorda (`gridMutate`); store yalnız sayfayı çözüp motoru çağıran + atomik-undo'yu yöneten ince
   katman. UI yüzeyleri mantık taşımaz.
4. **Empirik canlı-gate:** Statik gate (typecheck + build + Vitest) gerekli ama yeterli değil;
   greedy reflow / etkileşim davranışları tarayıcıda canlı doğrulanır.

---

*Bu belge `gridMutate.ts`, `types.ts`, `bannerDom.ts`, `fractions.ts`, `BannerSection.tsx`,
`catalog.store.ts`, `module-registry.ts`, `history.store.ts` koduna dayanır. Kod değiştikçe
güncellenmelidir; `[DOĞRULANMADI]` işaretli kısımlar netleştirilince işaret kaldırılmalıdır.*
