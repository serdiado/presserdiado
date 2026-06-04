# Presserdiado — Bağımsız UX/UI Değerlendirme Raporu

*Dış denetim bakışı. Projenin kendi standart dökümanlarından bağımsız; yalnızca evrensel kullanılabilirlik ilkeleri (Nielsen sezgiselleri, Fitts/Hick/Jakob yasaları, Gestalt, WCAG 2.2 AA) ve sektör benchmark'ları (Canva, Adobe Express, Vistaprint Studio, Figma, Shopify admin) temel alınmıştır.*

**Değerlendirilen ekran:** Stüdyo açılış görünümü, boş forma (4×4 grid, 2 sayfa), hiçbir ürün yüklenmemiş.

**Hedef kullanıcı önceliği:** Önce KOBİ/esnaf (yardımsız ortalama broşür tasarlayıp sipariş verebilmeli), sonra ajans/freelancer (daha derin araçlara erişmeli).

**Kusur ölçeği:** 🔴 Kesinlikle düzeltilmeli · 🟡 Düzeltilse iyi olur · ⚪ Opsiyonel · ✅ Doğrulanmış / kabul edilmiş

---

# BÖLÜM I — Arayüz Değerlendirmesi

## Yönetici Özeti

İskelet sağlam: panel mantığı tanıdık, sağ sekme yapısı net, Excel akışı ve yeşil geri bildirimler iyi. Ancak ürün **acemi kullanıcıyı ilk 10 dakikada yalnız bırakıyor** ve **hızlı erişim barı bir profesyonelin bile gözünü yoruyor.** En kritik üç eksen: (1) açılışta yönlendirme/boş-durum yokluğu, (2) bağlamsal barın aşırı yükü ve karışık etkileşim metaforu, (3) nihai dönüşüm aksiyonu olan "İndir"in görsel olarak vurgusuz olması.

Genel his: araç pro kullanıcıya göre tasarlanmış, sonra "acemi de kullansın" diye etiketler eklenmiş gibi. Öncelik KOBİ ise, varsayılan görünümün daha az şey gösterip daha çok yönlendirmesi gerekir.

---

## 1. Üst Bar

**Görülen:** Solda `GÖRÜNÜM: Forma 1 (Kapaklar)` açılır menüsü; sağda Geri / İleri / zoom %100 / Proje / İndir / tema (güneş) ikonu.

🔴 **"İndir" nihai dönüşüm aksiyonu ama vurgusuz.** Bu üründe kullanıcının yolculuğu baskı siparişi/çıktı ile biter — "İndir" (veya "Siparişi Tamamla") ekrandaki en önemli buton. Şu an "Proje" ile aynı görsel ağırlıkta, nötr. Benchmark: Canva ve Vistaprint sağ üstte belirgin **dolu renkli** bir indirme/paylaşma CTA'sı tutar. Görsel hiyerarşi ilkesi: en önemli aksiyon en güçlü kontrast.

🟡 **Geri / İleri metinle ve soluk.** Undo/Redo evrensel olarak ikon (↶ ↷) ile gösterilir — dilden bağımsız, daha az yer kaplar, tanıdık. Metin hâli hem yeri işgal ediyor hem aktif/pasif durumu belirsiz. Nielsen: sistem durumunun görünürlüğü.

🟡 **`GÖRÜNÜM:` büyük harf etiket.** Tümü büyük harf tarama hızını düşürür. Üstelik bu açılır menünün ne yaptığı (sayfa/forma gezintisi) acemi için net değil; bir mikro-etiket veya ikon yardımcı olur.

🟡 **Zoom "100%" tıklanabilir mi belirsiz.** Sadece gösterge mi, dropdown mı, +/− kontrolü mü? Sektörde zoom genelde `−  100%  +` ya da tıklanınca açılan liste olarak sunulur. Affordance eksik.

⚪ **Tema (güneş) ikonu.** KOBİ önceliğinde öncelikli değil; sağ üstte yalnız ikon kabul edilebilir, tooltip'i varsa sorun yok.

---

## 2. Hızlı Erişim Barı (bağlamsal araç çubuğu)

**Görülen:** `Genel Ayar [⇄] Özel Ayar` · ☐ Zemin · ☐ Çerçeve · Köşe · Görseli Taşı · Görsel Boyutu ▾ · Birleştir (soluk) · Modül Ekle · **Temizle** (kırmızı) · Ayarlar — tek satırda.

