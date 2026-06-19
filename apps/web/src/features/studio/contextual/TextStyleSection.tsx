// Hızlı Bar paylaşılan metin biçimlendirme bölümü (Faz 2) — registry'den render, run-level.
// docs/metin-ayarlari-merkezi-mimari.md §2/§3/§4. TÜM kontroller CUSTOM (buton/inline-dropdown) —
// native input/select odak çalar (editorChrome FOCUSABLE_CONTROL_SELECTOR muafiyeti) → seçim ölürdü.
// Inline-absolute dropdown'lar #contextual-bar alt-ağacında kalır → preventDefault guard onları korur
// (PORTAL YOK — fold #1). Apply + commit + selection-restore ÇAĞIRANIN işi (onApply); read-back burada.

import { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Underline, Strikethrough, ChevronDown } from 'lucide-react';
import type { TypographyData } from '@matbaapro/shared';
import { ColorOpacityPicker } from '../pickers';
import { textSettingById } from '../textSettings/registry';
import type { TextSettingCtx, TextSettingDef } from '../textSettings/types';
import { MIXED, isRangeWithinElement, type RunValue } from '../modules/richText';

const FAMILIES = ['Inter', 'Roboto', 'Arial', 'Oswald', 'Helvetica', 'Georgia'];
const WEIGHTS = [
  { v: '400', l: 'Normal' },
  { v: '500', l: 'Orta' },
  { v: '700', l: 'Kalın' },
  { v: '900', l: 'Siyah' },
];
const CASES = [
  { v: 'none', l: 'Aa' },
  { v: 'uppercase', l: 'BÜYÜK' },
  { v: 'lowercase', l: 'küçük' },
  { v: 'capitalize', l: 'Baş Harf' },
];

interface Props {
  surface: 'module' | 'product';
  slotId: string;
  cellId: string;
  font: TypographyData;
  onApply: (def: TextSettingDef, value: RunValue) => void;
  /** Renk picker'a no-cover rect veren callback (run-active seçim rect'i). */
  getAvoidRect?: () => DOMRect | null;
}

/** selectionchange → re-render: kontroller canlı seçimin stilini yansıtsın (caret dahil, fold). */
function useSelectionTick(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const h = () => setTick((t) => t + 1);
    document.addEventListener('selectionchange', h);
    return () => document.removeEventListener('selectionchange', h);
  }, []);
  return tick;
}

/** Canlı seçimden read-ctx kur: seçim bir rich-text editable'ı (`[data-rt-editable]` — modül hücresi
 *  veya ürün adı, surface-agnostik) içindeyse run-read; değilse cell-read (font fallback). */
function buildReadCtx(
  surface: 'module' | 'product',
  slotId: string,
  cellId: string,
  font: TypographyData,
): TextSettingCtx {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const anchor = range.startContainer;
    const el = (anchor.nodeType === 1 ? (anchor as Element) : anchor.parentElement) ?? null;
    const ce = el?.closest('[data-rt-editable]') as HTMLElement | null;
    if (ce && isRangeWithinElement(range, ce)) {
      return { surface, slotId, cellId, cellEl: ce, range, font };
    }
  }
  return { surface, slotId, cellId, font };
}

// ── inline custom kontroller (hepsi buton; portal yok) ───────────────────────
const TRIGGER_CLS =
  'h-9 px-2 inline-flex items-center gap-1 rounded-md text-xs font-medium text-text-secondary whitespace-nowrap hover:bg-border-default transition-colors';

