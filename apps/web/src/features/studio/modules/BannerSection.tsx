import { useEffect, useState } from 'react';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import { hexToRgba } from '../util/style';
import type { BannerCellData, BannerModuleData } from './types';

interface Props {
  instanceData: BannerModuleData;
  slotId: string;
  pageNumber: number;
}

export function BannerSection({ instanceData, slotId, pageNumber }: Props) {
  const updateSlotModuleData = useCatalogStore((s) => s.updateSlotModuleData);
  const undo = useCatalogStore((s) => s.undo);
  const selection = useUIStore((s) => s.selection);
  const toggleElementSelection = useUIStore((s) => s.toggleElementSelection);

  const cells = instanceData?.cells ?? [];
  const selectedIds =
    selection.type === 'bannerCell' && selection.parentId === slotId ? selection.ids : [];

  const [editingCellId, setEditingCellId] = useState<string | null>(null);

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

  if (cells.length === 0) return null;
  const visible = cells.filter((c) => !c.hidden);

  return (
    <div
      className="w-full h-full grid relative overflow-hidden box-border bg-white"
      style={{
        gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
        gridTemplateRows: 'repeat(4, minmax(0, 1fr))',
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

        return (
          <div
            key={cell.id}
            id={`banner-${cell.id}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isEdit)
                toggleElementSelection('bannerCell', cell.id, e.ctrlKey || e.shiftKey, slotId);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingCellId(cell.id);
              if (!isSel) toggleElementSelection('bannerCell', cell.id, false, slotId);
            }}
            className={`flex box-border relative overflow-hidden transition-all ${
              isSel && !isEdit
                ? 'ring-2 ring-inset ring-blue-500 z-10 cursor-pointer'
                : isEdit
                  ? 'cursor-text z-20'
                  : 'cursor-pointer z-0'
            }`}
            style={{
              gridColumn: `span ${cell.colSpan}`,
              gridRow: `span ${cell.rowSpan}`,
              backgroundColor:
                cell.bgColor.o < 100 ? hexToRgba(cell.bgColor.c, cell.bgColor.o) : cell.bgColor.c,
              paddingTop: `${p.t}px`,
              paddingRight: `${p.r}px`,
              paddingBottom: `${p.b}px`,
              paddingLeft: `${p.l}px`,
              borderTop: `${b.t}px ${b.style} ${borderColor}`,
              borderRight: `${b.r}px ${b.style} ${borderColor}`,
              borderBottom: `${b.b}px ${b.style} ${borderColor}`,
              borderLeft: `${b.l}px ${b.style} ${borderColor}`,
              justifyContent: justify,
              alignItems: align,
            }}
          >
            {cell.image ? (
              <img src={cell.image} alt="Banner" className="max-w-full max-h-full object-contain pointer-events-none" />
            ) : (
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
                className={`w-full outline-none border-none m-0 p-0 ${isEdit ? 'pointer-events-auto' : 'pointer-events-none'}`}
                style={{
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
            )}
          </div>
        );
      })}
    </div>
  );
}
