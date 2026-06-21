import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { StudioSlot } from '@matbaapro/shared';
import { useCatalogStore, useLayerStore, useUIStore } from '@/stores/studio';
import { resolveFooterHeight } from '@/stores/studio/footerSlot';
import { colorValueBackground } from '../util/style';
import { consumeDragGesture } from '../util/editorChrome';
import { Slot } from './Slot';
import { FooterRenderer } from './FooterRenderer';

interface ContextMenuState {
  x: number;
  y: number;
  slot: StudioSlot;
  canMerge: boolean;
  canUnmerge: boolean;
  hasProduct: boolean;
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
  const mergeSelected = useCatalogStore((s) => s.mergeSelected);
  const unmergeSlot = useCatalogStore((s) => s.unmergeSlot);
  const clearSlot = useCatalogStore((s) => s.clearSlot);
  const moveSlotToTempPool = useCatalogStore((s) => s.moveSlotToTempPool);
  const copiedSlotSettings = useCatalogStore((s) => s.copiedSlotSettings);
  const selectPages = useLayerStore((s) => s.selectPages);
  const selectedPageIds = useLayerStore((s) => s.selectedPageIds);
  const setEditingContent = useUIStore((s) => s.setEditingContent);
  const foregroundOpacity = useUIStore((s) => s.foregroundOpacity);
  const selection = useUIStore((s) => s.selection);
  const isPreviewMode = useUIStore((s) => s.isPreviewMode);

  const copiedFooterSettings = useCatalogStore((s) => s.copiedFooterSettings);
  const copyFooterSettings = useCatalogStore((s) => s.copyFooterSettings);
  const pasteFooterSettings = useCatalogStore((s) => s.pasteFooterSettings);
  const copiedBackground = useCatalogStore((s) => s.copiedBackground);
  const copyBackground = useCatalogStore((s) => s.copyBackground);
  const pasteBackground = useCatalogStore((s) => s.pasteBackground);

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

    // Sağ tıklanan slot seçili değilse onu seçelim
    const sel = useUIStore.getState().selectedSlotIds;
    if (!sel.includes(slot.id)) {
      useUIStore.getState().toggleSlotSelection(slot.id, false);
    }

