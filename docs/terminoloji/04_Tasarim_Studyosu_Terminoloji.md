\# Presserdiado Tasarım Stüdyosu Terminoloji Sözlüğü



Bu dosya, Presserdiado tasarım stüdyosunda kullanılacak terimleri tanımlar.



Bu bölüm; tasarım editörü, çalışma yüzeyi, sağ panel, sol panel, hücre yapısı, ürün havuzu, şablon, modül, arka plan, katman, metin, görsel, renk, hizalama, baskı kontrolü ve çıktı alma terimlerini kapsar.



\---



\## Kullanım Kuralı



\- Kullanıcı arayüzünde \*\*Önerilen Terim\*\* alanı esas alınır.

\- İngilizce / teknik karşılıklar yalnızca geliştirici dokümantasyonu, veri modeli veya teknik açıklamalarda kullanılabilir.

\- Kullanıcıya görünen tasarım stüdyosu arayüzünde sade Türkçe kullanılmalıdır.

\- “Canvas” yerine \*\*Çalışma Yüzeyi\*\* kullanılmalıdır.

\- “Slot” yerine bağlama göre \*\*Hücre\*\* veya \*\*Alan\*\* kullanılmalıdır.

\- “Grid” yerine bağlama göre \*\*Izgara\*\* veya \*\*Düzen\*\* kullanılmalıdır.

\- “Sidebar” yerine \*\*Sağ Panel\*\* kullanılmalıdır.

\- “Contextual Bar” yerine \*\*Hızlı Araç Çubuğu\*\* kullanılmalıdır.

\- “Product Pool” yerine \*\*Ürün Havuzu\*\* kullanılmalıdır.

\- “Temporary Pool” yerine \*\*Bekleme Alanı\*\* kullanılmalıdır.

\- “Preflight” yerine \*\*Baskı Kontrolü\*\* kullanılmalıdır.

\- “Export” yerine kullanıcı eyleminde \*\*İndir\*\*, teknik bağlamda \*\*Dışa Aktar\*\* kullanılmalıdır.



\---



\## 1. Genel Stüdyo / Editör Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Genel Stüdyo | Tasarım Stüdyosu | Design Studio | Editör genel adı | Evet | Kullanıcının baskı tasarımını oluşturduğu ana çalışma alanıdır. | Design Studio | Ürün adı bağlamında kullanılabilir. |

| Genel Stüdyo | Tasarım Editörü | Design Editor | Editör teknik adı | Evet | Tasarımın düzenlendiği arayüzdür. | Design Editor | “Stüdyo” daha kullanıcı dostudur. |

| Genel Stüdyo | Çalışma Alanı | Workspace | Genel editör alanı | Evet | Kullanıcının tasarım işlemlerini yaptığı genel ortamdır. | Workspace | UI’da “Workspace” kullanılmamalı. |

| Genel Stüdyo | Çalışma Yüzeyi | Canvas | Orta tasarım alanı | Evet | Kullanıcının broşür, katalog veya diğer baskı tasarımını canlı olarak gördüğü ve düzenlediği ana alandır. | Canvas, Tuval | Presserdiado’da ana terim budur. |

| Genel Stüdyo | Kanvas | Canvas | Teknik / tasarım açıklaması | Hayır | Tasarım alanının teknik karşılığıdır. | Canvas | UI’da “Çalışma Yüzeyi” kullanılmalı. |

| Genel Stüdyo | Sayfa | Page | Tasarım yüzeyi | Evet | Tasarımın tek bir sayfasıdır. | Page |  |

| Genel Stüdyo | Yüzey | Surface | Baskı yüzeyi / forma | Evet | Tasarımın çalışılan baskı yüzeyidir. | Surface | Teknik bağlamda kullanılabilir. |

| Genel Stüdyo | Forma | Signature / Press Form | Broşür / matbaa yapısı | Açıklamada kullanılabilir | Birden fazla sayfanın aynı baskı yüzeyinde bulunduğu matbaa yapısıdır. | Signature | Son kullanıcıya “Sayfa Grubu” ile açıklanabilir. |

| Genel Stüdyo | Sayfa Grubu | Page Group / Form | Tasarım stüdyosu | Evet | Birlikte gösterilen veya birlikte basılan sayfalar grubudur. | Signature | Forma terimini sadeleştirmek için kullanılabilir. |

| Genel Stüdyo | Ön Yüz | Front Side | Tasarım görünümü | Evet | Ürünün ön tarafını gösterir. | Front Side |  |

| Genel Stüdyo | Arka Yüz | Back Side | Tasarım görünümü | Evet | Ürünün arka tarafını gösterir. | Back Side |  |

| Genel Stüdyo | Kapaklar | Covers | Forma / sayfa grubu | Evet | Broşür veya katalogda kapak sayfalarını ifade eder. | Covers |  |

| Genel Stüdyo | İç Sayfalar | Inner Pages | Forma / sayfa grubu | Evet | Broşür veya katalogda iç sayfaları ifade eder. | Inner Pages |  |

| Genel Stüdyo | Proje | Project | Tasarım dosyası | Evet | Kullanıcının kaydedilebilir tasarım çalışmasıdır. | Project |  |

| Genel Stüdyo | Çalışma | Work / Document | Tasarım dosyası | Evet | Kullanıcının üzerinde çalıştığı tasarım kaydıdır. | Work |  |

| Genel Stüdyo | Tasarım Dosyası | Design File | Proje / kayıt | Evet | Tasarımın kaydedilmiş dosya veya proje halidir. | Design File |  |

| Genel Stüdyo | Belge | Document | Teknik veri modeli | Açıklamada kullanılabilir | Tasarım projesinin belge yapısını ifade eder. | Document | UI’da sınırlı kullanılmalı. |

| Genel Stüdyo | Aktif Proje | Active Project | Editör durumu | Evet | Kullanıcının o anda açık olan projesidir. | Active Project |  |

| Genel Stüdyo | Aktif Sayfa | Active Page | Editör durumu | Evet | Kullanıcının o anda düzenlediği sayfadır. | Active Page |  |

| Genel Stüdyo | Aktif Seçim | Active Selection | Seçim durumu | Evet | Kullanıcının o anda seçtiği nesne, hücre veya metindir. | Active Selection |  |

| Genel Stüdyo | Boş Tasarım | Blank Design | Başlangıç yöntemi | Evet | İçeriği olmayan, yalnızca yapı ve ölçüleri hazır tasarım başlangıcıdır. | Blank Design |  |

| Genel Stüdyo | Hazır Şablon | Ready Template | Başlangıç yöntemi | Evet | Kullanıcının düzenleyerek başlayabileceği hazır tasarımdır. | Ready Template |  |

| Genel Stüdyo | Kayıtlı Tasarım | Saved Design | Kullanıcı çalışması | Evet | Kullanıcının daha önce kaydettiği tasarımdır. | Saved Design |  |

| Genel Stüdyo | Benim Tasarımlarım | My Designs | Kullanıcı paneli / başlangıç | Evet | Kullanıcının kendi kaydettiği tasarımlar alanıdır. | My Designs | Kullanıcı panelinde kullanılabilir. |

| Genel Stüdyo | Tasarımı Düzenle | Edit Design | Kullanıcı eylemi | Evet | Kayıtlı tasarımı yeniden açıp değiştirme işlemidir. | Edit Design |  |

| Genel Stüdyo | Tasarımı Kaydet | Save Design | Üst bar / proje kaydı | Evet | Tasarımı daha sonra kullanmak üzere kaydeder. | Save Design |  |

| Genel Stüdyo | Otomatik Kayıt | Autosave | Sistem durumu | Evet | Tasarımın sistem tarafından otomatik kaydedilmesidir. | Autosave |  |

| Genel Stüdyo | Son Kaydedilme | Last Saved | Sistem durumu | Evet | Tasarımın en son ne zaman kaydedildiğini gösterir. | Last Saved |  |

| Genel Stüdyo | Çalışmalarım | My Works / My Projects | Kullanıcı paneli | Evet | Kullanıcının kayıtlı projelerini gördüğü alandır. | My Works | Kullanıcı panelinde “Tasarım Projelerim” tercih edilebilir. |



\---



\## 2. Başlangıç / Kurulum Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Başlangıç | Yeni Proje | New Project | Başlangıç ekranı | Evet | Yeni bir tasarım çalışması başlatır. | New Project |  |

| Başlangıç | Ürün Seçimi | Product Selection | Başlangıç akışı | Evet | Kullanıcının tasarlamak veya bastırmak istediği ürünü seçtiği adımdır. | Product Selection |  |

| Başlangıç | Ne Üretmek İstiyorsunuz? | What do you want to create? | Başlangıç popup | Evet | Kullanıcının broşür, katalog, menü gibi ürün ailesini seçtiği sorudur. | What do you want to create? | Presserdiado başlangıç akışı için ana soru. |

| Başlangıç | Nasıl Çalışmak İstiyorsunuz? | How do you want to work? | Başlangıç popup | Evet | Kullanıcının çalışma mantığını seçtiği sorudur. | Working Mode |  |

| Başlangıç | Hücre Yapılı Tasarım | Structured / Grid-based Design | Başlangıç popup / editör modu | Evet | Excel verisi ve hücre yapısı ile çok ürünlü tasarım oluşturma modudur. | Grid-based Design, Slot Design | Presserdiado’nun ana çalışma modeli. |

| Başlangıç | Serbest Tasarım | Free Design / Freeform Design | Başlangıç popup / editör modu | Evet | Kullanıcının hücre yapısına bağlı kalmadan özgür tasarım yaptığı moddur. | Freeform Design | Az ürünlü kampanya ve yaratıcı tasarımlar için. |

| Başlangıç | Boş Tasarımla Başla | Start with Blank Design | Başlangıç yöntemi | Evet | Seçilen ürün yapısıyla boş tasarım alanı açar. | Start with Blank Design |  |

| Başlangıç | Hazır Şablon Seç | Choose Template | Başlangıç yöntemi | Evet | Kullanıcının hazır şablonlardan biriyle başlamasını sağlar. | Choose Template |  |

| Başlangıç | Kayıtlı Tasarımı Aç | Open Saved Design | Başlangıç yöntemi | Evet | Kullanıcının daha önce kaydettiği tasarımdan devam etmesini sağlar. | Open Saved Design |  |

| Başlangıç | Kayıtlı Tasarımlarımdan Aç | Open from My Designs | Başlangıç yöntemi | Evet | Kullanıcının kendi kayıtlı tasarımlarından birini açmasıdır. | Open from My Designs |  |

| Başlangıç | Örnek Dosya İndir | Download Sample File | Excel / veri akışı | Evet | Kullanıcının sisteme uygun örnek Excel dosyasını indirmesidir. | Download Sample File |  |

| Başlangıç | Verisiz Başla | Start Without Data | Başlangıç yöntemi | Evet | Excel yüklemeden tasarım stüdyosuna giriş yapılmasını sağlar. | Start Without Data |  |

| Başlangıç | Excel Yükle | Upload Excel | Veri yükleme | Evet | Ürün verilerinin Excel dosyasıyla sisteme yüklenmesidir. | Upload Excel |  |

| Başlangıç | Şablon Seç | Choose Template | Başlangıç / tasarım sekmesi | Evet | Kullanıcının tasarım yapısı veya hazır tasarım seçmesidir. | Choose Template |  |

| Başlangıç | Tasarım Tipi | Design Type | Başlangıç popup / şablon bilgileri | Evet | Hücre Yapılı Tasarım veya Serbest Tasarım seçimini ifade eder. | Design Type |  |

| Başlangıç | Çalışma Mantığı | Working Mode | Başlangıç popup | Evet | Tasarımın hücre yapılı mı serbest mi ilerleyeceğini belirleyen seçimdir. | Working Mode |  |

| Başlangıç | Baskı Yapısı | Print Structure | Başlangıç popup | Evet | Ebat, sayfa sayısı, kırım ve baskı yüzeyini belirleyen yapıdır. | Print Structure |  |

| Başlangıç | Kağıt Boyutu | Paper Size | Başlangıç popup | Evet | A3, A4, A5, A6 gibi tasarımın fiziksel boyutunu belirtir. | Paper Size |  |

| Başlangıç | Kırım Yapısı | Fold Structure | Başlangıç popup | Evet | Broşürün katlanma düzenini ifade eder. | Fold Structure |  |

| Başlangıç | Sayfa Sayısı | Page Count | Başlangıç popup / şablon bilgileri | Evet | Tasarımdaki toplam sayfa sayısını belirtir. | Page Count |  |

| Başlangıç | Açık Ölçü | Open Size | Şablon bilgileri | Evet | Ürünün katlanmadan önceki toplam ölçüsüdür. | Open Size | Kısa açıklama ile gösterilmeli. |

| Başlangıç | Kapalı Ölçü | Closed Size | Şablon bilgileri | Evet | Ürünün katlandıktan sonraki ölçüsüdür. | Closed Size | Kısa açıklama ile gösterilmeli. |

| Başlangıç | Taşma Payı | Bleed | Şablon bilgileri / baskı kontrolü | Evet | Kesimden sonra beyaz kenar kalmaması için dışa taşırılan alandır. | Bleed |  |

| Başlangıç | Güvenli Alan | Safe Area | Şablon bilgileri / baskı kontrolü | Evet | Yazı, logo ve önemli görsellerin kesilmemesi için içeride kalması gereken alandır. | Safe Area |  |

| Başlangıç | Başlangıç Ayarları | Initial Settings | Başlangıç popup | Evet | Tasarım başlamadan önce seçilen temel ayarlardır. | Initial Settings |  |

| Başlangıç | Kurulum Sihirbazı | Setup Wizard | Başlangıç akışı | Teknik dokümanda kullanılabilir | Kullanıcıyı adım adım tasarıma hazırlayan başlangıç akışıdır. | Wizard | UI’da doğrudan “Sihirbaz” yerine soru başlıkları tercih edilebilir. |



\---



\## 3. Üst Bar / Global Araç Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Üst Bar | Üst Bar | Top Bar | Tasarım stüdyosu | Evet | Editörün üst kısmındaki genel işlem çubuğudur. | Top Bar |  |

| Üst Bar | Üst Araç Çubuğu | Top Toolbar | Tasarım stüdyosu | Evet | Görünüm, geri alma, indirme ve sipariş gibi genel işlemleri içerir. | Top Toolbar |  |

| Üst Bar | Proje Adı | Project Name | Üst bar | Evet | Açık tasarım projesinin adıdır. | Project Name |  |

| Üst Bar | Geri Al | Undo | Üst bar / kısayol | Evet | Son yapılan işlemi geri alır. | Undo |  |

| Üst Bar | Yinele | Redo | Üst bar / kısayol | Evet | Geri alınan işlemi yeniden uygular. | Redo | “İleri Al” yerine “Yinele” tercih edilebilir. |

| Üst Bar | İleri Al | Redo | Üst bar / kısayol | Evet | Geri alınan işlemi tekrar uygular. | Redo | “Yinele” daha kısa ve yaygın. |

| Üst Bar | Yakınlaştır | Zoom In | Görünüm | Evet | Çalışma yüzeyini büyütür. | Zoom In |  |

| Üst Bar | Uzaklaştır | Zoom Out | Görünüm | Evet | Çalışma yüzeyini küçültür. | Zoom Out |  |

| Üst Bar | Zoom | Zoom | Görünüm | Hayır | Yakınlaştırma düzeyini ifade eden teknik terimdir. | Zoom | UI’da “Yakınlaştır / Uzaklaştır” kullanılmalı. |

| Üst Bar | Ekrana Sığdır | Fit to Screen | Görünüm | Evet | Aktif çalışma yüzeyini ekrana sığdırır. | Fit to Screen |  |

| Üst Bar | Sayfaya Sığdır | Fit to Page | Görünüm | Evet | Seçili sayfayı ekranda görünür hale getirir. | Fit to Page |  |

| Üst Bar | Forma Sığdır | Fit to Form | Görünüm | Açıklamada kullanılabilir | Aktif formayı ekrana sığdırır. | Fit to Form | Son kullanıcıya “Sayfa Grubu” ile açıklanabilir. |

| Üst Bar | Gerçek Boyut | Actual Size | Görünüm | Evet | Tasarımı gerçek ölçü oranına yakın gösterir. | Actual Size |  |

| Üst Bar | Görünüm | View | Üst bar | Evet | Çalışma yüzeyi görünüm seçeneklerini içerir. | View |  |

| Üst Bar | Görünüm Modu | View Mode | Üst bar / arka plan | Evet | Tasarımın hangi görünümde gösterileceğini belirler. | View Mode |  |

| Üst Bar | Önizleme | Preview | Üst bar | Evet | Tasarımı düzenleme çizgileri olmadan görüntüler. | Preview |  |

| Üst Bar | Tam Ekran Önizleme | Full Screen Preview | Önizleme | Evet | Tasarımın tam ekran önizlemesini açar. | Full Screen Preview |  |

| Üst Bar | Kılavuzları Göster | Show Guides | Görünüm | Evet | Yardımcı çizgileri görünür yapar. | Show Guides |  |

| Üst Bar | Kılavuzları Gizle | Hide Guides | Görünüm | Evet | Yardımcı çizgileri gizler. | Hide Guides |  |

| Üst Bar | Izgarayı Göster | Show Grid | Görünüm | Evet | Izgara çizgilerini gösterir. | Show Grid |  |

| Üst Bar | Izgarayı Gizle | Hide Grid | Görünüm | Evet | Izgara çizgilerini gizler. | Hide Grid |  |

| Üst Bar | Taşma Alanını Göster | Show Bleed Area | Görünüm / baskı kontrolü | Evet | Taşma payı alanını görünür yapar. | Show Bleed |  |

| Üst Bar | Güvenli Alanı Göster | Show Safe Area | Görünüm / baskı kontrolü | Evet | Güvenli alan çizgilerini gösterir. | Show Safe Area |  |

