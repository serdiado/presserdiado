export const STUDIO_TERMINOLOGY = {
  canvas: "Çalışma Yüzeyi",
  slot: "Hücre",
  grid: "Izgara",
  sidebar: "Sağ Panel",
  contextualBar: "Hızlı Araç Çubuğu",
  productPool: "Ürün Havuzu",
  temporaryPool: "Bekleme Alanı",
  assets: "Varlıklar",
  brandKit: "Marka Varlıkları",
  template: "Şablon",
  layer: "Katman",
} as const;

export const PRINT_TERMINOLOGY = {
  bleed: "Taşma Payı",
  safeArea: "Güvenli Alan",
  preflight: "Baskı Kontrolü",
  preflightReport: "Baskı Kontrol Raporu",
  trimLine: "Kesim Çizgisi",
  foldLine: "Kırım Çizgisi",
  signature: "Forma",
  imposition: "Montaj",
  jobTicket: "İş Emri",
  workflow: "İş Akışı",
  // Fold Types
  "none": "Katlamasız",
  "half-fold": "Tek Kırım",
  "z-fold": "Z Kırım",
  "roll-fold": "İçe Kırım",
  "accordion-fold": "Akordeon Kırım",
  "gate-fold": "Pencere Kırım",
  "french-fold": "Fransız Kırım",
  "double-parallel-fold": "Çift Paralel Kırım",
  // Modes
  "basic": "Basit",
  "pro": "Pro",
  // Design Types
  "brochure": "Broşür",
  "insert": "İnsört",
  "flyer": "El İlanı",
  "menu": "Menü",
  // Paper Sizes
  "A4": "A4",
  "A5": "A5",
  "A3": "A3",
} as const;

export const PANEL_TERMINOLOGY = {
  dashboardUser: "Ana Sayfa",
  dashboardAdmin: "Kontrol Paneli",
  adminPanel: "Yönetici Paneli",
  fulfillment: "Hazırlık / Üretim / Sevkiyat",
  billing: "Fatura ve Ödeme",
  ticket: "Destek Talebi",
  permission: "Yetki",
  role: "Rol",
  auditLog: "Denetim Kaydı",
  queue: "İş Kuyruğu",
  export: "İndir",
  exportAdmin: "Dışa Aktar",
  import: "Yükle",
  importAdmin: "İçe Aktar",
} as const;

export const TERMINOLOGY = {
  studio: STUDIO_TERMINOLOGY,
  print: PRINT_TERMINOLOGY,
  panel: PANEL_TERMINOLOGY,
} as const;

export type TermCategory = keyof typeof TERMINOLOGY;

export const getTerm = (category: TermCategory, key: string): string => {
  const categoryTerms = TERMINOLOGY[category] as Record<string, string>;
  if (categoryTerms && key in categoryTerms) {
    return categoryTerms[key];
  }
  console.warn(`Terminoloji uyarısı: '${category}' kategorisinde '${key}' anahtarı bulunamadı.`);
  return key;
};
