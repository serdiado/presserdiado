// Banner hücre DOM id — TEK KAYNAK. slotId ile kapsanır: bannerInit her modüle aynı
// `banner-inst-0..15` cell id'lerini verdiğinden, sayfada 2+ banner modülünde DOM id'leri
// çakışırdı → global getElementById çakışan id'de YANLIŞ modülü bulur (lasso/edit lookup bug'ı).
// slotId kapsaması DOM id'sini benzersizleştirir. Saf string util — store/UI/DOM importu yok,
// cycle riski yok. Hem BannerSection (render + lookup'lar) hem ContextualBar (run-color) buradan.
export const cellDomId = (slotId: string, cellId: string): string => `banner-${slotId}-${cellId}`;
