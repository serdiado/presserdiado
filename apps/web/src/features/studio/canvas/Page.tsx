import { useEffect, useState } from 'react';
import type { StudioSlot } from '@matbaapro/shared';
import { useCatalogStore, useLayerStore, useUIStore } from '@/stores/studio';
import { resolveFooterHeight, footerSlotId } from '@/stores/studio/footerSlot';
import { resolveMenuContext, isSlotMenuSelectionActive, type MenuContext } from '../contextMenu/menuContext';
import { ContextMenu } from '../contextMenu/ContextMenu';
import { colorValueBackground } from '../util/style';
import { consumeDragGesture } from '../util/editorChrome';
import { Slot } from './Slot';
import { FooterRenderer } from './FooterRenderer';

interface ContextMenuState {
  x: number;
  y: number;
  ctx: MenuContext;
}

// Menü açılış anında mevcut store durumundan bağlamı çöz (snapshot). resolveMenuContext SAF; seçim
// mutasyonundan (önce-seç / pageBg seçimi) SONRA çağrılır → canMerge/hasProduct/pageBg güncel seçimden doğru.
// targetSlotId = sağ-tıklanan slot (çoklu seçimde merge anchor'u eski menüyle parite kalsın).
function currentMenuContext(targetSlotId?: string): MenuContext {
  const cat = useCatalogStore.getState();
  const ui = useUIStore.getState();
  return resolveMenuContext({
    selection: ui.selection,
    pages: cat.getActivePages(),
    globalSettings: cat.globalSettings,
    copiedSlotStyle: cat.copiedSlotSettings !== null,
    copiedBg: cat.copiedBackground !== null,
    targetSlotId,
  });
}

