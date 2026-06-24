// İzolasyon (modül düzenleme) çıkış yüklemi — Canvas mousedown-capture'ından çağrılır. SAF (yalnız DOM
// closest; store/UI bağımlılığı YOK → test edilebilir, '@' alias zinciri yok). Çıkış YALNIZ: sağ-tık
// OLMAYAN bir tık + kanvas çalışma yüzeyinde + izole modül DIŞINDA olunca.
//
// Madde 10 (kullanıcı kararı): DÜZENLEME modundayken SAĞ TIK (button===2) düzenlemeyi İPTAL ETMEMELİ.
// (Önceki davranış: sağ tık de izolasyondan çıkarıyordu → düzenleme kapanıyordu. Artık sağ tık korunur;
//  modül-içi sağ tık zaten BannerSection menüsüne gider, modül-dışı sağ tık ise düzenlemeyi bozmaz.)
export function shouldExitIsolationOnPointer(
  button: number,
  target: HTMLElement | null,
  isoSlotId: string,
): boolean {
  if (button === 2) return false; // SAĞ tık → düzenleme korunur (iptal etme)
  if (!target) return false;
  if (!target.closest('#studio-canvas-root')) return false; // krom (panel/menü/bar) → çıkma
  if (target.closest(`#slot-${isoSlotId}`)) return false; // izole modül içi → kal
  return true; // kanvas yüzeyi ama modül dışı + sol/orta tık → çıkış (commit)
}
