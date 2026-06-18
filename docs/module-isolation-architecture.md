# Modül İzolasyon Modu — Mimari Not

> **Amaç:** Slot içine konan, ürün-harici (free) modüllerin düzenlenmesini stüdyodan izole bir
> "düzenleme evrenine" almak. Illustrator'ın grup-izolasyon modu deseni: modüle gir → modül
> aktifleşir, dışarısı kilitlenir → sen çıkana kadar yalnız modülün içini düzenlersin → çıkışta
> tüm oturum tek bir geri-al adımı olur.
>
> **Bu not yalnızca izolasyon + undo TEMELİNİ kapsar.** Inline zengin metin (kelime-renk) ve
> Excel-vari hücre boyutlandırma AYRI veri-modeli işleridir, bu temelin ÜSTÜNE gelir, bu görevde
> KAPSAM DIŞI (bkz. §12). Görevi dar tutmak hata yüzeyini düşürür.
>
> **Durum:** UYGULANDI ve doğrulandı — `dev` üzerinde (commit `978c2b4`→`24eff34`: ADIM A temel,
> ADIM B UI bağlama, metin-undo + çıkış allowlist düzeltmesi, ADIM C Hızlı Bar). Doğrulama: store
> değişmezleri 27/27 headless + 5 senaryo canlı (Puppeteer, gerçek UI). §5 metin-undo, ilk taslaktaki
> "native bastır + onBlur-coalesce"dan SHIPPED gerçeğe (sınırlarda zorla `blur()` flush + imperatif
> ref re-sync + kaba whole-cell undo) revize edildi; §6 routing kapısı `isoSession`; §7 blocklist → allowlist.

---

## 1. Problem ve kök neden

Free modüller (banner/Tablo Alanı, pizza, gelecekteki serbest-tasarım alanı) hücre-ızgara
stüdyosunun *içinde* yaşar ama ondan **başka bir düzenleme domainidir**: kendi nesne modeli,
kendi etkileşimleri, kendi geri-al ihtiyacı var. Tek bir global undo yığınının hem kaba
sayfa-düzenini hem ince modül-içi düzenlemeyi taşıması bütün karışıklığın kaynağı.

Somut bug (**Y2**): modül-içi metin/stil değişiklikleri global history'ye **hiç** yazmaz. Native
`contentEditable` undo'su odak değişince sıfırlanır. Sonuç olarak global undo'nun modüle en yakın
kayıtlı adımı "modül eklendi"dir → modül içinde Ctrl+Z, modülü slottan **siler**.

**Kök çözüm:** Düzenleme sırasında global history'ye HİÇ dokunma; modüle özel yerel bir history
tut; çıkışta yalnız bir kez, tek atomik adım olarak global'e yaz.

---

## 2. Kapsam sınırı (aktivasyon yüklemi)

İzolasyon **yalnızca** şu koşulu sağlayan slot için açılır. Stüdyo modelinde slot rolü iki
değerlidir — `StudioSlotRole = 'product' | 'free'` (`packages/shared` studio types). `custom` /
`global` / `footer` eski/ayrı `SlotRole`'a (CanvasLayer modeli) aittir, stüdyoda **kullanılmaz**;
slot'un özel-lik durumu ayrı `isCustom` bayrağında tutulur. Bu yüzden dışlama tek koşula iner:

```ts
// Tek karar noktası — sınır burada, dağıtma. (catalog.store içinde)
function isIsolatableModule(slot: StudioSlot): boolean {
  return slot.role === 'free' && slot.moduleType != null && slot.moduleData != null;
}
```

- `moduleType` runtime'da `'banner' | 'pizza'` — ikisi de free aile. Gelecekteki her free
  `moduleType` bu yüklemi sağladığı için izolasyonu **otomatik** devralır (kategori bazlı, tip bazlı
  değil).
- **`FreeStudioModule` / `ProductStudioModule` slot ayırt edici DEĞİLDİR.** Bunlar kütüphane-örneği
  tipleridir (`modules/types.ts`, `applyStudioModule` girdisi); slotta saklanmazlar.
