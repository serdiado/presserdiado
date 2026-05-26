# Presserdiado UX / UI Tasarım Kılavuzu

**Hedef kullanıcı:** Grafik tasarım ve web teknolojileri alanında deneyimsiz bireyler  
**İkincil kullanıcı:** Ajanslar ve freelancer tasarımcılar  
**Uygulama:** Web-to-print katalog ve broşür tasarım stüdyosu  
**Versiyon:** 1.0 · Mayıs 2026

# 1. Temel Tasarım Felsefesi

> *Ana ilke: Hedef kullanıcı Figma veya InDesign açmamış. Uygulamayı hayatında ilk kez açan biri kafası karışmadan 10 dakika içinde ilk tasarımını tamamlayabilmeli.*

### 1.1 İki katmanlı deneyim

Uygulama aynı anda iki farklı kullanıcıya hitap edecek şekilde kurgulanmalıdır:

- **Acemi katmanı —** Kanvas üzerindeki hızlı erişim toolbar'ı. Seçime göre değişen bağlamsal araçlar. En çok kullanılan 5-6 ayar, büyük ikonlar, kısa etiketler.

- **Deneyimli katman —** Sağ panel. Akordiyonlu yapı. Tüm gelişmiş ayarlar burada. Acemi kullanıcı bu paneli açmayabilir.

### 1.2 Referans ürünler

Tasarım kararlarında aşağıdaki referans sırasına uyulmalıdır:

- **Vistaprint stüdyo —** Baskı ürünü + acemi kullanıcı kombinasyonu. Toolbar yapısı ve ikon boyutları incelenebilir. Ancak gereğinden fazla basite indirgenmiş — biz daha fazla kontrol sunacağız.

- **Shopify ürün yönetimi —** Teknik bilgisi olmayan esnafa yönelik arayüz. Panel yapısı, etiket dili, hata mesajları.

- **Canva toolbar —** Yalnızca üst araç çubuğu. Bağlamsal değişim ve ikon boyutları için referans.

- **Figma / InDesign —** Referans ALINMAZ. Profesyonel araçlar, yanlış hedef kitle.

> *Altın kural: Şüphe duyduğunda daha basit olanı seç. Bir özelliği anlatmak için yardım metni yazman gerekiyorsa, o özellik muhtemelen yanlış tasarlanmıştır.*

# 2. Renk Sistemi

> *Temel kural: Her renk yalnızca bir anlam taşır. Mavi her yerde kullanılırsa anlamsızlaşır. Rengi kısıtla, anlamlı kıl.*

### 2.1 Ana renkler

| **Renk adı** | **Hex kodu** | **Kullanım kuralı** |
|---|---|---|
| **Aksiyon mavisi** | #2563EB | Birincil CTA butonu, aktif sekme, link — SADECE bu üç yerde |
| **Derin siyah** | #111827 | Başlıklar, birincil metin, aktif sekme etiketi |
| **Kırık beyaz** | #F9FAFB | Panel arka planı, pasif alanlar, devre dışı bölümler |
| **Orta gri** | #6B7280 | İkincil metin, pasif ikon, açıklama metinleri |
| **Kenar gri** | #E5E7EB | Sınırlar, ayraçlar, disabled buton arka planı |
| **Saf beyaz** | #FFFFFF | Kartlar, modal arka planı, aktif panel yüzeyi |

### 2.2 Anlamsal renkler — sadece belirli durumlarda

| **Renk adı** | **Hex kodu** | **SADECE bu durumlarda kullanılır** |
|---|---|---|
| **Başarı yeşili** | #16A34A | Yüklendi onayı, tamamlandı bildirimi, başarı ikonu — buton rengi OLMAZ |
| **Tehlike kırmızısı** | #DC2626 | Sil butonu, temizle butonu, geri alınamaz aksiyonlar — dekoratif kullanım YASAK |
| **Uyarı amberi** | #D97706 | Eksik adım bildirimi, dikkat gerektiren durum uyarısı |

### 2.3 Renk kullanım kuralları

- **Mavi —** Yalnızca tıklanabilir birincil aksiyonlar ve aktif durum. Başka yerde kullanılmaz.

- **Kırmızı —** Yalnızca silme ve temizleme aksiyonları. Dekoratif veya vurgulama amaçlı kullanılmaz.

