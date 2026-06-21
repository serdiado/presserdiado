import type { CSSProperties } from 'react';
import { useCatalogStore } from '@/stores/studio';
import { resolveFooterModule, footerSlotId } from '@/stores/studio/footerSlot';
import { BannerSection } from '../modules';

// Footer host (Evre 1, global): footer-bölgesinde tam bir GridModule barındırır. Modül
// globalSettings.footerModule'de (page.slots DIŞINDA) yaşar → slot-grid süreçlerine görünmez.
// Bu evrede SALT RENDER (statik); düzenleme=izolasyon Evre 1b'de bağlanır. Eski hücre-render
// döngüsü ve footer-cell store yolu kaldırıldı (footer store action'ları dormant — Evre 2 temizler).

interface Props {
  pageNumber: number;
  safeZone: [number, number, number, number];
}

export function FooterRenderer({ pageNumber, safeZone }: Props) {
  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const globalSettings = useCatalogStore((s) => s.globalSettings);
  const [, mr, , ml] = safeZone;

  const page = getActivePages().find((p) => p.pageNumber === pageNumber);
  if (!page) return null;

  // Bölge yüksekliği: dormant footer ayarından (heightMm kontrolü Evre 1b/2). left/right güvenli-bölge marjı.
  const heightMm = globalSettings.footer.heightMm;
  const containerBase: CSSProperties = {
    bottom: '5mm',
    left: `${ml}mm`,
    right: `${mr}mm`,
    height: `${heightMm}mm`,
    boxSizing: 'border-box',
    zIndex: 40,
  };

  const pageLabelNode = (
    <div
      data-hide-on-export="true"
      className="absolute text-[10px] font-black text-text-muted uppercase tracking-tighter pointer-events-none"
      style={{ right: '0mm', bottom: '-5mm', height: '5mm', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
    >
      P.{pageNumber}
    </div>
  );

  // Hayalet mod (hidden): host içerik render etmez (şeffaf, dashed sınır).
  if (page.footerMode === 'hidden') {
    return (
      <div
        data-footer-page={pageNumber}
        className="absolute"
        style={{ ...containerBase, border: '1px dashed rgba(156,163,175,0.4)' }}
      >
        {pageLabelNode}
      </div>
    );
  }

  // Normal mod: footer GridModule'ü bölgede render et. resolveFooterModule default-if-absent guard'lı
  // (eski proje footerModule taşımazsa default → render çökmesin).
  const footerModule = resolveFooterModule(globalSettings);
  return (
    <div data-footer-page={pageNumber} className="absolute" style={containerBase}>
      <BannerSection
        instanceData={footerModule}
        slotId={footerSlotId(pageNumber)}
        pageNumber={pageNumber}
      />
      {pageLabelNode}
    </div>
  );
}