- **Ürün-sunuş modülleri ayrıca dışlanmaz:** onlar `product` rollü slotta yalnız `customSettings`
  ekler, free slotta hiç görünmezler. Yüklem `role === 'free'` ile zaten kapsam dışı bırakır.

---

## 3. Tek kaynak — mevcut `editingContent` genişletilir (YENİ ALAN YOK)

İzolasyon davranışı **yeni bir `isolationContext` alanından değil**, hâlihazırda var olan tek
alandan türetilir:

```ts
// ui.store — MEVCUT alan, izolasyonun ihtiyacını zaten karşılıyor
editingContent: { slotId: string; contentType: 'product' | 'banner' | 'pizza' } | null;
```

**"İzolasyon modu" = `editingContent != null && editingContent.contentType ∈ {banner, pizza}`.**
Yeni alan eklemiyoruz: `slotId` yeterli (yönlendirme `slotId`'e bakar; `pageNumber`'ı çağıran
geçirir; baseline/commit tüm `formas`'ı snapshot'lar). Notun ilk taslağındaki "sıfırdan yeni tek
kaynak" çerçevesi gerçeğe uymuyordu — `editingContent` zaten tek meşru alan; yasaklanan dağınık
`isEditingModule`/`activeModuleId` bayrakları yok.

### Kritik: product kolu DOKUNULMAZ
Product düzenleme bugün dim/gating **üretmez** — `editingContent('product')` yalnız `opacity-100`
verir; asıl metin düzenleme ayrı local `editingText` + `updateSlotProduct` (global undo) ile olur.
İzolasyon product'a "yalnız yerel-undo" eklemiyor; **dim + gating + seçim-scope + klavye-sahiplenme
+ yerel-undo'nun hepsini** ekliyor — ve bunların hiçbiri product'ta yok.

Bu yüzden mutlak kural: **izolasyon davranışlarının HEPSİ `contentType ∈ {banner, pizza}` ile katı
kapılanır; `'product'` kolu bugünkü hafif davranışıyla AYNEN korunur.** Aksi halde product
düzenlemeye dim/gating sızar = regresyon.

`editingContent` tek `slotId` taşır ve yeni giriş öncekini temizler; `StudioSlotRole` iki değerli
olduğu için product ve free slotlar ayrıktır → **eşzamanlılık yok**. İki-alan + senkron-kontratı
gereksizdi; tek alanla ilgili drift riski **inşa gereği** düşer.

---

## 4. Yaşam döngüsü (canlı yazım + çıkışta tek commit)

`updateSlotModuleData`, izolasyonda bile `moduleData`'yı **canlı** yazar (`setActivePages`).
Persist'te `partialize` yok → kayıt her an tutarlı (§11). Dolayısıyla notun ilk taslağındaki
"çıkışta `slot.moduleData = finalData`" adımı bu mimaride **no-op**'tur; gerçek commit, baseline'ın
global'e yazılmasıdır.

### Giriş (enter)
Tetik: izolasyona uygun slota giriş (free modül için giriş yolu §13'te — banner için açıkça
eklenmeli). `enterIsolation(slot, pageNumber)`:
1. `isIsolatableModule(slot)` doğrula; değilse no-op.
2. **Farklı bir slot zaten izoleyse, önce `exitIsolation()` (commit) çağır** — zamanlama-bağımsız
   garanti (§ Risk: modülden modüle geçiş).
3. **Tam baseline** yakala: `entryBaseline = clone(formas / tempPool / globalSettings / ...)`
   (mevcut `HistorySnapshot` şekli), yerel katmanda tut.