export function Page({
  pageNumber,
  isFirst,
  isLast,
}: {
  pageNumber: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const formas = useCatalogStore((s) => s.formas);
  const activeFormaId = useCatalogStore((s) => s.activeFormaId);
  const template = useCatalogStore((s) => s.activeTemplate);
  const globalGridGap = useCatalogStore((s) => s.globalSettings?.gridGap ?? 0);
  const defaultGrid = useCatalogStore((s) => s.globalSettings?.defaultGrid);
  const globalSettings = useCatalogStore((s) => s.globalSettings);
  const selectPages = useLayerStore((s) => s.selectPages);
  const selectedPageIds = useLayerStore((s) => s.selectedPageIds);
  const setEditingContent = useUIStore((s) => s.setEditingContent);
  const foregroundOpacity = useUIStore((s) => s.foregroundOpacity);
  const isPreviewMode = useUIStore((s) => s.isPreviewMode);

  const activeForma = formas.find((f) => f.id === activeFormaId) || formas[0];
  const pages = activeForma?.pages ?? [];

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  useEffect(() => {
    const onWindowClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('#context-menu-container')) setContextMenu(null);
    };
    window.addEventListener('mousedown', onWindowClick, { capture: true });
    return () =>
      window.removeEventListener('mousedown', onWindowClick, { capture: true });
  }, []);

  const handleContextMenu = (e: React.MouseEvent, slot: StudioSlot) => {
    e.preventDefault();
    e.stopPropagation();

    // Sağ tıklanan slot "slot olarak" seçili değilse onu seçelim. selectedSlotIds'e BAKMA: metin-edit
    // (textElement) sırasında o BAYAT [slotId] kalır → boş menü bug'ı. selection.type-tabanlı guard.
    const ui = useUIStore.getState();
    if (!isSlotMenuSelectionActive(ui.selection, slot.id)) {
      ui.toggleSlotSelection(slot.id, false);
    }

    // Sağ tık daima menüyü açar — bağlam (kind + flag'ler) seçim mutasyonundan SONRA resolver'dan türer.
    // slot.id targetSlotId olarak verilir → çoklu seçim merge anchor'u sağ-tıklanan hücre (eski parite).
    setContextMenu({ x: e.clientX, y: e.clientY, ctx: currentMenuContext(slot.id) });
  };

  const currentPage = pages.find((p) => p.pageNumber === pageNumber);
  const pageConfig = template.pages.find((p) => p.pageNumber === pageNumber);
  if (!currentPage || !pageConfig) return null;

  const bleedLeft = isFirst ? `-${template.bleedMm}mm` : '0';
  const bleedRight = isLast ? `-${template.bleedMm}mm` : '0';

  const isSelected = selectedPageIds.includes(currentPage.id);
  const bg = currentPage.background;
  const [mt, mr, , ml] = pageConfig.safeZone;

  const isFooterHidden = currentPage.footerMode === 'hidden';
  // Footer bölge yüksekliği — footerSlot tek-kaynak (override → legacy custom → global; 2a-i'de byte-identical).
  const footerHeight = resolveFooterHeight(currentPage, globalSettings);
  const footerOffset = isFooterHidden ? 0 : footerHeight + 5;

  const totalColumns = currentPage.gridSettings?.cols ?? defaultGrid?.cols ?? 4;
  const configuredRows = currentPage.gridSettings?.rows ?? defaultGrid?.rows ?? 4;
  const totalRows = Math.max(configuredRows, Math.ceil(currentPage.slots.length / totalColumns));

  const effectiveGap =
    currentPage.gridSettings?.gap !== undefined
      ? currentPage.gridSettings.gap
      : globalGridGap;

  return (
    <>
      {contextMenu && (
        <ContextMenu
          ctx={contextMenu.ctx}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}

      <div
        id={`page-${currentPage.id}`}
        className={`physical-page relative shrink-0 border-r border-dashed border-border-strong last:border-r-0 ${
          !isPreviewMode && isSelected ? 'z-10 isolate' : 'z-1'
        }`}
        style={{
          width: `${pageConfig.widthMm}mm`,
          height: `${template.openHeightMm}mm`,
          boxSizing: 'border-box',
          backgroundColor: 'transparent',
          borderRightStyle: isPreviewMode ? 'none' : undefined,
        }}
        data-hide-border-on-export="true"
        onClick={(e) => {
          if (isPreviewMode) return; // Disable click actions on page in preview mode
          e.stopPropagation();
          // Drag-jesti (footer/modül lasso veya kenar-resize) sayfaya düşen mouseup'ında izolasyonu/
          // edit'i BOZMASIN — #canvas/Slot onClick'teki guard'ın aynısı (5fb45af). Kasıtlı tek-tık
          // çıkış: drag yoksa flag false → setEditingContent(null) normal işler.
          if (consumeDragGesture()) return;
          setEditingContent(null);
          if (e.ctrlKey || e.metaKey) {
            if (selectedPageIds.includes(currentPage.id))
              selectPages(selectedPageIds.filter((id) => id !== currentPage.id));
            else selectPages([...selectedPageIds, currentPage.id]);
          } else {
            selectPages([currentPage.id]);
            useUIStore.getState().setSelection({ type: 'pageBackground', ids: [String(pageNumber)] });
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const target = e.target as HTMLElement;
          const isSlot = target.closest('[data-slot-id]');

          // Footer host-slot sağ tık: ürün-slot'un handleContextMenu "önce seç" desenini mirror et —
          // seçili değilse seç, seçiliyse koru; pageBackground'a DÜŞME (iki belirtinin de kökü buydu).
          // Floating footer menüsü (Dal 5) Aşama 2'de gelecek → şimdilik yalnız seçim (hızlı bar
          // footer'da kalır). Edit-mode (izole iç hücre) HARİÇ: orada mevcut davranış korunur.
          const fSlotId = footerSlotId(pageNumber);
          const editing = useUIStore.getState().editingContent;
          const isFooterEditing = editing?.slotId === fSlotId && editing?.contentType === 'banner';
          if (target.closest('[data-footer-page]') && !isFooterEditing) {
            if (!useUIStore.getState().selectedSlotIds.includes(fSlotId)) {
              useUIStore.getState().toggleSlotSelection(fSlotId, false);
            }
            return;
          }

          if (!isSlot) {
            selectPages([currentPage.id]);
            useUIStore.getState().setSelection({ type: 'pageBackground', ids: [String(pageNumber)] });
            // pageBg seçimi SONRASI resolver → kind:'pageBg' (eski slot:null-as-any tip yalanı kalkar).
            setContextMenu({ x: e.clientX, y: e.clientY, ctx: currentMenuContext() });
          }
        }}
      >
        {bg && (
          <div
            className="absolute z-0"
            style={{
              top: `-${template.bleedMm}mm`,
              left: bleedLeft,
              right: bleedRight,
              bottom: `-${template.bleedMm}mm`,
              position: 'absolute',
              zIndex: 0,
              ...(bg.type === 'color' && bg.value
                ? colorValueBackground(bg.value)
                : bg.type === 'image' && bg.imageUrl
                  ? {
                      backgroundImage: `url(${bg.imageUrl})`,
                      backgroundSize:
                        bg.imageSize === 'fit' ? 'contain'
                        : bg.imageSize === 'stretch' ? '100% 100%'
                        : bg.imageSize === 'tile' ? 'auto'
                        : 'cover',
                      backgroundRepeat: bg.imageSize === 'tile' ? 'repeat' : 'no-repeat',
                      backgroundPosition: bg.imagePosition
                        ? bg.imagePosition.replace('middle', 'center').replace(/-/g, ' ')
                        : 'center',
                      opacity: (bg.imageOpacity ?? 100) / 100,
                    }
                  : {})
            }}
          />
        )}

        {isSelected && !isPreviewMode && (
          <div
            className="absolute pointer-events-none ring-2 ring-border-selected z-50"
            style={{
              top: `-${template.bleedMm}mm`,
              left: bleedLeft,
              right: bleedRight,
              bottom: `-${template.bleedMm}mm`,
            }}
          />
        )}

        <div
          className="absolute inset-0 overflow-hidden"
          style={{ opacity: foregroundOpacity / 100, transition: 'opacity 0.15s' }}
        >
          <div
            className="safe-zone absolute z-10 flex flex-col pointer-events-none"
            style={{
              top: `${mt}mm`,
              right: `${mr}mm`,
              bottom: `${5 + footerOffset}mm`,
              left: `${ml}mm`,
            }}
          >
            <div
              className="grid flex-1 min-h-0 min-w-0 w-full h-full relative z-0"
              style={{
                gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${totalRows}, minmax(0, 1fr))`,
                gap: `${effectiveGap}mm`,
              }}
            >
              {currentPage.slots.map((slot, idx) => {
                if (slot.hidden) return null;
                return (
                  <Slot
                    key={slot.id}
                    slot={slot}
                    pageNumber={pageNumber}
                    slotIndex={idx}
                    globalNumber={slot.globalNumber ?? 0}
                    onContextMenu={handleContextMenu}
                    gridPosition={slot.gridPosition ?? { colStart: 1, rowStart: 1 }}
                    totalRows={totalRows}
                    totalColumns={totalColumns}
                  />
                );
              })}
            </div>
          </div>

          <FooterRenderer
            pageNumber={pageNumber}
            safeZone={pageConfig.safeZone}
          />
        </div>
      </div>
    </>
  );
}
