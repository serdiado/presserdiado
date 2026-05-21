\# Presserdiado Terminoloji Kullanım Kuralları



Bu dosya, Presserdiado projesinde kullanıcı arayüzü, dokümantasyon, tasarım stüdyosu, web-to-print akışı ve yönetim panellerinde kullanılacak terimlerin nasıl seçileceğini tanımlar.



Amaç; proje genelinde tutarlı, sade, Türkçe ve kullanıcı dostu bir dil kullanmaktır.



\---



\## 1. Temel Kural



Kullanıcıya görünen arayüz metinlerinde her zaman terminoloji dosyalarındaki \*\*Önerilen Terim\*\* alanı esas alınır.



İngilizce veya teknik karşılıklar yalnızca şu durumlarda kullanılabilir:



\- Geliştirici dokümantasyonu

\- Kod içi yorumlar

\- Teknik açıklamalar

\- Sistem mimarisi belgeleri

\- API veya veri modeli açıklamaları



Kullanıcı arayüzünde İngilizce teknik terimler doğrudan kullanılmaz.



\---



\## 2. Öncelik Sırası



Bir terim seçilirken aşağıdaki sıra izlenir:



1\. \*\*Önerilen Terim\*\*

2\. \*\*Kullanım Alanı\*\*

3\. \*\*Açıklama\*\*

4\. \*\*Kullanılmaması Gereken Terimler\*\*

5\. \*\*İngilizce / Teknik Karşılık\*\*



Cline, Cursor, VS Code AI veya başka bir kod asistanı UI metni üretirken öncelikle \*\*Önerilen Terim\*\* alanını kullanmalıdır.



\---



\## 3. Kullanıcı Arayüzü Kuralı



Kullanıcı arayüzünde şu tip İngilizce terimler kullanılmamalıdır:



\- Canvas

\- Slot

\- Grid

\- Preflight

\- Export

\- Import

\- Layer

\- Sidebar

\- Dashboard

\- Template

\- Product Pool

\- Temporary Pool

\- Contextual Bar

\- Brand Kit

\- Workspace

\- Frame

\- Asset

\- Draft

\- File Browser

\- Job Ticket

\- Workflow



Bu terimler yerine ilgili terminoloji dosyalarında belirtilen Türkçe karşılıklar kullanılmalıdır.



\---



\## 4. Örnek Terim Dönüşümleri



| Kullanılmayacak Terim | Kullanılacak Terim | Not |

|---|---|---|

| Canvas | Çalışma Yüzeyi | Tasarımın düzenlendiği ana alan |

| Slot | Hücre / Alan | Bağlama göre seçilir |

| Grid | Izgara / Düzen | Teknik bağlamda Izgara, kullanıcı akışında Düzen |

| Preflight | Baskı Kontrolü | Kullanıcıya görünen ana terim |

| Export | İndir / Dışa Aktar | Bağlama göre seçilir |

| Import | İçe Aktar / Yükle | Dosya bağlamında Yükle tercih edilir |

| Layer | Katman | Teknik karşılık korunabilir |

| Sidebar | Sağ Panel | Kullanıcı arayüzü için |

| Dashboard | Ana Sayfa / Kontrol Paneli | Bağlama göre seçilir |

| Template | Şablon | Genel kullanım |

| Product Pool | Ürün Havuzu | Ürün listesi alanı |

| Temporary Pool | Bekleme Alanı | Geçici ürün bekleme alanı |

| Contextual Bar | Hızlı Araç Çubuğu | Seçime göre değişen araç çubuğu |

| Brand Kit | Marka Varlıkları / Marka Kiti | Kullanıcı panelinde Marka Varlıkları tercih edilir |

| Workspace | Çalışma Alanı | Kullanıcı paneli veya editör bağlamına göre |

| Frame | Çerçeve / Alan | Serbest tasarım bağlamında |

| Asset | Varlık | Görsel, logo, ikon, dosya gibi kaynaklar |

| Draft | Taslak | Kaydedilmiş ama tamamlanmamış çalışma |

| File Browser | Dosya Tarayıcı | Teknik dokümanda kullanılabilir |

| Job Ticket | İş Emri / Üretim Fişi | Yönetici paneli ve üretim akışı için |

| Workflow | İş Akışı | Operasyon ve üretim süreçleri için |



\---



\## 5. Teknik Terimlerin Kullanımı



Bazı teknik terimler tamamen kaldırılmaz; ancak kullanıcıya açıklamalı gösterilir.



Örnek:



\- Kullanıcı arayüzü: \*\*Baskı Kontrolü\*\*