| Üst Bar | Baskı Kontrolü | Preflight | Üst bar / çıktı öncesi | Evet | Tasarımın baskıya uygun olup olmadığını kontrol eder. | Preflight | Ana kullanıcı terimi budur. |

| Üst Bar | Kontrol Durumu | Check Status | Üst bar / baskı kontrolü | Evet | Tasarımın baskı kontrolünden geçip geçmediğini gösterir. | Check Status |  |

| Üst Bar | PDF İndir | Download PDF | Çıktı alma | Evet | Tasarımı PDF olarak indirir. | Download PDF, Export PDF |  |

| Üst Bar | JPEG İndir | Download JPEG | Çıktı alma | Evet | Tasarımı JPEG görsel olarak indirir. | Download JPEG |  |

| Üst Bar | PNG İndir | Download PNG | Çıktı alma | Evet | Tasarımı PNG görsel olarak indirir. | Download PNG |  |

| Üst Bar | Siparişi Tamamla | Complete Order / Checkout | Sipariş akışı | Evet | Tasarımı baskı siparişine dönüştürür. | Checkout | UI’da Checkout kullanılmamalı. |

| Üst Bar | Baskı Fiyatı | Print Price | Üst bar / fiyat popup | Evet | Seçilen üretim özelliklerine göre baskı fiyatını gösterir. | Print Price |  |

| Üst Bar | Fiyatı Gör | View Price | Üst bar / fiyat popup | Evet | Baskı fiyatı bilgilerini açar. | View Price |  |

| Üst Bar | Veriyi Yenile | Refresh Data | Ürün verisi | Evet | Tasarımdaki veri kaynağını günceller. | Refresh Data |  |

| Üst Bar | Excel’i Yenile | Refresh Excel | Ürün verisi | Evet | Yüklenen Excel dosyasına göre ürün verilerini günceller. | Refresh Excel |  |

| Üst Bar | Otomatik Kaydetme Durumu | Autosave Status | Üst bar | Evet | Tasarımın kaydedilme durumunu gösterir. | Autosave Status |  |



\---



\## 4. Sağ Panel / Ana Sekme Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Sağ Panel | Sağ Panel | Sidebar | Tasarım stüdyosu | Evet | Tasarım, ürün, hücre ve modül ayarlarının bulunduğu sağ kontrol alanıdır. | Sidebar | UI’da Sidebar kullanılmamalı. |

| Sağ Panel | Kontrol Paneli | Control Panel | Sağ panel / yönetim | Evet | Seçimlere ve sekmelere göre ayarların yapıldığı paneldir. | Control Panel | Yönetici panelinde de kullanılabilir. |

| Sağ Panel | Yan Panel | Side Panel | Genel panel tanımı | Evet | Ekranın kenarında yer alan kontrol panelidir. | Side Panel | Sağ panel bağlamında “Sağ Panel” tercih edilir. |

| Sağ Panel | Ana Menü | Main Menu | Sağ panel sekmeleri | Evet | Sağ paneldeki ana sekme grubudur. | Main Menu |  |

| Sağ Panel | Sekme | Tab | Panel navigasyonu | Evet | Aynı panel içinde farklı bölümlere geçiş sağlayan başlıktır. | Tab |  |

| Sağ Panel | Akordiyon Menü | Accordion Menu | Ayar panelleri | Evet | Açılıp kapanabilen ayar grubudur. | Accordion |  |

| Sağ Panel | Açılır Panel | Collapsible Panel | Ayar panelleri | Evet | Tıklanınca açılıp kapanan paneldir. | Collapsible Panel |  |

| Sağ Panel | Panel Başlığı | Panel Title | Sağ panel | Evet | Panel bölümünün adını gösterir. | Panel Title |  |

| Sağ Panel | Ayar Grubu | Settings Group | Sağ panel | Evet | Birbiriyle ilişkili ayarların toplandığı bölümdür. | Settings Group |  |

| Sağ Panel | Detay Ayarları | Detail Settings | Seçili öğe ayarları | Evet | Seçilen öğeye ait daha ayrıntılı ayarlardır. | Detail Settings |  |

| Sağ Panel | Gelişmiş Ayarlar | Advanced Settings | İleri seviye ayarlar | Evet | Daha ayrıntılı ve uzman kullanıma yönelik ayarlardır. | Advanced Settings | Çok görünür yapılmamalı. |

| Sağ Panel | Ürünler | Products | Sağ panel ana sekmesi | Evet | Ürün yükleme, ürün havuzu ve ürün yerleştirme işlemlerini içerir. | Products | Ana sekme adı sabit tutulmalı. |

| Sağ Panel | Tasarım | Design | Sağ panel ana sekmesi | Evet | Şablon, ızgara ve arka plan gibi genel tasarım ayarlarını içerir. | Design | Ana sekme adı sabit tutulmalı. |

| Sağ Panel | Hücre | Cell / Slot | Sağ panel ana sekmesi | Evet | Hücre, fiyat kutusu ve seçili ürün alanı ayarlarını içerir. | Slot | Ana sekme adı sabit tutulmalı. |

| Sağ Panel | Modüller | Modules | Sağ panel ana sekmesi | Evet | Banner, footer, fiyat listesi gibi hazır blokları içerir. | Modules | Ana sekme adı sabit tutulmalı. |

| Sağ Panel | Şablon | Template | Tasarım sekmesi | Evet | Aktif tasarım yapısı ve şablon bilgilerini içerir. | Template |  |

| Sağ Panel | Izgara | Grid | Tasarım sekmesi | Evet | Sayfa ve hücre düzenini belirleyen satır-sütun yapısıdır. | Grid | UI’da Grid kullanılmamalı. |

| Sağ Panel | Arka Plan | Background | Tasarım sekmesi | Evet | Sayfa veya forma zeminini yönetir. | Background |  |

| Sağ Panel | Ürün Bilgisi | Product Info | Hücre / ürün ayarları | Evet | Seçili ürünün adı, fiyatı, kodu ve görsel bilgilerini içerir. | Product Info |  |

| Sağ Panel | Genel Hücre Ayarları | Global Cell Settings | Hücre ayarları | Evet | Tüm genel hücreleri etkileyen ayarlardır. | Global Cell Settings |  |

| Sağ Panel | Özel Hücre Ayarları | Custom Cell Settings | Hücre ayarları | Evet | Yalnızca seçili özel hücreyi etkileyen ayarlardır. | Custom Cell Settings |  |

| Sağ Panel | Genel Fiyat Ayarları | Global Price Settings | Fiyat kutusu ayarları | Evet | Tüm genel fiyat kutularını etkileyen ayarlardır. | Global Price Settings |  |

| Sağ Panel | Banner Ayarları | Banner Settings | Modül ayarları | Evet | Seçili banner modülünün ayarlarını içerir. | Banner Settings |  |

| Sağ Panel | Footer Ayarları | Footer Settings | Modül ayarları | Evet | Sayfa altı bilgi alanının ayarlarını içerir. | Footer Settings | UI’da “Alt Bilgi Ayarları” da düşünülebilir. |

| Sağ Panel | Pizza Fiyat Listesi Ayarları | Pizza Price List Settings | Modül ayarları | Evet | Pizza fiyat listesi modülünün tablo ve görünüm ayarlarını içerir. | Pizza Price List Settings |  |



\---



\## 5. Sol Panel / Kütüphane / Varlık Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Kütüphane | Sol Panel | Left Panel | Tasarım stüdyosu | Evet | Varlıklar, medya veya bekleme alanı gibi yardımcı kaynakları içeren sol paneldir. | Left Panel |  |

| Kütüphane | Varlıklar | Assets | Sol panel / kullanıcı paneli | Evet | Görsel, logo, ikon ve dosya gibi tasarım kaynaklarıdır. | Assets | UI’da Assets kullanılmamalı. |

| Kütüphane | Kütüphane | Library | Sol panel | Evet | Kullanıcının görsel, dosya ve modül kaynaklarına eriştiği alandır. | Library |  |

| Kütüphane | Medya Kütüphanesi | Media Library | Sol panel / kullanıcı paneli | Evet | Görsel, fotoğraf, logo ve dosyaların bulunduğu alandır. | Media Library |  |

| Kütüphane | Görseller | Images | Medya alanı | Evet | Tasarımda kullanılabilecek görsel dosyalarıdır. | Images |  |

| Kütüphane | Fotoğraflar | Photos | Medya alanı | Evet | Fotoğraf dosyalarını ifade eder. | Photos |  |

| Kütüphane | Logolar | Logos | Marka varlıkları | Evet | Marka veya firma logolarıdır. | Logos |  |

| Kütüphane | İkonlar | Icons | Varlıklar | Evet | Arayüz veya tasarım içinde kullanılan küçük sembol görselleridir. | Icons |  |

| Kütüphane | Şekiller | Shapes | Varlıklar | Evet | Dikdörtgen, daire, çizgi gibi temel tasarım şekilleridir. | Shapes |  |

| Kütüphane | Arka Planlar | Backgrounds | Varlıklar | Evet | Sayfa veya alan zemininde kullanılabilecek görsellerdir. | Backgrounds |  |

| Kütüphane | Dokular | Textures | Varlıklar | Evet | Kağıt, kumaş, desen gibi yüzey hissi veren görsellerdir. | Textures |  |

| Kütüphane | Desenler | Patterns | Varlıklar | Evet | Tekrarlı zemin veya süsleme görselleridir. | Patterns |  |

| Kütüphane | Yüklenenler | Uploads | Medya alanı | Evet | Kullanıcının sisteme yüklediği dosyalardır. | Uploads |  |

| Kütüphane | Son Kullanılanlar | Recently Used | Medya alanı | Evet | Kullanıcının yakın zamanda kullandığı varlıklardır. | Recently Used |  |

| Kütüphane | Favoriler | Favorites | Medya alanı | Evet | Kullanıcının sık kullanmak için işaretlediği varlıklardır. | Favorites |  |

| Kütüphane | Marka Varlıkları | Brand Assets | Marka alanı | Evet | Marka renkleri, fontları, logoları ve görselleridir. | Brand Assets | Kullanıcı panelinde ana terim. |

| Kütüphane | Marka Kiti | Brand Kit | Marka alanı | Evet | Markaya ait renk, font ve logo setidir. | Brand Kit | UI’da “Marka Varlıkları” daha anlaşılır olabilir. |

| Kütüphane | Renk Paletleri | Color Palettes | Marka / stil | Evet | Birlikte kullanılan renk setleridir. | Color Palettes |  |

| Kütüphane | Fontlar | Fonts | Marka / tipografi | Evet | Tasarımda kullanılabilecek yazı tipleridir. | Fonts |  |

| Kütüphane | Kayıtlı Modüller | Saved Modules | Modül kütüphanesi | Evet | Kullanıcının kaydettiği tekrar kullanılabilir modüllerdir. | Saved Modules |  |

| Kütüphane | Modüllerim | My Modules | Kullanıcı modülleri | Evet | Kullanıcının kendi kaydettiği modüllerdir. | My Modules |  |

| Kütüphane | Şablonlarım | My Templates | Kullanıcı şablonları | Evet | Kullanıcının kendi kaydettiği şablonlardır. | My Templates |  |

| Kütüphane | Ürün Havuzu | Product Pool | Ürün listesi | Evet | Excel’den gelen veya manuel eklenen ürünlerin listelendiği alandır. | Product Pool | Ana terim. |

| Kütüphane | Bekleme Alanı | Temporary Pool | Geçici ürün alanı | Evet | Yerleştirilemeyen veya geçici olarak çıkarılan ürünlerin beklediği alandır. | Temporary Pool, Geçici Havuz | Kullanıcı için daha sade. |

| Kütüphane | Medya Galerisi | Media Gallery | Medya alanı | Evet | Kullanılabilir medya dosyalarının görsel listesidir. | Media Gallery |  |

| Kütüphane | Dosya Yükle | Upload File | Medya / veri | Evet | Kullanıcının dosya yüklemesini sağlar. | Upload File |  |

| Kütüphane | Görsel Yükle | Upload Image | Medya | Evet | Kullanıcının görsel dosyası yüklemesini sağlar. | Upload Image |  |

| Kütüphane | Logo Yükle | Upload Logo | Marka varlıkları | Evet | Kullanıcının logo dosyası yüklemesini sağlar. | Upload Logo |  |



\---



\## 6. Seçim / Nesne İşlem Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Seçim / İşlem | Seç | Select | Genel işlem | Evet | Bir öğeyi aktif hale getirir. | Select |  |

| Seçim / İşlem | Seçimi Kaldır | Deselect | Genel işlem | Evet | Aktif seçimi kaldırır. | Deselect |  |

| Seçim / İşlem | Tümünü Seç | Select All | Genel işlem | Evet | Tüm uygun öğeleri seçer. | Select All |  |

| Seçim / İşlem | Çoklu Seçim | Multi-select | Seçim işlemi | Evet | Birden fazla öğenin aynı anda seçilmesidir. | Multi-select |  |

| Seçim / İşlem | Seçili Nesne | Selected Object | Editör durumu | Evet | Kullanıcının seçtiği tasarım öğesidir. | Selected Object |  |

| Seçim / İşlem | Seçili Hücre | Selected Cell | Hücre ayarları | Evet | Kullanıcının seçtiği hücredir. | Selected Slot | “Slot” kullanılmamalı. |

| Seçim / İşlem | Seçili Metin | Selected Text | Metin ayarları | Evet | Kullanıcının seçtiği metindir. | Selected Text |  |

| Seçim / İşlem | Seçili Görsel | Selected Image | Görsel ayarları | Evet | Kullanıcının seçtiği görseldir. | Selected Image |  |

| Seçim / İşlem | Seçili Modül | Selected Module | Modül ayarları | Evet | Kullanıcının seçtiği hazır modüldür. | Selected Module |  |

| Seçim / İşlem | Taşı | Move | Genel işlem | Evet | Seçili öğeyi konumlandırır. | Move |  |

| Seçim / İşlem | Sürükle | Drag | Genel işlem | Evet | Bir öğeyi fareyle tutup hareket ettirme işlemidir. | Drag |  |

| Seçim / İşlem | Sürükle-Bırak | Drag and Drop | Genel işlem | Evet | Bir öğeyi tutup başka bir alana bırakma işlemidir. | Drag and Drop |  |

| Seçim / İşlem | Bırak | Drop | Genel işlem | Evet | Sürüklenen öğeyi hedef alana yerleştirir. | Drop |  |

| Seçim / İşlem | Yerleştir | Place | Ürün / modül / görsel | Evet | Seçili öğeyi tasarım alanına ekler. | Place |  |

| Seçim / İşlem | Konumlandır | Position | Nesne ayarları | Evet | Öğenin çalışma yüzeyindeki yerini belirler. | Position |  |

| Seçim / İşlem | Kopyala | Copy | Genel işlem | Evet | Seçili öğenin kopyasını alır. | Copy |  |

| Seçim / İşlem | Yapıştır | Paste | Genel işlem | Evet | Kopyalanan öğeyi ekler. | Paste |  |

| Seçim / İşlem | Kes | Cut | Genel işlem | Evet | Seçili öğeyi bulunduğu yerden kaldırıp kopyalar. | Cut |  |

| Seçim / İşlem | Sil | Delete | Genel işlem | Evet | Seçili öğeyi kaldırır. | Delete |  |

| Seçim / İşlem | Temizle | Clear | İçerik işlemi | Evet | Seçili alandaki içeriği kaldırır. | Clear | Tasarım düzenini koruyabilir. |

| Seçim / İşlem | İçeriği Temizle | Clear Content | Hücre / alan işlemi | Evet | Hücrenin içindeki ürünü veya içeriği kaldırır. | Clear Content |  |

| Seçim / İşlem | Biçimi Temizle | Clear Formatting | Stil işlemi | Evet | Seçili öğedeki özel biçimlendirmeyi kaldırır. | Clear Formatting |  |

| Seçim / İşlem | Çoğalt | Duplicate | Genel işlem | Evet | Seçili öğenin yeni bir kopyasını oluşturur. | Duplicate |  |

| Seçim / İşlem | Grupla | Group | Nesne işlemi | Evet | Birden fazla öğeyi birlikte hareket edecek şekilde birleştirir. | Group |  |

| Seçim / İşlem | Grubu Çöz | Ungroup | Nesne işlemi | Evet | Gruplanmış öğeleri tekrar ayırır. | Ungroup |  |

| Seçim / İşlem | Kilitle | Lock | Nesne işlemi | Evet | Seçili öğenin yanlışlıkla düzenlenmesini engeller. | Lock |  |

| Seçim / İşlem | Kilidi Aç | Unlock | Nesne işlemi | Evet | Kilitli öğeyi yeniden düzenlenebilir hale getirir. | Unlock |  |

| Seçim / İşlem | Gizle | Hide | Görünürlük işlemi | Evet | Seçili öğeyi görünmez yapar. | Hide |  |

| Seçim / İşlem | Göster | Show | Görünürlük işlemi | Evet | Gizlenmiş öğeyi görünür yapar. | Show |  |

| Seçim / İşlem | Öne Al | Bring Forward | Katman işlemi | Evet | Seçili öğeyi bir katman öne taşır. | Bring Forward |  |

| Seçim / İşlem | Arkaya Gönder | Send Backward | Katman işlemi | Evet | Seçili öğeyi bir katman geriye taşır. | Send Backward |  |

| Seçim / İşlem | En Öne Getir | Bring to Front | Katman işlemi | Evet | Seçili öğeyi en üst katmana taşır. | Bring to Front |  |

| Seçim / İşlem | En Arkaya Gönder | Send to Back | Katman işlemi | Evet | Seçili öğeyi en alt katmana taşır. | Send to Back |  |

