// Dosya adı → SKU eşleştirme yardımcıları. Ürün resmi yükleme sihirbazı (web) ve
// toplu yeniden eşleştirme ucu (api) aynı kuralı kullansın diye tek kaynakta toplandı.

export const normalizeSku = (s: string) => s.trim().toUpperCase();

// Dosya adından SKU adayını çıkar (sıra numarası sortOrder için kullanılmaz; o, SKU başına
// DB max + oturum sırası ile hesaplanır).
// 755BU.jpg → 755BU; 755BU_02.jpg → 755BU; urun_755BU.jpg → 755BU; IMG_001.jpg → IMG
export function guessSkuFromFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, '').trim();
  // Sondaki ayraç + 1-3 haneli sıra ekini at (755BU_02 → 755BU)
  const body = base.replace(/[_-]\d{1,3}$/, '');
  // Adayı son segment olarak al (urun_755BU → 755BU)
  const parts = body.split(/[_-]/).filter(Boolean);
  return (parts.length ? parts[parts.length - 1] : body).trim();
}

// Adayı SKU listesiyle yalnızca TAM eşleşme kuralıyla eşleştir.
// Levenshtein/öneri yok: kısa kodlarda (0022A↔1022 gibi) yanıltıcı önerileri ve
// acemi kullanıcının yanlış onayını engellemek için kesin eşleşme şart.
// normMap: normalize edilmiş SKU → orijinal (görüntülenecek) SKU.
export function matchSku(candidate: string, normMap: Map<string, string>): string {
  if (!candidate) return '';
  return normMap.get(normalizeSku(candidate)) ?? '';
}