\- Teknik açıklama: \*\*Baskı Kontrolü (Preflight)\*\*



\- Kullanıcı arayüzü: \*\*Taşma Payı\*\*

\- Teknik açıklama: \*\*Taşma Payı (Bleed)\*\*



\- Kullanıcı arayüzü: \*\*Güvenli Alan\*\*

\- Teknik açıklama: \*\*Güvenli Alan (Safe Area)\*\*



\- Kullanıcı arayüzü: \*\*Kesim Çizgisi\*\*

\- Teknik açıklama: \*\*Kesim Çizgisi (Trim Line)\*\*



Bu kullanım yalnızca açıklama, yardım metni veya geliştirici dokümantasyonunda tercih edilmelidir.



\---



\## 6. Dosya Yapısı



Terminoloji dosyaları aşağıdaki klasörde tutulur:



```text

docs/terminoloji/

```



Önerilen dosya yapısı:



```text

00\_Terminoloji\_Kullanim\_Kurallari.md

01\_Web-to-Print\_Terminoloji.md

02\_Matbaa\_Terminoloji.md

03\_Tasarim\_Studyosu\_Terminoloji.md

04\_Kullanici\_Paneli\_Terminoloji.md

05\_Yonetici\_Paneli\_Terminoloji.md

06\_Kullanilmamasi\_Gereken\_Terimler.md

07\_UI\_Yazim\_Kurallari.md

```



\---



\## 7. Standart Tablo Yapısı



Terminoloji dosyalarında mümkün olduğunca aşağıdaki tablo yapısı kullanılmalıdır:



| Kategori | Önerilen Terim | İngilizce / Teknik Karşılık | Kullanım Alanı | Kullanıcıya Gösterilsin mi? | Açıklama | Kullanılmaması Gereken Terimler | Not |

|---|---|---|---|---|---|---|---|



\---



\## 8. Kolon Açıklamaları



\### Kategori



Terimin ait olduğu ana bölümü belirtir.



Örnek:



\- Tasarım Stüdyosu

\- Matbaa

\- Web-to-Print

\- Kullanıcı Paneli

\- Yönetici Paneli

\- Baskı Kontrolü

\- Ürün Yönetimi

\- Sipariş Yönetimi



\### Önerilen Terim



Kullanıcı arayüzünde kullanılması gereken ana terimdir.



Bu alan, UI metinleri için birincil kaynaktır.



\### İngilizce / Teknik Karşılık



Terimin teknik, İngilizce veya geliştirici tarafındaki karşılığıdır.



Bu alan kullanıcı arayüzünde doğrudan kullanılmaz.



\### Kullanım Alanı



Terimin hangi ekranda, panelde, bileşende veya akışta kullanılacağını belirtir.



Örnek:



\- Sağ Panel

\- Tasarım Stüdyosu

\- Kullanıcı Paneli

\- Yönetici Paneli

\- Baskı Kontrol Ekranı

\- Sipariş Akışı

\- Üretim Takibi



\### Kullanıcıya Gösterilsin mi?



Bu terimin kullanıcı arayüzünde doğrudan gösterilip gösterilmeyeceğini belirtir.



Kullanılabilecek değerler:



\- Evet

\- Hayır

\- Açıklamada kullanılabilir

\- Teknik dokümanda kullanılabilir



\### Açıklama



Terimin ne anlama geldiğini sade şekilde açıklar.



Açıklama mümkün olduğunca kısa, net ve kullanıcı dostu olmalıdır.



\### Kullanılmaması Gereken Terimler



Aynı anlamda kullanılmaması gereken alternatifleri belirtir.



Özellikle İngilizce, teknik veya kafa karıştırıcı terimler bu kolonda yer alır.



\### Not



Geliştirici, tasarımcı veya ürün ekibi için ek kullanım notudur.



Bu alan UI’da gösterilmez.



\---



\## 9. UI Metni Yazım Kuralı



Kullanıcıya görünen buton, menü, başlık, uyarı, açıklama ve yardım metinlerinde:



\- Kısa cümleler kullanılmalı

\- Teknik jargon azaltılmalı

\- Aynı kavram için farklı terimler kullanılmamalı

\- İngilizce teknik terimler doğrudan gösterilmemeli

\- Kullanıcıyı korkutan uzun hata metinlerinden kaçınılmalı

\- Kritik işlemlerde kısa ve net uyarı verilmelidir

\- Gereksiz açıklama metinleri arayüzü kalabalıklaştırmamalıdır

\- Kullanıcıya ne olacağı açıkça söylenmelidir