| Seçim / İşlem | Alanı Boşalt | Clear Area | Hücre / alan işlemi | Evet | Seçili alanın içeriğini kaldırır. | Clear Area |  |

| Seçim / İşlem | Bekleme Alanına Gönder | Send to Waiting Area | Ürün işlemi | Evet | Seçili ürünü tasarımdan çıkarıp Bekleme Alanı’na taşır. | Send to Temporary Pool |  |

| Seçim / İşlem | Ürün Değiştir | Replace Product | Ürün işlemi | Evet | Seçili hücredeki ürünü başka bir ürünle değiştirir. | Replace Product |  |

| Seçim / İşlem | Takasla | Swap | Ürün / hücre işlemi | Evet | İki hücrenin içeriklerini yer değiştirir. | Swap |  |

| Seçim / İşlem | Yer Değiştir | Swap / Replace | Ürün / hücre işlemi | Evet | Öğelerin veya ürünlerin konumunu değiştirir. | Swap |  |



\---



\## 7. Katman / Sıralama Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Katman | Katman | Layer | Tasarım stüdyosu | Evet | Tasarım öğelerinin üst üste sıralanmasını sağlayan yapıdır. | Layer | Türkçe “Katman” kullanılmalı. |

| Katman | Katmanlar | Layers | Katman paneli | Evet | Tasarımdaki tüm katmanların listelendiği yapıdır. | Layers |  |

| Katman | Katman Listesi | Layer List | Katman paneli | Evet | Tasarımdaki katmanların sıralı listesidir. | Layer List |  |

| Katman | Katman Sırası | Layer Order | Katman işlemi | Evet | Öğelerin hangi sırayla üst üste görüneceğini belirler. | Layer Order |  |

| Katman | Ön Katman | Front Layer | Katman yapısı | Evet | Daha üstte görünen katmandır. | Front Layer |  |

| Katman | Arka Katman | Back Layer | Katman yapısı | Evet | Daha altta görünen katmandır. | Back Layer |  |

| Katman | Z-Index | Z-Index | Teknik katman yapısı | Hayır | Katmanların teknik sıralama değeridir. | Z-Index | UI’da kullanılmamalı. |

| Katman | Üstte | Above | Katman konumu | Evet | Öğenin diğer öğelerin üzerinde olduğunu belirtir. | Above |  |

| Katman | Altta | Below | Katman konumu | Evet | Öğenin diğer öğelerin altında olduğunu belirtir. | Below |  |

| Katman | Katman Grubu | Layer Group | Katman paneli | Evet | Birden fazla katmanın birlikte gruplanmasıdır. | Layer Group |  |

| Katman | Katman Maskesi | Layer Mask | Teknik tasarım | Teknik dokümanda kullanılabilir | Katmanın yalnızca belirli alanlarda görünmesini sağlayan maskedir. | Layer Mask | Kullanıcıya basit gösterilmeli. |

| Katman | Maske | Mask | Tasarım işlemi | Açıklamada kullanılabilir | Bir öğenin görünür alanını sınırlandıran yapıdır. | Mask |  |

| Katman | Kırpma Maskesi | Clipping Mask | Teknik tasarım | Teknik dokümanda kullanılabilir | Görselin belirli bir şekil içinde görünmesini sağlar. | Clipping Mask | UI’da “Şekle Sığdır” gibi sadeleştirilebilir. |

| Katman | Maskele | Mask | Tasarım işlemi | Açıklamada kullanılabilir | Öğenin görünür alanını belirli bir sınır içinde tutar. | Mask |  |

| Katman | Maskeyi Kaldır | Remove Mask | Tasarım işlemi | Açıklamada kullanılabilir | Uygulanan maskeyi kaldırır. | Remove Mask |  |

| Katman | Katman Görünürlüğü | Layer Visibility | Katman paneli | Evet | Katmanın görünür veya gizli olduğunu belirtir. | Layer Visibility |  |

| Katman | Katman Kilidi | Layer Lock | Katman paneli | Evet | Katmanın düzenlenip düzenlenemeyeceğini belirler. | Layer Lock |  |

| Katman | Arka Plan Katmanı | Background Layer | Katman yapısı | Evet | Arka planı oluşturan katmandır. | Background Layer |  |

| Katman | Görsel Katmanı | Image Layer | Katman yapısı | Evet | Görsel içeren katmandır. | Image Layer |  |

| Katman | Metin Katmanı | Text Layer | Katman yapısı | Evet | Metin içeren katmandır. | Text Layer |  |

| Katman | Şekil Katmanı | Shape Layer | Katman yapısı | Evet | Şekil içeren katmandır. | Shape Layer |  |

| Katman | Modül Katmanı | Module Layer | Katman yapısı | Evet | Hazır modül içeren katmandır. | Module Layer |  |

| Katman | Ürün Katmanı | Product Layer | Katman yapısı | Evet | Ürün bilgisi veya ürün görseli içeren katmandır. | Product Layer |  |

| Katman | Fiyat Katmanı | Price Layer | Katman yapısı | Evet | Fiyat kutusu veya fiyat metnini içeren katmandır. | Price Layer |  |

| Katman | Rozet Katmanı | Badge Layer | Katman yapısı | Evet | Promosyon etiketi veya rozet içeren katmandır. | Badge Layer |  |

| Katman | Footer Katmanı | Footer Layer | Katman yapısı | Evet | Sayfa altı bilgi alanını içeren katmandır. | Footer Layer | “Alt Bilgi Katmanı” da kullanılabilir. |

| Katman | Global Katman | Global Layer | Teknik katman yapısı | Teknik dokümanda kullanılabilir | Birden fazla sayfa veya yüzeye uygulanan katmandır. | Global Layer |  |

| Katman | Sayfa Katmanı | Page Layer | Teknik katman yapısı | Teknik dokümanda kullanılabilir | Belirli bir sayfaya ait katmandır. | Page Layer |  |

| Katman | Forma Katmanı | Form Layer | Teknik katman yapısı | Teknik dokümanda kullanılabilir | Belirli bir formaya ait katmandır. | Form Layer | Kullanıcıya açıklamalı gösterilmeli. |



\---



\## 8. Hizalama / Dağıtma / Konum Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Hizalama / Konum | Hizala | Align | Araç çubuğu | Evet | Seçili öğeyi belirli bir yöne veya merkeze hizalar. | Align |  |

| Hizalama / Konum | Sola Hizala | Align Left | Araç çubuğu | Evet | Seçili öğeyi sola hizalar. | Align Left |  |

| Hizalama / Konum | Sağa Hizala | Align Right | Araç çubuğu | Evet | Seçili öğeyi sağa hizalar. | Align Right |  |

| Hizalama / Konum | Ortala | Center Align | Araç çubuğu | Evet | Seçili öğeyi ortaya hizalar. | Center Align |  |

| Hizalama / Konum | Üste Hizala | Align Top | Araç çubuğu | Evet | Seçili öğeyi üst kenara hizalar. | Align Top |  |

| Hizalama / Konum | Alta Hizala | Align Bottom | Araç çubuğu | Evet | Seçili öğeyi alt kenara hizalar. | Align Bottom |  |

| Hizalama / Konum | Yatay Ortala | Center Horizontally | Araç çubuğu | Evet | Seçili öğeyi yatay eksende ortalar. | Center Horizontally |  |

| Hizalama / Konum | Dikey Ortala | Center Vertically | Araç çubuğu | Evet | Seçili öğeyi dikey eksende ortalar. | Center Vertically |  |

| Hizalama / Konum | Sayfaya Hizala | Align to Page | Hizalama seçeneği | Evet | Seçili öğeyi sayfaya göre hizalar. | Align to Page |  |

| Hizalama / Konum | Seçime Hizala | Align to Selection | Hizalama seçeneği | Evet | Öğeleri seçili grup içinde hizalar. | Align to Selection |  |

| Hizalama / Konum | Hücreye Hizala | Align to Cell | Hücre ayarları | Evet | İçeriği hücre sınırlarına göre hizalar. | Align to Slot |  |

| Hizalama / Konum | Güvenli Alana Hizala | Align to Safe Area | Baskı güvenliği | Evet | İçeriği güvenli alan içinde hizalar. | Align to Safe Area |  |

| Hizalama / Konum | Dağıt | Distribute | Araç çubuğu | Evet | Seçili öğeleri eşit aralıkla dağıtır. | Distribute |  |

| Hizalama / Konum | Yatay Dağıt | Distribute Horizontally | Araç çubuğu | Evet | Öğeleri yatayda eşit aralıkla dağıtır. | Distribute Horizontally |  |

| Hizalama / Konum | Dikey Dağıt | Distribute Vertically | Araç çubuğu | Evet | Öğeleri dikeyde eşit aralıkla dağıtır. | Distribute Vertically |  |

| Hizalama / Konum | Eşit Aralıkla Dağıt | Distribute Evenly | Araç çubuğu | Evet | Seçili öğeler arasında eşit boşluk bırakır. | Distribute Evenly |  |

| Hizalama / Konum | Konum | Position | Nesne ayarları | Evet | Seçili öğenin çalışma yüzeyindeki yerini belirtir. | Position |  |

| Hizalama / Konum | X Konumu | X Position | Nesne ayarları | Evet | Öğenin yatay konum değeridir. | X Position |  |

| Hizalama / Konum | Y Konumu | Y Position | Nesne ayarları | Evet | Öğenin dikey konum değeridir. | Y Position |  |

| Hizalama / Konum | Sol | Left | Konum / boşluk | Evet | Sol yön veya sol kenar değeridir. | Left |  |

| Hizalama / Konum | Sağ | Right | Konum / boşluk | Evet | Sağ yön veya sağ kenar değeridir. | Right |  |

| Hizalama / Konum | Üst | Top | Konum / boşluk | Evet | Üst yön veya üst kenar değeridir. | Top |  |

| Hizalama / Konum | Alt | Bottom | Konum / boşluk | Evet | Alt yön veya alt kenar değeridir. | Bottom |  |

| Hizalama / Konum | Merkez | Center | Konum | Evet | Orta noktayı ifade eder. | Center |  |

| Hizalama / Konum | Başlangıç | Start | Hizalama / teknik | Açıklamada kullanılabilir | Akış veya hizalamanın başladığı yönü ifade eder. | Start |  |

| Hizalama / Konum | Bitiş | End | Hizalama / teknik | Açıklamada kullanılabilir | Akış veya hizalamanın bittiği yönü ifade eder. | End |  |

| Hizalama / Konum | Döndür | Rotate | Nesne işlemi | Evet | Seçili öğeyi belirli açıyla çevirir. | Rotate |  |

| Hizalama / Konum | Açı | Angle | Nesne ayarı | Evet | Döndürme değerini belirtir. | Angle |  |

| Hizalama / Konum | Genişlik | Width | Nesne ayarı | Evet | Öğenin yatay ölçüsüdür. | Width |  |

| Hizalama / Konum | Yükseklik | Height | Nesne ayarı | Evet | Öğenin dikey ölçüsüdür. | Height |  |

| Hizalama / Konum | Oran | Ratio | Nesne ayarı | Evet | Genişlik ve yükseklik arasındaki ilişkiyi ifade eder. | Ratio |  |

| Hizalama / Konum | Oranı Koru | Keep Ratio | Nesne ayarı | Evet | Öğeyi büyütürken veya küçültürken oranını korur. | Keep Ratio |  |

| Hizalama / Konum | Orantılı Ölçekle | Scale Proportionally | Nesne ayarı | Evet | Öğeyi oranı bozulmadan büyütür veya küçültür. | Scale Proportionally |  |

| Hizalama / Konum | Kırp | Crop | Görsel işlemi | Evet | Görselin yalnızca seçilen kısmını gösterir. | Crop |  |

| Hizalama / Konum | Sığdır | Fit | Görsel / nesne işlemi | Evet | İçeriği alanın içine tamamen sığdırır. | Fit |  |

| Hizalama / Konum | Doldur | Fill | Görsel / nesne işlemi | Evet | İçeriği alanı tamamen kaplayacak şekilde yerleştirir. | Fill |  |

| Hizalama / Konum | Uydur | Fit / Adapt | Görsel işlemi | Evet | Görseli alana uygun hale getirir. | Fit | “Sığdır” daha net olabilir. |

| Hizalama / Konum | Taşır | Overflow | Teknik açıklama | Açıklamada kullanılabilir | İçeriğin alan dışına çıkmasıdır. | Overflow |  |

| Hizalama / Konum | Serbest Konum | Free Position | Görsel / nesne ayarı | Evet | Öğenin otomatik hizaya bağlı olmadan taşınmasını sağlar. | Free Position |  |

| Hizalama / Konum | Otomatik Konum | Auto Position | Görsel / nesne ayarı | Evet | Öğenin sistem tarafından konumlandırılmasıdır. | Auto Position |  |

| Hizalama / Konum | Odak Noktası | Focal Point | Görsel ayarı | Evet | Görselde dikkat edilmesi gereken ana noktayı belirler. | Focal Point |  |



\---



\## 9. Izgara / Hücre / Alan Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Izgara / Hücre | Izgara | Grid | Tasarım sekmesi | Evet | Sayfanın satır ve sütunlara bölünmüş yerleşim yapısıdır. | Grid | Ana teknik karşılık Grid, UI’da Izgara. |

| Izgara / Hücre | Düzen | Layout | Kullanıcı akışı / açıklama | Evet | Tasarımın genel yerleşim yapısını ifade eder. | Layout | Kullanıcıya daha sade gelebilir. |

| Izgara / Hücre | Hücre | Cell / Slot | Hücre sekmesi / ürün alanları | Evet | Ürün, fiyat ve görselin yerleştiği temel kutu alanıdır. | Slot | Presserdiado’da ana terim. |

| Izgara / Hücre | Slot | Slot | Teknik veri modeli | Hayır | Hücrenin teknik karşılığıdır. | Slot | UI’da kullanılmamalı. |

| Izgara / Hücre | Alan | Area / Zone | Serbest tasarım / modül | Evet | Tasarımda içerik yerleştirilebilen bölümdür. | Zone | Bağlama göre “Hücre” yerine kullanılabilir. |

| Izgara / Hücre | Ürün Alanı | Product Area | Hücre / modül | Evet | Ürün bilgisinin yerleştirildiği alandır. | Product Area |  |

| Izgara / Hücre | Serbest Alan | Free Area / Free Canvas | Hücre / modül | Evet | İçine görsel, metin veya modül serbestçe yerleştirilebilen alandır. | Free Canvas |  |

| Izgara / Hücre | Ürün Hücresi | Product Cell | Hücre yapısı | Evet | Ürün bilgisi göstermek için kullanılan hücredir. | Product Slot |  |

| Izgara / Hücre | Özel Hücre | Custom Cell | Hücre yapısı | Evet | Genel ayarlardan bağımsız olarak düzenlenen hücredir. | Custom Slot |  |

| Izgara / Hücre | Global Hücre | Global Cell | Hücre yapısı | Açıklamada kullanılabilir | Genel hücre ayarlarını takip eden standart hücredir. | Global Slot | Kullanıcıya “Genel Hücre” daha açık olabilir. |

| Izgara / Hücre | Genel Hücre | Global Cell | Hücre yapısı | Evet | Genel ayarlara bağlı çalışan standart hücredir. | Global Slot |  |

| Izgara / Hücre | Varsayılan Hücre | Default Cell | Hücre yapısı | Evet | Şablon veya genel ayarlara göre oluşturulan hücredir. | Default Cell |  |

| Izgara / Hücre | Birleştirilmiş Hücre | Merged Cell | Hücre işlemi | Evet | Birden fazla hücrenin tek büyük alan haline getirilmiş halidir. | Merged Slot |  |

| Izgara / Hücre | Boş Hücre | Empty Cell | Hücre durumu | Evet | İçinde ürün veya içerik olmayan hücredir. | Empty Slot |  |

| Izgara / Hücre | Dolu Hücre | Filled Cell | Hücre durumu | Evet | İçinde ürün veya içerik bulunan hücredir. | Filled Slot |  |

| Izgara / Hücre | Gizli Hücre | Hidden Cell | Teknik hücre durumu | Teknik dokümanda kullanılabilir | Birleşme nedeniyle görünmeyen hücredir. | Hidden Slot |  |

| Izgara / Hücre | Satır | Row | Izgara ayarı | Evet | Izgaradaki yatay hücre dizisidir. | Row |  |

| Izgara / Hücre | Sütun | Column | Izgara ayarı | Evet | Izgaradaki dikey hücre dizisidir. | Column |  |

| Izgara / Hücre | Satır Sayısı | Row Count | Izgara ayarı | Evet | Izgaradaki toplam satır adedidir. | Row Count |  |

| Izgara / Hücre | Sütun Sayısı | Column Count | Izgara ayarı | Evet | Izgaradaki toplam sütun adedidir. | Column Count |  |

| Izgara / Hücre | Hücre Aralığı | Cell Gap | Hücre / ızgara ayarı | Evet | Hücreler arasındaki boşluktur. | Cell Gap |  |

| Izgara / Hücre | Hücre Boşluğu | Cell Spacing | Hücre ayarı | Evet | Hücrelerin arasındaki görsel mesafedir. | Cell Spacing |  |

| Izgara / Hücre | Izgara Boşluğu | Grid Gap | Izgara ayarı | Açıklamada kullanılabilir | Izgara içindeki satır ve sütun boşluğudur. | Grid Gap | UI’da “Hücre Boşluğu” daha anlaşılır. |

| Izgara / Hücre | Satır Boşluğu | Row Gap | Izgara ayarı | Evet | Satırlar arasındaki boşluktur. | Row Gap |  |

| Izgara / Hücre | Sütun Boşluğu | Column Gap | Izgara ayarı | Evet | Sütunlar arasındaki boşluktur. | Column Gap |  |

