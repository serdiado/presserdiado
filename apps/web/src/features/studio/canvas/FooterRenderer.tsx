import { useEffect, useRef, useState } from 'react';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import { hexToRgba } from '../util/style';

interface Props {
  pageNumber: number;
  safeZone: [number, number, number, number];
}

export function FooterRenderer({ pageNumber, safeZone }: Props) {
  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const globalSettings = useCatalogStore((s) => s.globalSettings);
  const updatePageFooterCells = useCatalogStore((s) => s.updatePageFooterCells);
  const selection = useUIStore((s) => s.selection);
  const toggleElementSelection = useUIStore((s) => s.toggleElementSelection);

  const [editingCellId, setEditingCellId] = useState<string | null>(null);
  const didFocusRef = useRef(false);

  useEffect(() => {
    if (!editingCellId) didFocusRef.current = false;
    const onClickOutside = (e: MouseEvent) => {
      if (!editingCellId) return;
      const t = e.target as HTMLElement;
      if (t.closest(`#footer-${editingCellId}`)) return;
      if (t.closest('#contextual-bar')) return;
      setEditingCellId(null);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [editingCellId]);

  const [, mr, , ml] = safeZone;

  const page = getActivePages().find((p) => p.pageNumber === pageNumber);
  if (!page || page.footerMode === 'hidden') return null;

  const isCustom = page.footerMode === 'custom';
  const activeFooter = isCustom ? page.customFooter : globalSettings.footer;
  if (!activeFooter?.cells) return null;

  const visible = activeFooter.cells.filter((c) => !c.hidden);
  const selectedFooterCellIds =
    selection.type === 'footerCell' && selection.parentId === `page-${pageNumber}`
      ? selection.ids
      : [];

  return (
    <div
      className="absolute flex"
      style={{
        bottom: `5mm`,
        left: `${ml}mm`,
        right: `${mr}mm`,
        height: `${activeFooter.heightMm}mm`,
        boxSizing: 'border-box',
        zIndex: 40,
      }}
    >
      <div
        className="w-full h-full grid relative overflow-hidden box-border bg-surface-panel"
        style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gridTemplateRows: '1fr' }}
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
          const isSelected = selectedFooterCellIds.includes(cell.id);
          const isEditing = editingCellId === cell.id;

          return (
            <div
              key={cell.id}
              id={`footer-${cell.id}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isEditing)
                  toggleElementSelection(
                    'footerCell',
                    cell.id,
                    e.ctrlKey || e.shiftKey,
                    `page-${pageNumber}`,
                  );
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingCellId(cell.id);
                if (!isSelected)
                  toggleElementSelection('footerCell', cell.id, false, `page-${pageNumber}`);
              }}
              className={`flex box-border relative overflow-hidden transition-all ${
                isSelected && !isEditing
                  ? 'ring-2 ring-inset ring-border-selected z-10 cursor-pointer'
                  : isEditing
                    ? 'cursor-text z-20'
                    : 'cursor-pointer z-0'
              }`}
              style={{
                gridColumn: `span ${cell.colSpan}`,
                gridRow: '1',
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
                <img
                  src={cell.image}
                  alt="Footer Logo"
                  className="max-w-full max-h-full object-contain pointer-events-none"
                />
              ) : (
                <div
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  ref={(el) => {
                    if (isEditing && el && !didFocusRef.current) {
                      didFocusRef.current = true;
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
                    if (e.currentTarget.innerHTML !== cell.text) {
                      updatePageFooterCells(pageNumber, cell.id, {
                        text: e.currentTarget.innerHTML,
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setEditingCellId(null);
                  }}
                  className={`w-full outline-none border-none m-0 p-0 ${isEditing ? 'pointer-events-auto' : 'pointer-events-none'}`}
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

      <div
        data-hide-on-export="true"
        className="absolute text-[10px] font-black text-text-muted uppercase tracking-tighter pointer-events-none"
        style={{
          right: '0mm',
          bottom: '-5mm',
          height: '5mm',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        P.{pageNumber}
      </div>
    </div>
  );
}