\- “Tamam”, “Devam Et”, “İptal”, “Onayla” gibi eylemler tutarlı kullanılmalıdır



\---



\## 10. Buton Metni Kuralı



Buton metinleri kısa, eylem odaklı ve anlaşılır olmalıdır.



Doğru örnekler:



\- Kaydet

\- Devam Et

\- İptal

\- Onayla

\- Dosya Yükle

\- Excel Yükle

\- PDF İndir

\- Siparişi Tamamla

\- Baskı Kontrolü Yap

\- Tasarımı Kaydet

\- Ürünleri Temizle

\- Tümünü Sıfırla



Kaçınılması gereken örnekler:



\- Proceed

\- Submit

\- Upload File

\- Export PDF

\- Preflight Check

\- Reset All Design Settings Permanently

\- Confirm Operation



\---



\## 11. Menü ve Panel Başlığı Kuralı



Menü ve panel başlıklarında kısa ve tanınabilir terimler kullanılmalıdır.



Örnek ana menüler:



\- Ürünler

\- Tasarım

\- Hücre

\- Modüller

\- Şablon

\- Izgara

\- Arka Plan

\- Ürün Havuzu

\- Baskı Kontrolü

\- Siparişlerim

\- Tasarım Projelerim

\- Marka Varlıklarım



Aynı kavram için birden fazla ad kullanılmamalıdır.



Örnek:



\- Bir yerde “Ürün Havuzu”, başka yerde “Product Pool” veya “Ürün Listesi Havuzu” kullanılmamalıdır.

\- Bir yerde “Çalışma Yüzeyi”, başka yerde “Canvas” veya “Tuval” kullanılmamalıdır.



\---



\## 12. Uyarı Metni Kuralı



Uyarı metinleri kısa, net ve karar vermeyi kolaylaştıran yapıda olmalıdır.



Uyarı metni şu yapıyı izlemelidir:



1\. Ne olacak?

2\. Ne kaybolacak veya değişecek?

3\. Kullanıcı ne yapmalı?



Örnek:



```text

Tasarım sıfırlanacak.

Tüm ürünler ve düzen ayarları temizlenecek.

Devam etmek istiyor musunuz?

```



Kısa uyarı örneği:



```text

Ürünler temizlenecek.

Tasarım düzeni korunacak.

```



Uzun, karmaşık ve teknik uyarılardan kaçınılmalıdır.



\---



\## 13. Teknik Terim Açıklama Kuralı



Kullanıcıya teknik bir terim gösterilecekse yanında kısa açıklama verilmelidir.



Örnek:



```text

Taşma Payı

Kesimden sonra beyaz kenar kalmaması için tasarımın dışa doğru uzatılan alanı.

```



```text

Güvenli Alan

Yazı, logo ve önemli görsellerin kesilmemesi için içeride kalması gereken alan.

```



```text

Baskı Kontrolü

Tasarımın baskıya uygun olup olmadığını kontrol eder.

```



\---



\## 14. Presserdiado Ana Dil İlkesi



Presserdiado dili şu özellikleri taşımalıdır:



\- Sade

\- Tutarlı

\- Türkçe

\- Kullanıcı dostu

\- Teknik olarak doğru

\- Matbaa gerçeklerine uyumlu

\- Tasarım bilmeyen kullanıcıyı yormayan

\- Profesyonel ama karmaşık olmayan



Ana ilke:



> Teknik terimi sistem bilsin, kullanıcı sade karşılığını görsün.



\---



\## 15. Cline / AI Kod Asistanı İçin Kural



Bu projede UI metni, menü adı, buton adı, panel başlığı, hata mesajı veya açıklama yazarken:



1\. `docs/terminoloji/` klasöründeki terminoloji dosyalarını esas al.

2\. Her zaman \*\*Önerilen Terim\*\* kolonundaki ifadeyi kullan.

3\. \*\*Kullanılmaması Gereken Terimler\*\* kolonundaki ifadeleri kullanıcı arayüzünde kullanma.

4\. İngilizce teknik terimleri yalnızca geliştirici açıklamasında kullan.

5\. Aynı kavram için birden fazla isim üretme.

6\. Emin olmadığın terimi yeni üretme; mevcut terminoloji dosyalarından seç.

7\. Kullanıcı arayüzünde sade Türkçe kullan.

8\. Menü ve panel adlarını proje genelinde tutarlı tut.

9\. Buton metinlerini kısa ve eylem odaklı yaz.

10\. Uyarı metinlerini kısa, net ve kullanıcı kararını kolaylaştıracak şekilde yaz.