| Izgara / Hücre | Hücreleri Birleştir | Merge Cells | Hücre işlemi | Evet | Seçili hücreleri tek alan haline getirir. | Merge Slots |  |

| Izgara / Hücre | Hücreyi Böl | Split Cell | Hücre işlemi | Evet | Birleştirilmiş hücreyi yeniden ayırır. | Split Cell |  |

| Izgara / Hücre | Hücreleri Ayır | Unmerge Cells | Hücre işlemi | Evet | Birleştirilmiş hücreleri eski haline getirir. | Unmerge Cells |  |

| Izgara / Hücre | Genel Hücre Yapısı | Global Cell Structure | Izgara ayarı | Evet | Tüm sayfalardaki genel hücre düzenini belirler. | Global Grid |  |

| Izgara / Hücre | Sayfaya Özel Hücre Yapısı | Page-specific Cell Structure | Izgara ayarı | Evet | Yalnızca seçili sayfanın hücre düzenini belirler. | Page Grid |  |

| Izgara / Hücre | Varsayılan Düzen | Default Layout | Izgara / şablon | Evet | Sistem tarafından başlangıçta verilen standart yerleşimdir. | Default Layout |  |

| Izgara / Hücre | Sayfaya Özel Düzen | Page-specific Layout | Izgara / sayfa ayarı | Evet | Sadece seçili sayfaya uygulanmış özel yerleşimdir. | Page Layout |  |

| Izgara / Hücre | Tüm Sayfalara Uygula | Apply to All Pages | Ayar işlemi | Evet | Ayarı tüm sayfalara uygular. | Apply to All Pages |  |

| Izgara / Hücre | Bu Sayfaya Uygula | Apply to This Page | Ayar işlemi | Evet | Ayarı yalnızca seçili sayfaya uygular. | Apply to This Page |  |

| Izgara / Hücre | Sayfayı Globalden Ayır | Detach Page from Global | Izgara / sayfa ayarı | Açıklamada kullanılabilir | Seçili sayfanın genel ayarlardan bağımsız düzenlenmesini sağlar. | Detach from Global | Kullanıcıya daha sade anlatılmalı. |

| Izgara / Hücre | Varsayılana Dön | Reset to Default | Ayar işlemi | Evet | Seçili ayarı sistemin varsayılan değerine döndürür. | Reset to Default |  |

| Izgara / Hücre | Mizanpaj | Layout | Teknik tasarım | Açıklamada kullanılabilir | Sayfa üzerindeki görsel yerleşim düzenidir. | Layout | Kullanıcıya “Düzen” daha sade olabilir. |

| Izgara / Hücre | Otomatik Yerleşim | Auto Layout | Tasarım / veri | Evet | İçeriklerin sistem tarafından otomatik yerleştirilmesidir. | Auto Layout | Figma’daki Auto Layout ile karıştırılmamalı. |

| Izgara / Hücre | Otomatik Dizilim | Auto Placement | Ürün yerleştirme | Evet | Ürünlerin Excel sırasına veya kurala göre hücrelere yerleştirilmesidir. | Auto Placement |  |

| Izgara / Hücre | Alan Eşleme | Field Mapping | Excel / veri | Evet | Excel sütunlarının sistem alanlarıyla eşleştirilmesidir. | Field Mapping |  |

| Izgara / Hücre | Stil Kopyala | Copy Style | Hücre işlemi | Evet | Seçili hücrenin görsel stilini kopyalar. | Copy Style |  |

| Izgara / Hücre | Stil Yapıştır | Paste Style | Hücre işlemi | Evet | Kopyalanan stili başka hücreye uygular. | Paste Style |  |



\---



\## 10. Serbest Tasarım / Nesne Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Serbest Tasarım | Serbest Tasarım | Free Design / Freeform Design | Başlangıç modu | Evet | Hücre yapısına bağlı kalmadan özgür tasarım yapılmasını sağlar. | Freeform Design |  |

| Serbest Tasarım | Serbest Tuval | Free Canvas | Teknik açıklama | Hayır | Serbest düzenleme alanının teknik karşılığıdır. | Free Canvas | UI’da “Serbest Alan” tercih edilmeli. |

| Serbest Tasarım | Serbest Alan | Free Area | Hücre / modül | Evet | İçine metin, görsel, şekil veya modül yerleştirilebilen özgür alandır. | Free Canvas |  |

| Serbest Tasarım | Serbest Nesne | Free Object | Nesne yapısı | Evet | Hücre düzeninden bağımsız konumlandırılabilen tasarım öğesidir. | Free Object |  |

| Serbest Tasarım | Metin Kutusu | Text Box | Nesne ekleme | Evet | Kullanıcının metin yazabildiği kutudur. | Text Box |  |

| Serbest Tasarım | Görsel | Image | Nesne ekleme | Evet | Tasarıma eklenen fotoğraf, ürün resmi veya grafik dosyasıdır. | Image |  |

| Serbest Tasarım | Logo | Logo | Nesne ekleme | Evet | Marka veya firma logosudur. | Logo |  |

| Serbest Tasarım | Şekil | Shape | Nesne ekleme | Evet | Dikdörtgen, daire veya benzeri çizim öğesidir. | Shape |  |

| Serbest Tasarım | Çizgi | Line | Nesne ekleme | Evet | Düz çizgi öğesidir. | Line |  |

| Serbest Tasarım | Ok | Arrow | Nesne ekleme | Evet | Yön veya vurgu göstermek için kullanılan ok öğesidir. | Arrow |  |

| Serbest Tasarım | Dikdörtgen | Rectangle | Şekil | Evet | Dikdörtgen şekil öğesidir. | Rectangle |  |

| Serbest Tasarım | Daire | Circle | Şekil | Evet | Daire şekil öğesidir. | Circle |  |

| Serbest Tasarım | Yıldız | Star | Şekil / rozet | Evet | Yıldız biçimli şekil öğesidir. | Star |  |

| Serbest Tasarım | Çerçeve | Frame | Serbest tasarım / görsel alanı | Evet | İçine görsel veya öğe yerleştirilebilen sınırlandırılmış alandır. | Frame | Figma karşılığı Frame. |

| Serbest Tasarım | Konteyner | Container | Teknik düzen | Teknik dokümanda kullanılabilir | İçinde başka öğeler barındıran alan yapısıdır. | Container | UI’da “Alan” tercih edilebilir. |

| Serbest Tasarım | Alan Kutusu | Area Box | Serbest tasarım | Evet | İçerik yerleştirilebilen kutu alanıdır. | Area Box |  |

| Serbest Tasarım | Fotoğraf Alanı | Photo Area | Şablon / modül | Evet | Fotoğraf yerleştirmek için ayrılmış alandır. | Photo Area |  |

| Serbest Tasarım | Görsel Alanı | Image Area | Şablon / modül | Evet | Görsel yerleştirmek için ayrılmış alandır. | Image Area |  |

| Serbest Tasarım | Metin Alanı | Text Area | Şablon / modül | Evet | Metin yazmak için ayrılmış alandır. | Text Area |  |

| Serbest Tasarım | Grup | Group | Nesne grubu | Evet | Birlikte hareket eden birden fazla öğedir. | Group |  |

| Serbest Tasarım | Bileşen | Component | Teknik tasarım sistemi | Teknik dokümanda kullanılabilir | Tekrar kullanılabilir tasarım parçasıdır. | Component | UI’da “Modül” daha uygun olabilir. |

| Serbest Tasarım | Örnek Bileşen | Instance | Teknik tasarım sistemi | Teknik dokümanda kullanılabilir | Bir bileşenin kullanılmış kopyasıdır. | Instance | UI’da kullanılmamalı. |

| Serbest Tasarım | Varyant | Variant | Şablon / tasarım sistemi | Teknik dokümanda kullanılabilir | Aynı bileşenin farklı sürümüdür. | Variant |  |

| Serbest Tasarım | Otomatik Düzen | Auto Layout | Teknik tasarım sistemi | Açıklamada kullanılabilir | İçeriklerin belirli kurala göre otomatik hizalanmasıdır. | Auto Layout | Figma terimi olarak teknik dokümanda kullanılabilir. |

| Serbest Tasarım | Responsive Düzen | Responsive Layout | Teknik tasarım | Teknik dokümanda kullanılabilir | Boyuta göre uyum sağlayan düzen yapısıdır. | Responsive Layout |  |

| Serbest Tasarım | Sabit Genişlik | Fixed Width | Nesne ayarı | Açıklamada kullanılabilir | Öğenin genişliğinin değişmemesidir. | Fixed Width |  |

| Serbest Tasarım | Sabit Yükseklik | Fixed Height | Nesne ayarı | Açıklamada kullanılabilir | Öğenin yüksekliğinin değişmemesidir. | Fixed Height |  |

| Serbest Tasarım | İçeriğe Sığ | Hug Content | Teknik düzen | Açıklamada kullanılabilir | Alanın içeriğe göre boyutlanmasıdır. | Hug Content | UI’da “İçeriğe Sığ” kullanılabilir. |

| Serbest Tasarım | Alanı Doldur | Fill Container | Teknik düzen | Açıklamada kullanılabilir | Öğenin bulunduğu alanı doldurmasıdır. | Fill Container | “Doldur” daha kısa. |

| Serbest Tasarım | Kısıtlar | Constraints | Teknik tasarım | Teknik dokümanda kullanılabilir | Öğenin üst, alt, sağ veya sol kenara bağlı davranışıdır. | Constraints | Gelişmiş ayar olarak kullanılabilir. |



\---



\## 11. Arka Plan / Zemin Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Arka Plan | Arka Plan | Background | Tasarım sekmesi | Evet | Sayfa veya tasarım zeminini ifade eder. | Background |  |

| Arka Plan | Zemin | Base / Background | Arka plan ayarı | Evet | Tasarımın en alt görsel yüzeyidir. | Base |  |

| Arka Plan | Sayfa Zemini | Page Background | Arka plan ayarı | Evet | Belirli bir sayfanın arka planıdır. | Page Background |  |

| Arka Plan | Forma Zemini | Form Background | Arka plan ayarı | Açıklamada kullanılabilir | Bir formanın tamamına uygulanan arka plandır. | Form Background | Kullanıcıya “Sayfa Grubu Zemini” de denebilir. |

| Arka Plan | Tasarım Zemini | Design Background | Arka plan ayarı | Evet | Tasarımın genel zeminidir. | Design Background |  |

| Arka Plan | Düz Renk | Solid Color | Zemin türü | Evet | Tek renkten oluşan arka plan türüdür. | Solid Color |  |

| Arka Plan | Geçişli Renk | Gradient | Zemin türü | Evet | Birden fazla rengin yumuşak geçişle birleştiği arka plan türüdür. | Gradient | UI’da “Gradient” kullanılmamalı. |

| Arka Plan | Renk Geçişi | Gradient | Zemin ayarı | Evet | Renklerin birbirine geçişini ifade eder. | Gradient |  |

| Arka Plan | Başlangıç Rengi | Start Color | Gradient ayarı | Evet | Renk geçişinin başladığı renktir. | Start Color |  |

| Arka Plan | Bitiş Rengi | End Color | Gradient ayarı | Evet | Renk geçişinin bittiği renktir. | End Color |  |

| Arka Plan | Geçiş Açısı | Gradient Angle | Gradient ayarı | Evet | Renk geçişinin yönünü belirler. | Gradient Angle |  |

| Arka Plan | Görsel Arka Plan | Image Background | Zemin türü | Evet | Arka plan olarak kullanılan görseldir. | Image Background |  |

| Arka Plan | Doku | Texture | Zemin türü | Evet | Yüzey hissi veren arka plan görselidir. | Texture |  |

| Arka Plan | Desen | Pattern | Zemin türü | Evet | Tekrarlı arka plan görselidir. | Pattern |  |

| Arka Plan | Kaplama | Overlay | Arka plan efekti | Evet | Arka plan üzerine eklenen renk veya görsel katmandır. | Overlay | UI’da “Overlay” kullanılmamalı. |

| Arka Plan | Harmanlama | Blend Mode | Arka plan efekti | Açıklamada kullanılabilir | Katmanların birbirine nasıl karışacağını belirler. | Blend Mode | Gelişmiş ayar olabilir. |

| Arka Plan | Opaklık | Opacity | Görünüm ayarı | Evet | Nesnenin görünürlük yoğunluğunu belirler. | Opacity |  |

| Arka Plan | Şeffaflık | Transparency | Görünüm ayarı | Evet | Nesnenin arkasını ne kadar göstereceğini belirtir. | Transparency |  |

| Arka Plan | Arka Plan Görseli | Background Image | Arka plan ayarı | Evet | Zemin olarak kullanılan görseldir. | Background Image |  |

| Arka Plan | Görseli Doldur | Fill Image | Görsel ayarı | Evet | Görseli alanı tamamen kaplayacak şekilde yerleştirir. | Fill Image |  |

| Arka Plan | Görseli Sığdır | Fit Image | Görsel ayarı | Evet | Görseli alan içine tamamen sığdırır. | Fit Image |  |

| Arka Plan | Görseli Tekrarla | Repeat Image | Görsel ayarı | Evet | Görseli zemin üzerinde tekrar ederek kullanır. | Repeat Image |  |

| Arka Plan | Formaya Yay | Spread Across Form | Arka plan ayarı | Açıklamada kullanılabilir | Arka planı birden fazla sayfa boyunca kesintisiz uygular. | Spread | Kullanıcıya “Seçili Sayfalara Yay” daha açık olabilir. |

| Arka Plan | Tüm Sayfalara Yay | Apply to All Pages | Arka plan ayarı | Evet | Arka planı tüm sayfalara uygular. | Apply to All Pages |  |

| Arka Plan | Seçili Sayfalara Uygula | Apply to Selected Pages | Arka plan ayarı | Evet | Arka planı yalnızca seçili sayfalara uygular. | Apply to Selected Pages |  |

| Arka Plan | Sadece Arka Planı Göster | Show Background Only | Görünüm modu | Evet | Ürün ve diğer öğeleri gizleyerek yalnızca arka planı gösterir. | Show Background Only |  |

| Arka Plan | Tüm Tasarımı Göster | Show Full Design | Görünüm modu | Evet | Arka planla birlikte tüm tasarım öğelerini gösterir. | Show Full Design |  |



\---



\## 12. Renk / Stil Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Renk / Stil | Renk | Color | Genel stil | Evet | Nesne, metin veya zemin rengidir. | Color |  |

| Renk / Stil | Dolgu Rengi | Fill Color | Nesne / şekil ayarı | Evet | Nesnenin iç rengidir. | Fill Color |  |

| Renk / Stil | Zemin Rengi | Background Color | Hücre / arka plan | Evet | Alanın arka plan rengidir. | Background Color |  |

| Renk / Stil | Yazı Rengi | Text Color | Metin ayarı | Evet | Metnin rengidir. | Text Color |  |

| Renk / Stil | Çizgi Rengi | Stroke Color | Çizgi / kenarlık | Evet | Çizgi veya kenarlığın rengidir. | Stroke Color |  |

| Renk / Stil | Kenarlık Rengi | Border Color | Hücre / nesne | Evet | Kenarlığın rengidir. | Border Color |  |

| Renk / Stil | Kontur Rengi | Stroke Color | Teknik tasarım | Açıklamada kullanılabilir | Dış çizgi rengidir. | Stroke Color | UI’da “Kenarlık Rengi” daha sade. |

| Renk / Stil | Fiyat Zemini | Price Background | Fiyat kutusu | Evet | Fiyat kutusunun arka plan rengidir. | Price Background |  |

| Renk / Stil | Fiyat Rengi | Price Color | Fiyat metni | Evet | Fiyat metninin rengidir. | Price Color |  |

| Renk / Stil | Rozet Rengi | Badge Color | Promosyon etiketi | Evet | Rozet veya kampanya etiketinin rengidir. | Badge Color |  |

| Renk / Stil | Renk Paleti | Color Palette | Marka / stil | Evet | Birlikte kullanılan renk grubudur. | Color Palette |  |

| Renk / Stil | Marka Renkleri | Brand Colors | Marka varlıkları | Evet | Markaya ait tanımlı renklerdir. | Brand Colors |  |

| Renk / Stil | Ana Renk | Primary Color | Marka / stil | Evet | Tasarımda en çok kullanılan temel renktir. | Primary Color |  |

| Renk / Stil | İkincil Renk | Secondary Color | Marka / stil | Evet | Ana rengi destekleyen yardımcı renktir. | Secondary Color |  |

| Renk / Stil | Vurgu Rengi | Accent Color | Marka / stil | Evet | Önemli alanları öne çıkarmak için kullanılan renktir. | Accent Color |  |

| Renk / Stil | Nötr Renk | Neutral Color | Marka / stil | Evet | Arka plan, metin veya dengeleyici kullanım için nötr renktir. | Neutral Color |  |

| Renk / Stil | Özel Renk | Custom Color | Renk seçici | Evet | Kullanıcının kendisinin belirlediği renktir. | Custom Color |  |

| Renk / Stil | Renk Kodu | Color Code | Renk seçici | Evet | Rengin teknik kod değeridir. | Color Code |  |

| Renk / Stil | HEX | HEX | Renk kodu | Açıklamada kullanılabilir | Web renk kodu formatıdır. |  | Teknik değer olduğu için korunabilir. |

| Renk / Stil | RGB | RGB | Renk kodu | Açıklamada kullanılabilir | Ekran renk sistemidir. |  | Baskı kontrolünde uyarı konusu olabilir. |

| Renk / Stil | CMYK | CMYK | Baskı rengi | Açıklamada kullanılabilir | Matbaa baskı renk sistemidir. |  |  |

| Renk / Stil | Ton | Tone | Renk ayarı | Evet | Rengin açıklık veya koyuluk hissidir. | Tone |  |

| Renk / Stil | Gölge | Shadow | Stil ayarı | Evet | Nesneye derinlik veren gölge efektidir. | Shadow |  |

