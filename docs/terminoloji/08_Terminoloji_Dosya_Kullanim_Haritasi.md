# Presserdiado Terminoloji Dosya Kullanım Haritası

Bu dosya, Presserdiado projesinde terminoloji dosyalarının ne zaman ve nasıl kullanılacağını tanımlar.

Amaç; her görevde tüm terminoloji dosyalarını okumak yerine, yalnızca ilgili dosyaları referans alarak doğru, tutarlı ve hafif bir çalışma akışı oluşturmaktır.

---

## Ana Kural

Her görevde tüm terminoloji dosyaları okunmaz.

Önce çalışılan alan belirlenir, sonra yalnızca ilgili terminoloji dosyaları referans alınır.

```text
Doğru yöntem:
Önce çalışma alanını belirle.
Sonra bu dosyadaki kullanım haritasına göre ilgili terminoloji dosyalarını seç.
Sadece gerekli dosyaları oku.
Kullanıcıya görünen metinlerde önerilen Türkçe terimleri kullan.
Kullanılmaması gereken İngilizce / teknik terimleri arayüzde kullanma.
```

---

## Her Görevde Uygulanacak Genel Talimat

Bir UI, menü, buton, açıklama, popup, tooltip, form alanı veya ekran metni düzenlenirken şu kurallar geçerlidir:

```text
1. Kullanıcıya görünen metinlerde sade Türkçe kullanılmalıdır.
2. Terminoloji dosyalarındaki “Önerilen Terim” alanı esas alınmalıdır.
3. İngilizce teknik terimler kullanıcı arayüzünde kullanılmamalıdır.
4. Teknik terimler sadece kod, veri modeli, API, log veya geliştirici dokümantasyonunda kullanılabilir.
5. Aynı kavram için birden fazla farklı terim kullanılmamalıdır.
6. Menü adları, buton metinleri, uyarılar ve açıklamalar tutarlı olmalıdır.
7. Mevcut işlevler, veri yapısı ve kullanıcı akışı bozulmamalıdır.
8. Emin olunmayan durumda 07_Kullanilmamasi_Gereken_Terimler.md dosyasıyla kontrol yapılmalıdır.
```

---

## Terminoloji Dosyaları

| Dosya | Kullanım Amacı |
|---|---|
| `00_Terminoloji_Kullanim_Kurallari.md` | Terminoloji kullanımının genel kurallarını belirler. |
| `01_UI_Yazim_Kurallari.md` | UI dili, buton metinleri, uyarılar, popup metinleri ve yazım standardını belirler. |
| `02_Web-to-Print_Terminoloji.md` | Web-to-print sitesi, ürün seçimi, sipariş, teklif ve online baskı akışlarını kapsar. |
| `03_Matbaa_Terminoloji.md` | Baskı, kesim, taşma payı, güvenli alan, kırım, kağıt, üretim ve matbaa terimlerini kapsar. |
| `04_Tasarim_Studyosu_Terminoloji.md` | Tasarım stüdyosu, çalışma yüzeyi, sağ panel, hücre, modül, ürün havuzu ve editör terimlerini kapsar. |
| `05_Kullanici_Paneli_Terminoloji.md` | Kullanıcı paneli, projeler, dosyalar, marka varlıkları, siparişler ve hesap ayarlarını kapsar. |
| `06_Yonetici_Paneli_Terminoloji.md` | Yönetici paneli, kullanıcı, sipariş, üretim, fiyatlandırma, destek, rapor ve sistem terimlerini kapsar. |
| `07_Kullanilmamasi_Gereken_Terimler.md` | Kullanıcı arayüzünde kullanılmaması gereken İngilizce veya teknik terimleri ve doğru karşılıklarını kapsar. |
| `08_Terminoloji_Dosya_Kullanim_Haritasi.md` | Hangi görevde hangi terminoloji dosyasının kullanılacağını belirler. |

---

# Göreve Göre Dosya Kullanım Haritası

---

## 1. Genel UI Metni / Buton / Uyarı / Popup / Tooltip Çalışmaları

