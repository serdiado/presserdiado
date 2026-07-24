# Üye görünümü verileri — SONUÇLANDI

Bu klasör, üye girişiyle toplanacak veriler için hazırlanmıştı. Kullanıcı Chrome'da turmatsan
üye hesabına giriş yaptı, "Claude in Chrome" bu oturum üzerinden `hesap/index.php?goster=fiyat-listesi`
sayfasını ve üye "Ürünler" sekmelerini okuyup gerekli veriyi doğrudan çekti — elle dosya
bırakmaya gerek kalmadı. Sonuç ana JSON'lara işlendi (`docs/vitrin/turmatsan/*.json`).

Detay: `../../TODO_vitrin.md` → Faz 1 bölümü ("TAMAMLANDI" notu + "Nasıl toplandı" özeti).

## Kalan tek gerçek boşluk

- **İnsert (IN01-IN08)** — üye panelinde de ebat/adet/fiyat bulunamadı; `quote` moduna alındı.
  Kesinleştirmek istersen müşteri temsilcisiyle (444 11 30) görüşüp bu klasöre not bırakabilirsin.
- **4BK170U** (ekstra-urunler) — toptan fiyatı sayfada boş görünüyor, sipariş anında teyit edilecek.

Bu klasör ileride benzer bir elle-veri-toplama ihtiyacı çıkarsa (ör. yeni bir tedarikçi) aynı
yöntemle tekrar kullanılabilir.