function BarDropdown({
  label,
  options,
  selected,
  width = 'w-32',
  onSelect,
}: {
  label: string;
  options: { v: string; l: string }[];
  selected: string | null;
  width?: string;
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className={TRIGGER_CLS}>
        <span className="truncate max-w-24">{label}</span>
        <ChevronDown size={14} className="text-text-muted shrink-0" />
      </button>
      {open && (
        <div
          className={`absolute top-full left-0 mt-1 z-99999 ${width} bg-surface-panel border border-border-default rounded-radius-md shadow-drop-md overflow-hidden`}
        >
          {options.map((o) => (
            <button
              key={o.v}
              onClick={() => {
                onSelect(o.v);
                setOpen(false);
              }}
              className={`w-full flex items-center px-3 py-2 text-body-sm text-left transition-colors ${
                selected === o.v
                  ? 'bg-surface-subtle text-text-primary font-medium'
                  : 'text-text-secondary hover:bg-surface-subtle'
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** İki-A punto stepper — buton (native input YOK; doğrudan sayı-yazımı bile-isteye feda, fold-minör). */
function SizeStepper({
  value,
  fallback,
  onStep,
}: {
  value: number | null;
  fallback: number;
  onStep: (next: number) => void;
}) {
  const base = value ?? fallback;
  const btn = 'h-9 w-7 inline-flex items-center justify-center rounded-md hover:bg-border-default text-text-secondary';
  return (
    <div className="inline-flex items-center">
      <button onClick={() => onStep(Math.max(6, base - 1))} className={btn} title="Küçült">
        <span className="text-[10px] font-bold leading-none">A</span>
      </button>
      <span className="w-7 text-center text-xs tabular-nums select-none">{value ?? '—'}</span>
      <button onClick={() => onStep(Math.min(120, base + 1))} className={btn} title="Büyüt">
        <span className="text-[15px] font-bold leading-none">A</span>
      </button>
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`h-9 w-9 inline-flex items-center justify-center rounded-md transition-colors ${
        active ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-border-default'
      }`}
    >
      {children}
    </button>
  );
}

function ColorSwatch({ color, opacity }: { color: string; opacity: number }) {
  return (
    <span className={TRIGGER_CLS}>
      <span
        className="w-3.5 h-3.5 rounded-sm shrink-0"
        style={{ backgroundColor: color, opacity: opacity / 100, border: '1px solid rgba(0,0,0,0.15)' }}
      />
      <span>Renk</span>
    </span>
  );
}

// ── bölüm ────────────────────────────────────────────────────────────────────
export function TextStyleSection({ surface, slotId, cellId, font, onApply, getAvoidRect }: Props) {
  useSelectionTick(); // canlı seçim değişince yeniden oku
  const ctx = buildReadCtx(surface, slotId, cellId, font);

  const r = textSettingById;
  const famRead = r.fontFamily.read(ctx);
  const sizeRead = r.fontSize.read(ctx);
  const weightRead = r.fontWeight.read(ctx);
  const italicRead = r.italic.read(ctx);
  const underlineRead = r.underline.read(ctx);
  const lineThroughRead = r.lineThrough.read(ctx);
  const colorRead = r.color.read(ctx);
  const caseRead = r.textTransform.read(ctx);

  const famVal = famRead === MIXED ? null : (famRead as string) ?? font.fontFamily;
  const sizeVal = sizeRead === MIXED ? null : (sizeRead as number) ?? font.fontSize;
  const weightVal = weightRead === MIXED ? null : String((weightRead as string) ?? font.fontWeight);
  const isBold = weightVal != null && Number(weightVal) >= 700; // MIXED → false
  const color =
    colorRead === MIXED || colorRead == null
      ? { color: font.color, opacity: font.opacity }
      : (colorRead as { color: string; opacity: number });
  const caseVal = caseRead === MIXED ? null : String((caseRead as string) ?? font.textTransform);

  return (
    <>
      <BarDropdown
        label={famRead === MIXED ? 'Karışık' : (famVal as string)}
        options={FAMILIES.map((f) => ({ v: f, l: f }))}
        selected={famVal}
        onSelect={(v) => onApply(r.fontFamily, v)}
      />

      <SizeStepper value={sizeVal} fallback={font.fontSize} onStep={(n) => onApply(r.fontSize, n)} />

      <BarDropdown
        label={
          weightRead === MIXED ? 'Karışık' : WEIGHTS.find((w) => w.v === weightVal)?.l ?? 'Normal'
        }
        options={WEIGHTS}
        selected={weightVal}
        width="w-28"
        onSelect={(v) => onApply(r.fontWeight, v)}
      />

      <ToggleBtn active={isBold} title="Kalın" onClick={() => onApply(r.fontWeight, isBold ? '400' : '700')}>
        <Bold size={16} />
      </ToggleBtn>
      <ToggleBtn active={italicRead === true} title="İtalik" onClick={() => onApply(r.italic, italicRead !== true)}>
        <Italic size={16} />
      </ToggleBtn>
      <ToggleBtn
        active={underlineRead === true}
        title="Altı çizili"
        onClick={() => onApply(r.underline, underlineRead !== true)}
      >
        <Underline size={16} />
      </ToggleBtn>
      <ToggleBtn
        active={lineThroughRead === true}
        title="Üstü çizili"
        onClick={() => onApply(r.lineThrough, lineThroughRead !== true)}
      >
        <Strikethrough size={16} />
      </ToggleBtn>

      <ColorOpacityPicker
        solidOnly
        avoidRect={getAvoidRect?.() ?? null}
        trigger={<ColorSwatch color={color.color} opacity={color.opacity} />}
        value={{ type: 'solid', color: color.color, opacity: color.opacity }}
        onChange={(v) => {
          if (v.type !== 'solid') return;
          onApply(r.color, { color: v.color, opacity: v.opacity });
        }}
      />

      <BarDropdown
        label={caseRead === MIXED ? 'Karışık' : CASES.find((c) => c.v === (caseVal ?? 'none'))?.l ?? 'Aa'}
        options={CASES}
        selected={caseVal ?? 'none'}
        width="w-32"
        onSelect={(v) => onApply(r.textTransform, v)}
      />
    </>
  );
}