\---



\## 16. Özel Presserdiado Terim Tercihleri



Aşağıdaki tercihler proje genelinde esas alınmalıdır:



| Kavram | Kullanılacak Terim | Not |

|---|---|---|

| Canvas | Çalışma Yüzeyi | Editörün orta tasarım alanı |

| Slot | Hücre | Ürün yerleşim alanı |

| Slot / Free Area | Alan | Serbest tasarım bağlamında kullanılabilir |

| Grid | Izgara | Teknik düzen yapısı |

| Layout | Düzen | Kullanıcıya daha sade gösterilecek bağlamlarda |

| Product Pool | Ürün Havuzu | Ürünlerin listelendiği alan |

| Temporary Pool | Bekleme Alanı | Yerleştirilemeyen veya geçici ürünler |

| Preflight | Baskı Kontrolü | PDF/sipariş öncesi kontrol |

| Export | İndir | Son kullanıcı eylemi için |

| Export | Dışa Aktar | Teknik veya gelişmiş kullanım için |

| Import | Yükle | Dosya yükleme bağlamında |

| Import | İçe Aktar | Veri/aktarımı bağlamında |

| Sidebar | Sağ Panel | Tasarım stüdyosu sağ kontrol alanı |

| Contextual Bar | Hızlı Araç Çubuğu | Seçime göre değişen araç çubuğu |

| Template | Şablon | Genel kullanım |

| Brand Kit | Marka Varlıkları | Kullanıcı panelinde tercih edilir |

| Brand Kit | Marka Kiti | Teknik/kurumsal bağlamda kullanılabilir |

| Dashboard | Ana Sayfa | Kullanıcı paneli için |

| Dashboard | Kontrol Paneli | Yönetici paneli için |

| Job Ticket | İş Emri | Yönetici/üretim paneli için |

| Workflow | İş Akışı | Operasyonel süreçler için |

| Asset | Varlık | Marka, medya ve dosya kaynakları için |



\---



\## 17. Kullanıcı Tipine Göre Dil Kuralı



\### Son Kullanıcı



Son kullanıcıya sade ve yönlendirici dil kullanılmalıdır.



Örnek:



\- Tasarımını kaydet

\- Excel dosyanı yükle

\- Ürünleri yerleştir

\- Baskı kontrolü yap

\- Siparişi tamamla



\### Matbaa Operatörü



Matbaa operatörüne daha teknik ama Türkçe terimler kullanılabilir.



Örnek:



\- İş Emri

\- Üretim Fişi

\- Baskı Kontrol Raporu

\- Forma Montajı

\- Kesim Çizgisi

\- Taşma Payı



\### Geliştirici



Geliştirici dokümantasyonunda teknik karşılıklar parantez içinde kullanılabilir.



Örnek:



\- Çalışma Yüzeyi (Canvas)

\- Hücre (Slot)

\- Baskı Kontrolü (Preflight)

\- Katman (Layer)



\---



\## 18. Dosya Adlandırma Kuralı



Terminoloji dosyaları Türkçe karakter kullanılmadan, okunabilir ve sıralı adlandırılmalıdır.



Doğru örnek:



```text

03\_Tasarim\_Studyosu\_Terminoloji.md

```



Kaçınılması gereken örnek:



```text

tasarım terimleri son son.md

```



\---



\## 19. Yeni Terim Ekleme Kuralı



Projeye yeni bir terim eklenecekse önce ilgili terminoloji dosyasına eklenmelidir.



Yeni terim eklenirken şu bilgiler doldurulmalıdır:



\- Kategori

\- Önerilen Terim

\- İngilizce / Teknik Karşılık

\- Kullanım Alanı

\- Kullanıcıya Gösterilsin mi?

\- Açıklama

\- Kullanılmaması Gereken Terimler

\- Not



Cline veya geliştirici, terminoloji dosyasında bulunmayan yeni bir UI terimini doğrudan üretmemelidir.



\---



\## 20. Kısa Özet



Presserdiado’da kullanıcıya görünen dilin ana ilkesi:



> Teknik terimi sistem bilsin, kullanıcı sade karşılığını görsün.



Bu nedenle:



\- UI’da İngilizce teknik terim kullanılmaz.

\- Her zaman “Önerilen Terim” esas alınır.

\- Aynı kavram için tek isim kullanılır.

\- Kullanıcıya kısa, sade ve güven veren metinler gösterilir.

\- Matbaa doğruluğu korunur ama kullanıcı teknik detayla boğulmaz.

