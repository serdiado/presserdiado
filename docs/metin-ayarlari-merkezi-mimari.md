# Metin Ayarları — Merkezi Mimari (KESİNLEŞMİŞ PLAN)

> Durum: **Faz 1–4.1 SHIPPED + push'lu** (motor → modül → ürün → sağ panel tek-kaynak; cell/run property-scoped; atomik undo; italik). Footer (cat-3) bekliyor.
> İlke: **tek merkez, çok görünüm.** Metin ayarları tek yerde (registry) tanımlanır; Hızlı Bar + Sağ Panel + yüzeyler oradan beslenir.
> Bu not shipped gerçeğe senkronludur (§3 davranış sözleşmesi + §SHIPPED mekanizmalar kanonik).

## 0. Neden bu mimari
Metin ayarları bugün birden çok yerde bağımsız (Hızlı Bar alt kümesi, Sağ Panel tam seti, yüzey-yüzey farklar). Hedef: tek tanım, kopya yok, yeni ayar eklemek tek yerde.

## 1. MERKEZ — text settings registry  **[ÇEKİRDEK]**
Her metin ayarı **bir kez** tanımlanır:
- `control`: kontrol UI'ı (custom — native değil; bkz §4)
- `property`: hangi stil (color, fontFamily, fontSize, fontWeight, fontStyle, textDecoration, lineHeight, letterSpacing, align, …)
- `scope`: `run` (seçime uygulanabilir) | `cell` (yalnız tüm hücre)
- `apply(target, value)`: `target` = seçim aralığı (run) veya hücre (cell)

Registry kanonik kaynaktır. Ayar eklemek = registry'ye bir giriş → her görünüm otomatik alır.

## 2. GÖRÜNÜMLER (hepsi registry'den render)
- **Sağ Panel "Metin ayarları"** = TAM set (font, kalınlık, punto, satır, harf aralığı, küsurat, yatay/dikey, AA/Aa/U, renk & saydamlık).
- **Hızlı Bar metin bölümü** = registry'den seçili ALT KÜME (font, punto[iki-A], kalınlık, B/I/U/S, renk, büyük-küçük). Tüm bar modlarınca (ürün modu, modül modu, footer) ortak tüketilir — moda özel kalanlar (ürün: zemin/çerçeve/köşe; modül: hücre birleştir/ayır) ayrıdır, paylaşılmaz.
- **Üç yüzey** (modül/ürün/footer) aynı registry + motoru kullanır.

## 3. KAPSAM — run vs cell (DAVRANIŞ SÖZLEŞMESİ, shipped)
**Tetikleyici = metin alt-seçimi var mı:**
- **Alt-seçim VAR** (metne gir, kelime seç) → **run-level:** yalnız seçime inline span override. [Hızlı Bar]
- **Alt-seçim YOK** (kutu seçili / sadece caret / sağ panel) → **cell-level, PROPERTY-SCOPED:** uygulanan property X tüm metne (container) uygulanır **VE** bu hücrede X'in run-override'ları **temizlenir** (`clearRunProperty`) → metin container'ı izler. **Diğer run property'leri korunur** (X=renk uygula → run renkleri silinir ama run italik/altçizili durur).
- **Box-mode Hızlı Bar ≡ Sağ Panel:** kutu seçiliyken Hızlı Bar da cell-level çalışır; ikisi de container okur → **read-back senkron**.
- **genel/özel:** container yazımı genel→global (tüm genel slotlar), özel→slot-custom. **Strip per-SEÇİLİ-hücre** (diğer genel slotların run'ları toplu silinmez — her biri ona uygulanınca döner).
- Cell-only property'ler (satır/harf aralığı/küsurat/hizalama): yalnız container, run yok → strip atlanır.
- **POST-PİLOT:** sağ panelden *sadece-seçime* detaylı ayar (kendi-seçim altyapısı) = DIŞARIDA.

## 4. CUSTOM KONTROLLER + preventDefault  **[neden floating düştü]**
Kök içgörü: tarayıcı contentEditable seçimi **focus**'a bağlı; focus giden her kontrolde ölür.
- **Native form kutusu** (font-size input, native select) → odak ALMAK ZORUNDA → seçim ölür. ÇÖZÜLEMEZ.
- **Custom/odak-çalmayan kontrol** (iki-A stepper = buton, custom font açılırı, swatch, B/I/U/S butonları) + `usePreserveEditorSelectionOnChrome` hook'u (chrome mousedown'ında preventDefault, native input HARİÇ) → seçim YAŞAR.
Bu yüzden: run-level kontroller HEPSİ custom olmalı. Ayrı "floating çubuk" GEREKMEZ — Hızlı Bar (üst, Canva gibi) custom kontrollerle yeterli. (Floating fikri bu nedenle düştü.)