| Renk / Stil | Parlaklık | Brightness | Görsel ayarı | Evet | Görsel veya rengin ışık yoğunluğunu belirtir. | Brightness |  |

| Renk / Stil | Kontrast | Contrast | Görsel ayarı | Evet | Açık ve koyu alanlar arasındaki farktır. | Contrast |  |

| Renk / Stil | Renk Seçici | Color Picker | Renk ayarı | Evet | Kullanıcının renk seçtiği araçtır. | Color Picker |  |

| Renk / Stil | Damlalık | Eyedropper | Renk aracı | Evet | Ekrandan renk seçmeye yarayan araçtır. | Eyedropper |  |

| Renk / Stil | Stil | Style | Genel biçim | Evet | Renk, yazı, kenarlık ve gölge gibi görünüm ayarlarının bütünüdür. | Style |  |

| Renk / Stil | Biçim | Formatting | Metin / nesne ayarı | Evet | Seçili öğenin görsel düzenidir. | Formatting |  |

| Renk / Stil | Görsel Stil | Visual Style | Hücre / nesne | Evet | Seçili öğenin görsel görünüm ayarlarıdır. | Visual Style |  |

| Renk / Stil | Stili Kopyala | Copy Style | Stil işlemi | Evet | Seçili öğenin stilini kopyalar. | Copy Style |  |

| Renk / Stil | Stili Yapıştır | Paste Style | Stil işlemi | Evet | Kopyalanan stili başka öğeye uygular. | Paste Style |  |

| Renk / Stil | Varsayılan Stil | Default Style | Stil ayarı | Evet | Sistem tarafından kullanılan başlangıç stilidir. | Default Style |  |

| Renk / Stil | Özel Stil | Custom Style | Stil ayarı | Evet | Kullanıcı tarafından değiştirilmiş stildir. | Custom Style |  |

| Renk / Stil | Global Stil | Global Style | Teknik stil yönetimi | Teknik dokümanda kullanılabilir | Birden fazla öğeye uygulanan ortak stildir. | Global Style | Kullanıcıya “Genel Stil” denebilir ancak gereksizse kullanılmamalı. |



\---



\## 13. Kenarlık / Köşe / Gölge Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Kenarlık / Gölge | Kenarlık | Border | Hücre / nesne ayarı | Evet | Nesnenin dış çizgisidir. | Border |  |

| Kenarlık / Gölge | Çerçeve | Frame / Border | Nesne / görsel | Evet | Görsel veya alanı çevreleyen sınırdır. | Frame | Bağlama göre kullanılır. |

| Kenarlık / Gölge | Kontur | Stroke | Teknik tasarım | Açıklamada kullanılabilir | Dış çizgi veya çizgi kalınlığıdır. | Stroke | UI’da “Kenarlık” daha sade. |

| Kenarlık / Gölge | Çizgi | Line | Şekil / kenarlık | Evet | Düz çizgi öğesi veya çizgi görünümüdür. | Line |  |

| Kenarlık / Gölge | Çizgi Kalınlığı | Stroke Width | Çizgi ayarı | Evet | Çizginin kalınlık değeridir. | Stroke Width |  |

| Kenarlık / Gölge | Kenarlık Kalınlığı | Border Width | Kenarlık ayarı | Evet | Kenarlığın kalınlık değeridir. | Border Width |  |

| Kenarlık / Gölge | Çizgi Tipi | Line Style | Çizgi ayarı | Evet | Çizginin düz, kesikli veya noktalı olmasını belirler. | Line Style |  |

| Kenarlık / Gölge | Düz Çizgi | Solid Line | Çizgi tipi | Evet | Kesintisiz çizgi tipidir. | Solid Line |  |

| Kenarlık / Gölge | Kesikli Çizgi | Dashed Line | Çizgi tipi | Evet | Aralıklı çizgi tipidir. | Dashed Line |  |

| Kenarlık / Gölge | Noktalı Çizgi | Dotted Line | Çizgi tipi | Evet | Noktalardan oluşan çizgi tipidir. | Dotted Line |  |

| Kenarlık / Gölge | Köşe | Corner | Köşe ayarı | Evet | Nesnenin köşe noktasıdır. | Corner |  |

| Kenarlık / Gölge | Köşe Yuvarlaklığı | Corner Radius | Köşe ayarı | Evet | Köşelerin ne kadar yuvarlak olacağını belirler. | Corner Radius |  |

| Kenarlık / Gölge | Ovallik | Radius / Roundedness | Hücre / fiyat kutusu | Evet | Köşe yuvarlaklığı değeridir. | Radius | UI’da kısa alan adı olarak kullanılabilir. |

| Kenarlık / Gölge | Radius | Border Radius | Teknik stil | Hayır | Köşe yuvarlaklığının teknik karşılığıdır. | Radius | UI’da kullanılmamalı. |

| Kenarlık / Gölge | Sol Üst Köşe | Top Left Corner | Köşe ayarı | Evet | Nesnenin sol üst köşesidir. | Top Left Corner |  |

| Kenarlık / Gölge | Sağ Üst Köşe | Top Right Corner | Köşe ayarı | Evet | Nesnenin sağ üst köşesidir. | Top Right Corner |  |

| Kenarlık / Gölge | Sol Alt Köşe | Bottom Left Corner | Köşe ayarı | Evet | Nesnenin sol alt köşesidir. | Bottom Left Corner |  |

| Kenarlık / Gölge | Sağ Alt Köşe | Bottom Right Corner | Köşe ayarı | Evet | Nesnenin sağ alt köşesidir. | Bottom Right Corner |  |

| Kenarlık / Gölge | Köşeleri Bağla | Link Corners | Köşe ayarı | Evet | Tüm köşelerin aynı değerle değişmesini sağlar. | Link Corners |  |

| Kenarlık / Gölge | Köşeleri Ayır | Unlink Corners | Köşe ayarı | Evet | Her köşenin ayrı değerle düzenlenmesini sağlar. | Unlink Corners |  |

| Kenarlık / Gölge | Gölge | Shadow | Stil ayarı | Evet | Nesneye derinlik hissi veren efekttir. | Shadow |  |

| Kenarlık / Gölge | Dış Gölge | Drop Shadow / Outer Shadow | Stil ayarı | Evet | Nesnenin dışına uygulanan gölgedir. | Drop Shadow |  |

| Kenarlık / Gölge | İç Gölge | Inner Shadow | Stil ayarı | Evet | Nesnenin içine uygulanan gölgedir. | Inner Shadow |  |

| Kenarlık / Gölge | Gölge Rengi | Shadow Color | Gölge ayarı | Evet | Gölgenin rengidir. | Shadow Color |  |

| Kenarlık / Gölge | Gölge Opaklığı | Shadow Opacity | Gölge ayarı | Evet | Gölgenin görünürlük yoğunluğudur. | Shadow Opacity |  |

| Kenarlık / Gölge | Gölge X | Shadow X | Gölge ayarı | Teknik dokümanda kullanılabilir | Gölgenin yatay yön değeridir. | Shadow X | UI’da “Yatay Gölge” daha anlaşılır. |

| Kenarlık / Gölge | Gölge Y | Shadow Y | Gölge ayarı | Teknik dokümanda kullanılabilir | Gölgenin dikey yön değeridir. | Shadow Y | UI’da “Dikey Gölge” daha anlaşılır. |

| Kenarlık / Gölge | Bulanıklık | Blur | Gölge / efekt | Evet | Gölgenin veya efektin yumuşaklık değeridir. | Blur |  |

| Kenarlık / Gölge | Yayılım | Spread | Gölge ayarı | Evet | Gölgenin ne kadar geniş alana yayılacağını belirler. | Spread |  |

| Kenarlık / Gölge | Aktif / Pasif | Active / Inactive | Ayar durumu | Evet | Özelliğin açık veya kapalı olduğunu belirtir. | Active / Inactive |  |



\---



\## 14. Metin / Tipografi Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Metin / Tipografi | Metin | Text | Metin aracı | Evet | Tasarımda kullanılan yazılı içeriktir. | Text |  |

| Metin / Tipografi | Metin Kutusu | Text Box | Metin aracı | Evet | İçine yazı yazılabilen alandır. | Text Box |  |

| Metin / Tipografi | Başlık | Title / Heading | Metin stili | Evet | Ana vurgu metnidir. | Heading |  |

| Metin / Tipografi | Alt Başlık | Subtitle / Subheading | Metin stili | Evet | Başlığı destekleyen ikinci seviye metindir. | Subheading |  |

| Metin / Tipografi | Gövde Metni | Body Text | Metin stili | Evet | Açıklama veya uzun metin alanıdır. | Body Text |  |

| Metin / Tipografi | Ürün Adı | Product Name | Ürün hücresi | Evet | Hücrede gösterilen ürün ismidir. | Product Name |  |

| Metin / Tipografi | Ürün Açıklaması | Product Description | Ürün bilgisi | Evet | Ürün hakkında ek açıklamadır. | Product Description |  |

| Metin / Tipografi | Fiyat Metni | Price Text | Fiyat kutusu | Evet | Ürünün fiyat bilgisini gösteren metindir. | Price Text |  |

| Metin / Tipografi | Eski Fiyat | Old Price | Fiyat alanı | Evet | İndirim öncesi fiyatı gösterir. | Old Price |  |

| Metin / Tipografi | Yeni Fiyat | New Price | Fiyat alanı | Evet | Güncel veya indirimli fiyatı gösterir. | New Price |  |

| Metin / Tipografi | Para Birimi | Currency | Fiyat ayarı | Evet | Fiyatın hangi para birimiyle gösterileceğini belirtir. | Currency |  |

| Metin / Tipografi | Küsurat | Decimal Part | Fiyat biçimi | Evet | Fiyatta virgülden sonraki bölümdür. | Decimal Part |  |

| Metin / Tipografi | Ondalık | Decimal | Fiyat biçimi | Açıklamada kullanılabilir | Sayının virgülden sonraki kısmını ifade eder. | Decimal |  |

| Metin / Tipografi | Ondalık Ölçekleme | Decimal Scale | Fiyat biçimi | Açıklamada kullanılabilir | Fiyatın küsurat kısmının farklı boyutta gösterilmesini sağlar. | Decimal Scale | Gelişmiş fiyat tipografisi için. |

| Metin / Tipografi | Fiyat Biçimlendirme | Price Formatting | Fiyat ayarı | Evet | Fiyat metninin görünüm ve yazım biçimidir. | Price Formatting |  |

| Metin / Tipografi | Yazı Tipi | Font Family | Metin ayarı | Evet | Metnin kullanılacağı yazı karakteridir. | Font Family |  |

| Metin / Tipografi | Font | Font | Metin ayarı | Evet | Yazı karakterini ifade eder. |  | “Yazı Tipi” daha kullanıcı dostu. |

| Metin / Tipografi | Font Ailesi | Font Family | Teknik metin ayarı | Teknik dokümanda kullanılabilir | Aynı yazı tipinin farklı ağırlık ve stillerini içeren ailedir. | Font Family |  |

| Metin / Tipografi | Font Kalınlığı | Font Weight | Metin ayarı | Evet | Yazının ince, normal veya kalın görünmesini belirler. | Font Weight |  |

| Metin / Tipografi | Yazı Boyutu | Font Size | Metin ayarı | Evet | Yazının büyüklüğünü belirler. | Font Size | “Punto” da kullanılabilir. |

| Metin / Tipografi | Punto | Point Size | Metin ayarı | Evet | Yazı boyutunu ifade eden matbaa terimidir. | Point Size | Kullanıcıya “Yazı Boyutu” daha açık olabilir. |

| Metin / Tipografi | Satır Aralığı | Line Height | Metin ayarı | Evet | Satırlar arasındaki boşluktur. | Line Height |  |

| Metin / Tipografi | Harf Aralığı | Letter Spacing | Metin ayarı | Evet | Harfler arasındaki boşluktur. | Letter Spacing |  |

| Metin / Tipografi | Karakter Aralığı | Character Spacing | Metin ayarı | Evet | Karakterler arasındaki mesafedir. | Character Spacing | Harf Aralığı ile aynı bağlamda. |

| Metin / Tipografi | Büyük Harf | Uppercase | Metin ayarı | Evet | Metni büyük harflerle gösterir. | Uppercase |  |

| Metin / Tipografi | Küçük Harf | Lowercase | Metin ayarı | Evet | Metni küçük harflerle gösterir. | Lowercase |  |

| Metin / Tipografi | Baş Harf Büyük | Title Case | Metin ayarı | Evet | Kelimelerin baş harflerini büyük yapar. | Title Case |  |

| Metin / Tipografi | Kalın | Bold | Metin ayarı | Evet | Yazıyı kalın yapar. | Bold |  |

| Metin / Tipografi | İnce | Light | Metin ayarı | Evet | Yazıyı ince yapar. | Light |  |

| Metin / Tipografi | İtalik | Italic | Metin ayarı | Evet | Yazıyı eğik yapar. | Italic |  |

| Metin / Tipografi | Altı Çizili | Underline | Metin ayarı | Evet | Metnin altını çizer. | Underline |  |

| Metin / Tipografi | Üstü Çizili | Strikethrough | Metin ayarı | Evet | Metnin üstünü çizer. | Strikethrough |  |

| Metin / Tipografi | Metni Sığdır | Fit Text | Metin ayarı | Evet | Metni bulunduğu alana sığacak şekilde düzenler. | Fit Text |  |

| Metin / Tipografi | Satıra Sığdır | Fit to Line | Metin ayarı | Evet | Metni tek satıra sığdırmaya çalışır. | Fit to Line |  |

| Metin / Tipografi | Taşan Metin | Overset Text | Baskı kontrolü | Evet | Alana sığmadığı için görünmeyen veya kesilen metindir. | Overset Text |  |

| Metin / Tipografi | Metin Taşması | Text Overflow | Baskı kontrolü | Evet | Metnin ayrılan alanın dışına çıkmasıdır. | Text Overflow |  |

| Metin / Tipografi | Otomatik Küçült | Auto Shrink | Metin ayarı | Evet | Metni alana sığdırmak için yazı boyutunu otomatik küçültür. | Auto Shrink |  |

| Metin / Tipografi | Minimum Yazı Boyutu | Minimum Font Size | Baskı kontrolü | Evet | Okunabilirlik için izin verilen en küçük yazı boyutudur. | Minimum Font Size |  |

| Metin / Tipografi | Okunabilirlik | Readability | Baskı kontrolü | Evet | Metnin rahat okunup okunmadığını ifade eder. | Readability |  |



\---



\## 15. Görsel / Fotoğraf / Medya Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Görsel / Medya | Görsel | Image | Genel medya | Evet | Tasarımda kullanılan fotoğraf, ürün resmi veya grafik dosyasıdır. | Image |  |

| Görsel / Medya | Fotoğraf | Photo | Medya | Evet | Fotoğraf dosyasını ifade eder. | Photo |  |

| Görsel / Medya | Ürün Görseli | Product Image | Ürün hücresi | Evet | Ürünü temsil eden görseldir. | Product Image |  |

| Görsel / Medya | Logo | Logo | Marka / medya | Evet | Marka veya firma işaretidir. | Logo |  |

| Görsel / Medya | İkon | Icon | Medya / UI | Evet | Küçük sembol veya işaret görselidir. | Icon |  |

| Görsel / Medya | Medya | Media | Varlıklar | Evet | Görsel, fotoğraf, logo ve benzeri dosyaların genel adıdır. | Media |  |

| Görsel / Medya | Yüklenen Görsel | Uploaded Image | Medya | Evet | Kullanıcının sisteme yüklediği görseldir. | Uploaded Image |  |

| Görsel / Medya | Görsel Seç | Choose Image | Görsel işlemi | Evet | Tasarıma veya ürüne görsel seçer. | Choose Image |  |

| Görsel / Medya | Görsel Değiştir | Replace Image | Görsel işlemi | Evet | Mevcut görseli başka görselle değiştirir. | Replace Image |  |

| Görsel / Medya | Görseli Kaldır | Remove Image | Görsel işlemi | Evet | Seçili görseli kaldırır. | Remove Image |  |

| Görsel / Medya | Görseli Kaydet | Save Image | Görsel işlemi | Evet | Görseli ürün veya medya kaydına kaydeder. | Save Image |  |

| Görsel / Medya | Görsel Kalitesi | Image Quality | Baskı kontrolü | Evet | Görselin baskıya uygun netlikte olup olmadığını gösterir. | Image Quality |  |

| Görsel / Medya | Kalite Durumu | Quality Status | Baskı kontrolü | Evet | Görselin uygunluk durumunu gösterir. | Quality Status |  |

| Görsel / Medya | Düşük Çözünürlük | Low Resolution | Baskı kontrolü | Evet | Görselin baskıda bulanık çıkma riski olduğunu belirtir. | Low Resolution |  |

| Görsel / Medya | Yüksek Çözünürlük | High Resolution | Baskı kontrolü | Evet | Görselin baskı için yeterli netlikte olduğunu belirtir. | High Resolution |  |

| Görsel / Medya | Baskıya Uygun | Print-ready | Baskı kontrolü | Evet | Görsel veya dosyanın baskı için uygun olduğunu belirtir. | Print-ready |  |

| Görsel / Medya | Baskıya Uygun Değil | Not Print-ready | Baskı kontrolü | Evet | Görsel veya dosyanın baskı için uygun olmadığını belirtir. | Not Print-ready |  |

| Görsel / Medya | Kırp | Crop | Görsel işlemi | Evet | Görselin yalnızca belirlenen kısmını gösterir. | Crop |  |

| Görsel / Medya | Kırpmayı Sıfırla | Reset Crop | Görsel işlemi | Evet | Görsel kırpma ayarını varsayılana döndürür. | Reset Crop |  |