🔴 **Bilişsel aşırı yük (Hick yasası).** Tek bir şeritte 10+ kontrol var ve tek bir hücre seçiliyken bile hepsi görünüyor. Karar süresi seçenek sayısıyla artar. Benchmark: Canva bağlamsal toolbar tipik olarak **4–6** en sık aracı gösterir, gerisini "Daha fazla (…)" altına alır. Acemi kullanıcı bu barda boğulur.

🔴 **Karışık etkileşim metaforu (tutarlılık ihlali — Nielsen #4).** Aynı satırda üç farklı zihinsel model yan yana: **toggle** (Genel/Özel Ayar), **checkbox** (Zemin, Çerçeve), **buton/dropdown** (Köşe, Görsel Boyutu, Modül Ekle). Checkbox "bir durumu açıp kapatır", buton "bir eylemi tetikler". Kullanıcı hangisinin kalıcı durum, hangisinin anlık aksiyon olduğunu ayırt edemez.

🟡 **"Genel Ayar / Özel Ayar" toggle'ı bağlamsız.** Neyin geneli, neyin özeli? Acemi için tamamen opak. En azından "Tüm hücreler / Bu hücre" gibi somut bir dil gerekir.

🟡 **"Görseli Taşı" bir buton olarak var.** Taşıma, doğrudan sürükleme ile yapılması beklenen bir jest; ayrı bir "taşı moduna gir" butonu acemiye fazladan adım ve mod-hatası riski yükler. Doğrudan sürükleme daha sezgisel. *(Yol haritasında zaten kaldırılması planlı.)*

🟡 **"Temizle" (kırmızı, yıkıcı) sürekli ve tek tık uzakta.** Geri alınamaz aksiyon barda daimi; yanlış tık riski. Bir taşma menüsü altında ya da onay diyaloğuyla korunmalı.

⚪ **"Ayarlar" (⚙) etiketi çok genel.** "Ne ayarı?" sorusunu doğuruyor; işlevsel, düşük öncelik.

---

## 3. Sol Panel (ikon şeridi)

**Görülen:** ~80px dikey şerit, içinde tek "Bekleme" ikonu.

✅ **Genişlik ve büyümeye hazır olma — doğru karar.** Şerit ilerleyen sürümlerde başka araçlarla (modüller, katmanlar vb.) dolacak. Tek ikonun şimdilik üstte durması doğru — yeni ikonlar üstten aşağı eklenecek, bu yüzden dikey ortalamak yerine üstte tutmak isabetli. Önceki "tek ikon için fazla geniş" itirazım geçersiz.

⚪ **"Bekleme" etiketi tek başına eksik anlamlı.** İkon + net tooltip ("Bekleme alanı — sayfadan çıkardığın ürünler") açıklığı artırır. Düşük öncelik.

---

## 4. Sağ Panel

**Görülen:** 4 sekme (Ürünler / Tasarım / Hücre / Modüller); Ürünler aktif. "Excel ile otomatik yerleştir" kartı, "Ürün havuzu" kartı, arama, "Tümü / Kullanılan / Kalan" segment'i.

✅🟡 **İki ayrı Excel akışı — doğrulandı, sadeleştirilmeli.** Senin de belirttiğin gibi ürün havuzu Excel'i nadiren kullanılacak; birincil akış kullanıcının kendi panelinden ürün yüklemesi olacak. **Öneri:** ikinci (havuz) Excel'i ya tümüyle kaldır ya da "Gelişmiş" / "Diğer" başlığı altına gizle. Böylece acemi tek ve net bir yükleme akışıyla karşılaşır; iki-Excel kafa karışıklığı ortadan kalkar. Birincil ekranda yalnızca en sık kullanılan yol görünmeli.

🟡 **Sekme adları soyut ve örtüşüyor.** Bir acemi için "Hücre" de bir tasarım değil mi? "Tasarım / Hücre / Modüller" sınırları net değil; kullanıcı aradığı ayarı (örn. arka plan rengi) hangi sekmede bulacağını kestiremez.

🟡 **"Yerleştir" disabled ama nedeni söylenmiyor.** 0 ürünken pasif olması doğru, ama acemi "neden basamıyorum?" der. Yanına küçük bir ipucu ("Önce bir Excel yükleyin") beklenmedik durumu açıklar.

⚪ **"Tümü / Kullanılan / Kalan" segment'i** iyi — net, sayılı, tanıdık.

---

## 5. Kanvas

**Görülen:** İki sayfa yan yana, 4×4 boş hücre grid'i, her hücrede soluk "BOŞ HÜCRE"; ilk hücre seçili. Sayfa numaraları çok soluk. Sağ altta koyu "Fiyat Hesabı ₺722,99" pill'i.

🔴 **Açılışta onboarding / boş-durum yönlendirmesi yok.** KOBİ için en kritik eksik. Kullanıcı boş grid + dolu araç barıyla karşılaşıyor; "ilk adımım ne?" cevapsız. Benchmark: Vistaprint/Canva ilk açılışta başlangıç ipucu, vurgulanmış ilk aksiyon ya da kısa sihirbaz gösterir. Yardımsız iş bitirme hedefi tam burada kurulur ya da kaybedilir.

🟡 **"BOŞ HÜCRE" 32 kez tekrar + çok soluk.** Görsel gürültü + okunamayacak kadar açık (WCAG kontrast altında). Tek genel ipucu ya da yalnız seçili/hover hücrede ipucu daha temiz.

🟡 **Sayfa numaraları neredeyse görünmez.** Yönelim bilgisi kayboluyor. Kontrast artırılmalı.

✅ **"Fiyat Hesabı ₺722,99" — bilinen sorunlar.** Senin notunla: (a) konumu geçici/yanlış, ayrıca derinlemesine ele alınacak; (b) boş şablonda sıfır olmaması **yazılımsal hata**. İkisi de kayıt altında. Tasarım kararı olarak floating koyu pill'in kanvasta tek dikkat çeken eleman olması ileride yeniden değerlendirilmeli.

⚪ **Hücre köşe yuvarlaklığı / grid estetiği** — tercih, sorun değil.

---

## Holistik / Bütünsel

🔴 **"Ayar" kavramı üç ayrı yere dağılmış.** Bağlamsal barda Genel/Özel Ayar + Ayarlar butonu; sağ panelde Tasarım + Hücre sekmeleri. "Hücre rengini nereden değiştiririm?" sorusunun tek, öngörülebilir cevabı yok. Tek bir tutarlı "ayar evi" kurulmalı.

🟡 **Mavi rengin anlamı sulanıyor.** Mavi hem aktif sekmede, hem "Yerleştir" CTA'sında, hem "GÖRÜNÜM" etiketinde görünüyor olabilir. Bir renk birden çok rol üstlenince sinyal değerini kaybeder.

🟡 **Genel kontrast düşük.** Boş hücre etiketi, sayfa numaraları, Geri/İleri gibi metinler WCAG AA eşiğini geçmeyecek kadar açık.

---

## Doğru Kurgulanmış Bölümler

- **Sağ panel sekme yapısı** — ikon + etiket, aktif sekmede mavi vurgu: tanıdık ve net.
- **Sol panel + Bekleme flyout etkileşimi** — temiz, beklendiği gibi.
- **Excel dropzone + yeşil onayı** — iyi durum görünürlüğü, doğru renk semantiği.
- **"Örnek Excel indir"** — acemi için akıllı yardım.
- **Genel grid hizalaması** — düzenli, simetrik.
- **Yıkıcı aksiyonların kırmızı olması** — doğru renk semantiği.
- **İki sayfanın forma olarak yan yana gösterimi** — baskı zihniyetine uygun metafor.

---

# BÖLÜM II — Tasarım Sistemi Önerileri

*Sıfırdan, bağımsız bakış: bu ürün için tipografi, ikonografi ve renk sistemleri nasıl olmalı. Mevcut kodunuzla örtüşen yerler olabilir — bu, değerlerin zaten makul olduğu anlamına gelir; örtüşmeyen yerlerde gerekçemi belirttim.*

## A. Tipografi Sistemi

**Font ailesi**
- **Önerilen: Inter** (alternatifler: Geist, IBM Plex Sans). Gerekçe: yüksek x-height → küçük boyutta bile okunur; humanist sans → samimi ama profesyonel; çok geniş ağırlık yelpazesi.
- **Tabular (eşit genişlikli) rakam şart.** Bu bir fiyat-ağırlıklı ürün; fiyat sütunları, hesaplamalar, ₺ değerleri hizalı görünmeli. Inter'in `tabular-nums` özelliği açılmalı.
- **Türkçe karakter tam desteği kritik:** ğ, ş, ı, İ, ö, ü, ç hem UI'da hem baskı içeriğinde kusursuz render olmalı. Font seçiminde bu sınanmalı.
- **Mono font** (JetBrains Mono / sistem mono) yalnız teknik değerler için: hex renk kodu, ölçü (mm), SKU gibi. Maksimum 2 aile — üçüncü font eklenmez.

**Boyut ölçeği** (arayüz için — baskı içeriği ayrı):

| Rol | Boyut | Ağırlık | Not |
|---|---|---|---|
| Modal / sayfa başlığı | 20px | 600 | Yalnız büyük başlıklar |
| Bölüm / akordiyon başlığı | **15–16px** | 600 | Gövdeden net ayrışmalı |
| Gövde / panel değeri | 13–14px | 400 | Standart içerik |
| Form etiketi | 13px | 500 | |
| Açıklama / yardım metni | 12px | 400 | **Minimum tavsiye** |
| İkon altı etiket | 11px | 500 | Yalnız çok dar yerlerde |

**Gerekçeli farklar (bağımsız görüş):**
- **Başlık ile gövdeyi yeterince ayırın.** 13px başlık + 13px gövde (yalnız ağırlık farkıyla) zayıf hiyerarşi yaratır; göz tarayamaz. Başlığı **15–16px**'e çıkarmak ayrışmayı netleştirir.
- **Minimum 12px'i hedefleyin, 11px'i istisna tutun.** Acemi/KOBİ kullanıcı küçük metni okumaz, atlar — ve o metinde genelde kritik ipucu olur. 11px yalnız ikon-altı etiket gibi yardımcı yerlerde.

**Ağırlık disiplini:** 400 (gövde), 500 (etiket/vurgu), 600 (başlık). **700 ve üzeri kullanılmaz** — arayüzde aşırı ağırlık görsel gürültüdür. Vurgu ağırlıkla değil, boyut ve renkle yapılır.

**Satır yüksekliği:** gövde 1.5, başlık 1.3, etiket 1.4.

**Yazım:** Her yerde sentence case ("Hücre görünümü"). ALL CAPS yok — tarama hızını düşürür, "bağırma" hissi verir.

---

## B. İkonografi Sistemi

**Tek aile, tek stil**
- **Tek ikon ailesi: Lucide** (alternatif: Phosphor, Feather). Tüm proje boyunca tek aile — farklı aileden tek ikon bile bütünlüğü bozar.
- **Yalnız outline.** Filled varyant kullanılmaz. Tutarlı stroke-width (1.5–2px) tüm ikonlarda sabit.

**Boyut hiyerarşisi** (bağlama göre — küçükten büyüğe okunabilirlik + dokunulabilirlik dengesi):

| Bağlam | İkon boyu | Not |
|---|---|---|
| Sol şerit (Canva tarzı, etiketli) | 22–24px | İkon + altında etiket |
| Sağ panel ana sekmeler | 20–22px | İkon + etiket |
| Hızlı erişim toolbar | 18–20px | Etiketli |
| Panel akordiyon başlıkları | 18px | |
| Satır içi / küçük aksiyon | 16px | Liste, inline buton |

**Gerekçeli fark (bağımsız görüş):** Ana sekmeler için 32px gibi büyük boylar gereksiz — 20–24px yeterince fark edilir ve dikey alanı israf etmez. Ekran gayrimenkulü değerli; ikon büyüklüğü değil, etiket + yerleşim tanınırlığı sağlar.

**Kullanım kuralları**
- **Minimum tıklama hedefi 40×40px.** Görsel ikon 16px olsa bile padding ile 40px'e tamamlanır (Fitts yasası; acemi parmak/fare hassasiyeti).
- **İkon asla yalnız değil (acemi önceliği).** Her ikon yanında/altında metin etiketi. Tek istisna: evrensel tanınanlar (geri al, ilerle, kapat) — bunlarda da **tooltip şart**.
- **Renk anlam taşır:** nötr gri (varsayılan/pasif), birincil mavi (tıklanabilir/aktif), kırmızı (yıkıcı). Bu üç dışında ikon rengi değişmez. Dekoratif renkli ikon yok.

---

## C. Renk Sistemi

**Temel oran — 60/30/10**
- **%60 nötr:** uygulama zemini, panel/kart yüzeyleri. Arayüzün sakin tabanı.
- **%30 ikincil:** gri tonları — borderlar, ikincil metin, pasif ikonlar, ayırıcılar. En çok kullanılan renk ailesi gri olmalı.
- **%10 vurgu:** birincil marka rengi (mavi). Ekranda **nadir ve güçlü** — bol kullanılırsa anlamını yitirir.

**Anlamsal roller (her renk tek iş yapar)**

| Renk | Yalnızca şunun için | Asla |
|---|---|---|
| Birincil (mavi) | CTA butonu + aktif durum | Etiket, dekorasyon, başlık |
| Gri skalası | Zemin, border, ikincil metin, pasif | — (omurga) |
| Kırmızı | Yıkıcı aksiyon (sil/temizle) + hata | Vurgu, dekorasyon |
| Yeşil | Başarı/onay bildirimi | Buton rengi |
| Amber | Uyarı (eksik veri vb.) | Genel vurgu |
| Koyu/siyah | Başlık + aktif etiket vurgusu | Gövde metni |

*Kontrol sorusu: Bir elemana mavi vermeden önce "bu bir CTA mı veya aktif durum mu?" Cevap hayırsa mavi kullanma.*

**Ekran bölgelerine göre renk dağılımı**
- **Üst bar:** nötr zemin; **tek** birincil CTA (İndir/Sipariş). Diğer her şey gri.
- **Hızlı erişim barı:** tümü nötr gri; yalnız yıkıcı (Temizle) kırmızı.
- **Sağ / sol panel:** nötr yüzey; aktif sekme/öğe birincil vurgu. Geri kalan gri.
- **Kanvas:** **en nötr alan.** Editörde tuval, kullanıcının renkli işinin (broşür, ürün görselleri) parladığı yer olmalı. Arayüz renkleri burada geri çekilir — nötr gri zemin (Figma/Canva da böyle yapar). UI mavisi/aksanı kanvasta görünmemeli, yoksa kullanıcının tasarımıyla yarışır.

**Erişilebilirlik**
- Tüm metin **WCAG AA**: normal metin ≥ 4.5:1, büyük metin ≥ 3:1 kontrast. Şu anki soluk gri metinler (boş hücre, sayfa no, geri/ileri) bu eşiğin altında — koyulaştırılmalı.
- Renk **tek başına** bilgi taşımaz: durum, renkle birlikte ikon/metinle de gösterilmeli (renk körlüğü).

---

# Birleşik Öncelik Sırası

Etki × KOBİ kritikliğine göre:

1. **Açılış yönlendirmesi / boş-durum** — KOBİ'nin yardımsız başlayabilmesi buna bağlı.
2. **Hızlı erişim barını sadeleştir** — 4–6 araç + taşma menüsü; tek tutarlı kontrol dili.
3. **"İndir"i birincil CTA yap** — dönüşüm aksiyonunun görünürlüğü.
4. **Kontrast düzeltmeleri** — soluk metinler (boş hücre, sayfa no, geri/ileri).
5. **Etkileşim metaforunu birleştir** — checkbox / buton / toggle karmaşası.
6. **İkinci (havuz) Excel'i gizle/kaldır** — birincil akışı tek ve net bırak.
7. **"Ayar" dağınıklığını tek eve topla** — bağlamsal bar ↔ sağ panel ilişkisi.
8. **Sekme adlarını somutlaştır** — "Tasarım / Hücre" ayrımını berraklaştır.
9. **Fiyat Hesabı** — sıfır hatası (yazılım) + konum (tasarım), ayrıca ele alınacak.

---

*Bu rapor genel hatları belirler. Sıradaki adımda her başlığı — Bölüm I bulguları ve Bölüm II'deki tipografi/ikon/renk sistemleri dahil — tek tek ele alıp somut çözüm ve uygulama planına dönüştürebiliriz.*
