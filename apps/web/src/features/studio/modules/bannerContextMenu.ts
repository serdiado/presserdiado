// Banner hücre sağ-tık kararı (Dal 8 — Yol A). SAF yüklem (React/DOM importu YOK) → birim test
// edilebilir; sağ-tık dallanmasının tek-kaynağı. Precedent: canvas/isolationExit.ts (aynı desen —
// sağ-tık kararı saf yükleme çıkarılır, BannerSection yalnız yan-etkiyi map'ler).
//
//  - passthrough : izolasyon DIŞI → olay üst slot/Page menüsüne bırakılır (mevcut bubble korunur).
//  - native      : metin imleci BU hücrede aktif → tarayıcının native clipboard menüsü (Kes/Kopyala/
//                  Yapıştır). BannerSection stopPropagation çağırır (üst registry menüsünü keser) ama
//                  preventDefault ÇAĞIRMAZ → native menü görünür. Custom menü/descriptor/clipboard kodu YOK.
//  - structural  : izolasyon var, metin-edit yok → mevcut yapısal menü (satır/sütun ekle-sil).
export type BannerCtxAction = 'passthrough' | 'native' | 'structural';

export function bannerCtxAction(
  isEditingModule: boolean,
  isTextEditingThisCell: boolean,
): BannerCtxAction {
  if (!isEditingModule) return 'passthrough';
  if (isTextEditingThisCell) return 'native';
  return 'structural';
}
