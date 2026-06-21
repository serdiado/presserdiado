import { type CSSProperties, useState, useRef, useEffect } from 'react';
import { Pencil, EyeOff, Eye, Globe, File, ChevronUp, ChevronDown } from 'lucide-react';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import { resolveFooterModule, resolveFooterHeight, footerSlotId, synthFooterSlot } from '@/stores/studio/footerSlot';
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
  const forkPageFooter = useCatalogStore((s) => s.forkPageFooter);
  const revertPageFooter = useCatalogStore((s) => s.revertPageFooter);
  const showPageFooter = useCatalogStore((s) => s.showPageFooter);
  const setFooterHeight = useCatalogStore((s) => s.setFooterHeight);
  const enterIsolation = useUIStore((s) => s.enterIsolation);
  const toggleElementSelection = useUIStore((s) => s.toggleElementSelection);
  const toggleSlotSelection = useUIStore((s) => s.toggleSlotSelection);
  const editingContent = useUIStore((s) => s.editingContent);
  const selectedSlotIds = useUIStore((s) => s.selectedSlotIds);
  const [hovered, setHovered] = useState(false);
  const [heightDraft, setHeightDraft] = useState<string | null>(null);
  // ▲▼ basılı-tut auto-repeat timer'ları (ref → render'dan bağımsız). Unmount'ta temizlenir (leak yok).
  const repeatTimers = useRef<{ timeout?: ReturnType<typeof setTimeout>; interval?: ReturnType<typeof setInterval> }>({});
  useEffect(() => () => {
    if (repeatTimers.current.timeout) clearTimeout(repeatTimers.current.timeout);
    if (repeatTimers.current.interval) clearInterval(repeatTimers.current.interval);
  }, []);
  const [, mr, , ml] = safeZone;

  const page = getActivePages().find((p) => p.pageNumber === pageNumber);
  if (!page) return null;

  const slotId = footerSlotId(pageNumber);
  const isEditing = editingContent?.slotId === slotId && editingContent?.contentType === 'banner';
  // Footer-seçili = FreeSlotMode'u tetikleyen aynı state (selection.type='slot' + selectedSlotIds=[footer-slot]).
  const isFooterSelected = selectedSlotIds.includes(slotId);

  // Footer düzenleme girişi — ürün-slot çift-tık deseniyle BİREBİR (Slot.tsx): izolasyona gir +
  // ilk hücreyi seç. Auto-select olmadan BannerCellMode/CellPanel aktive olmaz (giriş "ölü" görünür).
  const enterFooterEdit = () => {
    const slot = synthFooterSlot(pageNumber, getActivePages(), globalSettings);
    enterIsolation(slot);
    const firstCellId = (slot.moduleData as { cells?: { id: string }[] } | undefined)?.cells?.[0]?.id;
    if (firstCellId) toggleElementSelection('bannerCell', firstCellId, false, slotId);
  };
  const heightMm = resolveFooterHeight(page, globalSettings);
  // "custom" state'i override-VARLIĞINDAN (footerMode'dan değil) — sözleşme enforcement.
  const isCustom = !!page.footerOverride;

  // Yük. input commit-timing: type-in yalnız draft (store'a yazma/clamp YOK); commit Enter/blur'de
  // (clamp setFooterHeight içinde). Ok-tuş ↑/↓ ve ▲▼ buton anlık commit (±1) — tarayıcıdan bağımsız.
  const commitHeight = (raw: string) => {
    const n = parseInt(raw, 10);
    setFooterHeight(pageNumber, Number.isFinite(n) ? n : 5);
    setHeightDraft(null);
  };
  const stepHeight = (delta: number) => {
    const base = parseInt(heightDraft ?? String(heightMm), 10);
    setFooterHeight(pageNumber, (Number.isFinite(base) ? base : heightMm) + delta);
    setHeightDraft(null);
  };
  // ▲▼ basılı-tut: pointerdown → anlık 1 adım + ~350ms gecikme sonra ~60ms interval'le tekrar.
  // İlk adım stepHeight (draft-aware, tek-tık ile aynı); interval CANLI store okur (closure-staleness
  // yok) → her tick committed yükseklikten +delta artar. Hızlanma yok (sabit tekrar). Adım-başı commit.
  const stopRepeat = () => {
    if (repeatTimers.current.timeout) clearTimeout(repeatTimers.current.timeout);
    if (repeatTimers.current.interval) clearInterval(repeatTimers.current.interval);
    repeatTimers.current = {};
  };
  const startRepeat = (delta: number) => {
    stopRepeat();
    stepHeight(delta);
    repeatTimers.current.timeout = setTimeout(() => {
      repeatTimers.current.interval = setInterval(() => {
        const c = useCatalogStore.getState();
        const pg = c.getActivePages().find((p) => p.pageNumber === pageNumber);
        const cur = pg ? resolveFooterHeight(pg, c.globalSettings) : heightMm;
        setFooterHeight(pageNumber, cur + delta);
      }, 60);
    }, 350);
  };
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
            onClick={() => showPageFooter(pageNumber)}
          >
            <Eye size={14} /> Alt bilgiyi göster
          </button>
        )}
        {pageLabelNode}
      </div>
    );
  }

  // Normal mod: footer GridModule'ü bölgede render et (default-if-absent guard'lı).
  const footerModule = resolveFooterModule(page, globalSettings);
  return (
    <div
      id={`slot-${slotId}`}
      data-footer-page={pageNumber}
      className="absolute"
      // Footer-seçili çerçeve: ürün-modül outline desenini birebir mirror eder (inline shorthand —
      // Tailwind v4 outline width/style ambiguity'sini atlar), renk = aktif-tab mavisi token'ı (blue-500).
      style={{
        ...containerBase,
        ...(isFooterSelected
          ? { outline: '2px solid var(--color-blue-500)', outlineOffset: '2px' }
          : {}),
      }}
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

      {/* Minimal kontroller — düzenleme DIŞINDA, hover VEYA footer-seçili (toolbar seçiliyken kalıcı).
          Üst-kenara pinli çubuk (yükseklikten bağımsız sabit konum); tam-alan karartma YOK (içeriği
          gizlemesin). onDoubleClick stopPropagation: toolbar çift-tıkı host'a (enterFooterEdit) ulaşmasın
          (single-click fold'un dblclick karşılığı). Export'ta gizli. */}
      {!isEditing && (hovered || isFooterSelected) && (
        <div
          data-hide-on-export="true"
          className="absolute bottom-1 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 pointer-events-none"
          onDoubleClick={(e) => e.stopPropagation()}
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
              type="text"
              inputMode="numeric"
              value={heightDraft ?? String(heightMm)}
              onChange={(e) => setHeightDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitHeight(e.currentTarget.value);
                  e.currentTarget.blur();
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  stepHeight(1);
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  stepHeight(-1);
                }
              }}
              onBlur={(e) => commitHeight(e.currentTarget.value)}
              className="w-9 text-center bg-surface-subtle border border-border-default rounded px-1 py-0.5 focus:outline-none"
            />
            {/* Kendi ▲▼ buton — native spinner yerine; anlık commit (±1). Ok-tuş ↑/↓ ile birlikte kesin. */}
            <span className="flex flex-col leading-none">
              <button
                type="button"
                onPointerDown={(e) => { e.stopPropagation(); startRepeat(1); }}
                onPointerUp={stopRepeat}
                onPointerLeave={stopRepeat}
                onPointerCancel={stopRepeat}
                className="text-text-muted hover:text-text-primary"
              >
                <ChevronUp size={11} />
              </button>
              <button
                type="button"
                onPointerDown={(e) => { e.stopPropagation(); startRepeat(-1); }}
                onPointerUp={stopRepeat}
                onPointerLeave={stopRepeat}
                onPointerCancel={stopRepeat}
                className="text-text-muted hover:text-text-primary"
              >
                <ChevronDown size={11} />
              </button>
            </span>
            <span className="text-text-muted">mm</span>
          </label>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-panel text-text-primary text-xs font-bold rounded-lg shadow-sm pointer-events-auto"
            onClick={(e) => {
              // State override-VARLIĞINDAN (footerMode'dan değil): custom→Genel yap (revert), global→Özel yap (fork).
              e.stopPropagation();
              if (isCustom) revertPageFooter(pageNumber);
              else forkPageFooter(pageNumber);
            }}
          >
            {isCustom ? (
              <>
                <Globe size={14} /> Genel yap
              </>
            ) : (
              <>
                <File size={14} /> Özel yap
              </>
            )}
          </button>
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