- **Yeşil —** Yalnızca başarı durumu bildirimleri. Buton rengi olarak kullanılmaz.

- **Gri —** En çok kullanılan renk bu olmalı. Pasif, ikincil, bilgi amaçlı tüm elemanlar.

- **Siyah —** Başlıklar ve aktif durum etiketleri. Genel metin rengi değil, vurgu için.

> *Kontrol sorusu: Bir elemana mavi renk eklemeden önce 'bu bir CTA butonu mu veya aktif durum mu?' diye sor. Cevap hayırsa mavi kullanma.*

# 3. Tipografi Kuralları

### 3.1 Font ailesi

- **UI fontu —** Inter veya sistem sans-serif. Ekranda yüksek okunabilirlik için optimize.

- **Mono font —** Hex kodları, teknik değerler gibi kod içeriği için. Courier New veya JetBrains Mono.

> *Maksimum 2 font ailesi kullanılır. Üçüncü font eklenmez.*

### 3.2 Boyut skalası

| **Seviye**                | **Boyut** | **Ağırlık** |                                                 |
|---------------------------|-----------|-------------|-------------------------------------------------|
| **Modal / sayfa başlığı** | 20px      | 600         | Yalnızca modal ve büyük ekran başlıkları        |
| **Panel bölüm başlığı**   | 15px      | 600         | Akordiyonlar, sekme etiketleri, kart başlıkları |
| **Gövde metin**           | 13px      | 400         | Form etiketleri, açıklama paragrafları, içerik  |
| **Alt etiket / ipucu**    | 11px      | 400         | Sekme alt etiketi, tooltip metni, yardım notu   |

> *Kritik kural: 11px altına asla inme. Panel açıklama metinleri minimum 12px. Acemi kullanıcı küçük metni okumaz — atlar. O metinde genellikle kritik bilgi vardır.*
>
> *Tüm başlıklar sentence case: 'Hücre görünümü' — ASLA 'HÜCRE GÖRÜNÜMÜ' değil. Büyük harf tarama hızını düşürür.*

# 4. İkon Sistemi

### 4.1 İkon seti

Proje boyunca yalnızca Lucide React kullanılır. Başka ikon seti karıştırılmaz.

- Tüm ikonlar outline stilinde

- Filled varyantlar kullanılmaz

- Tutarlılık için aynı aileden seçim zorunludur

### 4.2 Boyut kuralları — bağlama göre 4 boyut

| **Boyut** | **Kullanım yeri**        | **Lucide prop** | **Açıklama**                              |
|-----------|--------------------------|-----------------|-------------------------------------------|
| **32 px** | **Üst sekme menüsü**     | size={32}       | En büyük boy — 4 sekme ikonu burada       |
| **24 px** | **Hızlı erişim toolbar** | size={24}       | Bağlamsal araç çubuğu ikonları            |
| **18 px** | **Panel akordiyonları**  | size={18}       | Sağ panel bölüm başlıkları                |
| **16 px** | **Satır içi aksiyonlar** | size={16}       | Küçük buton, liste satırı, inline aksiyon |

> *Minimum tıklama alanı: Her zaman 40×40px. Görsel boyutu 16px olsa bile padding ile 40px'e tamamlanmalı. Aksi halde acemi kullanıcı ikonlara tıklayamaz.*

### 4.3 İkon kullanım kuralları

- **İkon asla yalnız değil —** Toolbar ve panel içindeki her ikon yanında metin etiketi taşımalı. Tek istisnalar: Geri al, ilerle gibi evrensel tanınan aksiyonlar — bunlarda da tooltip şart.

- **Renk anlam taşısın —** Mavi ikon = tıklanabilir/aktif. Gri ikon = pasif/bilgi. Kırmızı ikon = tehlikeli aksiyon. Bu üçü dışında ikon rengi değiştirilmez.

- **Tutarlı aile —** Lucide'in outline seti. Farklı stilden tek bir ikon bile görsel bütünlüğü bozar.

- **Tooltip zorunlu —** Etiket olmayan her ikona hover'da tooltip eklenir. 'Ne işe yarar?' sorusu cevaplanmalı.

### 4.4 Mevcut ikonlar ve önerilen değişiklikler