Aşağıdaki işler yapılırken bu dosyalar referans alınmalıdır:

```text
Buton metni yazma
Popup metni yazma
Uyarı metni yazma
Tooltip metni yazma
Form alanı adı yazma
Boş durum mesajı yazma
Hata mesajı yazma
Başarılı işlem mesajı yazma
Onay popup metni yazma
Kullanıcıya görünen kısa açıklama metni yazma
```

Kullanılacak dosyalar:

```text
00_Terminoloji_Kullanim_Kurallari.md
01_UI_Yazim_Kurallari.md
07_Kullanilmamasi_Gereken_Terimler.md
```

Uygulama kuralı:

```text
UI metinleri kısa, anlaşılır ve eylem odaklı olmalıdır.
Teknik terimler kullanılmamalıdır.
Butonlar açık eylem bildirmelidir.
Uyarılar kısa tutulmalıdır.
```

---

## 2. Web-to-Print Sitesi / Online Baskı Akışı

Aşağıdaki alanlarda çalışılırken bu dosyalar referans alınmalıdır:

```text
Web sitesi ana sayfası
Ürün listeleme
Ürün detay sayfası
Ürün seçenekleri
Online baskı akışı
Sepet
Sipariş oluşturma
Teklif alma
Fiyat hesaplama
Ödeme akışı
Kargo / teslimat seçimi
Baskı ürünü seçimi
Hazır şablonla başlama
Dosya yükleyerek sipariş verme
```

Kullanılacak dosyalar:

```text
00_Terminoloji_Kullanim_Kurallari.md
01_UI_Yazim_Kurallari.md
02_Web-to-Print_Terminoloji.md
03_Matbaa_Terminoloji.md
07_Kullanilmamasi_Gereken_Terimler.md
```

Uygulama kuralı:

```text
Kullanıcıya teknik matbaa diliyle yüklenme.
Ürün seçimleri sade olmalı.
Matbaa terimleri gerekli olduğunda kısa açıklama ile kullanılmalı.
Checkout yerine Siparişi Tamamla kullanılmalı.
Shipping yerine Kargo veya Teslimat kullanılmalı.
Billing yerine Fatura ve Ödeme kullanılmalı.
```

---

## 3. Matbaa / Baskı / Üretim Terimleri

Aşağıdaki konularda çalışılırken bu dosyalar referans alınmalıdır:

```text
Taşma payı
Güvenli alan
Kesim çizgisi
Kırım çizgisi
Forma
Montaj
Kağıt türü
Kağıt gramajı
Selefon
Lak
Varak
Gofre
Kesim
Kırım
Baskı öncesi
Baskı sonrası
Baskı kontrolü
Baskıya hazır PDF
Üretim PDF’i
Matbaa iş akışı
```

Kullanılacak dosyalar:

```text
00_Terminoloji_Kullanim_Kurallari.md
01_UI_Yazim_Kurallari.md
03_Matbaa_Terminoloji.md
07_Kullanilmamasi_Gereken_Terimler.md
```

Uygulama kuralı:

```text
Matbaa terimleri doğru kullanılmalı.
Son kullanıcıya karmaşık teknik terimler açıklamasız gösterilmemeli.
Bleed yerine Taşma Payı kullanılmalı.
Safe Area yerine Güvenli Alan kullanılmalı.
Trim Line yerine Kesim Çizgisi kullanılmalı.
Preflight yerine Baskı Kontrolü kullanılmalı.
Job Ticket yerine İş Emri kullanılmalı.
```

---

## 4. Tasarım Stüdyosu / Tasarım Editörü / Çalışma Yüzeyi

Aşağıdaki alanlarda çalışılırken bu dosyalar referans alınmalıdır:

```text
Tasarım stüdyosu
Çalışma yüzeyi
Kanvas alanı
Sağ panel
Sol panel
Ürünler sekmesi
Tasarım sekmesi
Hücre sekmesi
Modüller sekmesi
Şablon ayarları
Izgara ayarları
Arka plan ayarları
Hücre ayarları
Ürün havuzu
Bekleme alanı
Fiyat kutusu
Modül ekleme
Katmanlar
Hızlı araç çubuğu
Baskı önizleme
PDF indirme
```

