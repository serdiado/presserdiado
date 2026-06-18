import { forwardRef, useEffect, useState } from 'react';
import { Pencil, Move } from 'lucide-react';
import type { BadgeConfig, CatalogSettings, StudioSlot } from '@matbaapro/shared';
import { DragHandle } from './DragHandle';
import { createProductDragImage } from '../utils/dragImage';
import { useCatalogStore, useHistoryStore, useUIStore } from '@/stores/studio';
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

function BadgeRenderer({ badge, scale, slotId }: { badge: BadgeConfig; scale: number; slotId?: string }) {
  if (!badge.active) return null;

  const sizeRatio = badge.size / 100;
  const baseSize = 36 * scale * sizeRatio;
  const fontSize = 9 * scale * sizeRatio;

  const baseStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 40,
    pointerEvents: 'none',
    backgroundColor: colorOpacityToCss({ c: badge.bgColor, o: badge.bgOpacity ?? 100 }),
    color: colorOpacityToCss({ c: badge.font?.color ?? '#000000', o: badge.font?.opacity ?? 100 }),
    borderColor: colorOpacityToCss({ c: badge.borderColor, o: badge.borderOpacity ?? 100 }),
    borderWidth: badge.borderWidth * scale,
    borderStyle: 'solid',
    fontSize,
    fontWeight: badge.font?.fontWeight ?? 'bold',
    fontFamily: badge.font?.fontFamily ?? 'inherit',
    boxShadow: shadowStyle(badge.shadow),
    textAlign: badge.font?.textAlign ?? 'center',
    textDecoration: badge.font?.textDecoration ?? 'none',
    textTransform: badge.font?.textTransform ?? 'none',
    display: 'flex',
    alignItems: badge.font?.verticalAlign === 'top' ? 'flex-start' : badge.font?.verticalAlign === 'middle' ? 'center' : badge.font?.verticalAlign === 'bottom' ? 'flex-end' : 'center',
    justifyContent: badge.font?.textAlign === 'left' ? 'flex-start' : badge.font?.textAlign === 'center' ? 'center' : badge.font?.textAlign === 'right' ? 'flex-end' : 'center',
  };

  if (badge.shape === 'circle') {
    return (
      <div
        style={{
          ...baseStyle,
          width: baseSize,
          height: baseSize,
          borderRadius: '50%',
          lineHeight: 1,
          overflow: 'hidden',
          padding: `${2 * scale}px`,
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
    const clipId = slotId ? `burst-clip-${slotId}` : `burst-clip-temp`;
    return (
      <div style={{ position: 'relative', zIndex: 40, pointerEvents: 'none', width: baseSize, height: baseSize }}>
        <svg viewBox={`0 0 ${baseSize} ${baseSize}`} width={baseSize} height={baseSize}>
          <defs>
            <clipPath id={clipId}>
              <polygon points={points} />
            </clipPath>
          </defs>
          <polygon
            points={points}
            fill={colorOpacityToCss({ c: badge.bgColor, o: badge.bgOpacity ?? 100 })}
            stroke={colorOpacityToCss({ c: badge.borderColor, o: badge.borderOpacity ?? 100 })}
            strokeWidth={badge.borderWidth * scale * 2}
            clipPath={`url(#${clipId})`}
          />
          <text
            x={r}
            y={r}
            textAnchor={
              badge.font?.textAlign === 'left'
                ? 'start'
                : badge.font?.textAlign === 'center'
                ? 'middle'
                : badge.font?.textAlign === 'right'
                ? 'end'
                : 'middle'
            }
            dominantBaseline="central"
            fill={colorOpacityToCss({ c: badge.font?.color ?? '#000000', o: badge.font?.opacity ?? 100 })}
            fontSize={fontSize}
            fontWeight={String(badge.font?.fontWeight ?? 'bold')}
            fontFamily={badge.font?.fontFamily ?? 'inherit'}
            style={{
              textDecoration: badge.font?.textDecoration ?? 'none',
              textTransform: badge.font?.textTransform ?? 'none',
            }}
          >
            {badge.text}
          </text>
        </svg>
      </div>
    );
  }

  if (badge.shape === 'flama') {
    const borderW = badge.borderWidth * scale;
    return (
      <div
        style={{
          ...baseStyle,
          position: 'relative',
          zIndex: 40,
          pointerEvents: 'none',
          boxShadow: shadowStyle(badge.shadow),
          padding: `${4 * scale * sizeRatio}px ${8 * scale * sizeRatio}px ${12 * scale * sizeRatio}px`,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            overflow: 'visible',
          }}
        >
          <polygon
            points="0,0 100,0 100,70 50,100 0,70"
            fill={colorOpacityToCss({ c: badge.bgColor, o: badge.bgOpacity ?? 100 })}
            stroke={colorOpacityToCss({ c: badge.borderColor, o: badge.borderOpacity ?? 100 })}
            strokeWidth={borderW}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span style={{ position: 'relative', zIndex: 10 }}>{badge.text}</span>
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
          position: 'relative',
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
            backgroundColor: colorOpacityToCss({ c: badge.bgColor, o: badge.bgOpacity ?? 100 }),
            color: colorOpacityToCss({ c: badge.font?.color ?? '#000000', o: badge.font?.opacity ?? 100 }),
            borderColor: colorOpacityToCss({ c: badge.borderColor, o: badge.borderOpacity ?? 100 }),
            borderWidth: badge.borderWidth * scale,
            borderStyle: 'solid',
            fontSize,
            fontWeight: badge.font?.fontWeight ?? 'bold',
            fontFamily: badge.font?.fontFamily ?? 'inherit',
            textAlign: badge.font?.textAlign ?? 'center',
            textDecoration: badge.font?.textDecoration ?? 'none',
            textTransform: badge.font?.textTransform ?? 'none',
            padding: `${2 * scale}px 0`,
            transform: `rotate(${rotate}deg)`,
            top: ribbonW * 0.35,
            ...(isRight ? { right: -ribbonW * 0.25 } : { left: -ribbonW * 0.25 }),
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            display: 'flex',
            alignItems: badge.font?.verticalAlign === 'top' ? 'flex-start' : badge.font?.verticalAlign === 'middle' ? 'center' : badge.font?.verticalAlign === 'bottom' ? 'flex-end' : 'center',
            justifyContent: badge.font?.textAlign === 'left' ? 'flex-start' : badge.font?.textAlign === 'center' ? 'center' : badge.font?.textAlign === 'right' ? 'flex-end' : 'center',
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
  const updateSlotCustomSettings = useCatalogStore((s) => s.updateSlotCustomSettings);
  const updateGlobalSettings = useCatalogStore((s) => s.updateGlobalSettings);

  const selectedSlotIds = useUIStore((s) => s.selectedSlotIds);
  const toggleSlotSelection = useUIStore((s) => s.toggleSlotSelection);
  const toggleElementSelection = useUIStore((s) => s.toggleElementSelection);
  const selectedTextElement = useUIStore((s) => s.selectedTextElement);
  const isNameSelected = selectedTextElement?.slotId === slot.id && selectedTextElement?.elementType === 'name';
  const setSelectedTextElement = useUIStore((s) => s.setSelectedTextElement);
  const editingContent = useUIStore((s) => s.editingContent);
  const setEditingContent = useUIStore((s) => s.setEditingContent);
  const enterIsolation = useUIStore((s) => s.enterIsolation);
  const isoSession = useHistoryStore((s) => s.isoSession);
  // İzolasyon krom (tek isoSession kapısı): bu modül izoleyken normal; diğer her şey soluk (dim).
  const isThisIsolated = isoSession?.slotId === slot.id;
  const isDimmedByIsolation = !!isoSession && !isThisIsolated;
  const activeBadgeMoveSlotId = useUIStore((s) => s.activeBadgeMoveSlotId);
  const userScale = useUIStore((s) => s.userScale);
  const isPreviewMode = useUIStore((s) => s.isPreviewMode);

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
  const [badgeDragState, setBadgeDragState] = useState({
    isDragging: false,
    x: 0,
    y: 0,
  });
  const [nameDragState, setNameDragState] = useState({
    isDragging: false,
    x: 50,
    y: 50,
  });
  const [priceDragState, setPriceDragState] = useState({
    isDragging: false,
    x: 50,
    y: 50,
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
      const dx = (e.clientX - imgDrag.startX) / userScale;
      const dy = (e.clientY - imgDrag.startY) / userScale;
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
  }, [imgDrag, pageNumber, slot.id, updateSlotImageSettings, userScale]);

  useEffect(() => {
    if (!isImgEditMode) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Element;

      const isContextualBar = target.closest('#contextual-bar');
      const isImage = target.closest(`#slot-${slot.id} img`);

      if (!isContextualBar && !isImage) {
        disableAllImageEditModes();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick, true);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true);
    };
  }, [isImgEditMode, slot.id, disableAllImageEditModes]);

  const handleBadgeMouseDown = (e: React.MouseEvent) => {
    if (!slot.isCustom) return;
    const badge = finalSettings.badge;
    const isMoveActive = activeBadgeMoveSlotId === slot.id;
    if (!badge.isFreePosition || !isMoveActive) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialPosX = badge.posX ?? 0;
    const initialPosY = badge.posY ?? 0;

    let currentX = initialPosX;
    let currentY = initialPosY;

    setBadgeDragState({
      isDragging: true,
      x: initialPosX,
      y: initialPosY,
    });

    const slotEl = document.getElementById(`slot-${slot.id}`);
    if (!slotEl) return;
    const rect = slotEl.getBoundingClientRect();

    let rafId: number | null = null;

    const onMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      currentX = Math.max(0, Math.min(100, initialPosX + (dx / rect.width) * 100));
      currentY = Math.max(0, Math.min(100, initialPosY + (dy / rect.height) * 100));

      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setBadgeDragState({ isDragging: true, x: currentX, y: currentY });
        rafId = null;
      });
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);

      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      const pages = useCatalogStore.getState().getActivePages();
      const newPages = pages.map((p) => {
        if (p.pageNumber === pageNumber) {
          return {
            ...p,
            slots: p.slots.map((s) => {
              if (s.id === slot.id) {
                const currentSettings = s.customSettings ?? useCatalogStore.getState().globalSettings;
                return {
                  ...s,
                  isCustom: true,
                  customSettings: {
                    ...currentSettings,
                    badge: {
                      ...(currentSettings.badge ?? {}),
                      posX: currentX,
                      posY: currentY,
                    },
                  },
                };
              }
              return s;
            }),
          };
        }
        return p;
      });
      useCatalogStore.getState().setActivePages(newPages);
      setBadgeDragState({ isDragging: false, x: 0, y: 0 });
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleNameMouseDown = (e: React.MouseEvent) => {
    if (editingText === 'name') return;
    if (!slot.isCustom) return;
    if (!isNameSelected) return;

    e.preventDefault();
    e.stopPropagation();

    const nameSettings = finalSettings.nameSettings || { isFreePosition: false, posX: 50, posY: 50 };
    const slotEl = document.getElementById(`slot-${slot.id}`);
    const nameEl = e.currentTarget as HTMLElement;
    if (!slotEl) return;

    const slotRect = slotEl.getBoundingClientRect();
    const nameRect = nameEl.getBoundingClientRect();

    let initialPosX = nameSettings.posX ?? 50;
    let initialPosY = nameSettings.posY ?? 50;

    const textAlign = finalSettings.fonts.productName.textAlign;

    if (!nameSettings.isFreePosition) {
      initialPosX = ((nameRect.left + nameRect.width / 2) - slotRect.left) / slotRect.width * 100;
      initialPosY = ((nameRect.top + nameRect.height / 2) - slotRect.top) / slotRect.height * 100;

      const patch = {
        nameSettings: {
          ...nameSettings,
          isFreePosition: true,
          posX: initialPosX,
          posY: initialPosY,
        },
      };
      if (slot.isCustom) {
        updateSlotCustomSettings(patch);
      } else {
        updateGlobalSettings(patch);
      }
    }

    const startX = e.clientX;
    const startY = e.clientY;

    let currentX = initialPosX;
    let currentY = initialPosY;

    setNameDragState({
      isDragging: true,
      x: initialPosX,
      y: initialPosY,
    });

    const minX = (nameRect.width / 2 / slotRect.width) * 100;
    const maxX = 100 - (nameRect.width / 2 / slotRect.width) * 100;

    const minY = (nameRect.height / 2 / slotRect.height) * 100;
    const maxY = 100 - minY;

    let rafId: number | null = null;

    const onMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const percentX = (dx / slotRect.width) * 100;
      const percentY = (dy / slotRect.height) * 100;

      currentX = Math.max(minX, Math.min(maxX, initialPosX + percentX));
      currentY = Math.max(minY, Math.min(maxY, initialPosY + percentY));

      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setNameDragState({ isDragging: true, x: currentX, y: currentY });
        rafId = null;
      });
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);

      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      if (slot.isCustom) {
        updateSlotCustomSettings({
          nameSettings: { isFreePosition: true, posX: currentX, posY: currentY },
        });
      } else {
        updateGlobalSettings({
          nameSettings: { isFreePosition: true, posX: currentX, posY: currentY },
        });
      }
      setNameDragState({ isDragging: false, x: currentX, y: currentY });
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handlePriceMouseDown = (e: React.MouseEvent) => {
    if (editingText === 'price') return;
    if (!slot.isCustom) return;
    const isPriceSelected = selectedTextElement?.slotId === slot.id && selectedTextElement?.elementType === 'price';
    if (!isPriceSelected) return;

    e.preventDefault();
    e.stopPropagation();

    const priceSettings = finalSettings.priceSettings || { isFreePosition: false, posX: 50, posY: 50 };
    const slotEl = document.getElementById(`slot-${slot.id}`);
    const priceEl = e.currentTarget as HTMLElement;
    if (!slotEl) return;

    const slotRect = slotEl.getBoundingClientRect();
    const priceRect = priceEl.getBoundingClientRect();

    let initialPosX = priceSettings.posX ?? 50;
    let initialPosY = priceSettings.posY ?? 50;

    if (!priceSettings.isFreePosition) {
      initialPosX = ((priceRect.left + priceRect.width / 2) - slotRect.left) / slotRect.width * 100;
      initialPosY = ((priceRect.top + priceRect.height / 2) - slotRect.top) / slotRect.height * 100;

      const patch = {
        priceSettings: {
          ...priceSettings,
          isFreePosition: true,
          posX: initialPosX,
          posY: initialPosY,
        },
      };
      if (slot.isCustom) {
        updateSlotCustomSettings(patch);
      } else {
        updateGlobalSettings(patch);
      }
    }

    const startX = e.clientX;
    const startY = e.clientY;

    let currentX = initialPosX;
    let currentY = initialPosY;

    setPriceDragState({
      isDragging: true,
      x: initialPosX,
      y: initialPosY,
    });

    const minX = (priceRect.width / 2 / slotRect.width) * 100;
    const maxX = 100 - (priceRect.width / 2 / slotRect.width) * 100;

    const minY = (priceRect.height / 2 / slotRect.height) * 100;
    const maxY = 100 - minY;

    let rafId: number | null = null;

    const onMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const percentX = (dx / slotRect.width) * 100;
      const percentY = (dy / slotRect.height) * 100;

      currentX = Math.max(minX, Math.min(maxX, initialPosX + percentX));
      currentY = Math.max(minY, Math.min(maxY, initialPosY + percentY));

      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setPriceDragState({ isDragging: true, x: currentX, y: currentY });
        rafId = null;
      });
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);

      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      if (slot.isCustom) {
        updateSlotCustomSettings({
          priceSettings: { isFreePosition: true, posX: currentX, posY: currentY },
        });
      } else {
        updateGlobalSettings({
          priceSettings: { isFreePosition: true, posX: currentX, posY: currentY },
        });
      }
      setPriceDragState({ isDragging: false, x: currentX, y: currentY });
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const isSelected = selectedSlotIds.includes(slot.id);
  const isModuleSlot = slot.role === 'free' && !!slot.moduleData;

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
    // İzolasyon aktifken drop/apply doğrudan moduleData setState'i yapar (yönlendirmeyi atlar) →
    // ÖNCE commit-exit et ki düzenleme oturumu tek atomik adım kalsın, drop ayrı adım olsun.
    if (useHistoryStore.getState().isoSession) useUIStore.getState().exitIsolation();
    // EN ÖNCE — kütüphane örneği (free veya product slota inebilir). Diğer tüm
    // anahtarlardan ve role==='free' check'inden ÖNCE; koşulsuz return.
    const studioModuleId = e.dataTransfer.getData('studioModuleId');
    if (studioModuleId) {
      useCatalogStore.getState().applyStudioModule(pageNumber, slot.id, studioModuleId);
      return;
    }
    const newModuleType = e.dataTransfer.getData('newModuleType');
    if (newModuleType) {
      // Rol dönüşümü + modül atama + tek forced saveState'i setSlotModule yapar
      // (slot.id hedefli; selectedSlotIds DEĞİL — Bug 2). toggleSlotRole çağrılmaz.
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
      useCatalogStore.getState().setIsDirty(true);
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
    freeStyles = {
      zIndex: 40,
    };
  }

  return (
    <div
      ref={ref}
      id={`slot-${slot.id}`}
      onClick={(e) => {
        if (isPreviewMode) return;
        e.stopPropagation();
        if (editingContent?.slotId === slot.id) return;
        if (editingContent) setEditingContent(null);
        if (!isSelected || selectedSlotIds.length > 1) {
          disableAllImageEditModes();
        }
        toggleSlotSelection(slot.id, e.ctrlKey || e.metaKey);
      }}
      onDoubleClick={(e) => {
        if (isPreviewMode) return;
        e.stopPropagation();
        if (slot.role === 'free' && slot.moduleData) {
          // Banner VE pizza tek giriş yolu — enterIsolation yüklemi doğrular, baseline kurar,
          // editingContent'i moduleType koluna alır (banner artık çift-tıkla GİRİLİR). Product değişmez.
          enterIsolation(slot);
          const md = slot.moduleData as { type?: string; cells?: { id: string }[] };
          if (md.type === 'banner') {
            const firstCellId = md.cells?.[0]?.id;
            if (firstCellId) toggleElementSelection('bannerCell', firstCellId, false, slot.id);
          }
        } else if (slot.role === 'product') {
          setEditingContent({ slotId: slot.id, contentType: 'product' });
        }
      }}
      onContextMenu={(e) => {
        if (isPreviewMode) return;
        onContextMenu(e, slot);
      }}
      draggable={!isPreviewMode && !!slot.product && !isImgEditMode}
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.setData('sourcePage', String(pageNumber));
        e.dataTransfer.setData('sourceIndex', String(slotIndex));
        if (slot.product) {
          const dragImg = createProductDragImage({
            name: slot.product.name ?? 'İsimsiz',
            imageUrl: slot.product.image,
          });
          e.dataTransfer.setDragImage(dragImg, 20, 20);
        }
      }}
      onDragOver={(e) => {
        if (isPreviewMode) return;
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      className={`product-slot group relative overflow-hidden border border-solid transition-all h-full w-full min-w-12.5 min-h-12.5 ${
        isPreviewMode ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer'
      } ${
        !isPreviewMode && isSelected
          ? `z-50${isModuleSlot ? '' : ' bg-surface-subtle'}`
          : isOver && !isPreviewMode
            ? 'border-border-strong scale-[0.98] z-20'
            : isModuleSlot
              ? 'border-transparent z-10'
              : !isPreviewMode
                ? 'hover:border-border-strong z-10'
                : 'z-10'
      }`}
      style={{
        gridColumn: gridPosition
          ? `${gridPosition.colStart} / span ${slot.colSpan}`
          : `span ${slot.colSpan}`,
        gridRow: gridPosition
          ? `${gridPosition.rowStart} / span ${slot.rowSpan}`
          : `span ${slot.rowSpan}`,
        borderRadius: isModuleSlot ? 0 : radiusStyle(finalSettings.radiuses.cell),
        ...(isModuleSlot
          ? { background: 'transparent' }
          : colorValueBackground(finalSettings.colors.cellBg)),
        ...(isModuleSlot
          ? {}
          : {
              borderColor: colorOpacityToCss(finalSettings.colors.cellBorder),
              borderWidth: `${finalSettings.borderWidth}px`,
              boxShadow: boxShadow,
            }),
        outline: !isPreviewMode && isSelected ? '2px solid var(--color-border-selected)' : undefined,
        outlineOffset: isSelected ? '2px' : undefined,
        padding: slot.role === 'free' ? undefined : paddingStyle(finalSettings.spacings.cell),
        ...freeStyles,
        // İzolasyon dim'i: izole modül dışındaki her slot soluklaşır (Illustrator deseni).
        ...(isDimmedByIsolation ? { opacity: 0.35 } : {}),
      }}
    >
      {!isPreviewMode && (
        <div
          data-hide-on-export="true"
          className="absolute top-0 left-0 p-1 text-[11px] font-black text-slate-400/50 pointer-events-none z-50"
        >
          {globalNumber || ''}
        </div>
      )}

      {slot.role === 'free' && (
        <div className="w-full h-full flex flex-col relative z-20 overflow-hidden pointer-events-auto rounded-[inherit]">
          {!slot.moduleData ? (
            !isPreviewMode && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-surface-subtle border-2 border-dashed border-border-strong pointer-events-none">
                <span className="text-text-muted font-bold text-sm uppercase tracking-widest">
                  SERBEST ALAN
                </span>
                <span className="text-[11px] text-text-muted mt-1">Modül Sürükleyin</span>
              </div>
            )
          ) : (
            <>
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

              {(slot.moduleData as { type?: string })?.type === 'banner' &&
                editingContent?.slotId !== slot.id &&
                !isPreviewMode && (
                <div
                  data-hide-on-export="true"
                  className={`absolute inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity
                    ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                  `}
                  style={{ background: 'rgba(0,0,0,0.40)' }}
                >
                  <button
                    className="flex items-center gap-2 px-4 py-2.5 bg-surface-panel text-text-primary text-xs font-bold rounded-lg shadow-lg pointer-events-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      const firstCellId = (slot.moduleData as BannerModuleData)?.cells?.[0]?.id;
                      enterIsolation(slot);
                      if (firstCellId) {
                        toggleElementSelection('bannerCell', firstCellId, false, slot.id);
                      }
                    }}
                  >
                    <Pencil size={14} />
                    Modülü düzenle
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {slot.role !== 'free' && !slot.product && !isPreviewMode && (
        <div className="w-full h-full flex items-center justify-center pointer-events-none">
          <span className="text-[10px] text-slate-200 font-bold uppercase tracking-widest">
            Boş Hücre
          </span>
        </div>
      )}

      {slot.role !== 'free' && finalSettings.badge.active && (() => {
        const badge = finalSettings.badge;
        const offset = 4 * clampedScale;

        const displayBadgeX = badgeDragState.isDragging ? badgeDragState.x : (badge.posX ?? 0);
        const displayBadgeY = badgeDragState.isDragging ? badgeDragState.y : (badge.posY ?? 0);

        const positionStyle: React.CSSProperties = badge.isFreePosition
          ? { top: `${displayBadgeY}%`, left: `${displayBadgeX}%` }
          : (() => {
              switch (badge.position) {
                case 'top-right': return { top: offset, right: offset };
                case 'bottom-left': return { bottom: offset, left: offset };
                case 'bottom-right': return { bottom: offset, right: offset };
                default: return { top: offset, left: offset };
              }
            })();

        const isSelectedBadge = selectedTextElement?.slotId === slot.id && selectedTextElement?.elementType === 'badge';

        // Border radius of selection ring matching shape
        const borderRadius = badge.shape === 'circle'
          ? '50%'
          : badge.shape === 'pill'
            ? '9999px'
            : badge.shape === 'flama'
              ? '2px'
              : badge.shape === 'banner'
                ? '0px'
                : '2px';

        const isFreePosition = badge.isFreePosition === true;
        const isMoveActive = activeBadgeMoveSlotId === slot.id;

        return (
          <div
            id={`badge-${slot.id}`}
            data-badge-drag="true"
            className={`absolute pointer-events-auto cursor-pointer transition-all z-40 ${
              isSelectedBadge
                ? 'ring-2 ring-border-selected ring-offset-1'
                : 'hover:ring-1 hover:ring-border-strong'
            }`}
            style={{
              ...positionStyle,
              borderRadius,
              cursor: isFreePosition && isMoveActive ? (badgeDragState.isDragging ? 'grabbing' : 'grab') : 'pointer',
              transition: badgeDragState.isDragging ? 'none' : undefined,
            }}
            onClick={(e) => {
              e.stopPropagation();
              toggleSlotSelection(slot.id, e.ctrlKey || e.metaKey);
              setSelectedTextElement({ slotId: slot.id, elementType: 'badge' });
            }}
            onMouseDown={handleBadgeMouseDown}
          >
            <BadgeRenderer badge={badge} scale={clampedScale} slotId={slot.id} />
            <DragHandle visible={isFreePosition && isMoveActive} />
          </div>
        );
      })()}

      {slot.role !== 'free' && slot.product && (
        <div
          className={`w-full h-full flex flex-col min-w-0 min-h-0 ${
            editingContent?.slotId === slot.id ? 'opacity-100' : isSelected ? 'opacity-75' : ''
          }`}
        >
          {/* Price box */}
          {(() => {
            const priceSettings = finalSettings.priceSettings || {};
            const isPriceFree = priceSettings.isFreePosition === true;
            const displayPriceX = priceDragState.isDragging ? priceDragState.x : (priceSettings.posX ?? 50);
            const displayPriceY = priceDragState.isDragging ? priceDragState.y : (priceSettings.posY ?? 50);
            const isPriceSelected = selectedTextElement?.slotId === slot.id && selectedTextElement?.elementType === 'price';

            const transformStyle = isPriceFree
              ? 'translate(-50%, -50%)'
              : finalSettings.pricePosition === 'center'
                ? 'translateX(-50%)'
                : undefined;

            const positionStyles: React.CSSProperties = isPriceFree
              ? {
                  left: `${displayPriceX}%`,
                  top: `${displayPriceY}%`,
                  transform: transformStyle,
                  transition: priceDragState.isDragging ? 'none' : undefined,
                }
              : {
                  top: 0,
                  ...(finalSettings.pricePosition === 'left'
                    ? { left: 0 }
                    : finalSettings.pricePosition === 'center'
                      ? { left: '50%', transform: transformStyle }
                      : { right: 0 }),
                };

            return (
              <div
                className={`absolute z-30 flex shadow-sm transition-all px-1.5 py-1 pointer-events-auto outline-none ${
                  isPriceSelected
                    ? 'ring-2 ring-border-selected ring-offset-1 cursor-text'
                    : 'cursor-pointer hover:ring-1 hover:ring-border-strong'
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
                  ...positionStyles,
                  cursor: isPriceSelected ? (priceDragState.isDragging ? 'grabbing' : 'grab') : 'pointer',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (editingText !== 'price') {
                    toggleSlotSelection(slot.id, e.ctrlKey || e.metaKey);
                    setSelectedTextElement({ slotId: slot.id, elementType: 'price' });
                  }
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingText('price');
                }}
                onMouseDown={handlePriceMouseDown}
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
            );
          })()}

          {/* Image */}
          <div
            title={slot.product.sku ?? ''}
            className="flex-1 flex items-center justify-center min-h-0 min-w-0 mb-2 mt-6 pointer-events-auto relative z-10"
          >
            {slot.product.image ? (
              <>
                <img
                  src={slot.product.image}
                  crossOrigin="anonymous"
                  onMouseDown={handleImgMouseDown}
                  draggable={false}
                  className="max-w-full max-h-full object-contain select-none"
                  style={{
                    transform: `translate(${displayX}px, ${displayY}px) scale(${displayScale})`,
                    cursor: isImgEditMode ? 'grab' : 'default',
                  }}
                />
                <DragHandle
                  visible={isImgEditMode}
                  style={{
                    transform: `translate(${displayX}px, ${displayY}px)`,
                  }}
                />
              </>
            ) : (
              <div className="text-[10px] text-slate-300 italic uppercase">Resim Yok</div>
            )}
          </div>

          {/* Name */}
          {(() => {
            const nameSettings = finalSettings.nameSettings || {};
            const isNameFree = nameSettings.isFreePosition === true;
            const displayNameX = nameDragState.isDragging ? nameDragState.x : (nameSettings.posX ?? 50);
            const displayNameY = nameDragState.isDragging ? nameDragState.y : (nameSettings.posY ?? 50);

            const renderInner = () => (
              <>
                <div
                  className={`outline-none transition-all ${
                    editingText === 'name'
                      ? 'bg-white/90 text-black z-50 ring-2 ring-border-selected overflow-hidden whitespace-pre-wrap rounded cursor-text'
                      : 'line-clamp-3 whitespace-pre-wrap'
                  }`}
                  style={{ textAlign: finalSettings.fonts.productName.textAlign }}
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
                  {slot.product?.name}
                </div>
              </>
            );

            const customWidth = slot.isCustom === true && nameSettings.width !== undefined && nameSettings.width !== 100
              ? `${nameSettings.width}%`
              : '100%';

            const customHeight = slot.isCustom === true && nameSettings.height !== undefined
              ? `${nameSettings.height}mm`
              : 'auto';

            const customOverflow = slot.isCustom === true && nameSettings.height !== undefined
              ? 'hidden'
              : undefined;

            const commonStyles: React.CSSProperties = {
              display: 'block',
              width: customWidth,
              height: customHeight,
              overflow: customOverflow,
              marginLeft: 'auto',
              marginRight: 'auto',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              backgroundColor: colorOpacityToCss({ c: nameSettings.bgColor ?? '#ffffff', o: nameSettings.bgOpacity ?? 0 }),
              border: nameSettings.borderWidth ? `${nameSettings.borderWidth}px solid ${colorOpacityToCss({ c: nameSettings.borderColor ?? '#e2e8f0', o: nameSettings.borderOpacity ?? 0 })}` : undefined,
              borderRadius: nameSettings.borderRadius ? `${nameSettings.borderRadius}px` : undefined,
              padding: nameSettings.borderWidth ? '2px 4px' : undefined,
              ...fontStyle({
                ...finalSettings.fonts.productName,
                fontSize: finalSettings.fonts.productName.fontSize * clampedScale,
              }),
            };

            const ringClasses = `outline-none transition-all ${
              selectedTextElement?.slotId === slot.id &&
              selectedTextElement?.elementType === 'name' &&
              editingText !== 'name'
                ? 'ring-2 ring-border-selected'
                : editingText !== 'name'
                  ? 'hover:ring-1 hover:ring-border-strong'
                  : ''
            }`;

            if (isNameFree) {
              const transformVal = 'translate(-50%, -50%)';

              return (
                <div
                  className={`shrink-0 pointer-events-auto absolute z-20 ${ringClasses}`}
                  data-name-drag="true"
                  onMouseDown={handleNameMouseDown}
                  style={{
                    ...commonStyles,
                    left: `${displayNameX}%`,
                    top: `${displayNameY}%`,
                    transform: transformVal,
                    transition: nameDragState.isDragging ? 'none' : undefined,
                    cursor: isNameSelected ? (nameDragState.isDragging ? 'grabbing' : 'grab') : 'pointer',
                  }}
                >
                  {renderInner()}
                </div>
              );
            }

            return (
              <div
                className={`shrink-0 pointer-events-auto relative z-20 ${ringClasses}`}
                data-name-drag="true"
                onMouseDown={handleNameMouseDown}
                style={{
                  ...commonStyles,
                  cursor: isNameSelected ? (nameDragState.isDragging ? 'grabbing' : 'grab') : 'pointer',
                }}
              >
                {renderInner()}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
});
