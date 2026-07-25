// API'nin createdAt/updatedAt gibi alanları — mysql2 sürücüsü TIMESTAMP kolonlarını, DB
// sunucusunun sistem saat dilimi UTC olduğu için "YYYY-MM-DD HH:MM:SS" ŞEKLİNDE, 'Z'/ofset
// OLMADAN döner. Bu değer GERÇEKTE UTC'dir — ama new Date() ofsetsiz "boşluklu" bir string'i
// TARAYICININ yerel saatiymiş gibi ayrıştırır (ör. Türkiye'de saat 01:06'da oluşan bir kayıt
// DB'de "22:06, bir önceki gün" UTC olarak görünür; 'Z' eklenmeden new Date() bunu yerel
// 22:06 sanıp bir önceki günü gösterir — gece yarısına yakın siparişlerde tarih hep 1 gün geri
// çıkar). Bu fonksiyon API'den gelen ham string'i doğru şekilde UTC olarak ayrıştırır.
export function parseApiDate(value: string): Date {
  // Zaten 'Z'/ofset içeriyorsa (API ileride tam ISO'ya geçerse) dokunma — idempotent.
  if (/[Zz]|[+-]\d{2}:?\d{2}$/.test(value)) return new Date(value);
  return new Date(value.replace(' ', 'T') + 'Z');
}
