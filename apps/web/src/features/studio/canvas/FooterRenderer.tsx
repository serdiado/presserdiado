import { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
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

  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [editingCellId, setEditingCellId] = useState<string | null>(null);
  const didFocusRef = useRef(false);

  useEffect(() => {
    if (!isEditing) return;
    const onClickOutside = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest(`[data-footer-page="${pageNumber}"]`)) return;
      if (t.closest('#studio-sidebar')) return;
      if (t.closest('#contextual-bar')) return;
      if (t.closest('[data-color-picker-popup]')) return;
      setIsEditing(false);
      setEditingCellId(null);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isEditing, pageNumber]);

  useEffect(() => {
    if (!editingCellId) didFocusRef.current = false;
  }, [editingCellId]);

  const [, mr, , ml] = safeZone;

  const page = getActivePages().find((p) => p.pageNumber === pageNumber);
  if (!page) return null;

  const isHidden = page.footerMode === 'hidden';
  const isCustom = page.footerMode === 'custom';
  const activeFooter = isCustom ? page.customFooter : globalSettings.footer;
  const heightMm = activeFooter?.heightMm ?? globalSettings.footer.heightMm;
  const visible = activeFooter?.cells?.filter((c) => !c.hidden) ?? [];

  const selectedFooterCellIds =
    selection.type === 'footerCell' && selection.parentId === `page-${pageNumber}`
      ? selection.ids
      : [];

  const selectFooterContainer = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleElementSelection('footerCell', '__footer__', false, `page-${pageNumber}`);
  };

  const handleEditButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isHidden) {
      toggleElementSelection('footerCell', '__footer__', false, `page-${pageNumber}`);
      return;
    }
    const firstVisible = visible[0];
    setIsEditing(true);
    if (firstVisible) {
      toggleElementSelection('footerCell', firstVisible.id, false, `page-${pageNumber}`);
    }
  };

  const showOverlay = !isEditing && (isHovered || selectedFooterCellIds.length > 0);

  const containerBase: React.CSSProperties = {
    bottom: `5mm`,
    left: `${ml}mm`,
    right: `${mr}mm`,
    height: `${heightMm}mm`,
    boxSizing: 'border-box',
    zIndex: 40,
  };

  const overlayNode = showOverlay && (
    <div
      data-hide-on-export="true"
      className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity"
      style={{ background: 'rgba(0,0,0,0.40)' }}
    >
      <button
        className="flex items-center gap-2 px-4 py-2.5 bg-surface-panel text-text-primary text-xs font-bold rounded-lg shadow-sm pointer-events-auto"
        onClick={handleEditButtonClick}
      >
        <Pencil size={14} />
        Alt bilgiyi düzenle
      </button>
    </div>
  );

  const pageLabelNode = (
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
  );

  // Hayalet mod (hidden): şeffaf, dashed border, içerik yok
  if (isHidden) {
    return (
      <div
        data-footer-page={pageNumber}
        className="absolute flex"
        style={{
          ...containerBase,
          border: '1px dashed rgba(156,163,175,0.4)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={selectFooterContainer}
      >
        {overlayNode}
        {pageLabelNode}
      </div>
    );
  }

  // Normal mod (global / custom)
  return (
    <div
      data-footer-page={pageNumber}
      className="absolute flex"
      style={containerBase}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="w-full h-full grid relative overflow-hidden box-border bg-surface-panel"
        style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gridTemplateRows: '1fr' }}
        onClick={!isEditing ? selectFooterContainer : undefined}
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
          const isCellSelected = selectedFooterCellIds.includes(cell.id);
          const isCellEditing = editingCellId === cell.id;

          const cellBorderOverride: React.CSSProperties = isEditing
            ? isCellSelected
              ? { outline: '1px solid rgba(107,114,128,0.9)', outlineOffset: '-1px' }
              : { outline: '1px dashed rgba(156,163,175,0.6)', outlineOffset: '-1px' }
            : {};

          return (
            <div
              key={cell.id}
              id={`footer-${cell.id}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isEditing) {
                  selectFooterContainer(e);
                  return;
                }
                if (!isCellEditing) {
                  toggleElementSelection(
                    'footerCell',
                    cell.id,
                    e.ctrlKey || e.shiftKey,
                    `page-${pageNumber}`,
                  );
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (!isEditing) return;
                setEditingCellId(cell.id);
                if (!isCellSelected)
                  toggleElementSelection('footerCell', cell.id, false, `page-${pageNumber}`);
              }}
              className={`flex box-border relative overflow-hidden transition-all ${
                isEditing
                  ? isCellEditing
                    ? 'cursor-text z-20'
                    : 'cursor-pointer z-0'
                  : 'cursor-default z-0'
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
                ...cellBorderOverride,
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
                  contentEditable={isCellEditing}
                  suppressContentEditableWarning
                  ref={(el) => {
                    if (isCellEditing && el && !didFocusRef.current) {
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
                  className={`w-full outline-none border-none m-0 p-0 ${isCellEditing ? 'pointer-events-auto' : 'pointer-events-none'}`}
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

      {overlayNode}
      {pageLabelNode}
    </div>
  );
}