| Görsel / Medya | Doldur | Fill | Görsel işlemi | Evet | Görseli alanı tamamen kaplayacak şekilde yerleştirir. | Fill |  |

| Görsel / Medya | Sığdır | Fit | Görsel işlemi | Evet | Görseli alan içine tamamen sığdırır. | Fit |  |

| Görsel / Medya | Odak Noktası | Focal Point | Görsel işlemi | Evet | Görselde görünmesi önemli olan noktayı belirtir. | Focal Point |  |

| Görsel / Medya | Görsel Ölçeği | Image Scale | Görsel ayarı | Evet | Görselin büyüklük oranını belirtir. | Image Scale |  |

| Görsel / Medya | Görsel Boyutu | Image Size | Görsel ayarı | Evet | Görselin tasarımdaki ölçüsüdür. | Image Size |  |

| Görsel / Medya | Görsel Konumu | Image Position | Görsel ayarı | Evet | Görselin alan içindeki yeridir. | Image Position |  |

| Görsel / Medya | Serbest Konum | Free Position | Görsel ayarı | Evet | Görselin alan içinde serbestçe hareket ettirilmesini sağlar. | Free Position |  |

| Görsel / Medya | Arka Planı Kaldır | Remove Background | Görsel işlemi | Evet | Görselin arka planını temizler. | Remove Background |  |

| Görsel / Medya | Dekupe | Cut-out | Görsel işlemi | Açıklamada kullanılabilir | Görselin arka planından ayrılması işlemidir. | Cut-out |  |

| Görsel / Medya | Şeffaf PNG | Transparent PNG | Dosya formatı | Açıklamada kullanılabilir | Arka planı şeffaf PNG görselidir. | Transparent PNG |  |

| Görsel / Medya | Görsel Opaklığı | Image Opacity | Görsel ayarı | Evet | Görselin görünürlük yoğunluğunu belirtir. | Image Opacity |  |

| Görsel / Medya | Görsel Döndürme | Image Rotation | Görsel ayarı | Evet | Görselin açıyla çevrilmesidir. | Image Rotation |  |

| Görsel / Medya | Yatay Çevir | Flip Horizontal | Görsel işlemi | Evet | Görseli yatay eksende ters çevirir. | Flip Horizontal |  |

| Görsel / Medya | Dikey Çevir | Flip Vertical | Görsel işlemi | Evet | Görseli dikey eksende ters çevirir. | Flip Vertical |  |

| Görsel / Medya | Görsel Filtre | Image Filter | Görsel ayarı | Evet | Görsele uygulanan renk veya görünüm efektidir. | Image Filter |  |

| Görsel / Medya | Parlaklık | Brightness | Görsel ayarı | Evet | Görselin ışık yoğunluğunu ayarlar. | Brightness |  |

| Görsel / Medya | Kontrast | Contrast | Görsel ayarı | Evet | Görseldeki açık ve koyu alan farkını ayarlar. | Contrast |  |

| Görsel / Medya | Doygunluk | Saturation | Görsel ayarı | Evet | Görselin renk yoğunluğunu ayarlar. | Saturation |  |



\---



\## 16. Ürün Verisi / Excel / Havuz Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Ürün Verisi | Ürünler | Products | Sağ panel | Evet | Tasarımda kullanılacak ürünlerin bulunduğu alandır. | Products | Ana sekme adı. |

| Ürün Verisi | Ürün Havuzu | Product Pool | Sağ panel / ürün listesi | Evet | Excel’den gelen veya manuel eklenen ürünlerin listelendiği alandır. | Product Pool | Ana terim. |

| Ürün Verisi | Genel Ürün Havuzu | General Product Pool | Ürün yönetimi | Evet | Tüm ürünlerin bulunduğu ana ürün listesidir. | General Product Pool |  |

| Ürün Verisi | Bekleme Alanı | Temporary Pool | Geçici ürün alanı | Evet | Yerleştirilemeyen veya tasarımdan çıkarılan ürünlerin beklediği alandır. | Temporary Pool, Geçici Havuz | Ana terim olarak önerilir. |

| Ürün Verisi | Otomatik Dizilim Excel’i | Auto Placement Excel | Excel yükleme | Evet | POS sırasına göre ürünlerin otomatik yerleşmesini sağlayan Excel dosyasıdır. | Auto Placement Excel |  |

| Ürün Verisi | Tüm Ürün Havuzu Excel’i | Product Pool Excel | Excel yükleme | Evet | Ürün havuzunu doldurmak için kullanılan genel ürün Excel dosyasıdır. | Product Pool Excel |  |

| Ürün Verisi | Excel Yükle | Upload Excel | Excel yükleme | Evet | Ürün verilerini Excel dosyasıyla sisteme aktarır. | Upload Excel |  |

| Ürün Verisi | Excel’i Yenile | Refresh Excel | Veri güncelleme | Evet | Yüklenen Excel dosyasına göre ürünleri günceller. | Refresh Excel |  |

| Ürün Verisi | Veriyi Yenile | Refresh Data | Veri güncelleme | Evet | Tasarımda kullanılan verileri günceller. | Refresh Data |  |

| Ürün Verisi | Alan Eşleme | Field Mapping | Excel / veri | Evet | Excel sütunlarının ürün alanlarıyla eşleştirilmesidir. | Field Mapping |  |

| Ürün Verisi | Sütun Eşleme | Column Mapping | Excel / veri | Evet | Excel sütunlarının sistem alanlarına bağlanmasıdır. | Column Mapping |  |

| Ürün Verisi | Ürün Kodu | Product Code / SKU | Ürün bilgisi | Evet | Ürünü tanımlayan kod bilgisidir. | Product Code |  |

| Ürün Verisi | SKU | SKU | Ürün bilgisi | Açıklamada kullanılabilir | Stok veya ürün kodu için kullanılan teknik koddur. |  | Teknik karşılık olarak korunabilir. |

| Ürün Verisi | ARTNR | Article Number | Excel verisi | Teknik dokümanda kullanılabilir | Ürün kodunun Excel’deki teknik alan adıdır. |  | UI’da “Ürün Kodu” tercih edilmeli. |

| Ürün Verisi | POS | Position | Excel verisi | Teknik dokümanda kullanılabilir | Ürünün otomatik yerleşim sırasını belirtir. |  | UI’da “Sıra Numarası” kullanılmalı. |

| Ürün Verisi | Sıra Numarası | Position Number | Excel / otomatik dizilim | Evet | Ürünün tasarımda hangi sıraya yerleşeceğini belirtir. | POS |  |

| Ürün Verisi | Ürün Adı | Product Name | Ürün bilgisi | Evet | Ürünün kullanıcıya görünen adıdır. | Product Name |  |

| Ürün Verisi | Satış Fiyatı | Sale Price | Ürün bilgisi | Evet | Ürünün müşteriye gösterilecek satış fiyatıdır. | Sale Price |  |

| Ürün Verisi | Alış Fiyatı | Purchase Price / Cost | Ürün bilgisi | Evet | Ürünün maliyet veya alış fiyatıdır. | Purchase Price |  |

| Ürün Verisi | Kategori | Category | Ürün bilgisi | Evet | Ürünün ait olduğu sınıftır. | Category |  |

| Ürün Verisi | Kâr Oranı | Profit Margin | Ürün bilgisi | Evet | Alış ve satış fiyatı arasındaki kâr oranıdır. | Profit Margin |  |

| Ürün Verisi | Kâr Tutarı | Profit Amount | Ürün bilgisi | Evet | Üründen elde edilen kâr miktarıdır. | Profit Amount |  |

| Ürün Verisi | Eksik Görsel | Missing Image | İçe aktarım raporu | Evet | Üründe görsel bilgisinin bulunmadığını belirtir. | Missing Image |  |

| Ürün Verisi | Eksik Fiyat | Missing Price | İçe aktarım raporu | Evet | Üründe fiyat bilgisinin bulunmadığını belirtir. | Missing Price |  |

| Ürün Verisi | Eksik Ürün Adı | Missing Product Name | İçe aktarım raporu | Evet | Üründe ürün adı bilgisinin bulunmadığını belirtir. | Missing Product Name |  |

| Ürün Verisi | Yerleştir | Place | Ürün işlemi | Evet | Ürünü seçili hücreye ekler. | Place |  |

| Ürün Verisi | Otomatik Yerleştir | Auto Place | Ürün işlemi | Evet | Ürünleri sistem kuralına göre hücrelere yerleştirir. | Auto Place |  |

| Ürün Verisi | Otomatik Diz | Auto Arrange / Auto Place | Ürün işlemi | Evet | Ürünleri sıra numarasına göre otomatik dizer. | Auto Arrange |  |

| Ürün Verisi | Ürünü Değiştir | Replace Product | Ürün işlemi | Evet | Seçili hücredeki ürünü değiştirir. | Replace Product |  |

| Ürün Verisi | Ürünü Kaldır | Remove Product | Ürün işlemi | Evet | Ürünü seçili hücreden kaldırır. | Remove Product |  |

| Ürün Verisi | Ürünü Temizle | Clear Product | Ürün işlemi | Evet | Hücredeki ürün bilgisini temizler. | Clear Product |  |

| Ürün Verisi | Ürünü Havuzdan Ekle | Add from Product Pool | Ürün işlemi | Evet | Ürünü ürün havuzundan tasarıma ekler. | Add from Product Pool |  |

| Ürün Verisi | Havuzdan Sürükle | Drag from Pool | Ürün işlemi | Evet | Ürünü havuzdan tutup tasarıma bırakma işlemidir. | Drag from Pool |  |

| Ürün Verisi | Yerleştirilemeyen Ürünler | Unplaced Products | İçe aktarım raporu | Evet | Otomatik yerleşemeyen ürünleri gösterir. | Unplaced Products |  |

| Ürün Verisi | İçe Aktarım Raporu | Import Report | Excel yükleme sonrası | Evet | Excel yükleme ve ürün yerleştirme sonucunu gösteren rapordur. | Import Report |  |

| Ürün Verisi | Raporu Görüntüle | View Report | Excel yükleme sonrası | Evet | İçe aktarım raporunu açar. | View Report |  |



\---



\## 17. Fiyat Kutusu / Kampanya / Rozet Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Fiyat / Rozet | Fiyat Kutusu | Price Box | Hücre / fiyat ayarı | Evet | Ürün fiyatının gösterildiği görsel alandır. | Price Box | Ana terim. |

| Fiyat / Rozet | Fiyat Alanı | Price Area | Hücre / fiyat ayarı | Evet | Fiyat bilgisinin yer aldığı alandır. | Price Area |  |

| Fiyat / Rozet | Fiyat Etiketi | Price Tag | Fiyat görseli | Evet | Fiyatı öne çıkaran etiket görünümlü alandır. | Price Tag |  |

| Fiyat / Rozet | Fiyat Zemini | Price Background | Fiyat kutusu | Evet | Fiyat kutusunun arka plan rengidir. | Price Background |  |

| Fiyat / Rozet | Fiyat Konumu | Price Position | Fiyat kutusu | Evet | Fiyat kutusunun hücre içindeki yerini belirler. | Price Position |  |

| Fiyat / Rozet | Fiyat Genişliği | Price Width | Fiyat kutusu | Evet | Fiyat kutusunun genişliğini belirler. | Price Width |  |

| Fiyat / Rozet | Fiyat Yüksekliği | Price Height | Fiyat kutusu | Evet | Fiyat kutusunun yüksekliğini belirler. | Price Height |  |

| Fiyat / Rozet | Fiyat Kenarlığı | Price Border | Fiyat kutusu | Evet | Fiyat kutusunun dış çizgisidir. | Price Border |  |

| Fiyat / Rozet | Fiyat Konturu | Price Stroke | Teknik fiyat stili | Açıklamada kullanılabilir | Fiyat kutusunun dış çizgi stilidir. | Price Stroke | UI’da “Fiyat Kenarlığı” tercih edilir. |

| Fiyat / Rozet | Fiyat Fontu | Price Font | Fiyat metni | Evet | Fiyat yazısında kullanılan yazı tipidir. | Price Font |  |

| Fiyat / Rozet | Fiyat Rengi | Price Color | Fiyat metni | Evet | Fiyat yazısının rengidir. | Price Color |  |

| Fiyat / Rozet | Eski Fiyat | Old Price | Kampanya fiyatı | Evet | İndirim öncesi fiyatı gösterir. | Old Price |  |

| Fiyat / Rozet | Yeni Fiyat | New Price | Kampanya fiyatı | Evet | Güncel veya indirimli fiyatı gösterir. | New Price |  |

| Fiyat / Rozet | İndirimli Fiyat | Discounted Price | Kampanya fiyatı | Evet | İndirim sonrası geçerli fiyatı gösterir. | Discounted Price |  |

| Fiyat / Rozet | Promosyon Etiketi | Promotional Badge | Hücre / kampanya | Evet | Ürün üzerinde kampanya, yeni ürün veya indirim bilgisini gösteren etikettir. | Badge |  |

| Fiyat / Rozet | Rozet | Badge | Hücre / kampanya | Evet | Ürünü öne çıkarmak için kullanılan küçük etiket alanıdır. | Badge |  |

| Fiyat / Rozet | İndirim Rozeti | Discount Badge | Kampanya | Evet | İndirim bilgisini gösteren rozettir. | Discount Badge |  |

| Fiyat / Rozet | Yeni Ürün Rozeti | New Product Badge | Kampanya | Evet | Ürünün yeni olduğunu gösteren rozettir. | New Product Badge |  |

| Fiyat / Rozet | Şok Fiyat Rozeti | Hot Price Badge | Kampanya | Evet | Özel fiyat vurgusu yapan rozettir. | Hot Price Badge |  |

| Fiyat / Rozet | Kampanya Rozeti | Campaign Badge | Kampanya | Evet | Kampanya bilgisini gösteren rozettir. | Campaign Badge |  |

| Fiyat / Rozet | Etiket Şekli | Badge Shape | Rozet ayarı | Evet | Rozetin yuvarlak, yıldız veya dikdörtgen gibi şeklini belirler. | Badge Shape |  |

| Fiyat / Rozet | Yuvarlak Rozet | Round Badge | Rozet ayarı | Evet | Yuvarlak rozet biçimidir. | Round Badge |  |

| Fiyat / Rozet | Yıldız Rozet | Star Badge | Rozet ayarı | Evet | Yıldız biçimli rozet türüdür. | Star Badge |  |

| Fiyat / Rozet | Flama | Flag Badge | Rozet ayarı | Evet | Bayrak veya flama biçimli etikettir. | Flag Badge |  |

| Fiyat / Rozet | Dikdörtgen Etiket | Rectangle Badge | Rozet ayarı | Evet | Dikdörtgen biçimli etiket türüdür. | Rectangle Badge |  |

| Fiyat / Rozet | Rozet Konumu | Badge Position | Rozet ayarı | Evet | Rozetin hücre içindeki yerini belirler. | Badge Position |  |

| Fiyat / Rozet | Rozet Boyutu | Badge Size | Rozet ayarı | Evet | Rozetin büyüklüğünü belirler. | Badge Size |  |

| Fiyat / Rozet | Rozet Rengi | Badge Color | Rozet ayarı | Evet | Rozetin zemin rengidir. | Badge Color |  |

| Fiyat / Rozet | Rozet Yazısı | Badge Text | Rozet ayarı | Evet | Rozet üzerinde gösterilen metindir. | Badge Text |  |



\---



\## 18. Modül / Hazır Blok Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Modül | Modül | Module | Modüller sekmesi | Evet | Tasarıma eklenebilen hazır veya kaydedilmiş blok yapıdır. | Module |  |

| Modül | Hazır Modül | Ready Module | Modüller sekmesi | Evet | Kullanıma hazır modül yapısıdır. | Ready Module |  |

| Modül | Modüller | Modules | Sağ panel ana sekmesi | Evet | Tasarıma eklenebilecek hazır blokların bulunduğu sekmedir. | Modules |  |

| Modül | Modüllerim | My Modules | Kullanıcı modülleri | Evet | Kullanıcının kaydettiği modüllerdir. | My Modules |  |

| Modül | Ürün Modülü | Product Module | Kayıtlı modül | Evet | Ürün hücresi tasarımının tekrar kullanılabilir halidir. | Product Module |  |

| Modül | Serbest Tuval Modülü | Free Canvas Module | Kayıtlı modül | Açıklamada kullanılabilir | Serbest alan içinde hazırlanmış tekrar kullanılabilir tasarım modülüdür. | Free Canvas Module | UI’da “Serbest Alan Modülü” daha uygun olabilir. |

| Modül | Serbest Alan Modülü | Free Area Module | Kayıtlı modül | Evet | Serbest alan olarak kaydedilmiş tekrar kullanılabilir tasarım bloğudur. | Free Canvas Module |  |

| Modül | Hücresel Modül | Cell-based Module | Kayıtlı modül | Evet | Hücre mantığıyla hazırlanmış tekrar kullanılabilir modüldür. | Cell-based Module |  |

| Modül | Banner Modülü | Banner Module | Modüller sekmesi | Evet | Reklam, duyuru veya kampanya alanı oluşturmak için kullanılan modüldür. | Banner Module |  |

| Modül | Footer Modülü | Footer Module | Modüller sekmesi | Evet | Sayfa altı bilgi alanı için kullanılan modüldür. | Footer Module | UI’da “Alt Bilgi Modülü” de düşünülebilir. |

| Modül | Alt Bilgi Modülü | Footer Module | Modüller sekmesi | Evet | Adres, web sitesi, telefon veya yasal not gibi alt bilgileri gösterir. | Footer Module |  |

| Modül | Pizza Fiyat Listesi | Pizza Price List | Modüller sekmesi | Evet | Pizza boyutları ve fiyatları için kullanılan hazır tablo modülüdür. | Pizza Price List |  |