4. **Girişte `saveState` ÇAĞIRMA** (yoksa boş-oturum bile global'e +1 yazar → I2 ihlali).
5. `editingContent`'i banner/pizza koluna set et.
6. Yerel history'yi başlat.

### Düzenleme
Modül-içi tüm değişiklikler yerel history'ye işler; global history **dokunulmaz** (I1).

### Çıkış (exit)
Tetik: `Esc`, modül dışına tıklama, açık "Bitti", veya farklı modüle geçiş. `exitIsolation()`:
1. Odaktaki `contentEditable`'ın bekleyen metnini önce commit et — **programatik `blur()` ile
   zorla** (native blur, odaklanılamayan `<div>`'e tıklamada ateşlenmez; bkz. §5). `blur()` →
   `onBlur` → `updateCell`, `editingContent` HÂLÂ aktifken koşar → yerel snapshot + canlı yazım;
   sonra adım 2 kıyası metni içerir.
2. **Değişiklik kararı — tek otorite: yapısal eşitlik.** `isEqual(entryBaselineModuleData, finalModuleData)`:
   - **Eşit DEĞİLSE** → `entryBaseline`'ı global `past`'e it + `future` temizle (tek adım, "modül düzenlendi").
   - **Eşitse** → global'e hiçbir şey yazma (+0).
3. `editingContent = null`, yerel history'yi at.

**Değişiklik tespiti notu:** Karar **yapısal `isEqual`**'dur, dirty-flag KAPISI değildir.
`moduleData` tamamen serileştirilebilir olduğundan `isEqual`'in tek hata modu zararsız
yanlış-pozitiftir (gereksiz +1); kayıp yoktur. Dirty bayrağı arkasına gizlemek, ileride `moduleData`'yı
push'u atlayarak yazan yeni bir yol eklenirse commit'i sessizce atlar — o yüzden **kıyas tek ve nihai
otorite olmalı**. `JSON.stringify` KULLANMA (`clone`/`deepMerge` anahtar sırasını oynatıp gereksiz
+1 üretebilir); yapısal `isEqual` kullan.

---

## 5. Modüle-özel yerel history + metin commit (SHIPPED gerçek)

- İzolasyon oturumu boyunca yaşayan **geçici** snapshot yığını + işaretçi (`editingContent === null`
  iken yok).
- Snapshot içeriği: **`structuredClone(moduleData)`** — modül şeklinden **bağımsız**, opak blob.
  Banner/pizza/serbest-tasarım ayrımı YAPMAZ. Yeniden-kullanılabilirlik buradan gelir.
- Snapshot her anlamlı **commit'te** alınır (coalesce, tuş-başına DEĞİL): metin commit'i, yapısal
  değişiklik, renk/stil uygula. Global `saveState`'in 800ms coalesce mantığının yerel ikizi.
- Yerel undo en geriye **baseline'a kadar** gider, ötesine değil → modül asla silinemez (I3).

### Metin commit'i — neden `onBlur` yetmedi (empirik), ne yapıldı
İlk tasarım "native intra-edit undo'yu `preventDefault` ile bastır + metni `onBlur`'da coalesce et"
idi. **Canlı testte (Puppeteer) çürüdü:** `onBlur` normal etkileşimde ATEŞLENMİYOR — kullanıcı
odaklanılamayan bir `<div>`'e (yan hücre, kanvas boşluğu, başka slot) tıkladığında `contentEditable`
odağı korur, blur olmaz → `updateCell` hiç koşmaz → yerel snapshot oluşmaz → Ctrl+Z geri alacak şey
bulamaz; metin yalnız DOM'da kalır (store ile React `__html` izleği de ayrışır). Kök-neden: commit'in
hiç koşmaması (native-vs-local değil).

**SHIPPED çözüm — sınırlarda ZORLA flush + imperatif re-sync:**
- **Zorla `blur()` flush** üç sınırda: (a) `exitIsolation` (commit'ten önce), (b) TopBar izolasyon
  Ctrl+Z/Ctrl+Y (`isolationUndo/Redo`'dan önce), (c) **hücre-değişiminde** — `BannerSection` dış-tık
  listener'ı, `editingCellId`'i temizlemeden önce düzenlenen hücrenin DOM metnini doğrudan okuyup
  commit eder. Programatik `blur()` `onBlur`→`updateCell`'i güvenilir tetikler.
- **İmperatif ref re-sync:** hücre metin katmanında `dangerouslySetInnerHTML` **KALDIRILDI**; ref,
  düzenlenmiyorken `el.innerHTML = cell.text` ile DOM'u store'dan zorla hizalar (React `__html` diff'i
  elle değiştirilen DOM'u güncellemiyor; ayrıca aynı-tick flush+undo React'te batch'lenince `__html`
  değişmemiş görünüp DOM bayat kalıyordu). undo/redo/reseed sonrası hücreyi store'a kesin hizalar.
- **Kaba (whole-cell) undo:** izolasyon Ctrl+Z odaktaki hücreyi flush eder (commit + snapshot) sonra
  yerel yığında geri alır → bir Ctrl+Z hücrenin TÜM metin düzenlemesini geri alır (tuş-başına değil);
  native intra-edit undo'ya güvenilmez. İzolasyonda `preventDefault` yapılır; tek sahip TopBar
  handler'ı — **`BannerSection`'daki kaldırılmış ikinci Ctrl+Z listener'ı GERİ GETİRİLMEZ** (çift-undo).

---

## 6. Mevcut `history` mode altyapısıyla entegrasyon (paralel sistem KURMA)

Yönlendirme **`updateSlotModuleData` İÇİNDE** yapılır (ince sarmalayıcı DEĞİL). Doğrulandı: tüm
modül-data yazıcıları (`CellPanel`, `BannerSettingsPanel`, `PizzaSettingsPanel`, `ContextualBar`,
`BannerSection.updateCell`, `PizzaSection`) zaten bu aksiyondan geçiyor; tek noktada çözüm hepsini
kapsar. `catalog.store` zaten `useUIStore`/`useHistoryStore` import ediyor → yeni bağ yok.

```ts
updateSlotModuleData: (pageNumber, slotId, updates, history = 'none') => {
  // Kapı = AKTİF isoSession (editingContent VARLIĞI değil). isoSession yalnız enterIsolation ile
  // doğar; bu yüzden eski/doğrudan setEditingContent yolları (A→B geçişinde editingContent(banner)
  // kısa süre isoSession'sız var olabilir) routing'i ETKİLEMEZ → regresyon yok.
  const hist = useHistoryStore.getState();
  if (hist.isoSession && hist.isoSession.slotId === slotId) {
    hist.pushIsolationSnapshot();   // structuredClone(moduleData), coalesce'lı
  } else if (history === 'discrete') {
    hist.saveState(true);           // bugünkü davranış — KORUNUR
  }
  // ...setActivePages ile CANLI yaz (her durumda)...
}
```

**Kapı neden `isoSession`, `editingContent` değil:** ikisi shipped kodda eşdeğerdir — `editingContent`'in
free kolu (`banner`/`pizza`) ile `isoSession`, `enterIsolation`/`exitIsolation` tarafından **atomik**
set/clear edilir (§3 "eşleşme" değişmezi; ADIM B regresyonunda doğrulandı). Ama mekanizma
`isoSession`'dır: yerel snapshot/undo'nun sahibi odur ve yalnız `enterIsolation` onu kurar — böylece
izolasyon-dışı `setEditingContent` yolları yönlendirmeyi sızdırmaz.

İzolasyon dışı yol birebir korunur. "Modülü kaldır undo'ya yazmıyordu" düzeltmesindeki
`'discrete'`/`clearHistory` baseline mantığı bozulmaz.

---

## 7. Input gating & seçim daraltma

İzolasyondayken (banner/pizza kolu):
- Modül DIŞINDAKİ pointer/seçim olayları **bloklanır**; modülden uzağa tıklama "çıkış" (commit)
  tetikler.
- **Seçim guard'ı setter'ların İÇİNE konur** (çağrı sitelerine değil): `setSelection` /
  `toggleElementSelection`, hedef izole modülün dışındaysa (`parentId !== editingContent.slotId`)
  `bannerCell`/`textElement` seçimini reddeder; slot/page/background seçimini yok sayar. Mevcut
  panellerin değişmeden çalışması buna bağlı (I6/I7).
- **Pizza nüansı:** pizza hücreleri selection KULLANMAZ — `PizzaSection` iç hücreyi component-local
  edit state ile düzenler. Seçim-scope guard'ı banner için anlamlı; pizza için **input-gating
  (modül-dışı pointer bloğu + dim) yeterlidir**.
- Sayfa-mutasyonu kısayolları (slot sil, ızgara değiştir, forma gezinme) izolasyonda önce çıkışı
  (commit) tetikler ya da bastırılır.
- **Dış-tıklama→çıkış gating'i TEK YERDE (Canvas, capture-faz `mousedown`) ve ALLOWLIST ile** —
  blocklist DEĞİL. Tek pozitif koşul: çıkış YALNIZ tık `#studio-canvas-root` İÇİNE ama izole modül
  DIŞINA (`!#slot-<id>`) düştüğünde tetiklenir. Tüm krom (sol IconSidebar, üst bar, zoom, sağ panel,
  Hızlı Bar, picker'lar `document.body`'ye portal, sağ-tık menüsü) `#studio-canvas-root` DIŞINDA
  olduğundan hiçbiri çıkış tetiklemez — istisna listesi tutmaya gerek yok. (`BannerSection`'daki
  kısmi, banner'a-özel dış-tık efekti KALDIRILDI, buraya toplandı.)

---

## 8. Paneller & Hızlı Bar — yeniden kullanım, MİGRASYON YOK

- Sağ panel (`CellPanel` / `BannerSettingsPanel` / `PizzaSettingsPanel`) bugün `selection`'ı
  hedefliyor. Seçim izole modüle daraltıldığı için paneller **olduğu gibi** modülü düzenler.
  **Hiçbir ayar menüsü taşınmaz/çoğaltılmaz.**
- Panel yazımları da §6 yönlendirmesine tabidir (izolasyonda yerel, global sabit).
- **Hızlı Bar** "modül izole" bağlamı kazanır (mevcut "arkaplan/ürün-alanı/free-slot" bağlamlarının
  kardeşi). İzolasyon aktifken Hızlı Bar **YALNIZ bu kolu** gösterir: "<modül> düzenleniyor" çerçevesi
  + **"Bitti"** (→ `exitIsolation`). Banner'da hücre araçları (`BannerCellMode`) bu çerçevenin altında
  akar; modül-seviye ayarlar mevcut "Ayarlar"→sağ panelle erişilir (taşınmaz). Gelecekteki kelime-renk
  araçlarının UI'ı da buraya girer — ayrı modal yok. (Aracın *yeteneği* §12'de.)

---

## 9. Tek renderer ilkesi (zaten gerçek)

`Slot`, free slotta `slot.moduleData.type`'a göre `BannerSection` / `PizzaSection` render ediyor;
normal ve izolasyon modunda **aynı** bileşen. İkinci render yolu YASAK. İzolasyon yalnız bu
renderer'ın etrafına düzenleme tutamaçları + dim overlay ekler. Yerinde düzenleme olduğu için
gerçek ölçü/WYSIWYG zaten bedava.

---

## 10. Değişmezler (kabul kriterleri — Act'te self-verify)

- **I1.** İzolasyondayken global history uzunluğu DEĞİŞMEZ.
- **I2.** Değişiklikle çıkışta global history tam **+1**; değişiksiz çıkışta **+0**.
- **I3.** İzolasyonda Ctrl+Z modülü slottan ASLA silmez; yalnız baseline'a kadar geri alır.
- **I4.** Çıkıştan sonra global Ctrl+Z tüm oturumu **tek adımda** geri alır; **ardından global
  redo düzenlenmiş hale geri döndürür** (commit normal history girişidir, özel-kılıf yok).
- **I5.** Tek renderer: modül izolasyona girip-çıkarken görsel olarak **birebir aynı** (drift yok).
- **I6.** Seçim izole modülün dışına ASLA çıkamaz (banner). Pizza modül-dışı pointer ile korunur.
- **I7.** Mevcut paneller değişmeden çalışır; hiçbir panel UI'ı kopyalanmaz/taşınmaz.
- **I8.** Yalnız `role === 'free' && moduleType != null && moduleData != null` slotlar izolasyona
  girer; product hücreleri ve ürün-sunuş modülleri ASLA girmez.

---

## 11. Persistans — flush GEREKMEZ

`catalog.store` persist middleware'inde `partialize` yok → tüm state (canlı `moduleData`'lı
`formas`) yazılır; `serializeStudioState()` de canlı `formas`'ı okur. `updateSlotModuleData` canlı
yazdığı için kayıt her an tutarlı. Notun "flush before persist" şartı bu mimaride otomatik sağlanır;
ayrı flush kodu eklenmez. **Kayıt sırasında oturum zorla kapatılmaz** (düzenleme bölünmesin);
in-progress edit yalnız yerel yığında, global adım çıkışta oluşur (kayıt ≠ commit, I1/I2 ile uyumlu).

---

## 12. KAPSAM DIŞI (bu görevde YAPMA — ayrı işler)

Bu temel oturduktan SONRA, her biri ayrı görev olarak, aynı opak `moduleData` snapshot mekanizmasının
üstünde:
1. **Inline zengin metin (kelime-renk):** hücre metnini "run/span" modeline çevirme (`BannerCellData`
   şema yükseltmesi).
2. **Excel-vari hücre boyutu:** modül-data'ya per-kolon genişlik + per-satır yükseklik dizileri +
   sürükleme tutamaçları.

İkisi de izolasyon katmanına dokunmaz.

---

## 13. Dokunulacak yüzey (Act için harita)

- `apps/web/src/stores/studio/ui.store.ts` — `editingContent`'i izolasyon kolu olarak kullan;
  `enterIsolation`/`exitIsolation` (enter, farklı slot izoleyse önce commit-exit eder); seçim
  setter guard'ları.
- `apps/web/src/stores/studio/history.store.ts` — oturum-scoped yerel yığın (`pushIsolationSnapshot`,
  `isolationUndo/Redo` baseline'da durur), `commitIsolationBaseline(baseline)` (global `past`'e +1 +
  `future` temizle; mevcut undo/redo ile özdeş giriş). Mevcut `undo`/`redo` (canlı current'ı
  `future`'a iter) DEĞİŞTİRİLMEZ.
- `apps/web/src/stores/studio/catalog.store.ts` — `isIsolatableModule`; `updateSlotModuleData` §6
  yönlendirmesi. **Drop/apply doğrudan `moduleData` setState'i izolasyon AKTİFKEN çağrılırsa önce
  commit-exit etmeli** (aktif oturumu clobber etmesin).
- `apps/web/src/features/studio/canvas/Slot.tsx` — banner girişi **açıldı** (çift-tık + "Modülü
  düzenle"/`handleEditModule` → `enterIsolation`); product düzenleme yolu DEĞİŞMEDİ; izole modül dışı
  slotlar dim (`opacity .35`); drop/apply izolasyon aktifken önce commit-exit eder.
- `apps/web/src/features/studio/canvas/Canvas.tsx` — izolasyon **çıkış gating'i TEK YER**: capture-faz
  `mousedown` **allowlist** (`#studio-canvas-root` içi & `!#slot-<id>`) → `exitIsolation`.
- `apps/web/src/features/studio/topbar/TopBar.tsx` — Ctrl+Z/Ctrl+Y handler'ında izolasyon kontrolü;
  izolasyonda `preventDefault` + **odaktaki contentEditable'ı `blur()` ile flush** + `isolationUndo/Redo`;
  `Esc` → exit (commit). İkinci listener EKLENMEDİ.
- `apps/web/src/features/studio/modules/BannerSection.tsx` + `PizzaSection.tsx` — render/edit
  kapıları `editingContent`'in free-modül kolundan türetilir; ikinci Ctrl+Z listener geri getirilmedi.
  Banner metin katmanı: `dangerouslySetInnerHTML` **kaldırıldı** → imperatif ref re-sync; dış-tık
  listener'ı hücre-değişiminde DOM metnini doğrudan commit eder (§5).
- `apps/web/src/features/studio/contextual/ContextualBar.tsx` — "modül izole" bağlamı (izolasyonda
  tek-kol: "<modül> düzenleniyor" + **"Bitti"** → `exitIsolation`).
- `CellPanel.tsx` / `BannerSettingsPanel.tsx` / `PizzaSettingsPanel.tsx` — DEĞİŞMEZ (yalnız
  seçim-scope üzerinden çalıştığı teyit edilir).

> **Uygulama notu:** Bu mimari sözleşmedir; imzalar/fonksiyon adları doğrulanmış kod referanslarıyla
> hizalıdır ama Act'te tekrar teyit edilmeli. §10 değişmezlerini test planına çevir; her adımı (A→B→C)
> ayrı doğrula.
