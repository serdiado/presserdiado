\# Presserdiado UI Yazım Kuralları



Bu dosya, Presserdiado projesinde kullanıcıya görünen arayüz metinlerinin nasıl yazılacağını tanımlar.



Amaç; buton, menü, panel, uyarı, açıklama, boş durum, hata mesajı ve yardım metinlerinde tutarlı, sade ve kullanıcı dostu bir dil oluşturmaktır.



\---



\## 1. Genel Yazım İlkesi



Presserdiado arayüz dili şu özellikleri taşımalıdır:



\- Sade

\- Kısa

\- Türkçe

\- Tutarlı

\- Eylem odaklı

\- Kullanıcıyı yönlendiren

\- Teknik olarak doğru

\- Gereksiz jargon kullanmayan

\- Tasarım bilmeyen kullanıcıyı yormayan



Ana ilke:



> Kullanıcıya ne yapacağını söyle, teknik detayı gerektiğinde açıkla.



\---



\## 2. Terminoloji Önceliği



UI metni yazılırken her zaman `docs/terminoloji/` klasöründeki terminoloji dosyaları esas alınmalıdır.



Öncelik sırası:



1\. `00\_Terminoloji\_Kullanim\_Kurallari.md`

2\. İlgili terminoloji dosyasındaki \*\*Önerilen Terim\*\*

3\. İlgili terimin \*\*Kullanım Alanı\*\*

4\. İlgili terimin \*\*Açıklama\*\* alanı

5\. \*\*Kullanılmaması Gereken Terimler\*\* alanı



Kullanıcı arayüzünde İngilizce teknik terimler doğrudan kullanılmamalıdır.



\---



\## 3. Genel Ton



Presserdiado’nun arayüz tonu şu şekilde olmalıdır:



\- Profesyonel ama soğuk olmayan

\- Yardımcı ama fazla açıklama yapmayan

\- Güven veren ama abartılı olmayan

\- Net ama sert olmayan

\- Teknik olarak doğru ama kullanıcıyı teknik bilgiye zorlamayan



Kaçınılması gereken tonlar:



\- Fazla resmi

\- Fazla samimi

\- Fazla teknik

\- Fazla pazarlama odaklı

\- Gereksiz uzun

\- Belirsiz

\- Korkutucu



\---



\## 4. Buton Metni Kuralları



Buton metinleri kısa, net ve eylem odaklı olmalıdır.



\### Doğru Kullanım



```text

Kaydet

Devam Et

İptal

Onayla

Dosya Yükle

Excel Yükle

PDF İndir

Önizle

Siparişi Tamamla

Tasarımı Kaydet

Ürünleri Temizle

Tümünü Sıfırla

Baskı Kontrolü Yap

```



\### Yanlış Kullanım



```text

Submit

Proceed

Upload File

Export PDF

Preflight Check

Reset All

Click Here

Confirm Operation

```



\### Kural



\- Butonlarda mümkün olduğunca fiil kullanılmalıdır.

\- Kullanıcı butona bastığında ne olacağını anlamalıdır.

\- Gereksiz uzun buton metinlerinden kaçınılmalıdır.

\- Aynı işlem için farklı buton metinleri kullanılmamalıdır.



\---



\## 5. Ana Menü Adları



Ana menü adları kısa, tanınabilir ve tek kelimelik olmalıdır.



Tasarım stüdyosu sağ panel ana menüleri:



```text

Ürünler

Tasarım

Hücre

Modüller

```



Kullanıcı paneli ana menüleri:



```text

Ana Sayfa

Tasarım Projelerim

Kayıtlı Şablonlarım

Ürün Listelerim

Marka Varlıklarım

Baskı Siparişlerim

Dosyalarım

Ekip ve Paylaşım

Fatura ve Ödeme

Hesap Ayarları

Yardım Merkezi

```



Yönetici paneli ana menüleri:



```text

Kontrol Paneli

Kullanıcılar

Müşteriler

Siparişler

Üretim

Baskı İşleri

Ürünler

Fiyatlandırma

Şablonlar

Baskı Kontrolü

Faturalar

Kargo

Destek Talepleri

Ekip ve Yetkiler

Raporlar

Sistem Ayarları

```



\---



\## 6. Panel Başlığı Kuralları



Panel başlıkları, kullanıcının o bölümde neyi yöneteceğini açıkça belirtmelidir.



\### Doğru Kullanım



```text

Şablon Bilgileri

Izgara Ayarları

Arka Plan Ayarları

Ürün Bilgisi

Genel Hücre Ayarları

Özel Hücre Ayarları

Fiyat Kutusu Ayarları

Banner Ayarları

Footer Ayarları

Baskı Kontrolü

```



\### Yanlış Kullanım



```text

Settings

Options

Configuration

Edit

Advanced

Style

General

```



\### Kural



\- Panel başlığı tek başına anlamlı olmalıdır.

\- “Ayarlar” kelimesi yalnızca gerçekten ayar içeren bölümlerde kullanılmalıdır.

\- Gereksiz İngilizce başlık kullanılmamalıdır.

\- Aynı panel farklı yerlerde farklı isimle anılmamalıdır.



\---



\## 7. Akordiyon Menü Kuralları



Akordiyon menü başlıkları kısa ve taranabilir olmalıdır.



Tasarım sekmesi için önerilen akordiyonlar:



```text

Şablon

Izgara

Arka Plan

```



Arka Plan akordiyonu içinde önerilen alt başlıklar:



```text

Görünüm Modu

Sayfa Seçimi

Zemin Türü

Ayarlar

```



Hücre sekmesi için önerilen akordiyonlar:



```text

Genel Hücre

Seçili Hücre

Ürün Bilgisi

Fiyat Kutusu

Promosyon Etiketi

```



\### Kural



\- Akordiyon başlıkları kısa olmalıdır.

\- Başlıklar teknik değil, kullanıcı odaklı olmalıdır.

\- Aynı seviyedeki başlıklar aynı dil yapısında olmalıdır.

\- Gereksiz “Genel Stil”, “Tema”, “Baskı Alanları” gibi karmaşık bölümler kullanılmamalıdır.



\---



\## 8. Açıklama Metni Kuralları



Açıklama metinleri kısa ve yardımcı olmalıdır.



\### Doğru Kullanım



```text

Bu ayar tüm sayfalardaki hücreleri etkiler.

```



```text

Bu hücre artık genel ayarlardan bağımsız düzenlenir.

```



```text

Taşma payı, kesimden sonra beyaz kenar kalmasını önler.

```



\### Yanlış Kullanım



```text

Bu bölümde yapacağınız değişiklikler, sistemin genel yapılandırma ayarlarında bulunan tüm bağımlı bileşenlerin görünüm ve davranış biçimlerini kapsamlı şekilde güncelleyecektir.

```



\### Kural



\- Açıklama tek veya iki cümleyi geçmemelidir.

\- Kullanıcıya doğrudan fayda sağlamayan açıklama yazılmamalıdır.

\- Teknik terim varsa sade açıklama eklenmelidir.

\- Gereksiz uyarı tonu kullanılmamalıdır.



\---



\## 9. Yardım Metni Kuralları



Yardım metinleri, kullanıcının karar vermesini kolaylaştırmalıdır.



\### Doğru Kullanım



```text

Çok ürünlü broşürler için Hücre Yapılı Tasarım önerilir.

```



```text

Az ürünlü veya serbest kampanya tasarımları için Serbest Tasarım kullanabilirsiniz.

```



```text

Görsellerin net basılması için yüksek çözünürlüklü dosyalar kullanın.

```



\### Yanlış Kullanım



```text

Bu özellik gelişmiş kullanıcılar için tasarlanmış olup belirli durumlarda farklı sonuçlar doğurabilir.

```



\### Kural



\- Yardım metni karar vermeye yardımcı olmalıdır.

\- Gereksiz teknik detay verilmemelidir.