## 5. MOTOR (`richText.ts`) — RE-SEGMENTATION (shipped)
- Run = `text`/`name` HTML'i içinde inline `<span style="…">` (constrained-HTML; opacity color'a rgba ile gömülü). Ayrı run-array YOK. Depolama HTML; re-segmentation yalnız düzenleme-anı in-memory model.
- **Model B = re-segmentation** (span-surgery DEĞİL): `parseCell`→`{text,style}|{br}` segment listesi → offset böl → `applyPatch` → `coalesce` → `serializeSegments`. Flat by-construction. `applyRunStyle(cellEl, range, {property,value})` → restore-range; `readRunStyle`→value|MIXED|undefined.
- **`clearRunProperty(html, X)`** (cell-level strip): parse → tüm segmentlerden `style[X]` sil → coalesce → serialize. color→color+opacity birlikte; underline/lineThrough ortogonal (biri silinince diğeri durur).
- Property set: color(+opacity), fontFamily, fontSize, fontWeight, fontStyle(italic), underline, lineThrough, textTransform. `applyRunColor` ince geri-uyum wrapper.
- Sanitizer: DOMPurify, allowlist span/b/i/u/s/br + style→color/font-*/text-decoration/text-transform. Commit sınırında.
- Edit-time `!isEdit` ref-gate. **Ürün render tuzağı:** `textContent` karşılaştırması HTML→düz strip'i yakalamaz → `data-rt-synced` dataset-marker ile saklanan-ad string'i izlenir (banner innerHTML-karşılaştırma deseninin ürün karşılığı; `&`-entity sonsuz döngüsü de önlenir).

