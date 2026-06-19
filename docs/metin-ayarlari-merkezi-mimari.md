# Metin Ayarları — Merkezi Mimari (KESİNLEŞMİŞ PLAN)

> Durum: TASARIM KİLİTLİ. Run-level rich-text notunun yerini alan, birleştirilmiş tasarım.
> İlke: **tek merkez, çok görünüm.** Metin ayarları tek yerde tanımlanır; Hızlı Bar + Sağ Panel + üç yüzey oradan beslenir.

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

## 3. KAPSAM — run vs cell (pilot: hafif yol)
- **Run-level** (renk, font, punto, kalınlık, B/I/U/S, büyük-küçük): SEÇİME uygulanır → motor span-sarar (§5). Hızlı Bar'dan, custom kontroller seçimi korur.
- **Cell-level** (satır/harf aralığı, küsurat, hizalama, saydamlık): TÜM HÜCREYE. Sağ panelden uygulanır, seçim gerekmez (panele tıklayıp text-edit'ten çıkmak sorun değil — hücre seçili kalır).
- **POST-PİLOT:** detaylı ayarı *sadece seçime* uygulamak (Canva tam paritesi) = "kendi-seçimine-sahip-olma" altyapısı (offset-tabanlı persist + custom highlight). Şimdilik DIŞARIDA.

## 4. CUSTOM KONTROLLER + preventDefault  **[neden floating düştü]**
Kök içgörü: tarayıcı contentEditable seçimi **focus**'a bağlı; focus giden her kontrolde ölür.
- **Native form kutusu** (font-size input, native select) → odak ALMAK ZORUNDA → seçim ölür. ÇÖZÜLEMEZ.
- **Custom/odak-çalmayan kontrol** (iki-A stepper = buton, custom font açılırı, swatch, B/I/U/S butonları) + `usePreserveEditorSelectionOnChrome` hook'u (chrome mousedown'ında preventDefault, native input HARİÇ) → seçim YAŞAR.
Bu yüzden: run-level kontroller HEPSİ custom olmalı. Ayrı "floating çubuk" GEREKMEZ — Hızlı Bar (üst, Canva gibi) custom kontrollerle yeterli. (Floating fikri bu nedenle düştü.)

## 5. MOTOR (değişmez çekirdek — `richText.ts`)
- Run = `text` HTML'i içinde inline `<span style="color: …">` (constrained-HTML; opacity color'a rgba ile gömülü). Ayrı run-array YOK.
- `applyRunStyle(range, {property,value})`: extract → iç-stil temizliği → wrap → `normalizeRuns` (flat invariant: bare/wrapper-unwrap, nesting-düzleştir, bitişik-merge, boş-temizle). Renkten **herhangi bir inline stile** (font/punto/kalınlık/italik/altçizgi) genelleşir.
- Sanitizer: DOMPurify, sıkı allowlist (span/b/i/br + style→color). Commit sınırında. (Mevcut XSS açığını da kapatır.)
- Edit-time `!isEdit` ref-gate korunur → re-render contentEditable'ı clobber etmez.

## 6. PER-YÜZEY TESİSAT (motor + registry ortak; yalnız depolama/commit farklı)
- **Modül:** `cell.text` zaten innerHTML; izolasyon-commit (tek-adım undo). Çoğu hazır.
- **Ürün:** `slot.product.name` (per-slot, clone-izole → sızma yok). **innerText→HTML göçü** gerekir (commit→innerHTML, render→dangerouslySetInnerHTML). Undo: global `saveState`. En zor yüzey.
- **Footer:** cat-3 motor-birleştirmesiyle banner motoruna katılır → run-level + undo'yu miras alır (mevcut footer saveState açığı orada yapısal kapanır).

## 7. YAYILIM SIRASI
1. Registry iskeleti + motor genelleştirme (renk→çok-stil).
2. Hızlı Bar paylaşılan metin bölümü (custom kontroller: iki-A + custom font açılırı + B/I/U/S + renk + büyük-küçük) + preventDefault hook → **modül** (çoğu hazır).
3. **Ürün** (innerText→HTML göçü) → aynı bölüm + hook.
4. **Footer** (cat-3 motor-birleştirme).
5. Sağ Panel "Metin ayarları" → registry'nin tam görünümü olarak bağlanır (cell-level uygular).

## 8. KAPSAM DIŞI (post-pilot)
- Kendi-seçime-sahip-olma altyapısı (sağ panelden sadece-seçime detaylı ayar).
- Sistem-Excel clipboard interop. Animasyon, Konumlandır. "Efektler" pasif (ileride).

## Bulgu çıpaları
- Genel/özel: `globalSettings` studio.ts:94-130, granüler `customSettings` DeepPartial, merge Slot.tsx:309-312. İçerik daima per-slot.
- Modül commit innerHTML BannerSection:336; ref-gate :315-334. Ürün slot.product clone-izole catalog.store.ts:1087-1097, render children :1209, commit innerText :1184. Footer updatePageFooterCells saveState YOK :552-574.
- ColorOpacityPicker agnostik :596-605, data-color-picker-popup. editorChrome.ts: usePreserveEditorSelectionOnChrome (mevcut, modülde bağlı).
- Sanitize: DOMPurify ^3.4.11 eklendi.
