import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { StudioSlot } from '@matbaapro/shared';
import { useCatalogStore, useLayerStore, useUIStore } from '@/stores/studio';
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

export function Page({ pageNumber }: { pageNumber: number }) {
  const formas = useCatalogStore((s) => s.formas);
  const activeFormaId = useCatalogStore((s) => s.activeFormaId);
  const template = useCatalogStore((s) => s.activeTemplate);
  const gridGap = useCatalogStore((s) => s.globalSettings?.gridGap ?? 0);
  const defaultGrid = useCatalogStore((s) => s.globalSettings?.defaultGrid);
  const globalSettings = useCatalogStore((s) => s.globalSettings);
  const mergeSelected = useCatalogStore((s) => s.mergeSelected);
  const unmergeSlot = useCatalogStore((s) => s.unmergeSlot);
  const clearSlot = useCatalogStore((s) => s.clearSlot);
  const moveSlotToTempPool = useCatalogStore((s) => s.moveSlotToTempPool);
  const selectPages = useLayerStore((s) => s.selectPages);
  const selectedPageIds = useLayerStore((s) => s.selectedPageIds);
  const setEditingContent = useUIStore((s) => s.setEditingContent);

  const activeForma = formas.find((f) => f.id === activeFormaId);
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
    const sel = useUIStore.getState().selectedSlotIds;
    const canMerge = sel.length > 1 && sel.includes(slot.id);
    const canUnmerge = slot.colSpan > 1 || slot.rowSpan > 1;
    const hasProduct = !!slot.product;
    // Sağ tık daima menüyü açar — rol değiştirme her hücrede mümkün
    setContextMenu({ x: e.clientX, y: e.clientY, slot, canMerge, canUnmerge, hasProduct });
  };

  const currentPage = pages.find((p) => p.pageNumber === pageNumber);
  const pageConfig = template.pages.find((p) => p.pageNumber === pageNumber);
  if (!currentPage || !pageConfig) return null;

  const isSelected = selectedPageIds.includes(currentPage.id);
  const [mt, mr, , ml] = pageConfig.safeZone;

  const isFooterHidden = currentPage.footerMode === 'hidden';
  const activeFooter =
    currentPage.footerMode === 'custom' ? currentPage.customFooter : globalSettings.footer;
  const footerHeight = activeFooter?.heightMm ?? 18;
  const footerOffset = isFooterHidden ? 0 : footerHeight + 5;

  const totalColumns = currentPage.gridSettings?.cols ?? defaultGrid?.cols ?? 4;
  const configuredRows = currentPage.gridSettings?.rows ?? defaultGrid?.rows ?? 4;
  const totalRows = Math.max(configuredRows, Math.ceil(currentPage.slots.length / totalColumns));

  return (
    <>
      {contextMenu &&
        createPortal(
          <div
            id="context-menu-container"
            className="fixed z-[99999] bg-white border border-slate-300 shadow-2xl rounded-md py-1 min-w-[150px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            {contextMenu.canMerge && (
              <button
                className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50"
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
                className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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
                  className="w-full text-left px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
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
            <div className="my-1 border-t border-slate-200" />
            {(contextMenu.slot.role ?? 'product') === 'product' ? (
              <button
                className="w-full text-left px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50"
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
            )}
          </div>,
          document.body,
        )}

      <div
        id={`page-${currentPage.id}`}
        className={`physical-page relative shrink-0 border-r border-dashed border-slate-300 last:border-r-0 overflow-hidden ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{
          width: `${pageConfig.widthMm}mm`,
          height: `${template.openHeightMm}mm`,
          boxSizing: 'border-box',
          backgroundColor: 'transparent',
        }}
        data-hide-border-on-export="true"
        onClick={(e) => {
          setEditingContent(null);
          if (e.target !== e.currentTarget) return;
          if (e.ctrlKey || e.metaKey) {
            if (selectedPageIds.includes(currentPage.id))
              selectPages(selectedPageIds.filter((id) => id !== currentPage.id));
            else selectPages([...selectedPageIds, currentPage.id]);
          } else {
            selectPages([currentPage.id]);
          }
        }}
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
              gap: `${gridGap}mm`,
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
    </>
  );
}