\- Kullanıcıya “neden” gerektiği kısa şekilde anlatılmalıdır.



\---



\## 10. Boş Durum Mesajları



Boş durum mesajları kullanıcıya ne olmadığını ve ne yapması gerektiğini söylemelidir.



\### Ürün Havuzu Boş



```text

Henüz ürün yok.

Excel dosyanızı yükleyerek ürünleri ekleyebilirsiniz.

```



\### Şablon Yok



```text

Henüz kayıtlı şablon yok.

Yeni bir tasarımı şablon olarak kaydedebilirsiniz.

```



\### Proje Yok



```text

Henüz tasarım projeniz yok.

Yeni bir proje oluşturarak başlayabilirsiniz.

```



\### Sipariş Yok



```text

Henüz siparişiniz yok.

Tasarımınızı tamamladıktan sonra baskı siparişi oluşturabilirsiniz.

```



\### Kural



\- Boş durum mesajı yalnızca “boş” dememelidir.

\- Kullanıcıya sonraki adım gösterilmelidir.

\- Ton sakin ve yönlendirici olmalıdır.



\---



\## 11. Başarı Mesajları



Başarı mesajları kısa olmalıdır.



\### Doğru Kullanım



```text

Tasarım kaydedildi.

```



```text

Ürünler yerleştirildi.

```



```text

PDF hazırlandı.

```



```text

Sipariş oluşturuldu.

```



```text

Baskı kontrolü tamamlandı.

```



\### Yanlış Kullanım



```text

İşleminiz başarılı bir şekilde gerçekleştirilmiştir.

```



\### Kural



\- Başarı mesajları kısa tutulmalıdır.

\- Gereksiz resmi dil kullanılmamalıdır.

\- Kullanıcının neyin tamamlandığını anlaması yeterlidir.



\---



\## 12. Hata Mesajları



Hata mesajları kullanıcıyı suçlamamalıdır.



\### Doğru Kullanım



```text

Excel dosyası okunamadı.

Lütfen dosya formatını kontrol edin.

```



```text

PDF oluşturulamadı.

Tekrar deneyin veya dosyayı kontrol edin.

```



```text

Görsel bulunamadı.

Bu ürün için yeni bir görsel yükleyebilirsiniz.

```



\### Yanlış Kullanım



```text

Geçersiz işlem.

```



```text

Hata oluştu.

```



```text

Invalid file.

```



```text

User error.

```



\### Kural



\- Hata ne olduğunu söylemelidir.

\- Mümkünse çözüm önermelidir.

\- Kullanıcı suçlanmamalıdır.

\- Teknik hata kodu son kullanıcıya gösterilmemelidir.

\- Teknik detay gerekiyorsa “Detayları göster” altında verilebilir.



\---



\## 13. Uyarı Mesajları



Uyarı mesajları kısa, net ve karar verdirici olmalıdır.



\### Şablon Değişikliği



```text

Şablon değiştirilecek.

Mevcut yerleşim etkilenebilir.

Devam etmek istiyor musunuz?

```



\### Tasarımı Sıfırlama



```text

Tasarım sıfırlanacak.

Ürünler ve düzen ayarları temizlenecek.

Devam etmek istiyor musunuz?

```



\### Ürünleri Temizleme



```text

Ürünler temizlenecek.

Tasarım düzeni korunacak.

```



\### Aynı Ürünü Tekrar Ekleme



```text

Bu ürün tasarımda zaten var.

Yine de eklemek istiyor musunuz?

```



\### Kural



Uyarı metni şu üç soruya cevap vermelidir:



1\. Ne olacak?

2\. Ne değişecek?

3\. Kullanıcı devam etmeli mi?



\---



\## 14. Onay Popup Kuralları



Onay popup metinleri kısa olmalıdır.



\### Önerilen Yapı



```text

Başlık: Tasarımı sıfırla?

Açıklama: Ürünler ve düzen ayarları temizlenecek.

Butonlar: İptal / Sıfırla

```