| Modül | Fiyat Listesi Modülü | Price List Module | Modüller sekmesi | Evet | Ürün veya hizmet fiyatlarını tablo halinde gösteren modüldür. | Price List Module |  |

| Modül | Tablo Modülü | Table Module | Modüller sekmesi | Evet | Satır ve sütunlardan oluşan tablo yapısıdır. | Table Module |  |

| Modül | Kampanya Modülü | Campaign Module | Modüller sekmesi | Evet | Kampanya veya öne çıkan ürün alanı için kullanılan modüldür. | Campaign Module |  |

| Modül | Logo Alanı | Logo Area | Modül / şablon | Evet | Logo yerleştirmek için ayrılmış alandır. | Logo Area |  |

| Modül | Reklam Alanı | Ad Area | Modül / şablon | Evet | Reklam veya duyuru içeriği için ayrılmış alandır. | Ad Area |  |

| Modül | Banner Alanı | Banner Area | Modül / şablon | Evet | Banner modülünün veya görsel duyuru alanının bulunduğu bölümdür. | Banner Area |  |

| Modül | Footer Şeridi | Footer Strip | Modül / sayfa altı | Açıklamada kullanılabilir | Sayfanın altındaki bilgi şerididir. | Footer Strip | UI’da “Alt Bilgi Alanı” daha sade. |

| Modül | Alt Bilgi Alanı | Footer Area | Modül / sayfa altı | Evet | Sayfa altında adres, not veya logo gibi bilgilerin bulunduğu alandır. | Footer Area |  |

| Modül | Modülü Sürükle | Drag Module | Modül işlemi | Evet | Modülü tutup tasarım alanına taşıma işlemidir. | Drag Module |  |

| Modül | Modülü Bırak | Drop Module | Modül işlemi | Evet | Modülü hedef alana yerleştirme işlemidir. | Drop Module |  |

| Modül | Modülü Düzenle | Edit Module | Modül işlemi | Evet | Seçili modülün içeriğini veya ayarlarını değiştirir. | Edit Module |  |

| Modül | Modülü Kaydet | Save Module | Modül işlemi | Evet | Modülü tekrar kullanmak üzere kaydeder. | Save Module |  |

| Modül | Modülü Sil | Delete Module | Modül işlemi | Evet | Seçili modülü kaldırır. | Delete Module |  |

| Modül | Modülü Çoğalt | Duplicate Module | Modül işlemi | Evet | Seçili modülün kopyasını oluşturur. | Duplicate Module |  |

| Modül | Modülü Tüm Sayfalara Uygula | Apply Module to All Pages | Modül işlemi | Evet | Modülü tüm sayfalara ekler veya uygular. | Apply to All Pages |  |

| Modül | Bu Sayfadan Ayır | Detach from This Page | Modül işlemi | Evet | Modülü genel yapıdan ayırıp yalnızca bu sayfaya özel hale getirir. | Detach |  |

| Modül | Modül İçeriği | Module Content | Modül ayarları | Evet | Modülün içindeki metin, görsel veya tablo bilgileridir. | Module Content |  |

| Modül | Modül Ayarları | Module Settings | Modül ayarları | Evet | Modülün görünüm ve davranış ayarlarıdır. | Module Settings |  |

| Modül | Mini Izgara | Mini Grid | Banner / tablo modülü | Evet | Modül içinde kullanılan küçük ızgara yapısıdır. | Mini Grid |  |

| Modül | İç Hücre | Inner Cell | Modül içi yapı | Evet | Modülün kendi içindeki hücredir. | Inner Cell |  |

| Modül | Alt Hücre | Sub Cell | Modül içi yapı | Evet | Modül içinde daha küçük hücre alanıdır. | Sub Cell |  |

| Modül | Tablo Satırı | Table Row | Tablo modülü | Evet | Tablo içindeki yatay satırdır. | Table Row |  |

| Modül | Tablo Sütunu | Table Column | Tablo modülü | Evet | Tablo içindeki dikey sütundur. | Table Column |  |



\---



\## 19. Şablon / Marka / Tasarım Sistemi Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Şablon / Marka | Şablon | Template | Tasarım sekmesi / başlangıç | Evet | Tasarımın ölçü, sayfa, kırım ve yerleşim yapısını belirleyen temel yapıdır. | Template |  |

| Şablon / Marka | Aktif Şablon | Active Template | Şablon bilgileri | Evet | O anda kullanılan şablondur. | Active Template |  |

| Şablon / Marka | Şablon Seç | Choose Template | Başlangıç / tasarım sekmesi | Evet | Kullanıcının şablon seçmesini sağlar. | Choose Template |  |

| Şablon / Marka | Şablon Bilgileri | Template Info | Tasarım sekmesi | Evet | Aktif şablonun ölçü, sayfa ve kırım bilgilerini gösterir. | Template Info |  |

| Şablon / Marka | Hazır Şablon | Ready Template | Başlangıç / şablon galerisi | Evet | Kullanıma hazır tasarım şablonudur. | Ready Template |  |

| Şablon / Marka | Boş Şablon | Blank Template | Başlangıç | Evet | İçeriği boş, yapısı hazır şablondur. | Blank Template |  |

| Şablon / Marka | Kayıtlı Şablon | Saved Template | Kullanıcı paneli | Evet | Kullanıcının kaydettiği şablondur. | Saved Template |  |

| Şablon / Marka | Proje Şablonu | Project Template | Kayıtlı şablon | Evet | Tüm tasarım düzenini içeren tekrar kullanılabilir proje yapısıdır. | Project Template |  |

| Şablon / Marka | Komple Proje Şablonu | Full Project Template | Kayıtlı şablon | Evet | Grid, arka plan, modül ve yerleşimleriyle tüm projeyi saklayan şablondur. | Full Project Template |  |

| Şablon / Marka | Şablonu Değiştir | Change Template | Tasarım sekmesi | Evet | Aktif şablonu farklı bir şablonla değiştirir. | Change Template | Uyarı gerektirir. |

| Şablon / Marka | Şablonu Kaydet | Save Template | Kayıt işlemi | Evet | Mevcut tasarımı şablon olarak kaydeder. | Save Template |  |

| Şablon / Marka | Şablonu Kopyala | Copy Template | Şablon işlemi | Evet | Şablonun kopyasını oluşturur. | Copy Template |  |

| Şablon / Marka | Şablonu Kilitle | Lock Template | Şablon işlemi | Evet | Şablonun belirli alanlarının değişmesini engeller. | Lock Template |  |

| Şablon / Marka | Kilitli Şablon | Locked Template | Şablon yapısı | Evet | Bazı alanları düzenlemeye kapalı şablondur. | Locked Template |  |

| Şablon / Marka | Düzenlenebilir Alan | Editable Area | Şablon yapısı | Evet | Kullanıcının değiştirebildiği şablon alanıdır. | Editable Area |  |

| Şablon / Marka | Kilitli Alan | Locked Area | Şablon yapısı | Evet | Kullanıcının değiştiremediği korumalı alandır. | Locked Area |  |

| Şablon / Marka | Marka Kiti | Brand Kit | Marka yönetimi | Evet | Markaya ait renk, font ve logoları içeren settir. | Brand Kit | Kullanıcı panelinde “Marka Varlıkları” tercih edilebilir. |

| Şablon / Marka | Marka Varlıkları | Brand Assets | Kullanıcı paneli / kütüphane | Evet | Markaya ait logo, renk, font ve görsellerdir. | Brand Assets | Ana kullanıcı terimi. |

| Şablon / Marka | Marka Renkleri | Brand Colors | Marka varlıkları | Evet | Markaya ait tanımlı renklerdir. | Brand Colors |  |

| Şablon / Marka | Marka Fontları | Brand Fonts | Marka varlıkları | Evet | Markaya ait yazı tipleridir. | Brand Fonts |  |

| Şablon / Marka | Marka Logoları | Brand Logos | Marka varlıkları | Evet | Markaya ait logo dosyalarıdır. | Brand Logos |  |

| Şablon / Marka | Ana Logo | Primary Logo | Marka varlıkları | Evet | Markanın ana kullanım logosudur. | Primary Logo |  |

| Şablon / Marka | İkincil Logo | Secondary Logo | Marka varlıkları | Evet | Alternatif logo kullanımıdır. | Secondary Logo |  |

| Şablon / Marka | Başlık Fontu | Heading Font | Marka fontları | Evet | Başlıklarda kullanılacak yazı tipidir. | Heading Font |  |

| Şablon / Marka | Gövde Fontu | Body Font | Marka fontları | Evet | Açıklama ve metinlerde kullanılacak yazı tipidir. | Body Font |  |

| Şablon / Marka | Marka Kısıtları | Brand Restrictions | Marka yönetimi | Teknik dokümanda kullanılabilir | Markaya ait tasarım kurallarını ifade eder. | Brand Restrictions | Kullanıcıya “Marka Kuralları” daha uygun olabilir. |

| Şablon / Marka | Marka Kuralları | Brand Guidelines | Marka yönetimi | Evet | Tasarımların markaya uygun kalması için belirlenen kurallardır. | Brand Guidelines |  |

| Şablon / Marka | Markaya Uygunluk | Brand Compliance | Marka kontrolü | Evet | Tasarımın marka kurallarına uygun olup olmadığını belirtir. | Brand Compliance |  |

| Şablon / Marka | Marka Kontrolü | Brand Check | Kontrol / marka | Evet | Tasarımın marka renkleri, fontları ve logolarıyla uyumunu kontrol eder. | Brand Check |  |



\---



\## 20. Hızlı Araç Çubuğu Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Hızlı Araç Çubuğu | Hızlı Araç Çubuğu | Contextual Bar | Seçime göre araçlar | Evet | Seçili öğeye göre değişen hızlı işlem çubuğudur. | Contextual Bar | Ana terim. |

| Hızlı Araç Çubuğu | Bağlamsal Araç Çubuğu | Contextual Toolbar | Teknik açıklama | Açıklamada kullanılabilir | Seçilen öğeye göre değişen araç çubuğudur. | Contextual Toolbar | UI’da “Hızlı Araç Çubuğu” daha sade. |

| Hızlı Araç Çubuğu | Hızlı Ayarlar | Quick Settings | Hızlı araç çubuğu | Evet | Seçili öğe için hızlıca değiştirilebilen ayarlardır. | Quick Settings |  |

| Hızlı Araç Çubuğu | Seçime Göre Ayarlar | Contextual Settings | Hızlı araç çubuğu | Evet | Seçili öğeye göre görünen ayarlardır. | Contextual Settings |  |

| Hızlı Araç Çubuğu | Hücre Araçları | Cell Tools | Hızlı araç çubuğu | Evet | Seçili hücreye ait hızlı işlemlerdir. | Cell Tools |  |

| Hızlı Araç Çubuğu | Metin Araçları | Text Tools | Hızlı araç çubuğu | Evet | Seçili metne ait hızlı işlemlerdir. | Text Tools |  |

| Hızlı Araç Çubuğu | Görsel Araçları | Image Tools | Hızlı araç çubuğu | Evet | Seçili görsele ait hızlı işlemlerdir. | Image Tools |  |

| Hızlı Araç Çubuğu | Fiyat Araçları | Price Tools | Hızlı araç çubuğu | Evet | Seçili fiyat alanına ait hızlı işlemlerdir. | Price Tools |  |

| Hızlı Araç Çubuğu | Modül Araçları | Module Tools | Hızlı araç çubuğu | Evet | Seçili modüle ait hızlı işlemlerdir. | Module Tools |  |

| Hızlı Araç Çubuğu | Kopyala Stil | Copy Style | Hızlı araç çubuğu | Evet | Seçili öğenin stilini kopyalar. | Copy Style |  |

| Hızlı Araç Çubuğu | Temizle Biçim | Clear Formatting | Hızlı araç çubuğu | Evet | Seçili öğedeki özel biçimlendirmeyi kaldırır. | Clear Formatting |  |

| Hızlı Araç Çubuğu | Göster / Gizle | Show / Hide | Hızlı araç çubuğu | Evet | Seçili öğeyi görünür veya gizli yapar. | Show / Hide |  |



\---



\## 21. Görünüm / Kılavuz / Yardımcı Çizgi Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Görünüm / Kılavuz | Görünüm | View | Üst bar / ayarlar | Evet | Çalışma yüzeyinin nasıl gösterileceğini belirleyen seçeneklerdir. | View |  |

| Görünüm / Kılavuz | Önizleme Modu | Preview Mode | Görünüm | Evet | Tasarımı düzenleme çizgileri olmadan gösterir. | Preview Mode |  |

| Görünüm / Kılavuz | Düzenleme Modu | Edit Mode | Görünüm | Evet | Tasarımın düzenlenebilir olduğu moddur. | Edit Mode |  |

| Görünüm / Kılavuz | Baskı Önizleme | Print Preview | Görünüm / çıktı | Evet | Tasarımın baskıya yakın görünümünü gösterir. | Print Preview |  |

| Görünüm / Kılavuz | Gerçek Baskı Görünümü | Print View | Görünüm | Evet | Tasarımı baskıya en yakın şekilde gösteren görünüm modudur. | Print View |  |

| Görünüm / Kılavuz | Izgara Görünümü | Grid View | Görünüm | Evet | Izgara çizgilerinin göründüğü çalışma görünümüdür. | Grid View |  |

| Görünüm / Kılavuz | Kılavuzlar | Guides | Görünüm | Evet | Hizalama ve baskı güvenliği için kullanılan yardımcı çizgilerdir. | Guides |  |

| Görünüm / Kılavuz | Yardımcı Çizgiler | Guides | Görünüm | Evet | Tasarımı hizalamaya veya kontrol etmeye yarayan çizgilerdir. | Guides |  |

| Görünüm / Kılavuz | Cetvel | Ruler | Görünüm | Evet | Ölçü ve konum takibi için kullanılan araçtır. | Ruler |  |

| Görünüm / Kılavuz | Sayfa Sınırları | Page Boundaries | Görünüm | Evet | Sayfanın dış sınırlarını gösterir. | Page Boundaries |  |

| Görünüm / Kılavuz | Kesim Çizgisi | Trim Line | Görünüm / baskı kontrolü | Evet | Ürünün kesileceği nihai sınırı gösterir. | Trim Line |  |

| Görünüm / Kılavuz | Taşma Alanı | Bleed Area | Görünüm / baskı kontrolü | Evet | Tasarımın kesim dışına taşması gereken alanı gösterir. | Bleed Area |  |

| Görünüm / Kılavuz | Güvenli Alan | Safe Area | Görünüm / baskı kontrolü | Evet | Önemli içeriklerin içeride kalması gereken alanı gösterir. | Safe Area |  |

| Görünüm / Kılavuz | Kırım Çizgileri | Fold Lines | Görünüm / broşür | Evet | Broşürün katlanacağı çizgileri gösterir. | Fold Lines |  |

| Görünüm / Kılavuz | Katlama Çizgileri | Fold Lines | Görünüm / broşür | Evet | Katlama yapılacak çizgileri gösterir. | Fold Lines |  |

| Görünüm / Kılavuz | Hücre Sınırları | Cell Boundaries | Görünüm | Evet | Hücrelerin dış sınırlarını gösterir. | Slot Boundaries |  |

| Görünüm / Kılavuz | Boşluk Göstergesi | Spacing Indicator | Görünüm | Evet | Öğeler arasındaki boşluğu gösterir. | Spacing Indicator |  |

| Görünüm / Kılavuz | Yapışma | Snap | Hizalama | Evet | Öğelerin kılavuz, ızgara veya başka öğelere otomatik hizalanmasıdır. | Snap |  |

| Görünüm / Kılavuz | Izgaraya Yapış | Snap to Grid | Hizalama | Evet | Öğeyi ızgara çizgilerine otomatik hizalar. | Snap to Grid |  |

| Görünüm / Kılavuz | Kılavuza Yapış | Snap to Guide | Hizalama | Evet | Öğeyi kılavuz çizgilere otomatik hizalar. | Snap to Guide |  |

| Görünüm / Kılavuz | Nesneye Yapış | Snap to Object | Hizalama | Evet | Öğeyi başka nesnelere otomatik hizalar. | Snap to Object |  |

| Görünüm / Kılavuz | Akıllı Kılavuz | Smart Guide | Hizalama | Evet | Hizalama sırasında otomatik çıkan yardımcı çizgilerdir. | Smart Guide |  |

| Görünüm / Kılavuz | Mesafe Göstergesi | Distance Indicator | Görünüm | Evet | Öğeler arasındaki mesafeyi gösterir. | Distance Indicator |  |

| Görünüm / Kılavuz | Ölçü Göstergesi | Measurement Indicator | Görünüm | Evet | Öğenin ölçülerini veya konum değerlerini gösterir. | Measurement Indicator |  |

| Görünüm / Kılavuz | Yakınlaştırma Seviyesi | Zoom Level | Görünüm | Evet | Çalışma yüzeyinin büyütme oranıdır. | Zoom Level |  |

| Görünüm / Kılavuz | Tam Ekran | Full Screen | Görünüm | Evet | Çalışma alanını tam ekran gösterir. | Full Screen |  |



\---



\## 22. Çıktı / Kontrol / Yayınlama Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Çıktı / Kontrol | Baskı Kontrolü | Preflight | PDF / sipariş öncesi | Evet | Tasarımın baskıya uygun olup olmadığını kontrol eder. | Preflight | Ana terim. |

| Çıktı / Kontrol | Kontrol Merkezi | Check Center / Preflight Center | Baskı kontrolü | Evet | Baskı kontrolü sonuçlarının listelendiği alandır. | Preflight Center |  |

| Çıktı / Kontrol | Dosya Kontrolü | File Check | Dosya yükleme / çıktı | Evet | Tasarım dosyasının uygunluğunu kontrol eder. | File Check |  |

