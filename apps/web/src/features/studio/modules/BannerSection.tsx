import { useEffect, useRef, useState } from 'react';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import { colorValueBackground, colorOpacityToCss, radiusStyle, shadowStyle, hexToRgba } from '../util/style';
import { usePreserveEditorSelectionOnChrome, markDragGesture } from '../util/editorChrome';
import type { BannerCellData, BannerModuleData } from './types';
import { materializeFractions, FRACTION_MIN } from './fractions';
import { cellDomId } from './bannerDom';
import {
  setActiveRange,
  clearActiveSession,
  sanitizeRichText,
  isRangeWithinElement,
} from './richText';

interface Props {
  instanceData: BannerModuleData;
  slotId: string;
  pageNumber: number;
}

interface LassoRect { startX: number; startY: number; currentX: number; currentY: number }

export function BannerSection({ instanceData, slotId, pageNumber }: Props) {
  const updateSlotModuleData = useCatalogStore((s) => s.updateSlotModuleData);
  const setBannerFractions = useCatalogStore((s) => s.setBannerFractions);
  const selection = useUIStore((s) => s.selection);
  const toggleElementSelection = useUIStore((s) => s.toggleElementSelection);
  const setSelection = useUIStore((s) => s.setSelection);
  const editingContent = useUIStore((s) => s.editingContent);

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
  // Kolon/satır sınır sürükleme. Store YALNIZ mouseup'ta yazılır (her move'da değil) →
  // sürükleme tek snapshot. Canlı önizleme dragFractions (local state) ile, rAF-throttle'lı.
  const resizeDragRef = useRef<{
    axis: 'col' | 'row';
    index: number;
    startPos: number;
    startFractions: number[];
  } | null>(null);
  const pendingResizeRef = useRef<{ axis: 'col' | 'row'; fractions: number[] } | null>(null);
  const rafRef = useRef<number | null>(null);
  const [dragFractions, setDragFractions] = useState<{ axis: 'col' | 'row'; fractions: number[] } | null>(null);

  // Hücre text-edit'teyken Hızlı Bar/popup ile etkileşim editör focus+seçimini bozmasın
  // (kök desen — yeni araçlar otomatik miras alır). bkz. util/editorChrome.ts
  usePreserveEditorSelectionOnChrome(!!editingCellId);

  const updateCell = (cellId: string, patch: Partial<BannerCellData>) => {
    const newCells = cells.map((c) => (c.id === cellId ? { ...c, ...patch } : c));
    updateSlotModuleData(pageNumber, slotId, { cells: newCells });
  };

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!editingCellId) return;
      const t = e.target as HTMLElement;
      if (t.closest(`#${cellDomId(slotId, editingCellId)}`)) return;
      if (t.closest('#contextual-bar')) return;
      // (1a) Renk seçici popup'ı body'ye portal — ona tıklamak edit'ten DÜŞÜRMEMELİ.
      // Yoksa run-level renk uygulanırken seçim ölür (bulgu 4 / docs §5).
      if (t.closest('[data-color-picker-popup]')) return;
      // Hücreden ayrılırken metni COMMIT et: native blur, odaklanılamayan <div>'e (yan hücre/kanvas)
      // tıkta ATEŞLENMEZ → onBlur kaçar. DOM'u doğrudan okuyup yazıyoruz (senaryo ii kök-nedeni).
      const ce = document
        .getElementById(cellDomId(slotId, editingCellId))
        ?.querySelector('[contenteditable]') as HTMLElement | null;
      if (ce) {
        const clean = sanitizeRichText(ce.innerHTML);
        const c = cells.find((x) => x.id === editingCellId);
        if (c && clean !== c.text) updateCell(editingCellId, { text: clean });
      }
      setEditingCellId(null);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [editingCellId, cells, updateCell, slotId]);

  // (1b) Run-level renk köprüsü: edit açıkken hücre-içi metin seçimini singleton'a yaz.
  // selectionchange, picker swatch'ına tıklamadan ÖNCE son geçerli range'i yakalar (tıklama
  // focus'u portal'a taşıyıp canlı seçimi collapse etmeden). ContextualBar onChange bunu okur.
  useEffect(() => {
    if (!editingCellId) return;
    const ce = document
      .getElementById(cellDomId(slotId, editingCellId))
      ?.querySelector('[contenteditable]') as HTMLElement | null;
    if (!ce) return;
    const onSelChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
      const range = sel.getRangeAt(0);
      // (Düzeltme C) range'in HER İKİ ucu da bu hücrenin contentEditable'ı içinde olsun.
      if (!isRangeWithinElement(range, ce)) return;
      setActiveRange(slotId, editingCellId, range);
    };
    document.addEventListener('selectionchange', onSelChange);
    return () => {
      document.removeEventListener('selectionchange', onSelChange);
      clearActiveSession();
    };
  }, [editingCellId, slotId]);

  // Modülden çıkış (dış-tıklama → commit) artık TEK YERDE: Canvas'taki izolasyon çıkış
  // gating'i (capture mousedown, isoSession kapısı). Banner'a özel ikinci listener KALDIRILDI
  // — krom↔undo ayrışmasını ve çift-handler'ı önler (eşleşme değişmezi).

  // Not: Banner'a özel global Ctrl+Z→undo listener'ı KALDIRILDI. App-level TopBar
  // handler'ı (window keydown) Ctrl+Z'yi zaten karşılıyor; buradaki ikinci listener
  // mount başına çift-undo yapıyordu (banner varken her Ctrl+Z iki snapshot pop).
  // Hücre düzenleme Ctrl+Z davranışı TopBar handler'ında aynen kalır.

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

    // Sınır sürükleme: imgDrag/lasso'dan ÖNCE (karşılıklı dışlama). Store'a YAZMAZ.
    if (resizeDragRef.current) {
      const d = resizeDragRef.current;
      const start = d.startFractions;
      const total = start.reduce((s, f) => s + f, 0);
      const pairSum = start[d.index] + start[d.index + 1];
      const deltaPx =
        d.axis === 'col' ? (e.clientX - d.startPos) / scaleX : (e.clientY - d.startPos) / scaleY;
      const contentLen = d.axis === 'col' ? container.clientWidth : container.clientHeight;
      const dFrac = (deltaPx / contentLen) * total;
      // İki komşu fraction birlikte güncellenir; toplam (pairSum) sabit → diğer kolonlar etkilenmez.
      const nFirst = Math.max(FRACTION_MIN, Math.min(pairSum - FRACTION_MIN, start[d.index] + dFrac));
      const next = [...start];
      next[d.index] = nFirst;
      next[d.index + 1] = pairSum - nFirst;
      pendingResizeRef.current = { axis: d.axis, fractions: next };
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          if (pendingResizeRef.current) setDragFractions(pendingResizeRef.current);
        });
      }
      return;
    }

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
      const el = document.getElementById(cellDomId(slotId, cell.id));
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
    // Sınır sürükleme bitişi: store'a TEK yazım (mouseup), pending fractions varsa commit.
    if (resizeDragRef.current) {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      const d = resizeDragRef.current;
      const pending = pendingResizeRef.current;
      resizeDragRef.current = null;
      pendingResizeRef.current = null;
      setDragFractions(null);
      if (pending) setBannerFractions(slotId, d.axis, pending.fractions);
      return;
    }

    if (imgDragRef.current) {
      imgDragRef.current = null;
      return;
    }

    const wasActive = lassoActive.current;
    const rect = lassoRect;

    lassoOrigin.current = null;
    setLassoRect(null);

    if (wasActive && rect) commitLasso(rect);

    // Gerçek lasso tamamlandı (in-bounds mouseup VEYA drag-out mouseleave): drag-jesti işaretle
    // → drag-out'ta canvas/slot click'i consumeDragGesture ile seçimi temizlemez. Staleness yok:
    // sonraki mousedown always-on tracker'da flag'i sıfırlar.
    if (wasActive) markDragGesture();

    // Reset after click event fires so cell onClick can check the flag
    setTimeout(() => { lassoActive.current = false; }, 0);
  };

  const rows = instanceData?.rows ?? 4;
  const cols = instanceData?.cols ?? 4;
  // Sürükleme sırasında local önizleme (dragFractions), değilse store'dan (yoksa eşit-bölü).
  const colFr =
    dragFractions?.axis === 'col'
      ? dragFractions.fractions
      : materializeFractions(instanceData?.colFractions, cols);
  const rowFr =
    dragFractions?.axis === 'row'
      ? dragFractions.fractions
      : materializeFractions(instanceData?.rowFractions, rows);
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
        gridTemplateColumns: colFr.map((f) => `minmax(0, ${f}fr)`).join(' '),
        gridTemplateRows: rowFr.map((f) => `minmax(0, ${f}fr)`).join(' '),
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
            id={cellDomId(slotId, cell.id)}
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
            className={`flex box-border relative overflow-hidden ${dragFractions ? 'transition-none' : 'transition-all'} ${
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
                  crossOrigin="anonymous"
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
                  crossOrigin="anonymous"
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
              data-rt-editable
              ref={(el) => {
                if (!el) return;
                if (isEdit) {
                  if (document.activeElement !== el) {
                    el.focus();
                    const sel = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(el);
                    range.collapse(false);
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                  }
                } else if (el.innerHTML !== (cell.text || '')) {
                  // Aktif düzenlenmiyorsa DOM'u store'dan ZORLA senkronla. dangerouslySetInnerHTML'in
                  // React __html diff'i, aynı-tick flush+undo batch'lenince DOM'u güncellemiyordu
                  // (kullanıcı yazınca DOM React'in bildiği __html'den ayrışıyor). İmperatif sync bunu
                  // kapatır: undo/redo/reseed sonrası hücre store metnini yansıtır.
                  el.innerHTML = cell.text || '';
                }
              }}
              onBlur={(e) => {
                // (1a-tamamlayıcı) Focus picker'a (portal, odaklanabilir slider/buton) kaçarsa
                // edit'i KORU — run-level renk uygulanacak; onChange sonrası ce.focus() geri alır.
                const rel = e.relatedTarget as HTMLElement | null;
                if (rel && rel.closest('[data-color-picker-popup]')) return;
                const clean = sanitizeRichText(e.currentTarget.innerHTML);
                if (clean !== cell.text) updateCell(cell.id, { text: clean });
                setEditingCellId(null);
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
                fontStyle: f.fontStyle ?? 'normal',
                color: f.opacity < 100 ? hexToRgba(f.color, f.opacity) : f.color,
                textAlign: f.textAlign,
                whiteSpace: 'pre-wrap',
              }}
            />
          </div>
        );
      })}

      {/* Kolon/satır sınır tutamaçları (yalnız düzenleme modunda). İnce şerit → hücre yüzeyi
          tıklanabilir kalır; stopPropagation lasso'yu tetiklemez; imgDrag aktifken başlamaz. */}
      {isEditingModule && (() => {
        const handles: React.ReactNode[] = [];
        const colTotal = colFr.reduce((s, f) => s + f, 0);
        let cAcc = 0;
        for (let j = 0; j < colFr.length - 1; j++) {
          cAcc += colFr[j];
          handles.push(
            <div
              key={`colh-${j}`}
              onMouseDown={(e) => {
                if (imgDragRef.current) return;
                e.stopPropagation();
                resizeDragRef.current = {
                  axis: 'col',
                  index: j,
                  startPos: e.clientX,
                  startFractions: [...colFr],
                };
              }}
              className="absolute top-0 h-full z-40"
              style={{ left: `${(cAcc / colTotal) * 100}%`, width: 6, transform: 'translateX(-50%)', cursor: 'col-resize' }}
            />,
          );
        }
        const rowTotal = rowFr.reduce((s, f) => s + f, 0);
        let rAcc = 0;
        for (let i = 0; i < rowFr.length - 1; i++) {
          rAcc += rowFr[i];
          handles.push(
            <div
              key={`rowh-${i}`}
              onMouseDown={(e) => {
                if (imgDragRef.current) return;
                e.stopPropagation();
                resizeDragRef.current = {
                  axis: 'row',
                  index: i,
                  startPos: e.clientY,
                  startFractions: [...rowFr],
                };
              }}
              className="absolute left-0 w-full z-40"
              style={{ top: `${(rAcc / rowTotal) * 100}%`, height: 6, transform: 'translateY(-50%)', cursor: 'row-resize' }}
            />,
          );
        }
        return handles;
      })()}

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