Kullanılacak dosyalar:

```text
00_Terminoloji_Kullanim_Kurallari.md
01_UI_Yazim_Kurallari.md
03_Matbaa_Terminoloji.md
04_Tasarim_Studyosu_Terminoloji.md
07_Kullanilmamasi_Gereken_Terimler.md
```

Uygulama kuralı:

```text
Canvas yerine Çalışma Yüzeyi kullanılmalı.
Slot yerine Hücre kullanılmalı.
Grid yerine Izgara kullanılmalı.
Sidebar yerine Sağ Panel kullanılmalı.
Product Pool yerine Ürün Havuzu kullanılmalı.
Temporary Pool yerine Bekleme Alanı kullanılmalı.
Preflight yerine Baskı Kontrolü kullanılmalı.
Export yerine kullanıcı tarafında İndir kullanılmalı.
```

---

## 5. Tasarım Stüdyosu Sağ Panel Menüleri

Sağ paneldeki ana sekmeler veya akordiyon menüler üzerinde çalışılırken bu bölüm kullanılmalıdır.

Geçerli ana sekmeler:

```text
Ürünler
Tasarım
Hücre
Modüller
```

Kullanılacak dosyalar:

```text
00_Terminoloji_Kullanim_Kurallari.md
01_UI_Yazim_Kurallari.md
04_Tasarim_Studyosu_Terminoloji.md
07_Kullanilmamasi_Gereken_Terimler.md
```

Gerekirse ek olarak:

```text
03_Matbaa_Terminoloji.md
```

Uygulama kuralı:

```text
Sağ panel ana sekme adları değiştirilmemelidir.
Ürünler, Tasarım, Hücre, Modüller ana yapısı korunmalıdır.
Seçim adında ayrı bir ana sekme oluşturulmamalıdır.
Kullanıcıyı teknik terimlerle yormayan kısa menü adları tercih edilmelidir.
```

---

## 6. Tasarım Stüdyosu > Tasarım Sekmesi

Aşağıdaki menüler üzerinde çalışılırken bu bölüm kullanılmalıdır:

```text
Şablon
Izgara
Arka Plan
```

Kullanılacak dosyalar:

```text
00_Terminoloji_Kullanim_Kurallari.md
01_UI_Yazim_Kurallari.md
04_Tasarim_Studyosu_Terminoloji.md
03_Matbaa_Terminoloji.md
07_Kullanilmamasi_Gereken_Terimler.md
```

Uygulama kuralı:

```text
Tema / Genel Stil menüsü kullanılmamalıdır.
Baskı Alanları menüsü kullanılmamalıdır.
Sayfa / Forma adında ayrı bir menü oluşturulmamalıdır.
Şablon, Izgara ve Arka Plan menüleri sade tutulmalıdır.
```

---

## 7. Tasarım Stüdyosu > Hücre Sekmesi

Aşağıdaki işler yapılırken bu bölüm kullanılmalıdır:

```text
Hücre ayarları
Genel hücre ayarları
Özel hücre ayarları
Hücre boşluğu
Hücre aralığı
Ürün alanı
Ürün görseli
Ürün adı
Fiyat kutusu
Fiyat zemini
Fiyat rengi
Rozet
Kampanya etiketi
Hücre içeriği temizleme
Hücreleri birleştirme
Hücreleri ayırma
Ürün değiştirme
```

Kullanılacak dosyalar:

```text
00_Terminoloji_Kullanim_Kurallari.md
01_UI_Yazim_Kurallari.md
04_Tasarim_Studyosu_Terminoloji.md
07_Kullanilmamasi_Gereken_Terimler.md
```

Gerekirse ek olarak:

```text
03_Matbaa_Terminoloji.md
```

Uygulama kuralı:

```text
Slot kelimesi kullanıcı arayüzünde kullanılmamalıdır.
Seçili slot yerine Seçili Hücre kullanılmalıdır.
Product Cell yerine Ürün Hücresi kullanılmalıdır.
Global Cell yerine Genel Hücre kullanılmalıdır.
Custom Cell yerine Özel Hücre kullanılmalıdır.
Fiyat kutusu, fiyat zemini ve rozet terimleri tutarlı kullanılmalıdır.
```

---

## 8. Tasarım Stüdyosu > Modüller Sekmesi

Aşağıdaki işler yapılırken bu bölüm kullanılmalıdır:

```text
Modül listesi
Hazır modül
Banner modülü
Footer modülü
Alt bilgi modülü
Pizza fiyat listesi
Fiyat listesi modülü
Tablo modülü
Kampanya modülü
Modül ayarları
Modül kaydetme
Modül düzenleme
Modül sürükle-bırak
```

Kullanılacak dosyalar:

```text
00_Terminoloji_Kullanim_Kurallari.md
01_UI_Yazim_Kurallari.md
04_Tasarim_Studyosu_Terminoloji.md
07_Kullanilmamasi_Gereken_Terimler.md
```

Uygulama kuralı:

```text
Component yerine Modül kullanılmalıdır.
Footer için bağlama göre Footer Modülü veya Alt Bilgi Modülü kullanılabilir.
Kullanıcıya görünen modül adları sade ve anlaşılır olmalıdır.
```

---

## 9. Tasarım Stüdyosu > Ürünler Sekmesi

Aşağıdaki işler yapılırken bu bölüm kullanılmalıdır:

```text
Ürün havuzu
Excel yükleme
Excel yenileme
Ürün listesi
Ürün arama
Ürün filtreleme
Ürün sürükle-bırak
Ürün yerleştirme
Otomatik dizilim
Yerleştirilemeyen ürünler
Bekleme alanı
Eksik görsel
Eksik fiyat
Eksik ürün adı
İçe aktarım raporu
Raporu görüntüle
Temizle
Sıfırla
```

Kullanılacak dosyalar:

```text
00_Terminoloji_Kullanim_Kurallari.md
01_UI_Yazim_Kurallari.md
04_Tasarim_Studyosu_Terminoloji.md
07_Kullanilmamasi_Gereken_Terimler.md
```

Gerekirse ek olarak:

```text
02_Web-to-Print_Terminoloji.md
```

Uygulama kuralı:

```text
Product Pool yerine Ürün Havuzu kullanılmalıdır.
Temporary Pool yerine Bekleme Alanı kullanılmalıdır.
Import Report yerine İçe Aktarım Raporu kullanılmalıdır.
Temizle ve Sıfırla anlamları karıştırılmamalıdır.
Temizle: ürünleri ve verileri kaldırır, tasarım düzenini korur.
Sıfırla: tüm tasarımı varsayılana döndürür.
```

---

## 10. Kullanıcı Paneli

