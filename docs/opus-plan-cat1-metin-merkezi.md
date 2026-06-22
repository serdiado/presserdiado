# Opus Uygulama Planı — Cat 1: Metin Ayarları Merkezi Mimari (1.4→1.6)

> Otorite tasarım: `metin-ayarlari-merkezi-mimari.md`. Bu = fazlı yol haritası.
> Her faz: Opus **Plan** → review → **Act** → **diff'le doğrula** + empirik gate. Tek-görev iterasyon.
> Komut stili: intent + dosya çıpası (Opus'un kod erişimi var — implementasyonu yeniden yazma).

---

## FAZ 0 — Motor modeli kararı  **[ilk, kısa Plan-mode discovery]**
Çekirdek risk: run artık tek-property (renk) değil, çok-property (renk+font+punto+kalınlık+italik+altçizgi+üstçizgi+büyük-küçük). İki yol:
- **(A) span-surgery genişletme** — mevcut `normalizeRuns` extract/wrap/merge'ü çok-property'ye uzat. Artımlı; ama iç-içe span kombinasyonları katlanarak büyür → edge-case bug riski.
- **(B) per-segment re-segmentation** ⭐ ÖNERİ — hücre içeriğini `{text, style{}}` segment listesine parse et → range'i segment offsetlerine eşle → etkilenen segmentlere property yaz → bitişik-eşit-stil segmentleri minimal span'e coalesce ederek yeniden serialize et. **Flat invariant by-construction**, idempotent, read-back kolay, property sayısından bağımsız.
- Depolama yine constrained-HTML (span); B sadece **düzenleme-anı in-memory model** + parse/serialize köprüsü. Mevcut renk round-trip'i (`parseRunColor`) korunur.
- **Karar gerekçesi:** kök-doğru (B). A pilotta hız verir ama çok-property'de teknik borç biriktirir → senin ilkene aykırı.
- Opus Plan'da: `richText.ts` mevcut `normalizeRuns`/`applyRunColor`'ı oku, B'ye geçişin parse/serialize sınırını ve renk round-trip korumasını doğrula.

---

## FAZ 1 — Registry + motor genelleştirme
**Amaç:** tek merkez + çok-stil motor.
- **Registry** (yeni, örn. `textSettings/registry.ts`): her ayar bir giriş
  `{ id, label, control, property, runCapable, apply(ctx,value), read(ctx) }`
  `ctx = { surface, slotId, cellId, range? }`. `range` varsa + `runCapable` → motor (run); yoksa → cell-level property. `read(ctx)` kontrol yansıması için (seçim/hücre mevcut değeri; karışık → indeterminate).
- **Motor** (`richText.ts`, B modeli): `applyRunStyle(range, {property,value})` — color, fontFamily, fontSize, fontWeight, fontStyle, textDecoration(underline+line-through), textTransform(case). Flat by-construction.
- **Sanitizer**: allowlist genişlet — span style: color, font-family, font-size, font-weight, font-style, text-decoration; etiket: span/b/i/u/s/br. Commit sınırında (3 yüzey).
- **Test**: çok-property apply + normalize + idempotence + renk round-trip korunması + karışık-seçim read.
- **GATE (store-level):** vitest yeşil, typecheck/build temiz.

---

## FAZ 2 — Hızlı Bar paylaşılan metin bölümü (modülde)
**Amaç:** registry'den render eden, tüm bar modlarınca tüketilen tek bölüm — run-level.
- **Paylaşılan bileşen** (örn. `ContextualBar/TextStyleSection.tsx`): registry alt kümesinden **custom** kontroller — iki-A punto stepper (native input DEĞİL), custom font açılırı, kalınlık, B/I/U/S toggle, renk (`ColorOpacityPicker`), AA/Aa. Anchor: `ContextualBar.tsx:2515-2524`.
- **preventDefault hook** (`editorChrome.ts` `usePreserveEditorSelectionOnChrome`) tüm bölüme bağlı.
- **Read-back:** seçim değişince kontroller seçimin stilini gösterir (karışık → boş/indeterminate).
- **Bar modlarına bağla:** ürün modu + modül modu aynı bölümü render; moda-özel (ürün: zemin/çerçeve/köşe; modül: birleştir/ayır) ayrı kalır.
- **Picker konumu:** seçim rect'ini no-cover zone ver (`ColorOpacityPicker.tsx:640-651` smart-positioning'e).
- **EMPİRİK GATE (canlı):** her custom kontrolde seçim sağ-kalımı; çok-property run (renk+kalınlık+italik üst üste, doğru izole); read-back doğru; run-izolasyon (bir kelime ≠ komşu); tek Ctrl+Z; picker seçimi örtmüyor.

---

## FAZ 3 — Ürün yüzeyine yayılım (1.5, en zor)
**Amaç:** aynı bölüm+hook+motor ürün adında çalışsın.
- **innerText→HTML göçü:** commit `innerHTML` (şu an innerText `catalog.store.ts:1184`), render `dangerouslySetInnerHTML` + `!isEdit` ref-gate (children :1209), undo global `saveState`.
- Mevcut düz-metin adlar HTML olarak güvenli okunur; sanitize geçer.
- Per-slot clone-izolasyon (`updateSlotProduct` :1087-1097) → havuza sızma yok.
- **EMPİRİK GATE (canlı):** ürün adında run-stil; iki slotta aynı ürün → metinler bağımsız; havuz kaydı değişmiyor; undo global tek-adım; karışık-seçim read.

---

## FAZ 4 — Sağ Panel "Metin ayarları" → registry tam görünümü (1.6)
**Amaç:** tek-kaynağı kapat — sağ panel de aynı registry'den.
- Sağ panel "Metin ayarları" (Sidebar) registry **tam setini** render eder; cell-level uygular (ctx range'siz → tüm hücre/slot).
- Hızlı Bar (alt küme, run) + Sağ Panel (tam, cell) aynı registry tanımları → kontrol kodu tek yerde.
- **EMPİRİK GATE:** sağ panel cell-level, Hızlı Bar run-level, ikisi aynı registry; **kanıt: registry'ye yeni bir ayar ekle → sağ panelde belirir, alt kümeye seçince Hızlı Bar'da belirir** (single-source ispatı).

---

## Faz-üstü
- **Footer (cat 3):** ✓ GERÇEKLEŞTİ. Tasarım niyeti tuttu — footer host-slot arkıyla motora bağlandı, registry+motor footer'ı da besledi (run/cell + atomik undo bedava miras). Detay: [`footer-host-slot-architecture.md`](./footer-host-slot-architecture.md).
- **Kapsam dışı (post-pilot):** sağ panelden *sadece-seçime* detaylı ayar (kendi-seçim altyapısı); sistem-Excel clipboard; Animasyon/Konumlandır; Efektler pasif.
- **Her faz sonu:** diff'siz bitti yok.