| **Mevcut ikon** | **Önerilen ikon**              | **Gerekçe**                       |
|-----------------|--------------------------------|-----------------------------------|
| Grid3X3         | **LayoutGrid**                 | Daha net ızgara ifadesi           |
| Square          | **RectangleHorizontal**        | Ürün alanı dikdörtgen, kare değil |
| Tag             | **PriceTag / BadgeDollarSign** | Fiyat kutusu için daha açıklayıcı |
| — (yok)         | **FileSpreadsheet**            | Excel yükleme alanı için          |
| — (yok)         | **LayoutTemplate**             | Şablon seçimi için                |
| — (yok)         | **Undo2 / Redo2**              | Geri al / ilerle için standart    |

# 5. Buton Hiyerarşisi

> *Altın kural: Her panel görünümünde yalnızca bir tane birincil (mavi dolu) buton olabilir. İkincisi varsa o ikincil (çerçeveli) olmalı.*

### 5.1 Buton türleri

| **Tür**        | **Görünüm**                   | **Ne zaman**                                         |
|----------------|-------------------------------|------------------------------------------------------|
| **Birincil**   | Mavi dolu — #2563EB          | Sayfadaki tek ana aksiyon. Yerleştir, İndir, Kaydet. |
| **İkincil**    | Çerçeveli — border #E5E7EB   | Destekleyici aksiyon. Önizle, Değiştir, Geri dön.    |
| **Hayalet**    | Transparan — yalnızca metin   | Yardımcı, düşük öncelikli. İptal, Kapat.             |
| **Tehlike**    | Açık kırmızı zemin — #FEF2F2 | Sil, Temizle, Sıfırla. Her zaman onay modalı açar.   |
| **Devre dışı** | Soluk gri — %40 opaklık       | Ön koşul sağlanmadan erişilemeyen aksiyon.           |

### 5.2 Boyut kuralları

- **Yükseklik —** Birincil ve ikincil butonlar 40px. Hayalet butonlar 32px. Toolbar butonları 40px (ikon + etiket).

- **Minimum genişlik —** Toolbar butonu minimum 56px. Panel butonu panel genişliğinin %100'ü (full width).

- **Padding —** Yatay 16px, dikey 10px. İkon + metin arasında 8px boşluk.

- **Border radius —** 6px. Köşeli (0px) veya tam yuvarlak (pill) kullanılmaz.

> *Tehlikeli aksiyon kuralı: 'Havuzu Temizle', 'Sıfırla', 'Sil' gibi geri alınamaz her aksiyon, tıklandığında onay modalı açmalıdır. Onaysız silme işlemi yasaktır.*

# 6. Panel ve Menü Yapısı

### 6.1 İki katmanlı layout

Uygulama iki ayrı kontrol katmanından oluşur:

| **Katman**           | **Yer**                         | **İçerik**                                                                              |
|----------------------|---------------------------------|-----------------------------------------------------------------------------------------|
| **Hızlı erişim**     | Kanvas üstü — bağlamsal toolbar | Seçime göre değişen 5-6 araç. 24px ikon + kısa etiket. Acemi kullanıcı buradan çalışır. |
| **Gelişmiş ayarlar** | Sağ panel — akordiyonlu         | Tüm detay ayarları. 18px ikon. Deneyimli kullanıcı buradan çalışır. Acemi görmeyebilir. |

### 6.2 Hızlı erişim toolbar kuralları

- **Maksimum 5-6 araç —** Daha fazlası gözü dağıtır. 'En çok kullanılan 5 şey burada, geri kalanı sağ panelde' kuralı tutarlı uygulanır.

- **Bağlam duyarlı —** Arkaplan seçilince arkaplan araçları, ürün alanı seçilince alan araçları. Kanvasta seçim yokken genel araçlar.

- **İkon + kısa etiket —** Toolbar butonu: 24px ikon üstte, 11px etiket altta. Etiket maksimum 8 karakter.

- **Ayraç kullanımı —** Mantıksal gruplar 1px dikey çizgiyle ayrılır. En fazla 3 grup.

### 6.3 Toolbar içerik önerileri

**Arkaplan seçiliyken:**

- Görsel | Renk | Saydamlık | Köşeler

**Ürün alanı seçiliyken:**

- Görsel | Yazı | Fiyat | Çerçeve | Kopyala