| Çıktı / Kontrol | Hata | Error | Kontrol sonucu | Evet | Düzeltilmesi gereken sorunu belirtir. | Error |  |

| Çıktı / Kontrol | Uyarı | Warning | Kontrol sonucu | Evet | Dikkat edilmesi gereken ama her zaman işlemi engellemeyen durumu belirtir. | Warning |  |

| Çıktı / Kontrol | Kritik Hata | Critical Error | Kontrol sonucu | Evet | Baskıya geçmeden önce mutlaka düzeltilmesi gereken sorundur. | Critical Error |  |

| Çıktı / Kontrol | Çözünürlük Kontrolü | Resolution Check | Baskı kontrolü | Evet | Görsellerin baskı için yeterli netlikte olup olmadığını kontrol eder. | Resolution Check |  |

| Çıktı / Kontrol | Renk Modu Kontrolü | Color Mode Check | Baskı kontrolü | Evet | RGB/CMYK gibi renk modlarını kontrol eder. | Color Mode Check |  |

| Çıktı / Kontrol | Taşma Payı Kontrolü | Bleed Check | Baskı kontrolü | Evet | Tasarımda yeterli taşma payı olup olmadığını kontrol eder. | Bleed Check |  |

| Çıktı / Kontrol | Güvenli Alan Kontrolü | Safe Area Check | Baskı kontrolü | Evet | Önemli içeriklerin güvenli alan içinde kalıp kalmadığını kontrol eder. | Safe Area Check |  |

| Çıktı / Kontrol | Font Kontrolü | Font Check | Baskı kontrolü | Evet | Fontların uygunluğunu kontrol eder. | Font Check |  |

| Çıktı / Kontrol | Eksik Görsel Kontrolü | Missing Image Check | Baskı kontrolü | Evet | Eksik veya bulunamayan görselleri kontrol eder. | Missing Image Check |  |

| Çıktı / Kontrol | Taşan Metin Kontrolü | Overset Text Check | Baskı kontrolü | Evet | Alana sığmayan metinleri kontrol eder. | Overset Text Check |  |

| Çıktı / Kontrol | PDF Önizleme | PDF Preview | Çıktı öncesi | Evet | Oluşturulan PDF’i indirmeden önce gösterir. | PDF Preview |  |

| Çıktı / Kontrol | Onay PDF’i | Approval PDF | Müşteri onayı | Evet | Kullanıcının kontrol etmesi için oluşturulan PDF’tir. | Approval PDF |  |

| Çıktı / Kontrol | Üretim PDF’i | Production PDF | Matbaa üretimi | Teknik dokümanda kullanılabilir | Baskı üretiminde kullanılacak PDF’tir. | Production PDF |  |

| Çıktı / Kontrol | PDF İndir | Download PDF | Çıktı alma | Evet | Tasarımı PDF olarak indirir. | Export PDF |  |

| Çıktı / Kontrol | JPEG İndir | Download JPEG | Çıktı alma | Evet | Tasarımı JPEG olarak indirir. | Download JPEG |  |

| Çıktı / Kontrol | PNG İndir | Download PNG | Çıktı alma | Evet | Tasarımı PNG olarak indirir. | Download PNG |  |

| Çıktı / Kontrol | Dışa Aktar | Export | Gelişmiş çıktı | Açıklamada kullanılabilir | Tasarımı farklı dosya formatında oluşturur. | Export | Son kullanıcıda “İndir” daha uygun. |

| Çıktı / Kontrol | Baskıya Hazır | Print-ready | Kontrol sonucu | Evet | Tasarımın baskıya uygun olduğunu belirtir. | Print-ready |  |

| Çıktı / Kontrol | Baskıya Uygun Değil | Not Print-ready | Kontrol sonucu | Evet | Tasarımda baskıdan önce düzeltilmesi gereken sorun olduğunu belirtir. | Not Print-ready |  |

| Çıktı / Kontrol | Kontrolü Geçti | Passed Check | Kontrol sonucu | Evet | Tasarımın kontrol kurallarından geçtiğini belirtir. | Passed Check |  |

| Çıktı / Kontrol | Kontrol Gerekli | Check Required | Kontrol sonucu | Evet | Tasarımın baskıya gönderilmeden önce kontrol edilmesi gerektiğini belirtir. | Check Required |  |

| Çıktı / Kontrol | Tasarımı Onayla | Approve Design | Sipariş öncesi | Evet | Tasarımın baskıya gönderilmesini onaylar. | Approve Design |  |

| Çıktı / Kontrol | Müşteri Onayı | Customer Approval | Onay akışı | Evet | Müşterinin tasarımı onaylamasıdır. | Customer Approval |  |

| Çıktı / Kontrol | Paylaşım Linki | Share Link | Paylaşım | Evet | Tasarımı başkalarıyla paylaşmak için oluşturulan bağlantıdır. | Share Link |  |

| Çıktı / Kontrol | Onay Linki | Approval Link | Onay akışı | Evet | Tasarım onayı almak için gönderilen bağlantıdır. | Approval Link |  |



\---



\## 23. Proje Yönetimi / Versiyon / Geçmiş Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Proje Yönetimi | Projeyi Kaydet | Save Project | Proje işlemi | Evet | Mevcut tasarım projesini kaydeder. | Save Project |  |

| Proje Yönetimi | Projeyi Yükle | Load Project | Proje işlemi | Evet | Daha önce kaydedilmiş proje dosyasını açar. | Load Project |  |

| Proje Yönetimi | Projeyi Kopyala | Duplicate Project | Proje işlemi | Evet | Projenin yeni bir kopyasını oluşturur. | Duplicate Project |  |

| Proje Yönetimi | Projeyi Sil | Delete Project | Proje işlemi | Evet | Projeyi siler. | Delete Project | Onay popup gerekir. |

| Proje Yönetimi | Projeyi Yeniden Adlandır | Rename Project | Proje işlemi | Evet | Proje adını değiştirir. | Rename Project |  |

| Proje Yönetimi | Kayıtlı Projeler | Saved Projects | Kullanıcı paneli | Evet | Daha önce kaydedilmiş projeleri gösterir. | Saved Projects |  |

| Proje Yönetimi | Çalışmalarım | My Works | Kullanıcı paneli | Evet | Kullanıcının kayıtlı tasarım çalışmalarını gösterir. | My Works | “Tasarım Projelerim” daha net olabilir. |

| Proje Yönetimi | Versiyon | Version | Proje geçmişi | Evet | Tasarımın belirli bir kayıt sürümüdür. | Version |  |

| Proje Yönetimi | Versiyon Geçmişi | Version History | Proje geçmişi | Evet | Tasarımın önceki kayıt sürümlerini gösterir. | Version History |  |

| Proje Yönetimi | Geçmiş | History | Proje / işlem | Evet | Yapılan işlemlerin veya sürümlerin kaydıdır. | History |  |

| Proje Yönetimi | Snapshot | Snapshot | Teknik kayıt | Teknik dokümanda kullanılabilir | Projenin belirli andaki durum kaydıdır. | Snapshot | UI’da “Kayıt Noktası” kullanılabilir. |

| Proje Yönetimi | Kayıt Noktası | Snapshot | Proje geçmişi | Açıklamada kullanılabilir | Tasarımın belirli bir andaki kayıt halidir. | Snapshot |  |

| Proje Yönetimi | Otomatik Kayıt | Autosave | Proje kaydı | Evet | Sistem tarafından otomatik yapılan kayıttır. | Autosave |  |

| Proje Yönetimi | Manuel Kayıt | Manual Save | Proje kaydı | Evet | Kullanıcının kendisinin yaptığı kayıttır. | Manual Save |  |

| Proje Yönetimi | Son Değişiklik | Last Change | Proje durumu | Evet | Tasarımda yapılan en son değişikliği ifade eder. | Last Change |  |

| Proje Yönetimi | Son Kaydedilme | Last Saved | Proje durumu | Evet | Projenin en son kaydedildiği zamanı gösterir. | Last Saved |  |

| Proje Yönetimi | Taslak | Draft | Proje durumu | Evet | Henüz tamamlanmamış çalışma durumudur. | Draft | UI’da Taslak kullanılmalı. |

| Proje Yönetimi | Yayınlandı | Published | Proje durumu | Evet | Tasarımın kullanılabilir veya paylaşılabilir hale geldiğini belirtir. | Published |  |

| Proje Yönetimi | Onaylandı | Approved | Proje durumu | Evet | Tasarımın onaylandığını gösterir. | Approved |  |

| Proje Yönetimi | Revizyon | Revision | Proje / tasarım | Evet | Tasarım üzerinde yapılan düzeltme sürecidir. | Revision |  |

| Proje Yönetimi | Revizyon Notu | Revision Note | Proje / onay | Evet | Yapılması istenen düzeltmeye ait açıklamadır. | Revision Note |  |

| Proje Yönetimi | Kopya Oluştur | Create Copy | Proje işlemi | Evet | Mevcut tasarımın yeni bir kopyasını oluşturur. | Create Copy |  |

| Proje Yönetimi | Şablon Olarak Kaydet | Save as Template | Proje işlemi | Evet | Mevcut tasarımı tekrar kullanılabilir şablon olarak kaydeder. | Save as Template |  |

| Proje Yönetimi | Modül Olarak Kaydet | Save as Module | Proje işlemi | Evet | Seçili alanı tekrar kullanılabilir modül olarak kaydeder. | Save as Module |  |

| Proje Yönetimi | Favorilere Ekle | Add to Favorites | Proje / varlık | Evet | Öğeyi favoriler listesine ekler. | Add to Favorites |  |



\---



\## 24. Kullanıcı Mesajları / Durum Terimleri



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|

| Durum Mesajı | Yükleniyor | Loading | Sistem durumu | Evet | İşlemin devam ettiğini gösterir. | Loading |  |

| Durum Mesajı | Kaydediliyor | Saving | Sistem durumu | Evet | Tasarımın kaydedildiğini gösterir. | Saving |  |

| Durum Mesajı | Kaydedildi | Saved | Sistem durumu | Evet | Kaydetme işleminin tamamlandığını gösterir. | Saved |  |

| Durum Mesajı | Değişiklikler Kaydedildi | Changes Saved | Sistem durumu | Evet | Son değişikliklerin kaydedildiğini belirtir. | Changes Saved |  |

| Durum Mesajı | Kontrol Ediliyor | Checking | Baskı kontrolü | Evet | Tasarımın kontrol edildiğini gösterir. | Checking |  |

| Durum Mesajı | Hazırlanıyor | Preparing | Sistem durumu | Evet | Dosya veya işlem hazırlanıyor durumudur. | Preparing |  |

| Durum Mesajı | PDF Oluşturuluyor | Creating PDF | Çıktı | Evet | PDF dosyasının hazırlandığını gösterir. | Creating PDF |  |

| Durum Mesajı | İndiriliyor | Downloading | Çıktı | Evet | Dosyanın indirildiğini gösterir. | Downloading |  |

| Durum Mesajı | Veri Yükleniyor | Loading Data | Veri | Evet | Ürün veya proje verilerinin yüklendiğini gösterir. | Loading Data |  |

| Durum Mesajı | Excel Okunuyor | Reading Excel | Veri | Evet | Excel dosyasının sistem tarafından okunduğunu gösterir. | Reading Excel |  |

| Durum Mesajı | Ürünler Yerleştiriliyor | Placing Products | Veri / ürün | Evet | Ürünlerin hücrelere yerleştirildiğini gösterir. | Placing Products |  |

| Durum Mesajı | Ürün Yerleştirildi | Product Placed | Ürün | Evet | Ürünün tasarıma eklendiğini belirtir. | Product Placed |  |

| Durum Mesajı | Ürün Yerleştirilemedi | Product Could Not Be Placed | Ürün / rapor | Evet | Ürünün otomatik olarak yerleştirilemediğini belirtir. | Product Could Not Be Placed |  |

| Durum Mesajı | Eksik Alan Var | Missing Field | Veri / kontrol | Evet | Ürün veya tasarım bilgisinde eksik alan olduğunu gösterir. | Missing Field |  |

| Durum Mesajı | Görsel Yok | No Image | Ürün / hücre | Evet | Ürüne ait görsel bulunmadığını gösterir. | No Image |  |

| Durum Mesajı | Fiyat Yok | No Price | Ürün / hücre | Evet | Ürüne ait fiyat bulunmadığını gösterir. | No Price |  |

| Durum Mesajı | Ürün Adı Eksik | Product Name Missing | Ürün / rapor | Evet | Ürünün ad bilgisinin eksik olduğunu gösterir. | Product Name Missing |  |

| Durum Mesajı | Baskıya Hazır | Print-ready | Baskı kontrolü | Evet | Tasarımın baskıya uygun olduğunu gösterir. | Print-ready |  |

| Durum Mesajı | Kontrol Gerekli | Check Required | Baskı kontrolü | Evet | Tasarımın baskıya gönderilmeden önce kontrol edilmesi gerektiğini gösterir. | Check Required |  |

| Durum Mesajı | Uyarı | Warning | Sistem / kontrol | Evet | Dikkat edilmesi gereken bir durum olduğunu gösterir. | Warning |  |

| Durum Mesajı | Devam Et | Continue | Buton | Evet | İşleme devam eder. | Continue |  |

| Durum Mesajı | İptal | Cancel | Buton | Evet | İşlemi iptal eder. | Cancel |  |

| Durum Mesajı | Onayla | Confirm | Buton | Evet | İşlemi onaylar. | Confirm |  |

| Durum Mesajı | Vazgeç | Discard / Cancel | Buton | Evet | İşlemden veya değişiklikten vazgeçer. | Discard | Bağlama göre dikkatli kullanılmalı. |

| Durum Mesajı | Geri Dön | Go Back | Buton | Evet | Önceki adıma döner. | Go Back |  |

| Durum Mesajı | Değişiklikleri Kaydet | Save Changes | Buton | Evet | Yapılan değişiklikleri kaydeder. | Save Changes |  |

| Durum Mesajı | Değişiklikleri Kaydetmeden Çık | Exit Without Saving | Uyarı / buton | Evet | Kaydedilmemiş değişiklikleri kaybetme riskiyle çıkış yapar. | Exit Without Saving |  |

| Durum Mesajı | Bu İşlem Geri Alınamaz | This Action Cannot Be Undone | Uyarı | Evet | İşlemin geri alınamayacağını belirtir. | This Action Cannot Be Undone | Kısa uyarıda kullanılabilir. |

| Durum Mesajı | Tasarım Sıfırlanacak | Design Will Be Reset | Uyarı | Evet | Tasarımın varsayılan hale döneceğini belirtir. | Design Will Be Reset |  |

| Durum Mesajı | Yerleşim Değişebilir | Layout May Change | Uyarı | Evet | Şablon veya düzen değişince mevcut yerleşimin etkilenebileceğini belirtir. | Layout May Change |  |



\---



\## 25. Kullanılmaması Gereken Tasarım Stüdyosu Terimleri



Bu terimler kullanıcı arayüzünde doğrudan kullanılmamalı veya yalnızca teknik açıklama içinde verilmelidir.



| Kullanılmaması Gereken Terim | Kullanılacak Terim | Kullanım Notu |

|---|---|---|

| Canvas | Çalışma Yüzeyi | Editörün orta tasarım alanı. |

| Tuval | Çalışma Yüzeyi | Presserdiado’da “Çalışma Yüzeyi” daha net. |

| Slot | Hücre / Alan | Ürün yerleşimi için Hücre, serbest yapı için Alan. |

| Grid | Izgara / Düzen | Teknik yapı için Izgara, kullanıcı akışı için Düzen. |

| Sidebar | Sağ Panel | Tasarım stüdyosu sağ kontrol alanı. |

| Contextual Bar | Hızlı Araç Çubuğu | Seçime göre değişen araç çubuğu. |

| Product Pool | Ürün Havuzu | Ürünlerin listelendiği alan. |

| Temporary Pool | Bekleme Alanı | Geçici ürün bekleme alanı. |

| Preflight | Baskı Kontrolü | PDF ve sipariş öncesi kontrol. |

| Export | İndir / Dışa Aktar | Son kullanıcı için İndir. |

| Import | Yükle / İçe Aktar | Dosya için Yükle, veri için İçe Aktar. |

| Layer | Katman | İngilizce kullanılmamalı. |

| Frame | Çerçeve / Alan | Bağlama göre seçilir. |

| Asset | Varlık | Medya, logo, ikon ve dosyalar için. |

| Brand Kit | Marka Varlıkları / Marka Kiti | Kullanıcı panelinde Marka Varlıkları. |

| Auto Layout | Otomatik Düzen / Otomatik Yerleşim | Bağlama göre seçilir. |

| Component | Bileşen / Modül | Kullanıcıya çoğunlukla Modül daha uygun. |

| Instance | Örnek Bileşen | UI’da genelde kullanılmamalı. |

| Variant | Varyant | Teknik dokümanda kullanılabilir. |

| Snapshot | Kayıt Noktası | Teknik dokümanda Snapshot kullanılabilir. |

| Draft | Taslak | Kullanıcı paneli ve proje durumu için. |



\---



\## 26. Kısa Özet



Presserdiado tasarım stüdyosunda kullanıcıya görünen ana terimler şunlardır:



```text

Çalışma Yüzeyi

Sağ Panel

Ürünler

Tasarım

Hücre

Modüller

Şablon

Izgara

Arka Plan

Ürün Havuzu

Bekleme Alanı

Hızlı Araç Çubuğu

Baskı Kontrolü

PDF İndir

Siparişi Tamamla

```



Ana ilke:



> Kullanıcı tasarım programı bilmese bile neye tıkladığını ve neyin değişeceğini anlamalıdır.



Bu nedenle teknik terimler sistem içinde korunabilir, ancak kullanıcı arayüzünde sade Türkçe karşılıklar kullanılmalıdır.