Aşağıdaki alanlarda çalışılırken bu dosyalar referans alınmalıdır:

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
Kullanıcı bildirimleri
Kullanıcı profil ayarları
```

Kullanılacak dosyalar:

```text
00_Terminoloji_Kullanim_Kurallari.md
01_UI_Yazim_Kurallari.md
05_Kullanici_Paneli_Terminoloji.md
07_Kullanilmamasi_Gereken_Terimler.md
```

Gerekirse ek olarak:

```text
02_Web-to-Print_Terminoloji.md
03_Matbaa_Terminoloji.md
```

Uygulama kuralı:

```text
Dashboard yerine Ana Sayfa kullanılmalıdır.
Projects yerine Tasarım Projelerim kullanılmalıdır.
Assets yerine bağlama göre Dosyalarım veya Marka Varlıklarım kullanılmalıdır.
Brand Kit yerine Marka Varlıklarım kullanılmalıdır.
Billing yerine Fatura ve Ödeme kullanılmalıdır.
Team yerine Ekip kullanılmalıdır.
```

---

## 11. Kullanıcı Paneli > Sipariş / Fatura / Kargo Alanları

Aşağıdaki işler yapılırken bu bölüm kullanılmalıdır:

```text
Baskı Siparişlerim
Sipariş detayı
Sipariş durumu
Tasarım onayı
Baskı kontrolü
Fatura bilgileri
Ödeme bilgileri
Kargo takip
Teslimat bilgileri
Tekrar sipariş ver
Aynı tasarımla sipariş ver
```

Kullanılacak dosyalar:

```text
00_Terminoloji_Kullanim_Kurallari.md
01_UI_Yazim_Kurallari.md
02_Web-to-Print_Terminoloji.md
03_Matbaa_Terminoloji.md
05_Kullanici_Paneli_Terminoloji.md
07_Kullanilmamasi_Gereken_Terimler.md
```

Uygulama kuralı:

```text
Kullanıcıya sipariş durumları sade gösterilmelidir.
Preflight yerine Baskı Kontrolü kullanılmalıdır.
Shipping yerine Kargo kullanılmalıdır.
Billing yerine Fatura ve Ödeme kullanılmalıdır.
Reorder yerine Tekrar Sipariş Ver kullanılmalıdır.
```

---

## 12. Yönetici Paneli

Aşağıdaki alanlarda çalışılırken bu dosyalar referans alınmalıdır:

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

Kullanılacak dosyalar:

```text
00_Terminoloji_Kullanim_Kurallari.md
01_UI_Yazim_Kurallari.md
06_Yonetici_Paneli_Terminoloji.md
07_Kullanilmamasi_Gereken_Terimler.md
```

Gerekirse ek olarak:

```text
02_Web-to-Print_Terminoloji.md
03_Matbaa_Terminoloji.md
```

Uygulama kuralı:

```text
Dashboard yerine Kontrol Paneli kullanılmalıdır.
Admin Panel yerine Yönetici Paneli kullanılmalıdır.
Job Ticket yerine İş Emri kullanılmalıdır.
Workflow yerine İş Akışı kullanılmalıdır.
Preflight yerine Baskı Kontrolü kullanılmalıdır.
Billing yerine bağlama göre Fatura, Ödeme veya Muhasebe kullanılmalıdır.
Ticket yerine Destek Talebi kullanılmalıdır.
```

---

## 13. Yönetici Paneli > Üretim / Baskı İşleri

Aşağıdaki işler yapılırken bu bölüm kullanılmalıdır:

```text
Üretim kuyruğu
Baskı kuyruğu
İş emri
Üretim fişi
Baskı öncesi
Baskı kontrolü
Montaj
Prova
Baskı
Baskı sonrası
Kesim
Kırım
Selefon
Lak
Varak
Gofre
Paketleme
Sevkiyat
Makine atama
Operatör atama
Üretim durumu
Fire
Yeniden baskı
```

Kullanılacak dosyalar:

```text
00_Terminoloji_Kullanim_Kurallari.md
01_UI_Yazim_Kurallari.md
03_Matbaa_Terminoloji.md
06_Yonetici_Paneli_Terminoloji.md
07_Kullanilmamasi_Gereken_Terimler.md
```

Uygulama kuralı:

```text
Operasyon ekranlarında teknik doğruluk korunmalıdır.
Ancak ana menü, buton ve durum adlarında Türkçe karşılıklar kullanılmalıdır.
Job Ticket yerine İş Emri kullanılmalıdır.
Prepress yerine Baskı Öncesi kullanılmalıdır.
Postpress / Finishing yerine Baskı Sonrası veya Baskı Sonrası İşlem kullanılmalıdır.
```

---

## 14. Yönetici Paneli > Fiyatlandırma / Teklif

Aşağıdaki işler yapılırken bu bölüm kullanılmalıdır:

```text
Fiyatlandırma
Fiyat kuralları
Fiyat tablosu
Maliyet
Kâr
Kâr marjı
Adet bazlı fiyat
Kademeli fiyat
Teklif oluşturma
Teklifi siparişe çevirme
Müşteri bazlı fiyat
Bayi fiyatı
İskonto
Kampanya
Kupon
Ek ücret
KDV
```

Kullanılacak dosyalar:

```text
00_Terminoloji_Kullanim_Kurallari.md
01_UI_Yazim_Kurallari.md
02_Web-to-Print_Terminoloji.md
06_Yonetici_Paneli_Terminoloji.md
07_Kullanilmamasi_Gereken_Terimler.md
```

Uygulama kuralı:

```text
Pricing yerine Fiyatlandırma kullanılmalıdır.
Quote yerine Teklif kullanılmalıdır.
Cost yerine Maliyet kullanılmalıdır.
Profit Margin yerine Kâr Marjı kullanılmalıdır.
VAT yerine KDV kullanılmalıdır.
```

---

## 15. Yönetici Paneli > Sistem / Entegrasyon / Log

Aşağıdaki işler yapılırken bu bölüm kullanılmalıdır:

```text
Sistem ayarları
Platform ayarları
Entegrasyonlar
API
API anahtarı
Webhook
Ödeme entegrasyonu
Kargo entegrasyonu
Muhasebe entegrasyonu
E-fatura entegrasyonu
Loglar
Hata logları
Denetim kaydı
İş kuyruğu
Arka plan görevleri
Önbellek
Yedekleme
Geri yükleme
Sistem sağlığı
Performans izleme
```

Kullanılacak dosyalar:

```text
00_Terminoloji_Kullanim_Kurallari.md
01_UI_Yazim_Kurallari.md
06_Yonetici_Paneli_Terminoloji.md
07_Kullanilmamasi_Gereken_Terimler.md
```

Uygulama kuralı:

```text
Teknik panel olduğu için API, Webhook, Log gibi bazı terimler korunabilir.
Ancak kullanıcıya görünen ana menü ve açıklamalarda Türkçe karşılıklar tercih edilmelidir.
Audit Log yerine Denetim Kaydı kullanılmalıdır.
Cache yerine Önbellek kullanılmalıdır.
Backup yerine Yedekleme kullanılmalıdır.
```

---

# Cline İçin Standart Kullanım Talimatı

Cline veya benzeri kod asistanları görev yaparken bu dosya şu şekilde kullanılmalıdır:

```text
Önce bu dosyayı oku.
Çalışma alanını belirle.
Bu dosyadaki kullanım haritasına göre ilgili terminoloji dosyalarını seç.
Sadece gerekli terminoloji dosyalarını referans al.
Kullanıcıya görünen metinlerde önerilen Türkçe terimleri kullan.
Kullanılmaması gereken İngilizce / teknik terimleri arayüzde kullanma.
Mevcut işlevleri, veri modelini ve kullanıcı akışını bozma.
```

---

## Cline Komut Şablonu

Cline’a görev verirken şu şablon kullanılabilir:

```text
Terminoloji/08_Terminoloji_Dosya_Kullanim_Haritasi.md dosyasındaki talimatlara göre ilerle.