**Seçim yokken (genel):**

- Geri al | Yinele | Izgara | Tüm sayfalara uygula

### 6.4 Sağ panel akordiyonları

- **Varsayılan durum —** İlk açılışta yalnızca en çok kullanılan akordiyonun (Hücre görünümü veya Görsel ayarları) açık olması önerilir.

- **Öncelik sırası —** En çok kullanılan ayar en üstte. Gelişmiş ayarlar en altta ve kapalı.

- **Başlık yapısı —** 18px ikon + 15px bold etiket + chevron ikonu sağda. Tüm başlıklar sentence case.

- **Bağlam duyarlı panel —** Kullanıcı bir ürün alanına tıkladığında panel otomatik olarak o alana ait ayarlara atlar.

> *Geliştirme aşamasındaki özellikler panelde görünmemeli. 'Yakında eklenecek' veya 'geliştirme aşamasında' gibi notlar kullanıcıyı hayal kırıklığına uğratır.*

# 7. Sekme Yapısı

### 7.1 Aktif sekme tasarımı

Aktif sekme iki görsel sinyalin birlikte kullanılmasıyla belirtilir:

- **Alt çizgi —** 2px, aksiyon mavisi (#2563EB). Evrensel 'aktif sekme' konvansiyonu.

- **Arka plan —** Hafif mavi zemin (#EFF6FF). Alt çizgiyle birlikte kullanılır.

- **İkon ve etiket rengi —** Aksiyon mavisi (#2563EB). Pasif sekmede gri (#6B7280).

> *Neden mavi? Mavi evrensel 'aktif/seçili' sinyalidir. Koyu siyah alt çizgi daha güçlü kontrast verir ama acemi kullanıcının 'devre dışı' ile 'aktif' arasındaki farkı anlamasını zorlaştırır.*

### 7.2 Sekme etiket ve ikon önerileri

| **Mevcut etiket** | **Önerilen etiket** | **Lucide ikonu** | **Alt etiket (opsiyonel)** |
|-------------------|---------------------|------------------|----------------------------|
| ~~ÜRÜNLER~~       | **İçerik**          | PackageOpen      | Ürün ekle                  |
| ~~TASARIM~~       | **Tasarım**         | Palette          | Renk, şablon               |
| ~~HÜCRE~~         | **Yerleşim**        | LayoutGrid       | Alan ayarla                |
| ~~MODÜLLER~~      | **Modüller**        | Layers           | Hazır bileşenler           |

# 8. Terminoloji Sözlüğü

> *Kural: Uygulama içinde kullanılan her kelime grafik tasarım bilgisi olmayan bir kullanıcı tarafından anlaşılabilmeli. Şüphe duyduğunda daha basit kelimeyi seç.*

| **Jargon (kullanılmaz)** | **Önerilen kelime**      | **Açıklama**                                 |
|--------------------------|--------------------------|----------------------------------------------|
| ~~Hücre~~                | **Ürün alanı**           | Kullanıcı ürün koyduğu bir 'alan' görüyor    |
| ~~Izgara~~               | **Sayfa düzeni**         | Kaç ürün, kaç sütun — kullanıcı bunu anlıyor |
| ~~Ön Plan Saydamlığı~~   | **Ürün görünürlüğü**     | Ne yaptığını doğrudan anlatıyor              |
| ~~Köşe Yuvarlaklığı~~    | **Köşe şekli**           | CSS bilgisi gerektirmiyor                    |
| ~~İç Boşluk~~            | **İç aralık**            | Daha gündelik bir kelime                     |
| ~~Globalden~~            | **Tüm sayfalara uygula** | 'Global' yabancı kelime, açıkça anlat        |
| ~~Modüller~~             | **Hazır bileşenler**     | Ne olduğunu açıklıyor                        |
| ~~Kısurat %~~            | **Fiyat küsurat boyutu** | Özel özellik — ne yaptığını anlatan isim     |

### 8.1 Genel dil kuralları

- **Türkçe tercih et —** İngilizce teknik terim yerine Türkçe karşılığı varsa kullan. 'Upload' değil 'Yükle'.

- **Eylem fiili kullan —** Buton ve menü etiketleri eylem bildirmeli. 'Yükle', 'Seç', 'Uygula', 'Yerleştir'.

- **Sentence case zorunlu —** 'Hücre görünümü' — asla 'HÜCRE GÖRÜNÜMÜ' veya 'Hücre Görünümü' değil.

- **Kısa tut —** Buton etiketi maksimum 2 kelime. Sekme etiketi maksimum 1 kelime.

- **Açıklama metinleri —** Her kontrol veya ayarın yanında en fazla 1 cümlelik açıklama. Uzun açıklama gereken yer, kötü tasarlanmış yerdir.

# 9. Hata Önleme Kuralları

### 9.1 Geri alınamaz aksiyonlar

> *Kural: Geri alınamaz her aksiyon, tıklandığında onay modalı açmalıdır. Onaysız silme veya temizleme işlemi kesinlikle yapılmaz.*

- **Onay gerektiren aksiyonlar —** Havuzu Temizle, Tasarımı Sıfırla, Sayfayı Sil, Projeyi Sil.

- **Modal içeriği —** Ne silineceği açıkça yaz. 'Bu işlem geri alınamaz.' uyarısı. İki buton: Kırmızı 'Sil' ve hayalet 'İptal'.

- **Geri al (Undo) —** Mümkün olan her aksiyonda Ctrl+Z çalışmalı. Geri al butonu üst toolbar'da belirgin olmalı.

### 9.2 Boş durum tasarımı

- **Excel yüklenmemiş —** Yükleme alanı büyük, merkezi ve açıklayıcı olmalı. 'Örnek Excel İndir' linki belirgin yerde.

- **Ürün havuzu boş —** 'Henüz ürün eklenmedi' mesajı + 'Yükle' butonu. Boş liste gösterme.

- **Hücre seçilmemiş —** Panel 'Bir alan seçerek düzenle' yönlendirmesi göstermeli. Ayarlar gri ve tıklanamaz.

### 9.3 Devre dışı durum

- **Görsel —** %40 opaklık. Cursor: not-allowed. Arka plan: #F9FAFB.

- **Tooltip zorunlu —** Devre dışı elemana hover'da neden devre dışı olduğu açıklanır. 'Önce ürün listeni yükle' gibi.

- **Hiçbir şeyi tamamen gizleme —** Devre dışı göster, tamamen kaldırma. Kullanıcı özelliğin varlığını bilmeli.

> *Acemi kullanıcı için en önemli güvence: her yanlış tıklamanın geri alınabilir olduğunu bilmek. Undo her zaman çalışmalı.*

# 10. Hızlı Kontrol Listesi

Her yeni bileşen veya ekran tamamlandığında aşağıdaki sorular yanıtlanmalıdır:

### Dil ve terminoloji

- Tüm etiketler sentence case mi? (Büyük harf yok)

- Teknik jargon kullanılmış mı? Terminoloji sözlüğünden geçti mi?

- Buton etiketleri eylem fiili mi? (Yükle, Seç, Uygula)

- Açıklama metinleri 1 cümleyi geçiyor mu?

### Renk ve görsel

- Mavi yalnızca birincil CTA ve aktif durum için mi kullanılıyor?

- Her ekranda yalnızca bir tane birincil (mavi dolu) buton var mı?

- Kırmızı yalnızca tehlikeli aksiyonlarda mı?

- Metin kontrastı yeterli mi? (minimum 4.5:1)

- 11px altında font boyutu var mı?

### İkon

- Tüm ikonlar Lucide React'tan mı?

- İkonlar outline stilinde mi? (filled yok)

- Her ikonun yanında metin etiketi veya tooltip var mı?

- Tıklama alanı minimum 40×40px mi?

### Panel ve menü

- Toolbar'da maksimum 5-6 araç var mı?

- Akordiyonlar doğru öncelik sırasında mı? (en çok kullanılan en üstte)

- Geliştirme aşamasındaki özellikler gizlenmiş mi?

- Bağlam duyarlı panel doğru çalışıyor mu?

### Hata önleme

- Geri alınamaz her aksiyonda onay modalı var mı?

- Devre dışı elemanların tooltip'i yazıldı mı?

- Boş durumlar tasarlandı mı?

- Undo her önemli aksiyonda çalışıyor mu?

*Presserdiado UX/UI Kılavuzu · v1.0 · Mayıs 2026*