## 6. PER-YÜZEY TESİSAT (shipped durum)
- **Modül (banner hücresi):** `cell.text` innerHTML; izolasyon-local undo. ✓ SHIPPED.
- **Ürün adı:** `slot.product.name` (per-slot, clone-izole → sızma yok). innerText→HTML göçü ✓; render = imperatif ref-sync (`data-rt-synced`, dangerouslySetInnerHTML DEĞİL). Undo: global. ✓ SHIPPED.
- **Footer:** cat-3 motor-birleştirmesiyle banner motoruna katılacak → run/cell + atomik undo + clearRunForSurface'i miras alır (footer saveState açığı orada kapanır). BEKLİYOR.
- **Fiyat (price):** hâlâ innerText (Faz 3'te ertelendi); simetrik göç sonraki tur.

## SHIPPED MEKANİZMALAR (Faz 1–4.1 — kanonik referans)
- **`dispatchTextSetting(adapter, def, value)`** (ContextualBar): modül+ürün ortak; run→`applyRunStyle`+restore-range, cell→`applyCell`(container patch) + `runCapable` ise `clearRun`(strip). Adapter = `{resolveCellEl, commitRun, applyCell, clearRun, matchesSession}` (fold #1, tek-kaynak).
- **`clearRunForSurface(surface, slotId, cellIds, property)`** (`textSettings/cellApply.ts`): cell-level strip — hem Hızlı Bar adapter `clearRun` hem sağ panel `onClearRun` aynı helper'ı çağırır (tek-kaynak).
- **`withHistoryBatch(fn)`** (`history.store.ts`): **atomik undo.** Ön-snapshot/route tahmini YOK — "first-write-captures": batch içindeki ilk iç `saveState`/`pushIsolationSnapshot` forced çeker (kendi route'uyla: ürün→global, banner→iso), sonrakiler `batchPending` ile bastırılır. → cell-level (container+strip) **tek Ctrl+Z**, ara-durum yok. **Undo-gruplama (slider/picker per-tık) için yeniden kullanılır.** Unit-test'le kilitli.
- **`TypographyData.fontStyle?` (additive):** italik cell-capable; render `util/style.ts` + `BannerSection` inline. U/S cell-level `textDecoration` tek enum → **karşılıklı dışlayan** (run-level bağımsız).
- **Tek-kaynak KAPANDI:** sağ panel = `TypographyPicker` (7 yüzeyde paylaşılan — ürün adı, fiyat, badge, banner hücresi, footer, global fiyat, banner modül). Registry-driven yapılınca tüm yüzeylerde tek tanım; çağıranların genel/özel/global/slot onChange wiring'i korunur (registry cell apply PURE).
- **Custom kontroller + `usePreserveEditorSelectionOnChrome`** (run-level seçim korur); cell-level native kontrol serbest (seçim gerekmez).

## 7. YAYILIM SIRASI (durum)
1. ✓ Registry + motor (re-segmentation, çok-stil) — Faz 1
2. ✓ Hızlı Bar paylaşılan bölüm + custom kontroller + hook — modül — Faz 2
3. ✓ Ürün (innerText→HTML göçü) — Faz 3
4. ✓ Sağ Panel registry tam görünümü (TypographyPicker) + cell-level property-scoped + atomik undo + italik — Faz 4 / 4.1
5. ☐ **Footer (cat-3 motor-birleştirme)** — sıradaki büyük blok (cat 2 mini-excel veya cat 3 footer)

## 8. KAPSAM DIŞI / ERTELENMİŞ
- **Undo-gruplama:** slider/artımlı kontroller + **renk seçici (her tık ayrı undo)** her adımı ayrı history yazıyor; doğrusu = kapanışta/`onChangeEnd`'de tek commit → `withHistoryBatch` ile picker oturumunu tek batch'e sar. **Altyapı hazır**, ayrı tur.
- **editorChrome helper konsolidasyonu** (footer cat-3): `isProtectedChromeEscape` + `consumeTextDragGesture` üç yüzeyde birleşecek.
- **Fiyat (price) innerText→HTML göçü** (ürün-adı simetriği).
- **U/S cell-level birlikte** (TypographyData.textDecoration enum genişletme) — gerekirse.
- **Toplu run-reset** (tüm genel slotların run'larını tek seferde sıfırla) — gerekirse.
- Kendi-seçime-sahip-olma (sağ panelden sadece-seçime detaylı ayar); sistem-Excel clipboard; Animasyon/Konumlandır; Efektler pasif.

## Bulgu / dosya çıpaları (shipped)
- Motor: `modules/richText.ts` (parseCell/applyRunStyle/readRunStyle/clearRunProperty/serializeSegments + sanitizeRichText).
- Registry: `textSettings/registry.ts` (run-capable + cell-only girişler), `types.ts`, `cellApply.ts` (clearRunForSurface).
- Bar: `contextual/ContextualBar.tsx` (dispatchTextSetting + adapter), `contextual/TextStyleSection.tsx` (custom kontroller, read-back).
- Sağ panel: `pickers/TypographyPicker.tsx` (registry-driven, 7 yüzey paylaşımlı), `panels/CellPanel.tsx` (onClearRun threading).
- Undo: `stores/studio/history.store.ts` (`withHistoryBatch` first-write-captures) + `history.store.test.ts`.
- Ürün: `canvas/Slot.tsx` (innerText→HTML, `data-rt-synced` ref-sync, `usePreserveEditorSelectionOnChrome`, drag-out `consumeTextDragGesture`). Render-strip `util/style.ts` + `BannerSection.tsx` (`fontStyle`).
- Hook: `util/editorChrome.ts` (usePreserveEditorSelectionOnChrome + consumeTextDragGesture + picker-escape).
- genel/özel: container onChange çağıranda (setGlobalSettings / updateSlotCustomSettings); run-HTML per-slot.
- Marker: `[data-rt-editable]` (read-back kaynağı, modül+ürün), `[data-color-picker-popup]` (picker-escape/guard muafiyeti).
- Sanitize: DOMPurify ^3.4.11.