Çalışma alanı: [buraya ekran / modül / panel adı yaz]
Görev: [buraya yapılacak işi yaz]

Önce çalışma alanını belirle.
Bu dosyadaki kullanım haritasına göre ilgili terminoloji dosyalarını seç.
Kullanıcıya görünen tüm metinlerde önerilen Türkçe terimleri kullan.
Kullanılmaması gereken İngilizce / teknik terimleri arayüzde kullanma.
Mevcut işlevleri, veri yapısını ve kullanıcı akışını bozma.
```

---

## Örnek Cline Komutları

### Örnek 1 — Tasarım Stüdyosu Hücre Sekmesi

```text
Terminoloji/08_Terminoloji_Dosya_Kullanim_Haritasi.md dosyasındaki talimatlara göre ilerle.

Çalışma alanı: Tasarım Stüdyosu > Sağ Panel > Hücre sekmesi
Görev: Hücre sekmesindeki menü başlıklarını, buton metinlerini, açıklama metinlerini ve tooltip metinlerini terminolojiye göre düzenle.

Önce çalışma alanını belirle.
Bu dosyadaki kullanım haritasına göre ilgili terminoloji dosyalarını seç.
Kullanıcıya görünen tüm metinlerde önerilen Türkçe terimleri kullan.
Kullanılmaması gereken İngilizce / teknik terimleri arayüzde kullanma.
Mevcut işlevleri, veri yapısını ve kullanıcı akışını bozma.
```

---

### Örnek 2 — Kullanıcı Paneli

```text
Terminoloji/08_Terminoloji_Dosya_Kullanim_Haritasi.md dosyasındaki talimatlara göre ilerle.

