import { forwardRef, useEffect, useState } from 'react';
import type { BadgeConfig, CatalogSettings, StudioSlot } from '@matbaapro/shared';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import {
  BannerSection,
  PizzaSection,
  type BannerModuleData,
  type PizzaModuleData,
} from '../modules';
import {
  colorOpacityToCss,
  colorValueBackground,
  deepMerge,
  fontStyle,
  paddingStyle,
  radiusStyle,
  shadowStyle,
  splitPrice,
} from '../util/style';

function BadgeRenderer({ badge, scale }: { badge: BadgeConfig; scale: number }) {
  if (!badge.active) return null;

  const sizeRatio = badge.size / 100;
  const baseSize = 36 * scale * sizeRatio;
  const fontSize = 9 * scale * sizeRatio;
  const offset = 4 * scale;

  const positionStyle: React.CSSProperties = badge.isFreePosition
    ? { top: `${badge.posY}%`, left: `${badge.posX}%` }
    : (() => {
        switch (badge.position) {
          case 'top-right': return { top: offset, right: offset };
          case 'bottom-left': return { bottom: offset, left: offset };
          case 'bottom-right': return { bottom: offset, right: offset };
          default: return { top: offset, left: offset };
        }
      })();

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 40,
    pointerEvents: 'none',
    backgroundColor: badge.bgColor,
    color: badge.textColor,
    borderColor: badge.borderColor,
    borderWidth: badge.borderWidth * scale,
    borderStyle: 'solid',
    fontSize,
    fontWeight: badge.font?.fontWeight ?? 'bold',
    fontFamily: badge.font?.fontFamily ?? 'inherit',
    boxShadow: shadowStyle(badge.shadow),
    ...positionStyle,
  };

  if (badge.shape === 'circle') {
    return (
      <div
        style={{
          ...baseStyle,
          width: baseSize,
          height: baseSize,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          lineHeight: 1,
          overflow: 'hidden',
        }}
      >
        {badge.text}
      </div>
    );
  }

  if (badge.shape === 'pill') {
    return (
      <div
        style={{
          ...baseStyle,
          borderRadius: 9999,
          padding: `${2 * scale}px ${6 * scale * sizeRatio}px`,
          whiteSpace: 'nowrap',
          lineHeight: 1.2,
        }}
      >
        {badge.text}
      </div>
    );
  }

  if (badge.shape === 'burst') {
    const r = baseSize / 2;
    const points = Array.from({ length: 16 }, (_, i) => {
      const angle = (i * Math.PI) / 8 - Math.PI / 2;
      const radius = i % 2 === 0 ? r : r * 0.72;
      return `${r + radius * Math.cos(angle)},${r + radius * Math.sin(angle)}`;
    }).join(' ');
    return (
      <div style={{ ...positionStyle, position: 'absolute', zIndex: 40, pointerEvents: 'none', width: baseSize, height: baseSize }}>
        <svg viewBox={`0 0 ${baseSize} ${baseSize}`} width={baseSize} height={baseSize}>
          <polygon points={points} fill={badge.bgColor} stroke={badge.borderColor} strokeWidth={badge.borderWidth * scale} />
          <text
            x={r}
            y={r}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={badge.textColor}
            fontSize={fontSize}
            fontWeight={String(badge.font?.fontWeight ?? 'bold')}
            fontFamily={badge.font?.fontFamily ?? 'inherit'}
          >
            {badge.text}
          </text>
        </svg>
      </div>
    );
  }

  if (badge.shape === 'flama') {
    return (
      <div
        style={{
          ...baseStyle,
          padding: `${3 * scale * sizeRatio}px ${8 * scale * sizeRatio}px ${8 * scale * sizeRatio}px`,
          clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          borderRadius: 2,
        }}
      >
        {badge.text}
      </div>
    );
  }

  if (badge.shape === 'banner') {
    const ribbonW = baseSize * 1.4;
    const isRight = badge.position === 'top-right' || badge.position === 'bottom-right';
    const isBottom = badge.position === 'bottom-left' || badge.position === 'bottom-right';
    const rotate = isRight === isBottom ? -45 : 45;
    return (
      <div
        style={{
          ...positionStyle,
          position: 'absolute',
          zIndex: 40,
          pointerEvents: 'none',
          width: ribbonW,
          height: ribbonW,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: ribbonW * 1.5,
            backgroundColor: badge.bgColor,
            color: badge.textColor,
            borderColor: badge.borderColor,
            borderWidth: badge.borderWidth * scale,
            borderStyle: 'solid',
            fontSize,
            fontWeight: badge.font?.fontWeight ?? 'bold',
            fontFamily: badge.font?.fontFamily ?? 'inherit',
            textAlign: 'center',
            padding: `${2 * scale}px 0`,
            transform: `rotate(${rotate}deg)`,
            top: ribbonW * 0.35,
            ...(isRight ? { right: -ribbonW * 0.25 } : { left: -ribbonW * 0.25 }),
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {badge.text}
        </div>
      </div>
    );
  }

  // rectangle (default)
  return (
    <div
      style={{
        ...baseStyle,
        borderRadius: 2,
        padding: `${2 * scale}px ${5 * scale * sizeRatio}px`,
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
      }}
    >
      {badge.text}
    </div>
  );
}

interface SlotProps {
  slot: StudioSlot;
  pageNumber: number;
  slotIndex: number;
  globalNumber: number;
  onContextMenu: (e: React.MouseEvent, slot: StudioSlot) => void;
  gridPosition?: { colStart: number; rowStart: number };
  totalRows?: number;
  totalColumns?: number;
}

export const Slot = forwardRef<HTMLDivElement, SlotProps>(function Slot(
  { slot, pageNumber, slotIndex, globalNumber, onContextMenu, gridPosition, totalRows, totalColumns },
  ref,
) {
  const globalSettings = useCatalogStore((s) => s.globalSettings);
  const swapSlotContents = useCatalogStore((s) => s.swapSlotContents);
  const setSlotProduct = useCatalogStore((s) => s.setSlotProduct);
  const updateSlotProduct = useCatalogStore((s) => s.updateSlotProduct);
  const updateSlotImageSettings = useCatalogStore((s) => s.updateSlotImageSettings);
  const disableAllImageEditModes = useCatalogStore((s) => s.disableAllImageEditModes);

  const selectedSlotIds = useUIStore((s) => s.selectedSlotIds);
  const toggleSlotSelection = useUIStore((s) => s.toggleSlotSelection);
  const selectedTextElement = useUIStore((s) => s.selectedTextElement);
  const setSelectedTextElement = useUIStore((s) => s.setSelectedTextElement);
  const editingContent = useUIStore((s) => s.editingContent);
  const setEditingContent = useUIStore((s) => s.setEditingContent);

  const [isOver, setIsOver] = useState(false);
  const [editingText, setEditingText] = useState<'name' | 'price' | null>(null);
  const [imgDrag, setImgDrag] = useState({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialPosX: 0,
    initialPosY: 0,
    currentX: 0,
    currentY: 0,
  });

  const finalSettings: CatalogSettings =
    slot.isCustom && slot.customSettings
      ? (deepMerge(JSON.parse(JSON.stringify(globalSettings)), slot.customSettings as Partial<CatalogSettings>) as CatalogSettings)
      : globalSettings;

  const imgSettings = slot.imageSettings ?? {};
  const isImgEditMode = imgSettings.editMode ?? false;
  const currentPosX = imgSettings.posX ?? 0;
  const currentPosY = imgSettings.posY ?? 0;
  const currentScale = imgSettings.scale ?? 100;

  useEffect(() => {
    if (!imgDrag.isDragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - imgDrag.startX;
      const dy = e.clientY - imgDrag.startY;
      setImgDrag((p) => ({ ...p, currentX: p.initialPosX + dx, currentY: p.initialPosY + dy }));
    };
    const onUp = () => {
      updateSlotImageSettings(pageNumber, slot.id, {
        posX: imgDrag.currentX,
        posY: imgDrag.currentY,
      });
      setImgDrag((p) => ({ ...p, isDragging: false }));
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [imgDrag, pageNumber, slot.id, updateSlotImageSettings]);

  const isSelected = selectedSlotIds.includes(slot.id);

  // === scale clamp for spans ===
  const baseCols = 4;
  const baseRows = 4;
  const currentCols = totalColumns ?? 4;
  const currentRows = totalRows ?? 4;
  const widthRatio = slot.colSpan / currentCols;
  const heightRatio = slot.rowSpan / currentRows;
  const scaleX = widthRatio / (1 / baseCols);
  const scaleY = heightRatio / (1 / baseRows);
  const trueScale = Math.min(scaleX, scaleY);
  const clampedScale = Math.max(0.4, Math.min(3, trueScale));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const newModuleType = e.dataTransfer.getData('newModuleType');
    if (newModuleType) {
      if (slot.role !== 'free') useCatalogStore.getState().toggleSlotRole('free');
      useCatalogStore
        .getState()
        .setSlotModule(pageNumber, slot.id, newModuleType as 'banner' | 'pizza');
      return;
    }
    // User module: store'da kayıtlı modül datasını doğrudan slot'a koy.
    const userModuleRaw = e.dataTransfer.getData('newUserModuleData');
    if (userModuleRaw) {
      const data = JSON.parse(userModuleRaw) as { type: 'banner' | 'pizza' };
      if (slot.role !== 'free') useCatalogStore.getState().toggleSlotRole('free');
      useCatalogStore.getState().updateSlotModuleData(pageNumber, slot.id, null);
      // Önce moduleType'ı set et (initial data'yı yüklemeden), sonra data'yı override et.
      useCatalogStore.setState((state) => {
        const formas = state.formas.map((f) =>
          f.id === state.activeFormaId
            ? {
                ...f,
                pages: f.pages.map((p) =>
                  p.pageNumber === pageNumber
                    ? {
                        ...p,
                        slots: p.slots.map((s) =>
                          s.id === slot.id
                            ? { ...s, moduleType: data.type, moduleData: data }
                            : s,
                        ),
                      }
                    : p,
                ),
              }
            : f,
        );
        return { formas };
      });
      return;
    }
    if (slot.role === 'free') return;

    const sku = e.dataTransfer.getData('sourceTempPoolSku');
    if (sku) {
      const tempPool = useCatalogStore.getState().tempProductPool;
      const tp = tempPool.find((p) => p.sku === sku);
      if (tp) {
        if (slot.product)
          useCatalogStore.getState().addToTempPool(slot.product, pageNumber, slot.id);
        useCatalogStore.getState().setSlotProduct(pageNumber, slot.id, tp);
      }
      return;
    }
    const newProduct = e.dataTransfer.getData('newProductFromSidebar');
    if (newProduct) {
      // Mevcut ürünü her zaman temp pool'a alıp yenisini yerleştir
      if (slot.product)
        useCatalogStore.getState().addToTempPool(slot.product, pageNumber, slot.id);
      setSlotProduct(pageNumber, slot.id, JSON.parse(newProduct));
      return;
    }
    const sPage = parseInt(e.dataTransfer.getData('sourcePage'), 10);
    const sIdx = parseInt(e.dataTransfer.getData('sourceIndex'), 10);
    if (!isNaN(sPage) && (sPage !== pageNumber || sIdx !== slotIndex))
      swapSlotContents(sPage, sIdx, pageNumber, slotIndex);
  };

  const handleImgMouseDown = (e: React.MouseEvent) => {
    if (!isImgEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    setImgDrag({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: currentPosX,
      initialPosY: currentPosY,
      currentX: currentPosX,
      currentY: currentPosY,
    });
  };

  const displayX = imgDrag.isDragging ? imgDrag.currentX : currentPosX;
  const displayY = imgDrag.isDragging ? imgDrag.currentY : currentPosY;
  const displayScale = currentScale / 100;
  const boxShadow = shadowStyle(finalSettings.shadows.cell);

  // === Free slot positioning override ===
  let freeStyles: React.CSSProperties = {};
  if (slot.role === 'free' && gridPosition) {
    const R = totalRows ?? 4;
    const C = totalColumns ?? 4;
    const r = gridPosition.rowStart - 1;
    const c = gridPosition.colStart - 1;
    freeStyles = {
      position: 'absolute',
      gridColumn: '1 / -1',
      gridRow: '1 / -1',
      top: `${(r / R) * 100}%`,
      left: `${(c / C) * 100}%`,
      width: `${(slot.colSpan / C) * 100}%`,
      height: `${(slot.rowSpan / R) * 100}%`,
      zIndex: 40,
      margin: 0,
    };
  }

  return (
    <div
      ref={ref}
      id={`slot-${slot.id}`}
      onClick={(e) => {
        e.stopPropagation();
        if (editingContent?.slotId === slot.id) return;
        if (editingContent) setEditingContent(null);
        if (!isSelected || selectedSlotIds.length > 1) {
          disableAllImageEditModes();
        }
        toggleSlotSelection(slot.id, e.ctrlKey || e.metaKey);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (slot.role === 'free' && slot.moduleData) {
          const md = slot.moduleData as { type?: string };
          if (md.type === 'banner' || md.type === 'pizza')
            setEditingContent({ slotId: slot.id, contentType: md.type });
        } else if (slot.role === 'product') {
          setEditingContent({ slotId: slot.id, contentType: 'product' });
        }
      }}
      onContextMenu={(e) => onContextMenu(e, slot)}
      draggable={!!slot.product && !isSelected && !isImgEditMode}
      onDragStart={(e) => {
        e.dataTransfer.setData('sourcePage', String(pageNumber));
        e.dataTransfer.setData('sourceIndex', String(slotIndex));
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      className={`product-slot pointer-events-auto relative overflow-hidden border border-solid transition-all h-full w-full min-w-12.5 min-h-12.5 cursor-pointer ${
        isSelected
          ? 'z-50 border-2 border-border-selected bg-surface-subtle shadow-2xl'
          : isOver
            ? 'border-border-strong scale-[0.98] z-20'
            : 'hover:border-border-strong z-10'
      }`}
      style={{
        gridColumn: gridPosition
          ? `${gridPosition.colStart} / span ${slot.colSpan}`
          : `span ${slot.colSpan}`,
        gridRow: gridPosition
          ? `${gridPosition.rowStart} / span ${slot.rowSpan}`
          : `span ${slot.rowSpan}`,
        borderRadius: radiusStyle(finalSettings.radiuses.cell),
        ...colorValueBackground(finalSettings.colors.cellBg),
        borderColor: colorOpacityToCss(finalSettings.colors.cellBorder),
        borderWidth: `${finalSettings.borderWidth}px`,
        boxShadow: isSelected ? undefined : boxShadow,
        padding: paddingStyle(finalSettings.spacings.cell),
        ...freeStyles,
      }}
    >
      <div
        data-hide-on-export="true"
        className="absolute top-0 left-0 p-1 text-[11px] font-black text-slate-400/50 pointer-events-none z-50"
      >
        {globalNumber || ''}
      </div>

      {slot.role === 'free' && (
        <div className="w-full h-full flex flex-col relative z-20 overflow-hidden pointer-events-auto rounded-[inherit]">
          {!slot.moduleData ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-surface-subtle border-2 border-dashed border-border-strong pointer-events-none">
              <span className="text-text-muted font-bold text-[14px] uppercase tracking-widest">
                SERBEST ALAN
              </span>
              <span className="text-[9px] text-text-muted mt-1">Modül Sürükleyin</span>
            </div>
          ) : (
            <div
              className={`absolute inset-0 ${editingContent?.slotId === slot.id ? 'pointer-events-auto' : 'pointer-events-none'}`}
            >
              {(slot.moduleData as { type?: string })?.type === 'banner' ? (
                <BannerSection
                  instanceData={slot.moduleData as BannerModuleData}
                  slotId={slot.id}
                  pageNumber={pageNumber}
                />
              ) : (slot.moduleData as { type?: string })?.type === 'pizza' ? (
                <PizzaSection
                  instanceData={slot.moduleData as PizzaModuleData}
                  slotId={slot.id}
                  pageNumber={pageNumber}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-500 font-bold border border-red-200 text-xs">
                  Bilinmeyen Modül
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {slot.role !== 'free' && !slot.product && (
        <div className="w-full h-full flex items-center justify-center pointer-events-none">
          <span className="text-[10px] text-slate-200 font-bold uppercase tracking-widest">
            Boş Hücre
          </span>
        </div>
      )}

      {slot.role !== 'free' && (
        <BadgeRenderer badge={finalSettings.badge} scale={clampedScale} />
      )}

      {slot.role !== 'free' && slot.product && (
        <div
          className={`w-full h-full flex flex-col min-w-0 min-h-0 ${
            editingContent?.slotId === slot.id ? 'opacity-100' : isSelected ? 'opacity-75' : ''
          }`}
        >
          {/* Price box */}
          <div
            className={`absolute top-0 z-30 flex shadow-sm transition-all px-1.5 py-1 pointer-events-auto outline-none ${
              selectedTextElement?.slotId === slot.id && selectedTextElement?.elementType === 'price'
                ? 'ring-2 ring-border-selected ring-offset-1 cursor-text'
                : 'cursor-pointer hover:ring-1 hover:ring-border-strong'
            } ${
              finalSettings.pricePosition === 'left'
                ? 'left-0'
                : finalSettings.pricePosition === 'center'
                  ? 'left-1/2 -translate-x-1/2'
                  : 'right-0'
            }`}
            style={{
              width: `${finalSettings.priceWidth}%`,
              height: `${finalSettings.priceHeight * clampedScale}mm`,
              ...colorValueBackground(finalSettings.colors.priceBg),
              borderRadius: radiusStyle(finalSettings.radiuses.price),
              borderStyle: 'solid',
              borderWidth: `${(finalSettings.priceBorderWidth || 0) * clampedScale}px`,
              borderColor: colorOpacityToCss(finalSettings.colors.priceBorder),
              ...fontStyle({
                ...finalSettings.fonts.price,
                fontSize: finalSettings.fonts.price.fontSize * clampedScale,
              }),
            }}
            onClick={(e) => {
              e.stopPropagation();
              toggleSlotSelection(slot.id, e.ctrlKey || e.metaKey);
              setSelectedTextElement({ slotId: slot.id, elementType: 'price' });
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingText('price');
            }}
          >
            {editingText === 'price' ? (
              <div
                contentEditable
                suppressContentEditableWarning
                className="w-full h-full flex items-center justify-center text-center outline-none bg-white/90 text-black rounded"
                onBlur={(e) => {
                  updateSlotProduct(pageNumber, slot.id, { price: e.currentTarget.innerText });
                  setEditingText(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Escape') {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
                ref={(el) => {
                  if (el && document.activeElement !== el) {
                    el.focus();
                    const sel = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(el);
                    range.collapse(false);
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                  }
                }}
              >
                {String(slot.product.price ?? '')}
              </div>
            ) : (
              <div className="flex items-start pointer-events-none">
                <span style={{ lineHeight: '0.8' }}>{splitPrice(slot.product.price).main},</span>
                <span
                  style={{
                    fontSize: `${finalSettings.fonts.price.decimalScale}%`,
                    verticalAlign: 'top',
                    lineHeight: '1em',
                    marginLeft: '2px',
                  }}
                >
                  {splitPrice(slot.product.price).decimal}
                </span>
              </div>
            )}
          </div>

          {/* Image */}
          <div
            title={slot.product.sku ?? ''}
            className="flex-1 flex items-center justify-center min-h-0 min-w-0 mb-2 mt-6 pointer-events-auto relative z-10 overflow-hidden"
          >
            {slot.product.image ? (
              <img
                src={slot.product.image}
                onMouseDown={handleImgMouseDown}
                draggable={false}
                className="max-w-full max-h-full object-contain select-none"
                style={{
                  transform: `translate(${displayX}px, ${displayY}px) scale(${displayScale})`,
                  cursor: isImgEditMode ? 'grab' : 'default',
                }}
              />
            ) : (
              <div className="text-[8px] text-slate-300 italic uppercase">Resim Yok</div>
            )}
          </div>

          {/* Name */}
          <div
            className="shrink-0 w-full flex pointer-events-auto relative z-20"
            style={{
              height: `${3 * (finalSettings.fonts.productName.lineHeight || 1.2)}em`,
              ...fontStyle({
                ...finalSettings.fonts.productName,
                fontSize: finalSettings.fonts.productName.fontSize * clampedScale,
              }),
            }}
          >
            <div
              className={`w-full h-full outline-none transition-all ${
                editingText === 'name'
                  ? 'bg-white/90 text-black z-50 ring-2 ring-border-selected overflow-hidden whitespace-pre-wrap rounded cursor-text'
                  : 'line-clamp-3 whitespace-pre-wrap hover:ring-1 hover:ring-border-strong'
              } ${
                selectedTextElement?.slotId === slot.id &&
                selectedTextElement?.elementType === 'name' &&
                editingText !== 'name'
                  ? 'ring-2 ring-border-selected'
                  : ''
              }`}
              contentEditable={editingText === 'name'}
              suppressContentEditableWarning
              onClick={(e) => {
                e.stopPropagation();
                if (editingText !== 'name') {
                  toggleSlotSelection(slot.id, e.ctrlKey || e.metaKey);
                  setSelectedTextElement({ slotId: slot.id, elementType: 'name' });
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingText('name');
              }}
              onBlur={(e) => {
                updateSlotProduct(pageNumber, slot.id, { name: e.currentTarget.innerText });
                setEditingText(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  e.currentTarget.blur();
                } else if (e.key === 'Enter') {
                  const text = e.currentTarget.innerText || '';
                  const newlines = (text.match(/\n/g) || []).length;
                  if (newlines >= 2) e.preventDefault();
                }
              }}
              ref={(el) => {
                if (editingText === 'name' && el && document.activeElement !== el) {
                  el.focus();
                  const sel = window.getSelection();
                  const range = document.createRange();
                  range.selectNodeContents(el);
                  range.collapse(false);
                  sel?.removeAllRanges();
                  sel?.addRange(range);
                }
              }}
            >
              {slot.product.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
