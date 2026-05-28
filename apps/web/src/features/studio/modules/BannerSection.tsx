import { useEffect, useRef, useState } from 'react';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import { colorValueBackground, colorOpacityToCss, radiusStyle, shadowStyle, hexToRgba } from '../util/style';
import type { BannerCellData, BannerModuleData } from './types';

interface Props {
  instanceData: BannerModuleData;
  slotId: string;
  pageNumber: number;
}

interface LassoRect { startX: number; startY: number; currentX: number; currentY: number }

export function BannerSection({ instanceData, slotId, pageNumber }: Props) {
  const updateSlotModuleData = useCatalogStore((s) => s.updateSlotModuleData);
  const undo = useCatalogStore((s) => s.undo);
  const selection = useUIStore((s) => s.selection);
  const toggleElementSelection = useUIStore((s) => s.toggleElementSelection);
  const setSelection = useUIStore((s) => s.setSelection);
  const editingContent = useUIStore((s) => s.editingContent);
  const setEditingContent = useUIStore((s) => s.setEditingContent);

  const isEditingModule =
    editingContent?.slotId === slotId && editingContent?.contentType === 'banner';

  const cells = instanceData?.cells ?? [];
  const selectedIds =
    selection.type === 'bannerCell' && selection.parentId === slotId ? selection.ids : [];

  const [editingCellId, setEditingCellId] = useState<string | null>(null);
  const [lassoRect, setLassoRect] = useState<LassoRect | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const lassoOrigin = useRef<{ x: number; y: number } | null>(null);
  const lassoActive = useRef(false);
  const imgDragRef = useRef<{
    cellId: string;
    startX: number;
    startY: number;
    origPosX: number;
    origPosY: number;
  } | null>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!editingCellId) return;
      const t = e.target as HTMLElement;
      if (t.closest(`#banner-${editingCellId}`)) return;
      if (t.closest('#contextual-bar')) return;
      setEditingCellId(null);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [editingCellId]);

  // Modül düzenleme modundan çıkış: slot dışına tıklandığında
  useEffect(() => {
    if (!isEditingModule) return;
    const onClickOutside = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const slotEl = document.getElementById(`slot-${slotId}`);
      if (slotEl && slotEl.contains(t)) return;
      if (t.closest('#contextual-bar')) return;
      if (t.closest('#studio-sidebar')) return;
      if (t.closest('[data-color-picker-popup]')) return;
      setEditingContent(null);
      setSelection({ type: 'slot', ids: [slotId] });
      setEditingCellId(null);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isEditingModule, slotId, setEditingContent, setSelection]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !editingCellId) {
        undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, editingCellId]);

  const updateCell = (cellId: string, patch: Partial<BannerCellData>) => {
    const newCells = cells.map((c) => (c.id === cellId ? { ...c, ...patch } : c));
    updateSlotModuleData(pageNumber, slotId, { cells: newCells });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditingModule) return;
    if (editingCellId) return;
    if (e.button !== 0) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scaleX = rect.width / container.clientWidth;
    const scaleY = rect.height / container.clientHeight;
    const x = (e.clientX - rect.left) / scaleX;
    const y = (e.clientY - rect.top) / scaleY;
    lassoOrigin.current = { x, y };
    lassoActive.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scaleX = rect.width / container.clientWidth;
    const scaleY = rect.height / container.clientHeight;

    if (imgDragRef.current) {
      const dx = (e.clientX - imgDragRef.current.startX) / scaleX;
      const dy = (e.clientY - imgDragRef.current.startY) / scaleY;
      updateCell(imgDragRef.current.cellId, {
        imagePosX: imgDragRef.current.origPosX + dx,
        imagePosY: imgDragRef.current.origPosY + dy,
      });
      return;
    }

    if (!lassoOrigin.current) return;
    const currentX = (e.clientX - rect.left) / scaleX;
    const currentY = (e.clientY - rect.top) / scaleY;
    const dx = currentX - lassoOrigin.current.x;
    const dy = currentY - lassoOrigin.current.y;

    if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;

    lassoActive.current = true;
    setLassoRect({
      startX: lassoOrigin.current.x,
      startY: lassoOrigin.current.y,
      currentX,
      currentY,
    });
  };

  const commitLasso = (rect: LassoRect) => {
    const container = containerRef.current;
    if (!container) return;
    const cr = container.getBoundingClientRect();
    const scaleX = cr.width / container.clientWidth;
    const scaleY = cr.height / container.clientHeight;
    const lx = Math.min(rect.startX, rect.currentX);
    const ly = Math.min(rect.startY, rect.currentY);
    const rw = Math.abs(rect.currentX - rect.startX);
    const rh = Math.abs(rect.currentY - rect.startY);
    const al = cr.left + lx * scaleX;
    const at = cr.top + ly * scaleY;
    const ar = al + rw * scaleX;
    const ab = at + rh * scaleY;

    const matched: string[] = [];
    for (const cell of cells) {
      if (cell.hidden) continue;
      const el = document.getElementById(`banner-${cell.id}`);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.left < ar && r.right > al && r.top < ab && r.bottom > at) {
        matched.push(cell.id);
      }
    }

    if (matched.length > 0) {
      setSelection({ type: 'bannerCell', ids: matched, parentId: slotId });
    }
  };

  const handleMouseUp = () => {
    if (imgDragRef.current) {
      imgDragRef.current = null;
      return;
    }

    const wasActive = lassoActive.current;
    const rect = lassoRect;

    lassoOrigin.current = null;
    setLassoRect(null);

    if (wasActive && rect) commitLasso(rect);

    // Reset after click event fires so cell onClick can check the flag
    setTimeout(() => { lassoActive.current = false; }, 0);
  };

  const rows = instanceData?.rows ?? 4;
  const cols = instanceData?.cols ?? 4;
  const bgColor = instanceData?.bgColor ?? { type: 'solid' as const, color: '#ffffff', opacity: 100 };
  const cb = instanceData?.containerBorder ?? { color: { c: '#e2e8f0', o: 0 }, width: 0 };
  const radius = instanceData?.radius ?? { tl: 0, tr: 0, bl: 0, br: 0, linked: true };
  const shadow = instanceData?.shadow ?? { x: 0, y: 0, blur: 0, spread: 0, color: '#000000', opacity: 0, active: false };

  if (cells.length === 0) return null;
  const visible = cells.filter((c) => !c.hidden);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="w-full h-full grid relative overflow-hidden box-border select-none"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        ...colorValueBackground(bgColor),
        borderRadius: radiusStyle(radius),
        boxShadow: shadowStyle(shadow),
        border: cb.width > 0 ? `${cb.width}px solid ${colorOpacityToCss(cb.color)}` : undefined,
      }}
    >
      {visible.map((cell) => {
        const f = cell.font;
        const p = cell.padding;
        const b = cell.border;
        const justify =
          f.textAlign === 'center' ? 'center' : f.textAlign === 'right' ? 'flex-end' : 'flex-start';
        const align =
          f.verticalAlign === 'top' ? 'flex-start' : f.verticalAlign === 'bottom' ? 'flex-end' : 'center';
        const borderColor = b.color.o < 100 ? hexToRgba(b.color.c, b.color.o) : b.color.c;
        const isSel = selectedIds.includes(cell.id);
        const isEdit = editingCellId === cell.id;
        const cellBorderStyle: React.CSSProperties = {
          borderTop:    `${b.t}px ${b.style} ${borderColor}`,
          borderRight:  `${b.r}px ${b.style} ${borderColor}`,
          borderBottom: `${b.b}px ${b.style} ${borderColor}`,
          borderLeft:   `${b.l}px ${b.style} ${borderColor}`,
          outline: isEditingModule
            ? isSel
              ? '1px solid rgba(100,116,139,0.9)'
              : '1px dashed rgba(148,163,184,0.6)'
            : 'none',
          outlineOffset: '-1px',
        };

        return (
          <div
            key={cell.id}
            id={`banner-${cell.id}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isEditingModule) return;
              if (lassoActive.current) return;
              if (!isEdit)
                toggleElementSelection('bannerCell', cell.id, e.ctrlKey || e.shiftKey, slotId);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (!isEditingModule) return;
              setEditingCellId(cell.id);
              if (!isSel) toggleElementSelection('bannerCell', cell.id, false, slotId);
            }}
            className={`flex box-border relative overflow-hidden transition-all ${
              isSel && !isEdit
                ? 'ring-2 ring-inset ring-slate-400 z-10 cursor-pointer'
                : isEdit
                  ? 'cursor-text z-20'
                  : isEditingModule
                    ? 'cursor-pointer z-0'
                    : 'cursor-default z-0'
            }`}
            style={{
              gridColumn: `span ${cell.colSpan}`,
              gridRow: `span ${cell.rowSpan}`,
              ...colorValueBackground(cell.bgColor),
              paddingTop: `${p.t}px`,
              paddingRight: `${p.r}px`,
              paddingBottom: `${p.b}px`,
              paddingLeft: `${p.l}px`,
              ...cellBorderStyle,
              justifyContent: justify,
              alignItems: align,
            }}
          >
            {/* Resim katmanı — her zaman arkada */}
            {cell.image && (
              cell.imageMode === 'free' ? (
                <img
                  src={cell.image}
                  alt=""
                  draggable={false}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(calc(-50% + ${cell.imagePosX ?? 0}px), calc(-50% + ${cell.imagePosY ?? 0}px)) scale(${(cell.imageScale ?? 100) / 100})`,
                    maxWidth: 'none',
                    zIndex: 0,
                    pointerEvents: isEditingModule ? 'auto' : 'none',
                    cursor: isEditingModule ? 'grab' : 'default',
                    userSelect: 'none',
                  }}
                  onMouseDown={(e) => {
                    if (!isEditingModule) return;
                    e.stopPropagation();
                    imgDragRef.current = {
                      cellId: cell.id,
                      startX: e.clientX,
                      startY: e.clientY,
                      origPosX: cell.imagePosX ?? 0,
                      origPosY: cell.imagePosY ?? 0,
                    };
                  }}
                />
              ) : (
                <img
                  src={cell.image}
                  alt=""
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{
                    objectFit: cell.imageMode === 'cover' ? 'cover' : 'contain',
                    zIndex: 0,
                  }}
                />
              )
            )}

            {/* Yazı katmanı — her zaman resmin önünde */}
            <div
              contentEditable={isEdit}
              suppressContentEditableWarning
              ref={(el) => {
                if (isEdit && el && document.activeElement !== el) {
                  el.focus();
                  const sel = window.getSelection();
                  const range = document.createRange();
                  range.selectNodeContents(el);
                  range.collapse(false);
                  sel?.removeAllRanges();
                  sel?.addRange(range);
                }
              }}
              onBlur={(e) => {
                if (e.currentTarget.innerHTML !== cell.text)
                  updateCell(cell.id, { text: e.currentTarget.innerHTML });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setEditingCellId(null);
              }}
              className={`w-full outline-none border-none m-0 p-0 ${isEdit ? 'pointer-events-auto select-text' : 'pointer-events-none'}`}
              style={{
                position: 'relative',
                zIndex: 1,
                fontFamily: f.fontFamily,
                fontSize: `${f.fontSize}px`,
                fontWeight: f.fontWeight,
                lineHeight: f.lineHeight,
                letterSpacing: `${f.letterSpacing}px`,
                textTransform: f.textTransform,
                textDecoration: f.textDecoration,
                color: f.opacity < 100 ? hexToRgba(f.color, f.opacity) : f.color,
                textAlign: f.textAlign,
                whiteSpace: 'pre-wrap',
              }}
              dangerouslySetInnerHTML={{ __html: cell.text || '' }}
            />
          </div>
        );
      })}

      {lassoRect && (
        <div
          className="absolute pointer-events-none z-50 border border-primary bg-primary/10"
          style={{
            left: Math.min(lassoRect.startX, lassoRect.currentX),
            top: Math.min(lassoRect.startY, lassoRect.currentY),
            width: Math.abs(lassoRect.currentX - lassoRect.startX),
            height: Math.abs(lassoRect.currentY - lassoRect.startY),
          }}
        />
      )}
    </div>
  );
}