    const updatedSel = useUIStore.getState().selectedSlotIds;
    const canMerge = updatedSel.length > 1 && updatedSel.includes(slot.id);
    const canUnmerge = slot.colSpan > 1 || slot.rowSpan > 1;
    const hasProduct = !!slot.product;
    // Sağ tık daima menüyü açar — rol değiştirme her hücrede mümkün
    setContextMenu({ x: e.clientX, y: e.clientY, slot, canMerge: canMerge, canUnmerge, hasProduct });
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
      {contextMenu &&
        createPortal(
          <div
            id="context-menu-container"
            className="fixed z-99999 bg-surface-panel border border-border-strong shadow-2xl rounded-md py-1 min-w-37.5"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            {selection.type === 'footerCell' ? (
              <>
                <button
                  className="w-full text-left px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-subtle"
                  onClick={() => {
                    copyFooterSettings();
                    setContextMenu(null);
                  }}
                >
                  Stil Kopyala
                </button>
                {copiedFooterSettings !== null && (
                  <button
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-subtle"
                    onClick={() => {
                      pasteFooterSettings(pageNumber);
                      setContextMenu(null);
                    }}
                  >
                    Stil Yapıştır
                  </button>
                )}
              </>
            ) : selection.type === 'pageBackground' ? (
              <>
                <button
                  className="w-full text-left px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-subtle"
                  onClick={() => {
                    copyBackground(pageNumber);
                    setContextMenu(null);
                  }}
                >
                  Stil Kopyala
                </button>
                {copiedBackground !== null && (
                  <button
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-subtle"
                    onClick={() => {
                      pasteBackground(pageNumber);
                      setContextMenu(null);
                    }}
                  >
                    Stil Yapıştır
                  </button>
                )}
              </>
            ) : (
              <>
                {contextMenu.canMerge && (
                  <button
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-subtle"
                    onClick={() => {
                      mergeSelected(pageNumber, contextMenu.slot.id);
                      setContextMenu(null);
                    }}
                  >
                    Hücreleri Birleştir
                  </button>
                )}
                {contextMenu.canUnmerge && (
                  <button
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-subtle"
                    onClick={() => {
                      unmergeSlot(pageNumber, contextMenu.slot.id);
                      setContextMenu(null);
                    }}
                  >
                    Hücreyi Dağıt
                  </button>
                )}
                {contextMenu.hasProduct && (
                  <>
                    <button
                      className="w-full text-left px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-subtle"
                      onClick={() => {
                        moveSlotToTempPool(pageNumber, contextMenu.slot.id);
                        setContextMenu(null);
                      }}
                    >
                      Havuza Gönder
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      onClick={() => {
                        clearSlot(pageNumber, contextMenu.slot.id);
                        setContextMenu(null);
                      }}
                    >
                      Temizle
                    </button>
                  </>
                )}
                <div className="my-1 border-t border-border-default" />
                <button
                  className="w-full text-left px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-subtle"
                  onClick={() => {
                    const selIds = useUIStore.getState().selectedSlotIds;
                    if (!selIds.includes(contextMenu.slot.id)) {
                      useUIStore.getState().toggleSlotSelection(contextMenu.slot.id, false);
                    }
                    useCatalogStore.getState().copySlotSettings();
                    setContextMenu(null);
                  }}
                >
                  Stil Kopyala
                </button>
                {copiedSlotSettings !== null && (
                  <button
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-subtle"
                    onClick={() => {
                      const selIds = useUIStore.getState().selectedSlotIds;
                      if (!selIds.includes(contextMenu.slot.id)) {
                        useUIStore.getState().toggleSlotSelection(contextMenu.slot.id, false);
                      }
                      useCatalogStore.getState().pasteSlotSettings();
                      setContextMenu(null);
                    }}
                  >
                    Stil Yapıştır
                  </button>
                )}
                <div className="my-1 border-t border-border-default" />
                {contextMenu.slot && ((contextMenu.slot.role ?? 'product') === 'product' ? (
                  <button
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-subtle"
                    onClick={() => {
                      // toggleSlotRole selectedSlotIds'i kullaniyor — once secelim
                      useUIStore.getState().toggleSlotSelection(contextMenu.slot.id, false);
                      useCatalogStore.getState().toggleSlotRole('free');
                      setContextMenu(null);
                    }}
                  >
                    Serbest Alan Yap
                  </button>
                ) : (
                  <button
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                    onClick={() => {
                      useUIStore.getState().toggleSlotSelection(contextMenu.slot.id, false);
                      useCatalogStore.getState().toggleSlotRole('product');
                      setContextMenu(null);
                    }}
                  >
                    Ürün Hücresi Yap
                  </button>
                ))}
              </>
            )}
          </div>,
          document.body,
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
          const selection = useUIStore.getState().selection;
          const target = e.target as HTMLElement;
          const isSlot = target.closest('[data-slot-id]');
          const isFooter = target.closest('[data-footer-page]');

          if (isFooter) {
            if (selection.type === 'footerCell') {
              setContextMenu({
                x: e.clientX,
                y: e.clientY,
                slot: null as any,
                canMerge: false,
                canUnmerge: false,
                hasProduct: false,
              });
            }
          } else if (!isSlot) {
            selectPages([currentPage.id]);
            useUIStore.getState().setSelection({ type: 'pageBackground', ids: [String(pageNumber)] });

            setContextMenu({
              x: e.clientX,
              y: e.clientY,
              slot: null as any,
              canMerge: false,
              canUnmerge: false,
              hasProduct: false,
            });
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