```text

Başlık: Ürünleri temizle?

Açıklama: Tasarım düzeni korunacak, yalnızca ürünler kaldırılacak.

Butonlar: İptal / Temizle

```



```text

Başlık: Şablonu değiştir?

Açıklama: Mevcut yerleşim etkilenebilir.

Butonlar: İptal / Değiştir

```



\### Kural



\- Başlık soru formunda olabilir.

\- Açıklama tek cümle olmalıdır.

\- Ana eylem butonu net olmalıdır.

\- Tehlikeli işlemde ana eylem “Sil”, “Sıfırla”, “Temizle” gibi açık yazılmalıdır.



\---



\## 15. Teknik Terim Açıklama Kuralları



Teknik terimler sadeleştirilerek kullanılmalıdır.



\### Taşma Payı



```text

Kesimden sonra beyaz kenar kalmaması için tasarımın dışa doğru uzatılan alanı.

```



\### Güvenli Alan



```text

Yazı, logo ve önemli görsellerin kesilmemesi için içeride kalması gereken alan.

```



\### Kesim Çizgisi



```text

Ürünün baskı sonrası kesileceği nihai sınır.

```



\### Kırım Çizgisi



```text

Broşürün katlanacağı yer.

```



\### Baskı Kontrolü



```text

Tasarımın baskıya uygun olup olmadığını kontrol eder.

```



\### Kural



\- Teknik terim tek başına bırakılmamalıdır.

\- Yardım metninde kısa açıklama verilmelidir.

\- İngilizce karşılık yalnızca teknik dokümanda veya parantez içinde açıklama amacıyla kullanılabilir.



\---



\## 16. Kullanılacak / Kullanılmayacak Terim Örnekleri



| Kullanılmayacak | Kullanılacak |

|---|---|

| Canvas | Çalışma Yüzeyi |

| Slot | Hücre |

| Grid | Izgara / Düzen |

| Preflight | Baskı Kontrolü |

| Export | İndir / Dışa Aktar |

| Import | Yükle / İçe Aktar |

| Layer | Katman |

| Sidebar | Sağ Panel |

| Dashboard | Ana Sayfa / Kontrol Paneli |

| Template | Şablon |

| Product Pool | Ürün Havuzu |

| Temporary Pool | Bekleme Alanı |

| Contextual Bar | Hızlı Araç Çubuğu |

| Brand Kit | Marka Varlıkları / Marka Kiti |



\---



\## 17. Tasarım Stüdyosu UI Dil Kuralları



Tasarım stüdyosu içinde kullanıcıya sade ve doğrudan terimler gösterilmelidir.



\### Kullanılacak Ana Terimler



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



\### Kaçınılacak Terimler



```text

Canvas

Sidebar

Slot

Grid

Preflight

Export

Product Pool

Temporary Pool

Contextual Bar

```



\---



\## 18. Web-to-Print UI Dil Kuralları



Web-to-print sipariş akışında kullanıcıya üretim seçenekleri sade gösterilmelidir.



\### Kullanılacak Terimler



```text

Ürün Seçimi

Baskı Özellikleri

Ebat

Kağıt Türü

Gramaj

Adet

Kırım Tipi

Selefon

Baskı Fiyatı

Fiyat Hesapla

Sepete Ekle

Siparişi Tamamla

Tasarım Yükle

Online Tasarla

Hazır Şablon Seç

```



\### Kural



\- Teknik üretim detayları aşamalı gösterilmelidir.

\- Kullanıcı ilk ekranda gereksiz seçeneklerle boğulmamalıdır.

\- Tasarım alanını etkileyen seçimler önce alınmalıdır.

\- Fiyat ve üretim seçenekleri ayrı bir akışta gösterilebilir.



\---



\## 19. Kullanıcı Paneli UI Dil Kuralları



Kullanıcı panelinde kişisel sahiplik duygusu veren terimler kullanılmalıdır.



\### Kullanılacak Terimler