Çalışma alanı: Kullanıcı Paneli > Tasarım Projelerim ekranı
Görev: Bu ekrandaki başlıkları, filtreleri, butonları, boş durum metinlerini ve işlem menülerini terminolojiye göre düzenle.

Önce çalışma alanını belirle.
Bu dosyadaki kullanım haritasına göre ilgili terminoloji dosyalarını seç.
Kullanıcıya görünen tüm metinlerde önerilen Türkçe terimleri kullan.
Kullanılmaması gereken İngilizce / teknik terimleri arayüzde kullanma.
Mevcut işlevleri, veri yapısını ve kullanıcı akışını bozma.
```

---

### Örnek 3 — Yönetici Paneli

```text
Terminoloji/08_Terminoloji_Dosya_Kullanim_Haritasi.md dosyasındaki talimatlara göre ilerle.

Çalışma alanı: Yönetici Paneli > Siparişler > Sipariş Detayı ekranı
Görev: Sipariş durumu, üretim durumu, müşteri bilgileri, dosya kontrolü ve işlem butonlarında kullanılan metinleri terminolojiye göre düzenle.

Önce çalışma alanını belirle.
Bu dosyadaki kullanım haritasına göre ilgili terminoloji dosyalarını seç.
Kullanıcıya görünen tüm metinlerde önerilen Türkçe terimleri kullan.
Kullanılmaması gereken İngilizce / teknik terimleri arayüzde kullanma.
Mevcut işlevleri, veri yapısını ve kullanıcı akışını bozma.
```

---

### Örnek 4 — Web-to-Print Ürün Sayfası

```text
Terminoloji/08_Terminoloji_Dosya_Kullanim_Haritasi.md dosyasındaki talimatlara göre ilerle.

Çalışma alanı: Web-to-Print Sitesi > Ürün Detay Sayfası
Görev: Ürün seçenekleri, fiyat hesaplama, adet seçimi, baskı özellikleri, teslimat ve sipariş butonlarındaki metinleri terminolojiye göre düzenle.

Önce çalışma alanını belirle.
Bu dosyadaki kullanım haritasına göre ilgili terminoloji dosyalarını seç.
Kullanıcıya görünen tüm metinlerde önerilen Türkçe terimleri kullan.
Kullanılmaması gereken İngilizce / teknik terimleri arayüzde kullanma.
Mevcut işlevleri, veri yapısını ve kullanıcı akışını bozma.
```

---

## Kısa Görevlerde Kullanılacak Mini Komut

Basit metin düzeltmelerinde şu kısa komut yeterlidir:

```text
Terminoloji/08_Terminoloji_Dosya_Kullanim_Haritasi.md dosyasındaki talimatlara göre ilerle.

Çalışma alanı: [ekran adı]
Görev: Kullanıcıya görünen metinleri terminolojiye göre düzelt.

