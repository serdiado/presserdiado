import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  color: string;
  opacity: number;
  onChange: (color: string, opacity: number) => void;
  thickness?: number;
  onThicknessChange?: (t: number) => void;
  type?: 'fill' | 'border';
}

const STORAGE_KEY = 'matbaapro_saved_colors';
const CHECKER_BG =
  "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIiAvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIiAvPjwvc3ZnPg==')";

export function ColorOpacityPicker({
  color,
  opacity,
  onChange,
  thickness,
  onThicknessChange,
  type = 'fill',
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedColors, setSavedColors] = useState<{ c: string; o: number }[]>([]);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const loadColors = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setSavedColors(saved ? JSON.parse(saved) : []);
    } catch {
      setSavedColors([]);
    }
  };

  useEffect(() => {
    loadColors();
    window.addEventListener('matbaapro_colors_updated', loadColors);
    return () => window.removeEventListener('matbaapro_colors_updated', loadColors);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect();
      setCoords({ top: r.bottom + window.scrollY + 5, left: r.right + window.scrollX - 210 });
    }
  }, [isOpen]);

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

  const saveColor = () => {
    if (savedColors.some((s) => s.c === color && s.o === opacity)) return;
    const next = [{ c: color, o: opacity }, ...savedColors].slice(0, 18);
    setSavedColors(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('matbaapro_colors_updated'));
  };

  const deleteSaved = (e: React.MouseEvent, i: number) => {
    e.stopPropagation();
    const next = savedColors.filter((_, idx) => idx !== i);
    setSavedColors(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('matbaapro_colors_updated'));
  };

  return (
    <>
      <div
        ref={buttonRef}
        className="w-8 h-8 rounded cursor-pointer border border-slate-300 shadow-sm relative overflow-hidden shrink-0 bg-white"
        onClick={() => setIsOpen(!isOpen)}
        title={`${color} (%${opacity})`}
      >
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: CHECKER_BG }} />
        {type === 'border' ? (
          <div
            className="absolute inset-1.5 border-[3px] rounded-[1px] z-10"
            style={{ borderColor: color, opacity: opacity / 100 }}
          />
        ) : (
          <div
            className="absolute inset-0 z-10"
            style={{ backgroundColor: color, opacity: opacity / 100 }}
          />
        )}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-[99999] w-[210px] bg-white border border-slate-200 rounded-lg shadow-2xl p-3 flex flex-col gap-3"
            style={{ top: coords.top, left: coords.left }}
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded cursor-pointer border border-slate-300 shadow-sm relative overflow-hidden shrink-0">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => onChange(e.target.value, opacity)}
                  className="absolute -top-2.5 -left-2.5 w-[60px] h-[60px] cursor-pointer"
                />
              </div>
              <input
                type="text"
                value={color.toUpperCase()}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9A-F]{6}$/i.test(v)) onChange(v, opacity);
                }}
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-xs py-1.5 px-2 rounded outline-none uppercase font-mono text-center font-bold focus:border-blue-400"
              />
            </div>

            {thickness !== undefined && onThicknessChange && (
              <div className="flex flex-col gap-1 pb-2 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Kalınlık</span>
                  <span className="text-[10px] text-blue-600 font-bold">{thickness}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={thickness}
                  onChange={(e) => onThicknessChange(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600"
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Saydamlık</span>
                <span className="text-[10px] text-blue-600 font-bold">%{opacity}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={opacity}
                onChange={(e) => onChange(color, parseInt(e.target.value, 10))}
                className="w-full accent-blue-600"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Kayıtlı</span>
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
                    className="w-6 h-6 rounded cursor-pointer border border-slate-200 hover:border-blue-500 relative overflow-hidden group/c shadow-sm"
                    onClick={() => onChange(sc.c, sc.o)}
                    title={`${sc.c} (%${sc.o})`}
                  >
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: CHECKER_BG }} />
                    <div className="absolute inset-0" style={{ backgroundColor: sc.c, opacity: sc.o / 100 }} />
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
          </div>,
          document.body,
        )}
    </>
  );
}
