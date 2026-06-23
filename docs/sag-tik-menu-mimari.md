# Sağ Tık Menüsü — Mimari Belge

> Durum: KARARLAŞTIRILDI · Uygulama bekliyor.
> Kapsam: Stüdyo kanvasındaki tüm sağ tık (context menu) davranışları.
> İlgili kod: `apps/web/src/features/studio/canvas/Page.tsx` (mevcut menü),
> `apps/web/src/features/studio/contextual/ContextualBar.tsx` (hızlı bar — dil ortaklığı),
> `apps/web/src/stores/studio/catalog.store.ts` (action'lar).

---

## 1. Temel Model — İki Katman

Menü iki mantıksal katmandan oluşur:

- **KALICI katman:** Seçim ne olursa olsun anlamlı olan, her bağlamda aynı yerde
  duran aksiyonlar. Pratikte yalnızca **Stil Kopyala / Yapıştır**. Desteklemeyen
  bağlamda pasif görünür.
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

- **Kırmızı:** yalnızca **"Varsayılana Sıfırla" (Dal 5)**.
- **Nötr (kırmızı DEĞİL):** Hücreyi Boşalt (havuza gider), Modülü Kaldır (ürün hücresine
  döner), Sil (Ctrl+Z var). Hepsinin geri dönüşü olduğu için kırmızı enflasyonu yapılmaz.

(Renk Sistemi dokümanı ile uyumlu: kırmızı = yıkıcı aksiyon + hata; vurgu/dekorasyon değil.)

---

## 4. İsimlendirme İlkesi

Etiketler kısa + acemi-anlaşılır. Soyut kavram (özel/genel ayar) kısa etiket +
hızlı bar tooltip ile çözülür; her şey etikete sıkıştırılmaz. Hızlı bar ile sağ tık
**aynı kelime ailesini** paylaşır (birebir aynı string şart değil — toggle vs tek-satır
farkı nedeniyle zaten mümkün değil).

---

## 5. Dallar (sıralı, isimli, renk-kararlı)

### Dal 1 — Boş slot (ürün rolü, içi boş)
```
Modül Ekle
Ürün Ekle
─────────────
Hücreleri Birleştir        (çoklu seçimde aktif)
Özel Ayar Yap              (hücre genelse) / Genele Dön (hücre özelse)
─────────────
Stil Kopyala
Stil Yapıştır
```
Yıkıcı yok — boş hücrede silinecek içerik yok.

### Dal 2 — Ürünlü slot
```
Modül Ekle
Ürünü Değiştir
─────────────
Hücreleri Birleştir        (çoklu seçimde aktif)
Özel Ayar Yap / Genele Dön
─────────────
Stil Kopyala
Stil Yapıştır
─────────────
Hücreyi Boşalt             (güvenli — kırmızı DEĞİL)
```

### Dal 3 — Birleşik slot
```
Modül Ekle
─────────────
Hücreleri Ayır
Özel Ayar Yap / Genele Dön
─────────────
Stil Kopyala
Stil Yapıştır
─────────────
Hücreyi Boşalt             (içi doluysa aktif — güvenli)
```
Not: "Hücreyi Boşalt" birleşimi BOZMAZ; yalnız içeriği havuza atar. Ayırma ayrı aksiyon.

### Dal 4 — Modül / banner slot (free rolü, modüllü)
```
Modülü Değiştir
Modülü Kaldır              (modül silinir → boş ürün hücresine döner)
─────────────
Stil Kopyala
Stil Yapıştır
```
Özel/Genel YOK — modüllü hücre zaten özel ayarlıdır.

### Dal 5 — Footer hücre (seçim modu)
```
Özel Ayar Yap / Genele Dön
─────────────
Varsayılana Sıfırla        (KIRMIZI — geri dönüşü zor)
```
(Stil Kopyala/Yapıştır YOK — §6 "ertelenmiş" notu: footer stili canlı düzenlenir, ayrı clipboard yok.)

### Dal 6 — Footer edit modu (izole, iç hücre)
```
Düzenle
─────────────
Hücreleri Birleştir        (çoklu seçimde aktif)
Hücreleri Ayır             (birleşik hücrede aktif)
─────────────
Sil                        (güvenli — Ctrl+Z var, kırmızı DEĞİL)
```
(Stil Kopyala/Yapıştır YOK — §6 "ertelenmiş" notu.)

### Dal 7 — Sayfa zemini (mevcut yapı)
```
Zemin Rengi
Zemin Görseli
─────────────
Stil Kopyala
Stil Yapıştır
─────────────
Zemin Ayarları
```
Genel/Özel YOK — zeminde mod sistemi henüz yok (ayrı epic). Yıkıcı yok.

### Dal 8 — Metin-edit modu (hücre içi metin düzenleme aktif)
```
Kes
Kopyala
Yapıştır
```
Tek grup. Native Clipboard API ile çalışır — store action DEĞİL. Banner ve footer
metin düzenlemede aynı şekilde geçerli. (Sistem sağ tık menüsü kapalı olduğundan
native kopyala/yapıştır kaybı bu dalla telafi edilir.)

---

## 6. Action Eşleştirme

| Aksiyon | Store action | Durum |
|---|---|---|
| Modül Ekle | `setSlotModule()` (rol dönüşümünü kendi yapar) | VAR |
| Ürün Ekle / Ürünü Değiştir | `setSidebarState('products')` | VAR |
| Modülü Değiştir | `setSlotModule()` (modül-tip seçimi) | VAR |
| Modülü Kaldır | `toggleSlotRole('product')` | VAR |
| Hücreleri Birleştir | `mergeSelected()` | VAR |
| Hücreleri Ayır (slot) | `unmergeSlot()` | VAR |
| Özel Ayar Yap / Genele Dön (slot) | `toggleSlotCustomSettings()` | VAR |
| Özel Ayar Yap / Genele Dön (footer) | `setPageFooterMode()` | VAR |
| Stil Kopyala/Yapıştır (slot) | `copySlotSettings` / `pasteSlotSettings` | VAR |
| Stil Kopyala/Yapıştır (footer) | — *(ayrı clipboard action'ı yok — **ertelendi**, aşağıdaki nota bkz.)* | ⏸ |
| Stil Kopyala/Yapıştır (zemin) | `copyBackground` / `pasteBackground` | VAR |
| Footer Birleştir / Ayır | `mergeBannerCells(slotId, cellIds)` / `splitBannerCell(slotId, anchorId)` | VAR |
| Footer Düzenle | edit-mode tetikleme (çift tık → `enterIsolation`) | VAR |
| Footer Sil | `clearBannerCells(slotId, cellIds)` (Del tuşu yolu) | VAR |
| Zemin Rengi / Görseli | ilgili picker'ı aç | VAR |
| Zemin Ayarları | `setSidebarState('design','background')` | VAR |
| Kes / Kopyala / Yapıştır (metin) | native Clipboard API | — |
| **Hücreyi Boşalt** | **`clearSlotToPool()`** | 🆕 |
| **Varsayılana Sıfırla** | **`resetFooterToDefault(scope)`** | 🆕 |

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
Tüm "Temizle / Boşalt" çağrıları — sağ tık, ContextualBar, sağ panel — **tek action**
(`clearSlotToPool`) kullanır. Şu an `clearSlot` ürünü YOK EDİYOR (yanlış davranış);
düzeltme sonrası her yer havuza atar. Tek yerden değişiklik → her yer birden değişir.
İsim farklı görünebilir ("Temizle", "Hücreyi Boşalt") ama arkadaki action aynıdır.

---

## 8. Mimari Hedef — Veri-Driven Menü

Mevcut menü `selection.type`'a göre JSX içinde elle if/else dallarıyla yazılıyor; her
yeni tip elle dal açmayı gerektiriyor, tutarsızlık riski taşıyor.

Hedef: her aksiyon bir veri tanımı —
`{ id, etiket, ikon, görünürlük-koşulu, tehlikeli mi, grup }`. Menü, mevcut seçime göre
bu tanımları filtreleyip render eder. Yeni aksiyon = listeye bir satır; JSX'e dokunma.
Tutarlılık (renk, divider, sıra) otomatik. Bu, `ModuleRegistry` ve token sisteminin
deseni: **tek tanım kaynağı, render onu yorumlar.**

---

## DOKUNMA (invariant'lar + izolasyon sınırları)

- **Renk kuralı invariant:** Kırmızı yalnızca geri-dönüşü-zor eylemde. Yeni yıkıcı
  aksiyon eklenince varsayılan NÖTR; kırmızı için "havuz/undo yok mu?" testi geçilmeli.
- **Sıralama formülü invariant:** Oluştur → Dönüştür → [div] → Stil → [div] → Yıkıcı.
  Yeni aksiyon doğru gruba girer; yıkıcı her zaman en altta.
- **Tek-action invariant:** "Boşalt/Temizle" her yerde `clearSlotToPool`. Asla ikinci
  bir "temizle" action'ı türetilmez. `clearSlot` geri eklenmez.
- **Serbest alan gizli kalır:** Modül ekleme otomatik `free` dönüşümü yapar; kullanıcıya
  "serbest alan yap" aksiyonu SUNULMAZ.
- **Metin dalı izolasyonu:** Dal 8 native Clipboard'dır; store'a/persist'e girmez.
- **Hızlı bar ↔ sağ tık dil ortaklığı:** Aynı kavram aynı kelime ailesiyle. Biri
  değişince diğeri gözden geçirilir.
- **Footer "Hücreyi Boşalt" ≠ "Ayır":** İçerik temizleme birleşimi bozmaz; ayrı aksiyonlar.
