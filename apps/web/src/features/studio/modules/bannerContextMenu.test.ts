import { describe, it, expect } from 'vitest';
import { bannerCtxAction } from './bannerContextMenu';

// Dal 8 (Yol A) sağ-tık dallanması — saf yüklem (DOM/event yok). isolationExit.test.ts deseni:
// karar saf yüklemde test edilir; BannerSection yalnız yan-etkiyi (stop/prevent/ctxMenu) map'ler.
describe('bannerCtxAction', () => {
  it('izolasyon DIŞI → passthrough (üst slot/Page menüsüne bubble; mevcut davranış)', () => {
    expect(bannerCtxAction(false, false)).toBe('passthrough');
    expect(bannerCtxAction(false, true)).toBe('passthrough'); // editingModule yoksa metin-flag önemsiz
  });

  it('izolasyon + metin imleci BU hücrede → native (tarayıcı clipboard menüsü; yapısal menü AÇILMAZ)', () => {
    expect(bannerCtxAction(true, true)).toBe('native');
  });

  it('izolasyon + metin-edit YOK → structural (mevcut satır/sütun menüsü korunur)', () => {
    expect(bannerCtxAction(true, false)).toBe('structural');
  });
});
