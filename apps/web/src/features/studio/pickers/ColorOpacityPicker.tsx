import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HexColorPicker } from 'react-colorful';
import type {
  ColorValue,
  GradientStop,
  GradientType,
  GradientValue,
  SolidValue,
} from '@matbaapro/shared';
import { colorValueBackground, gradientToCss, hexToRgba } from '../util/style';

interface Props {
  value: ColorValue;
  onChange: (value: ColorValue) => void;
  thickness?: number;
  onThicknessChange?: (t: number) => void;
  /** Render as border indicator (outlined preview) instead of fill. */
  type?: 'fill' | 'border';
  /** Hide the gradient tab entirely (callers whose data model is solid-only). */
  solidOnly?: boolean;
}

const STORAGE_KEY = 'presserdiado_saved_colors';
const COLORS_UPDATED = 'presserdiado_colors_updated';
const POPUP_WIDTH = 320;
const MAX_STOPS = 3;

const CHECKER_BG =
  "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIiAvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIiAvPjwvc3ZnPg==')";

// ── colour conversion helpers ────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const int = parseInt(clean.padEnd(6, '0'), 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

function rgbToCmyk(r: number, g: number, b: number) {
  const rf = r / 255, gf = g / 255, bf = b / 255;
  const k = 1 - Math.max(rf, gf, bf);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rf - k) / (1 - k)) * 100),
    m: Math.round(((1 - gf - k) / (1 - k)) * 100),
    y: Math.round(((1 - bf - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function cmykToHex(c: number, m: number, y: number, k: number): string {
  const r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
  const g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
  const b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
  return rgbToHex(r, g, b);
}

function isValidHex(v: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(v);
}

// ── value helpers ─────────────────────────────────────────────────────

function ensureSolid(v: ColorValue): SolidValue {
  if (v.type === 'solid') return v;
  const first = v.stops[0];
  return { type: 'solid', color: first?.color ?? '#ffffff', opacity: first?.opacity ?? 100 };
}

function ensureGradient(v: ColorValue): GradientValue {
  if (v.type === 'gradient') return v;
  return {
    type: 'gradient',
    gradientType: 'linear',
    angle: 135,
    stops: [
      { color: v.color, opacity: v.opacity, position: 0 },
      { color: '#000000', opacity: 100, position: 100 },
    ],
  };
}

// ── solid sub-picker (HEX/RGB/CMYK + opacity) ─────────────────────────

type ColorTab = 'HEX' | 'RGB' | 'CMYK';

interface SolidEditorProps {
  color: string;
  opacity: number;
  onChange: (color: string, opacity: number) => void;
  /** Compact = no opacity slider, used inside per-stop mini pickers. */
  compact?: boolean;
}

function SolidEditor({ color, opacity, onChange, compact }: SolidEditorProps) {
  const [tab, setTab] = useState<ColorTab>('HEX');
  const [hexInput, setHexInput] = useState(color.toUpperCase());

  const rgb = hexToRgb(color);
  const [rInput, setRInput] = useState(String(rgb.r));
  const [gInput, setGInput] = useState(String(rgb.g));
  const [bInput, setBInput] = useState(String(rgb.b));

  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  const [cInput, setCInput] = useState(String(cmyk.c));
  const [mInput, setMInput] = useState(String(cmyk.m));
  const [yInput, setYInput] = useState(String(cmyk.y));
  const [kInput, setKInput] = useState(String(cmyk.k));

  useEffect(() => {
    setHexInput(color.toUpperCase());
    const next = hexToRgb(color);
    setRInput(String(next.r));
    setGInput(String(next.g));
    setBInput(String(next.b));
    const c2 = rgbToCmyk(next.r, next.g, next.b);
    setCInput(String(c2.c));
    setMInput(String(c2.m));
    setYInput(String(c2.y));
    setKInput(String(c2.k));
  }, [color]);

  return (
    <div className="flex flex-col gap-3">
      <div style={{ borderRadius: 8, overflow: 'hidden' }}>
        <HexColorPicker
          color={color}
          onChange={(c) => onChange(c, opacity)}
          style={{ width: '100%', height: compact ? 140 : 200 }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex border-b border-slate-100">
          {(['HEX', 'RGB', 'CMYK'] as ColorTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-sm transition-colors ${
                tab === t
                  ? 'border-b-2 border-blue-600 text-slate-900 font-semibold -mb-px'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'HEX' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">#</span>
            <input
              type="text"
              value={hexInput.replace(/^#/, '')}
              onChange={(e) => {
                const raw = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 6);
                setHexInput(raw);
                if (raw.length === 6 && isValidHex('#' + raw)) onChange('#' + raw, opacity);
              }}
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-sm py-2 px-2 rounded outline-none uppercase font-mono focus:border-slate-400"
              placeholder="FFFFFF"
              maxLength={6}
            />
          </div>
        )}

        {tab === 'RGB' && (
          <div className="flex gap-2">
            {[
              { label: 'R', val: rInput, set: setRInput, idx: 0 },
              { label: 'G', val: gInput, set: setGInput, idx: 1 },
              { label: 'B', val: bInput, set: setBInput, idx: 2 },
            ].map(({ label, val, set, idx }) => (
              <div key={label} className="flex flex-col items-center gap-0.5 flex-1">
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={val}
                  onChange={(e) => {
                    set(e.target.value);
                    const n = parseInt(e.target.value, 10);
                    if (isNaN(n)) return;
                    const vals = [rgb.r, rgb.g, rgb.b];
                    vals[idx] = Math.max(0, Math.min(255, n));
                    onChange(rgbToHex(vals[0], vals[1], vals[2]), opacity);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm py-2 px-2 rounded outline-none focus:border-slate-400 text-center"
                />
                <span className="text-xs text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'CMYK' && (
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
              {[
                { label: 'C', val: cInput, set: setCInput },
                { label: 'M', val: mInput, set: setMInput },
                { label: 'Y', val: yInput, set: setYInput },
                { label: 'K', val: kInput, set: setKInput },
              ].map(({ label, val, set }) => (
                <div key={label} className="flex flex-col items-center gap-0.5 flex-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={val}
                    onChange={(e) => {
                      set(e.target.value);
                      const n = parseInt(e.target.value, 10);
                      if (isNaN(n)) return;
                      const cv = label === 'C' ? n : parseInt(cInput, 10) || 0;
                      const mv = label === 'M' ? n : parseInt(mInput, 10) || 0;
                      const yv = label === 'Y' ? n : parseInt(yInput, 10) || 0;
                      const kv = label === 'K' ? n : parseInt(kInput, 10) || 0;
                      onChange(cmykToHex(cv, mv, yv, kv), opacity);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm py-2 px-2 rounded outline-none focus:border-slate-400 text-center"
                  />
                  <span className="text-xs text-slate-400">{label}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 leading-snug">
              Ekran rengi, baskıda farklılık gösterebilir.
            </p>
          </div>
        )}
      </div>

      {!compact && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Saydamlık</span>
            <span className="text-xs text-slate-800 font-bold">%{opacity}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={opacity}
            onChange={(e) => onChange(color, parseInt(e.target.value, 10))}
            className="w-full studio-slider"
          />
        </div>
      )}
    </div>
  );
}

// ── gradient editor ───────────────────────────────────────────────────

interface GradientEditorProps {
  value: GradientValue;
  onChange: (v: GradientValue) => void;
}

// 3 simple inline icons (no extra deps).
const LinearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="14" height="14" rx="2" fill="url(#lg)" />
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="16" y2="0">
        <stop offset="0" stopColor="#1e293b" />
        <stop offset="1" stopColor="#cbd5e1" />
      </linearGradient>
    </defs>
  </svg>
);
const RadialIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="14" height="14" rx="2" fill="url(#rg)" />
    <defs>
      <radialGradient id="rg" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#1e293b" />
        <stop offset="1" stopColor="#cbd5e1" />
      </radialGradient>
    </defs>
  </svg>
);
const DiamondIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="14" height="14" rx="2" fill="#cbd5e1" />
    <path d="M8 2.5 L13.5 8 L8 13.5 L2.5 8 Z" fill="#1e293b" />
  </svg>
);

function GradientEditor({ value, onChange }: GradientEditorProps) {
  const stops = useMemo(
    () => value.stops.slice().sort((a, b) => a.position - b.position),
    [value.stops],
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [miniOpen, setMiniOpen] = useState(true);
  const barRef = useRef<HTMLDivElement>(null);
  const dragIdxRef = useRef<number | null>(null);

  // Keep active in range.
  useEffect(() => {
    if (activeIdx >= stops.length) setActiveIdx(Math.max(0, stops.length - 1));
  }, [stops.length, activeIdx]);

  const updateStop = (idx: number, patch: Partial<GradientStop>) => {
    const next = stops.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    onChange({ ...value, stops: next });
  };

  const addStopAt = (position: number) => {
    if (stops.length >= MAX_STOPS) return;
    // Interpolate colour at this position from neighbouring stops.
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    let color = sorted[0]?.color ?? '#ffffff';
    let opacity = sorted[0]?.opacity ?? 100;
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i];
      const b = sorted[i + 1];
      if (position >= a.position && position <= b.position) {
        color = a.color;
        opacity = a.opacity;
        break;
      }
    }
    const newStop: GradientStop = { color, opacity, position };
    const nextStops = [...stops, newStop].sort((a, b) => a.position - b.position);
    onChange({ ...value, stops: nextStops });
    setActiveIdx(nextStops.findIndex((s) => s === newStop));
    setMiniOpen(true);
  };

  const removeStop = (idx: number) => {
    if (stops.length <= 2) return;
    const next = stops.filter((_, i) => i !== idx);
    onChange({ ...value, stops: next });
    if (activeIdx >= next.length) setActiveIdx(next.length - 1);
  };

  const onBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    addStopAt(Math.max(0, Math.min(100, pct)));
  };

  const onHandlePointerDown = (idx: number) => (e: React.PointerEvent) => {
    e.stopPropagation();
    setActiveIdx(idx);
    dragIdxRef.current = idx;
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onHandlePointerMove = (e: React.PointerEvent) => {
    if (dragIdxRef.current === null || !barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const pct = Math.max(
      0,
      Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)),
    );
    updateStop(dragIdxRef.current, { position: pct });
  };

  const onHandlePointerUp = (e: React.PointerEvent) => {
    if (dragIdxRef.current !== null) {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
      dragIdxRef.current = null;
    }
  };

  const onHandleClick = (idx: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx(idx);
    setMiniOpen(true);
  };

  const previewStyle = colorValueBackground(value);
  const active = stops[activeIdx];
  const totalOpacity = stops.reduce((s, st) => s + st.opacity, 0) / Math.max(1, stops.length);

  return (
    <div className="flex flex-col gap-3">
      {/* gradient type selector */}
      <div className="grid grid-cols-3 gap-1.5">
        {(
          [
            { type: 'linear' as GradientType, label: 'Doğrusal', Icon: LinearIcon },
            { type: 'radial' as GradientType, label: 'Dairesel', Icon: RadialIcon },
            { type: 'diamond' as GradientType, label: 'Baklava', Icon: DiamondIcon },
          ]
        ).map(({ type: gt, label, Icon }) => (
          <button
            key={gt}
            onClick={() => onChange({ ...value, gradientType: gt })}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
              value.gradientType === gt
                ? 'border-2 border-slate-900 bg-slate-50 text-slate-900 font-semibold'
                : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Icon />
            <span className="text-[11px]">{label}</span>
          </button>
        ))}
      </div>

      {/* angle (linear only) */}
      {value.gradientType === 'linear' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">Açı</span>
            <span className="text-xs font-bold text-slate-800 tabular-nums">
              {value.angle ?? 135}°
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={value.angle ?? 135}
            onChange={(e) => onChange({ ...value, angle: parseInt(e.target.value, 10) })}
            className="w-full studio-slider"
          />
        </div>
      )}

      {/* gradient bar with handles */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase">
          Renkler ({stops.length}/{MAX_STOPS})
        </span>
        <div className="relative" style={{ paddingTop: '26px' }}>
          {/* pin/bookmark handles — hang from top, circle above bar, tip at bar edge */}
          {stops.map((s, idx) => {
            const isActive = idx === activeIdx;
            return (
              <div
                key={idx}
                onPointerDown={onHandlePointerDown(idx)}
                onPointerMove={onHandlePointerMove}
                onPointerUp={onHandlePointerUp}
                onClick={onHandleClick(idx)}
                className={`absolute top-0 -translate-x-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing ${
                  isActive ? 'z-20' : 'z-10'
                }`}
                style={{ left: `${s.position}%` }}
              >
                <div
                  className={`w-5 h-5 rounded-full shadow-lg ${
                    isActive ? 'border border-slate-900' : 'border-2 border-slate-400'
                  }`}
                  style={{
                    backgroundColor: hexToRgba(s.color, s.opacity),
                    boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                  }}
                />
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: isActive
                      ? '6px solid rgb(15, 23, 42)'
                      : '6px solid rgb(148, 163, 184)',
                  }}
                />
              </div>
            );
          })}
          {/* gradient bar */}
          <div
            ref={barRef}
            onClick={onBarClick}
            className="relative h-9 rounded-md border border-slate-200 cursor-crosshair overflow-hidden"
            style={{ backgroundImage: CHECKER_BG, backgroundColor: '#ffffff' }}
          >
            <div className="absolute inset-0 pointer-events-none" style={previewStyle} />
          </div>
        </div>
        <p className="text-[10px] text-slate-400 leading-snug">
          Çubuğa tıklayarak yeni renk ekleyin, handle'ı sürükleyerek konumunu
          değiştirin, üstüne tıklayarak rengini düzenleyin.
        </p>
      </div>

      {/* active stop quick controls */}
      {active && (
        <div className="border border-slate-200 rounded-lg p-2.5 space-y-2 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMiniOpen((v) => !v)}
              className="w-7 h-7 rounded border-2 border-slate-300 shrink-0 shadow-sm"
              style={{ backgroundColor: hexToRgba(active.color, active.opacity) }}
              title="Rengi düzenle"
            />
            <span className="text-[11px] text-slate-800 font-mono flex-1">
              {active.color.toUpperCase()}
            </span>
            {stops.length > 2 && (
              <button
                onClick={() => removeStop(activeIdx)}
                className="text-slate-400 hover:text-red-500 text-xs leading-none shrink-0 px-1"
                title="Sil"
              >
                ×
              </button>
            )}
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={active.position}
            onChange={(e) =>
              updateStop(activeIdx, { position: parseInt(e.target.value, 10) })
            }
            className="w-full studio-slider"
          />

          {miniOpen && (
            <div className="pt-2 border-t border-slate-200">
              <SolidEditor
                color={active.color}
                opacity={active.opacity}
                onChange={(c, o) => updateStop(activeIdx, { color: c, opacity: o })}
                compact
              />
            </div>
          )}
        </div>
      )}

      {/* overall opacity (applies to all stops equally — convenience) */}
      <div className="flex flex-col gap-1 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 font-bold uppercase">Saydamlık</span>
          <span className="text-xs text-slate-800 font-bold">%{Math.round(totalOpacity)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(totalOpacity)}
          onChange={(e) => {
            const target = parseInt(e.target.value, 10);
            const next = stops.map((s) => ({ ...s, opacity: target }));
            onChange({ ...value, stops: next });
          }}
          className="w-full studio-slider"
        />
      </div>
    </div>
  );
}

// ── trigger preview ───────────────────────────────────────────────────

function previewCss(value: ColorValue): React.CSSProperties {
  if (value.type === 'solid') {
    return { backgroundColor: value.color, opacity: value.opacity / 100 };
  }
  return { backgroundImage: gradientToCss(value), opacity: 1 };
}

// ── main component ────────────────────────────────────────────────────

type TopTab = 'solid' | 'gradient';

export function ColorOpacityPicker({
  value,
  onChange,
  thickness,
  onThicknessChange,
  type = 'fill',
  solidOnly = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedColors, setSavedColors] = useState<{ c: string; o: number }[]>([]);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [topTab, setTopTab] = useState<TopTab>(value.type === 'gradient' ? 'gradient' : 'solid');

  const buttonRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync top tab when value type changes externally.
  useEffect(() => {
    if (solidOnly) {
      setTopTab('solid');
      return;
    }
    setTopTab(value.type === 'gradient' ? 'gradient' : 'solid');
  }, [value.type, solidOnly]);

  // Saved colours (storage) — solid only.
  const loadColors = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setSavedColors(saved ? JSON.parse(saved) : []);
    } catch {
      setSavedColors([]);
    }
  }, []);

  useEffect(() => {
    loadColors();
    window.addEventListener(COLORS_UPDATED, loadColors);
    return () => window.removeEventListener(COLORS_UPDATED, loadColors);
  }, [loadColors]);

  // Smart positioning.
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    const r = buttonRef.current.getBoundingClientRect();
    const POPUP_HEIGHT = 580;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const left =
      r.right + 5 + POPUP_WIDTH > vw ? Math.max(4, r.left - POPUP_WIDTH - 5) : r.right + 5;
    const top =
      r.bottom + 5 + POPUP_HEIGHT > vh ? Math.max(4, r.top - POPUP_HEIGHT) : r.bottom + 5;
    setCoords({ top, left });
  }, [isOpen]);

  // Close on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        isOpen &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [isOpen]);

  // Top-tab switching: convert between solid / gradient as needed.
  const setTab = (next: TopTab) => {
    setTopTab(next);
    if (next === 'solid' && value.type === 'gradient') {
      onChange(ensureSolid(value));
    } else if (next === 'gradient' && value.type === 'solid') {
      onChange(ensureGradient(value));
    }
  };

  const solidView = ensureSolid(value);

  const saveColor = () => {
    if (value.type !== 'solid') return;
    const key = { c: value.color, o: value.opacity };
    if (savedColors.some((s) => s.c === key.c && s.o === key.o)) return;
    const next = [key, ...savedColors].slice(0, 18);
    setSavedColors(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(COLORS_UPDATED));
  };

  const deleteSaved = (e: React.MouseEvent, i: number) => {
    e.stopPropagation();
    const next = savedColors.filter((_, idx) => idx !== i);
    setSavedColors(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(COLORS_UPDATED));
  };

  const preview = previewCss(value);

  return (
    <>
      {/* trigger button */}
      <div
        ref={buttonRef}
        className="w-8 h-8 rounded cursor-pointer border border-slate-300 shadow-sm relative overflow-hidden shrink-0 bg-white"
        onClick={() => setIsOpen(!isOpen)}
        title={
          value.type === 'solid'
            ? `${value.color} (%${value.opacity})`
            : `Gradient (${value.gradientType})`
        }
      >
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: CHECKER_BG }} />
        {type === 'border' ? (
          <div
            className="absolute inset-1.5 border-[3px] rounded-[1px] z-10"
            style={{
              borderColor:
                value.type === 'solid' ? value.color : value.stops[0]?.color ?? '#000',
              opacity:
                value.type === 'solid' ? value.opacity / 100 : 1,
            }}
          />
        ) : (
          <div className="absolute inset-0 z-10" style={preview} />
        )}
      </div>

      {/* popup */}
      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-99999 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 flex flex-col gap-3 overflow-y-auto"
            style={{
              top: coords.top,
              left: coords.left,
              width: POPUP_WIDTH,
              maxHeight: 'calc(100vh - 16px)',
            }}
          >
            {/* top tabs */}
            {!solidOnly && (
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setTab('solid')}
                  className={`py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    topTab === 'solid'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Düz Renk
                </button>
                <button
                  onClick={() => setTab('gradient')}
                  className={`py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    topTab === 'gradient'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Geçişli
                </button>
              </div>
            )}

            {topTab === 'solid' ? (
              <SolidEditor
                color={solidView.color}
                opacity={solidView.opacity}
                onChange={(c, o) => onChange({ type: 'solid', color: c, opacity: o })}
              />
            ) : (
              <GradientEditor
                value={ensureGradient(value)}
                onChange={(g) => onChange(g)}
              />
            )}

            {/* thickness slider — works for both tabs */}
            {thickness !== undefined && onThicknessChange && (
              <div className="flex flex-col gap-1 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold uppercase">Kalınlık</span>
                  <span className="text-xs text-slate-800 font-bold">{thickness}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={thickness}
                  onChange={(e) => onThicknessChange(parseInt(e.target.value, 10))}
                  className="w-full studio-slider"
                />
              </div>
            )}

            {/* saved colours — only on solid tab */}
            {topTab === 'solid' && (
              <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Kayıtlı</span>
                  <button
                    onClick={saveColor}
                    className="text-[9px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded font-bold border border-slate-200"
                  >
                    + EKLE
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {savedColors.map((sc, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded cursor-pointer border border-slate-200 hover:border-slate-400 relative overflow-hidden group/c shadow-sm"
                      onClick={() =>
                        onChange({ type: 'solid', color: sc.c, opacity: sc.o })
                      }
                      title={`${sc.c} (%${sc.o})`}
                    >
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{ backgroundImage: CHECKER_BG }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: sc.c, opacity: sc.o / 100 }}
                      />
                      <div
                        className="absolute top-0 right-0 bg-red-600/90 text-white w-3 h-3 flex items-center justify-center text-[10px] opacity-0 group-hover/c:opacity-100 rounded-bl-sm z-10 font-black"
                        onClick={(e) => deleteSaved(e, idx)}
                      >
                        ×
                      </div>
                    </div>
                  ))}
                  {savedColors.length === 0 && (
                    <span className="text-[9px] text-slate-500 italic">Henüz renk yok.</span>
                  )}
                </div>
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