İlgili terminoloji dosyalarını 08 dosyasındaki haritaya göre seç.
Teknik İngilizce terimleri UI’da kullanma.
Mevcut işlevleri bozma.
```

---

# Öncelik Sırası

Birden fazla dosyada aynı terim geçerse şu öncelik sırası uygulanmalıdır:

```text
1. 07_Kullanilmamasi_Gereken_Terimler.md
2. Çalışılan alana ait ana terminoloji dosyası
3. 01_UI_Yazim_Kurallari.md
4. 00_Terminoloji_Kullanim_Kurallari.md
```

Örnek:

```text
Tasarım stüdyosunda “slot” terimi görülürse:
Önce 07 dosyası kontrol edilir.
Sonra 04 dosyası kontrol edilir.
Sonuç: UI’da “Hücre” kullanılmalıdır.
```

---

# Alanlara Göre Hızlı Referans

| Çalışma Alanı | Ana Dosya | Yardımcı Dosyalar |
|---|---|---|
| Genel UI metinleri | `01_UI_Yazim_Kurallari.md` | `00`, `07` |
| Web-to-print sitesi | `02_Web-to-Print_Terminoloji.md` | `00`, `01`, `03`, `07` |
| Matbaa / baskı | `03_Matbaa_Terminoloji.md` | `00`, `01`, `07` |
| Tasarım stüdyosu | `04_Tasarim_Studyosu_Terminoloji.md` | `00`, `01`, `03`, `07` |
| Kullanıcı paneli | `05_Kullanici_Paneli_Terminoloji.md` | `00`, `01`, `07` |
| Yönetici paneli | `06_Yonetici_Paneli_Terminoloji.md` | `00`, `01`, `03`, `07` |
| Yasaklı / teknik terim kontrolü | `07_Kullanilmamasi_Gereken_Terimler.md` | İlgili alan dosyası |
| Dosya seçim haritası | `08_Terminoloji_Dosya_Kullanim_Haritasi.md` | Tüm terminoloji sistemi |

---

# Kritik Terim Dönüşümleri

Aşağıdaki dönüşümler tüm Presserdiado projesinde korunmalıdır:

```text
Canvas → Çalışma Yüzeyi
Slot → Hücre
Grid → Izgara
Sidebar → Sağ Panel
Contextual Bar → Hızlı Araç Çubuğu
Product Pool → Ürün Havuzu
Temporary Pool → Bekleme Alanı
Assets → Varlıklar
Brand Kit → Marka Varlıkları
Dashboard → Ana Sayfa / Kontrol Paneli
Admin Panel → Yönetici Paneli
Preflight → Baskı Kontrolü
Preflight Report → Baskı Kontrol Raporu
Bleed → Taşma Payı
Safe Area → Güvenli Alan
Trim Line → Kesim Çizgisi
Fold Line → Kırım Çizgisi
Signature → Forma / Sayfa Grubu
Imposition → Montaj / Sayfa Montajı
Job Ticket → İş Emri
Work Order → İş Emri
Workflow → İş Akışı
Fulfillment → Hazırlık / Üretim / Sevkiyat
Billing → Fatura / Ödeme / Muhasebe
Ticket → Destek Talebi
Permission → Yetki
Role → Rol
Audit Log → Denetim Kaydı
Queue → Kuyruk / İş Kuyruğu
Export → Dışa Aktar / İndir
Import → İçe Aktar / Yükle
```

---

# Son Kontrol Kuralı

Her terminoloji düzenlemesinden sonra şu kontrol yapılmalıdır:

```text
1. Kullanıcıya görünen İngilizce teknik terim kaldı mı?
2. Aynı kavram için iki farklı Türkçe terim kullanılmış mı?
3. Buton metinleri açık eylem bildiriyor mu?
4. Popup ve uyarı metinleri kısa mı?
5. Tasarım stüdyosunda Canvas / Slot / Grid gibi terimler UI’da görünüyor mu?
6. Web-to-print tarafında Checkout / Shipping / Billing gibi terimler UI’da görünüyor mu?
7. Yönetici panelinde Job Ticket / Preflight / Workflow gibi terimler gereksiz yere İngilizce kalmış mı?
8. Matbaa terimleri doğru ve açıklamalı kullanılmış mı?
9. Mevcut işlevler ve veri yapısı korunmuş mu?
```

---

# Özet

Bu dosya, Presserdiado terminoloji sisteminin yönlendirme haritasıdır.

```text
Her görevde tüm terminoloji dosyalarını okuma.
Önce çalışma alanını belirle.
Bu dosyadaki haritaya göre ilgili dosyaları seç.
Kullanıcıya görünen metinlerde önerilen Türkçe terimleri kullan.
Kullanılmaması gereken teknik / İngilizce terimleri UI’dan temizle.
Mevcut işlevleri bozma.
```

Bu dosya Cline’a verilecek terminoloji görevlerinde başlangıç dosyası olarak kullanılmalıdır.