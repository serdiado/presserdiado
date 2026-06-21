import { type CSSProperties, useState } from 'react';
import { Pencil, EyeOff, Eye } from 'lucide-react';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import { resolveFooterModule, footerSlotId, synthFooterSlot } from '@/stores/studio/footerSlot';
import { consumeDragGesture } from '../util/editorChrome';
import { BannerSection } from '../modules';

// Footer host (Evre 1, global): footer-bölgesinde tam bir GridModule barındırır. Modül
// globalSettings.footerModule'de (page.slots DIŞINDA) yaşar → slot-grid süreçlerine görünmez.
// Düzenleme = izolasyon (synthFooterSlot'a enterIsolation → BannerSection tam GridModule).
// Host container id = slot-<footerSlotId> → Canvas izolasyon-çıkış gating'i footer-içi tıkı korur.
// Eski footer-cell store yolu dormant (Evre 2 temizler).

interface Props {
  pageNumber: number;
  safeZone: [number, number, number, number];
}

export function FooterRenderer({ pageNumber, safeZone }: Props) {
  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const globalSettings = useCatalogStore((s) => s.globalSettings);
  const setPageFooterMode = useCatalogStore((s) => s.setPageFooterMode);
  const updateFooterSettings = useCatalogStore((s) => s.updateFooterSettings);
  const enterIsolation = useUIStore((s) => s.enterIsolation);
  const toggleElementSelection = useUIStore((s) => s.toggleElementSelection);
  const toggleSlotSelection = useUIStore((s) => s.toggleSlotSelection);
  const editingContent = useUIStore((s) => s.editingContent);
  const [hovered, setHovered] = useState(false);
  const [, mr, , ml] = safeZone;

  const page = getActivePages().find((p) => p.pageNumber === pageNumber);
  if (!page) return null;

  const slotId = footerSlotId(pageNumber);
  const isEditing = editingContent?.slotId === slotId && editingContent?.contentType === 'banner';

  // Footer düzenleme girişi — ürün-slot çift-tık deseniyle BİREBİR (Slot.tsx): izolasyona gir +
  // ilk hücreyi seç. Auto-select olmadan BannerCellMode/CellPanel aktive olmaz (giriş "ölü" görünür).
  const enterFooterEdit = () => {
    const slot = synthFooterSlot(pageNumber, globalSettings);
    enterIsolation(slot);
    const firstCellId = (slot.moduleData as { cells?: { id: string }[] } | undefined)?.cells?.[0]?.id;
    if (firstCellId) toggleElementSelection('bannerCell', firstCellId, false, slotId);
  };
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

  // Hayalet mod (hidden): içerik render edilmez; "göster" ile geri açılır.
  if (page.footerMode === 'hidden') {
    return (
      <div
        data-footer-page={pageNumber}
        className="absolute flex items-center justify-center"
        style={{ ...containerBase, border: '1px dashed rgba(156,163,175,0.4)' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && (
          <button
            data-hide-on-export="true"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-panel text-text-primary text-xs font-bold rounded-lg shadow-sm pointer-events-auto"
            onClick={() => setPageFooterMode(pageNumber, 'global')}
          >
            <Eye size={14} /> Alt bilgiyi göster
          </button>
        )}
        {pageLabelNode}
      </div>
    );
  }

  // Normal mod: footer GridModule'ü bölgede render et (default-if-absent guard'lı).
  const footerModule = resolveFooterModule(globalSettings);
  return (
    <div
      id={`slot-${slotId}`}
      data-footer-page={pageNumber}
      className="absolute"
      style={containerBase}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        // Tek-tık → footer modülünü "seçili" yap (ürün-slot deseni: Slot.tsx:806-817).
        // İzolasyondayken seçme; drag-release seçimi bozmasın; #canvas onClick→clearSelection ezmesin.
        if (isEditing) return;
        if (consumeDragGesture()) return;
        e.stopPropagation();
        toggleSlotSelection(slotId, false);
      }}
      onDoubleClick={(e) => {
        // Çift-tık girişi (ürün-slot deseni). Düzenleme DIŞINDAysa izolasyona gir + ilk hücreyi seç.
        if (isEditing) return;
        e.stopPropagation();
        enterFooterEdit();
      }}
    >
      {/* Slot.tsx:920-921 deseni: düzenleme DIŞINDA pointer-events-none → cell'ler olay yutmaz,
          çift-tık host'a ulaşır (enterFooterEdit). Düzenlemede auto → BannerSection tam etkileşimli. */}
      <div className={`w-full h-full ${isEditing ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <BannerSection instanceData={footerModule} slotId={slotId} pageNumber={pageNumber} />
      </div>

      {/* Minimal container kontrolleri — yalnız düzenleme DIŞINDA, hover'da. Export'ta gizli. */}
      {!isEditing && hovered && (
        <div
          data-hide-on-export="true"
          className="absolute inset-0 z-50 flex items-center justify-center gap-2 pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.30)' }}
        >
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-panel text-text-primary text-xs font-bold rounded-lg shadow-sm pointer-events-auto"
            onClick={(e) => {
              // Buton girişi: izolasyona gir + ilk hücreyi seç (cascade: BannerCellMode + CellPanel).
              // stopPropagation: aynı tıkın #canvas onClick→clearSelection'ı seçimi ezmesin.
              e.stopPropagation();
              enterFooterEdit();
            }}
          >
            <Pencil size={14} /> Alt bilgiyi düzenle
          </button>
          <label
            className="flex items-center gap-1 px-2 py-1.5 bg-surface-panel rounded-lg shadow-sm text-[11px] pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-text-muted">Yük.</span>
            <input
              type="number"
              min={5}
              max={60}
              value={heightMm}
              onChange={(e) => updateFooterSettings('global', { heightMm: parseInt(e.target.value) || 5 })}
              className="w-12 text-center bg-surface-subtle border border-border-default rounded px-1 py-0.5 focus:outline-none"
            />
            <span className="text-text-muted">mm</span>
          </label>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-panel text-text-primary text-xs font-bold rounded-lg shadow-sm pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              setPageFooterMode(pageNumber, 'hidden');
            }}
          >
            <EyeOff size={14} /> Gizle
          </button>
        </div>
      )}

      {pageLabelNode}
    </div>
  );
}