```text

Tasarım Projelerim

Kayıtlı Şablonlarım

Ürün Listelerim

Marka Varlıklarım

Baskı Siparişlerim

Dosyalarım

Ekip ve Paylaşım

Fatura ve Ödeme

Hesap Ayarları

Yardım Merkezi

```



\### Kural



\- “Benim” veya “-lerim” kullanımı kullanıcı sahipliğini güçlendirir.

\- Gereksiz teknik editör terimleri kullanıcı paneline taşınmamalıdır.

\- Kullanıcı panelinde “Grid”, “Slot”, “Preflight” gibi terimler kullanılmamalıdır.



\---



\## 20. Yönetici Paneli UI Dil Kuralları



Yönetici panelinde operasyonel ve daha teknik terimler kullanılabilir.



\### Kullanılacak Terimler



```text

Kontrol Paneli

Kullanıcılar

Müşteriler

Siparişler

Üretim

Baskı İşleri

İş Emri

Üretim Fişi

Baskı Kontrol Raporu

Fiyatlandırma

Şablon Yönetimi

Fatura Yönetimi

Kargo Yönetimi

Destek Talepleri

Raporlar

Sistem Ayarları

```



\### Kural



\- Yönetici panelinde teknik doğruluk daha önemlidir.

\- İngilizce terimler yerine Türkçe operasyon terimleri kullanılmalıdır.

\- “Job Ticket” yerine “İş Emri” kullanılmalıdır.

\- “Preflight Report” yerine “Baskı Kontrol Raporu” kullanılmalıdır.



\---



\## 21. Cline İçin UI Yazım Talimatı



Cline veya başka bir AI kod asistanı UI metni üretirken şu kurallara uymalıdır:



1\. Kullanıcıya görünen metinlerde sade Türkçe kullan.

2\. İngilizce teknik terimleri doğrudan UI’da kullanma.

3\. `docs/terminoloji/` dosyalarındaki \*\*Önerilen Terim\*\* alanını esas al.

4\. Aynı kavram için farklı adlar üretme.

5\. Butonları kısa ve eylem odaklı yaz.

6\. Uyarıları kısa ve karar verdirici yaz.

7\. Hata mesajlarında kullanıcıyı suçlama.

8\. Boş durumlarda kullanıcıya sonraki adımı göster.

9\. Teknik terimleri gerektiğinde kısa açıklamayla destekle.

10\. Emin olmadığın terim için yeni isim üretme; terminoloji dosyalarına bak.



\---



\## 22. Örnek UI Metinleri



\### Dosya Yükleme



```text

Excel dosyanızı yükleyin

Ürünleri otomatik yerleştirmek için Excel dosyanızı seçin.

```



\### Ürün Yerleştirme



```text

112 ürün yerleştirildi.

6 ürün Bekleme Alanı’na eklendi.

```



\### Eksik Görsel



```text

Görsel yok.

Bu ürün için yeni bir görsel yükleyebilirsiniz.

```



\### Baskı Kontrolü



```text

Baskı kontrolü tamamlandı.

Tasarım baskıya uygun görünüyor.

```



\### Baskı Kontrol Uyarısı



```text

Bazı görseller düşük çözünürlüklü.

Net baskı için daha kaliteli görseller yükleyin.

```



\### Sipariş



```text

Tasarımınız hazır.

Baskı siparişini tamamlayabilirsiniz.

```



\---



\## 23. Kısa Özet



Presserdiado UI metinleri şu ilkeye göre yazılmalıdır:



> Kısa söyle, doğru terimi kullan, kullanıcıyı sonraki adıma götür.



Bu nedenle:



\- İngilizce teknik terimlerden kaçınılır.

\- Terminoloji dosyalarındaki önerilen terimler kullanılır.

\- Butonlar kısa yazılır.

\- Uyarılar net yazılır.

\- Hata mesajları çözüm önerir.

\- Boş durumlar kullanıcıyı yönlendirir.

\- Kullanıcıya görünen dil sade ve güven verici olur.

