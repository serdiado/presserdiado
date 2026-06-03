import { Link2, Lock, LockOpen } from 'lucide-react';
import type { BorderRadiusData } from '@matbaapro/shared';

interface Props {
  title?: string;
  value: BorderRadiusData;
  onChange: (val: BorderRadiusData) => void;
}

const inputCls = 'w-16 text-center text-sm font-medium border border-border-default rounded-md p-2 outline-none focus:border-border-strong';

export function BorderRadiusPicker({ title = 'Köşe ovalliği', value, onChange }: Props) {
  const setLinked = (v: number) => onChange({ tl: v, tr: v, bl: v, br: v, linked: true });
  const setCorner = (k: keyof BorderRadiusData, v: number) =>
    onChange({ ...value, [k]: v, linked: false });
  const toggleLink = () => {
    if (!value.linked) onChange({ tl: value.tl, tr: value.tl, bl: value.tl, br: value.tl, linked: true });
    else onChange({ ...value, linked: false });
  };

  const handleChange = (corner: 'tl' | 'tr' | 'bl' | 'br', raw: string) => {
    const v = raw === '' ? 0 : Math.max(0, Math.min(99, parseInt(raw, 10) || 0));
    value.linked ? setLinked(v) : setCorner(corner, v);
  };

  const linkBar = (
    <div className={`flex justify-center py-1 transition-opacity ${value.linked ? 'text-text-secondary opacity-100' : 'opacity-0'}`}>
      <Link2 size={12} style={{ transform: 'rotate(90deg)' }} />
    </div>
  );

  return (
    <div>
      {title && <p className="text-[10px] font-bold text-text-secondary mb-3">{title}</p>}

      <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center">
        {/* Sol: TL + bağ + BL */}
        <div className="flex flex-col items-center gap-1">
          <input
            type="number"
            min={0}
            max={99}
            value={value.linked ? value.tl : value.tl}
            onChange={(e) => handleChange('tl', e.target.value)}
            className={inputCls}
          />
          {linkBar}
          <input
            type="number"
            min={0}
            max={99}
            value={value.linked ? value.tl : value.bl}
            onChange={(e) => handleChange('bl', e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Orta: preview kare, kilit içinde */}
        <div className="flex items-center justify-center">
          <div
            className="w-20 h-20 border-2 border-border-default relative"
            style={{ borderRadius: `${value.tl}px ${value.tr}px ${value.br}px ${value.bl}px` }}
          >
            <button
              onClick={toggleLink}
              className={`absolute inset-0 flex items-center justify-center cursor-pointer transition-colors ${
                value.linked ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {value.linked ? <Lock size={16} /> : <LockOpen size={16} />}
            </button>
          </div>
        </div>

        {/* Sağ: TR + bağ + BR */}
        <div className="flex flex-col items-center gap-1">
          <input
            type="number"
            min={0}
            max={99}
            value={value.linked ? value.tl : value.tr}
            onChange={(e) => handleChange('tr', e.target.value)}
            className={inputCls}
          />
          {linkBar}
          <input
            type="number"
            min={0}
            max={99}
            value={value.linked ? value.tl : value.br}
            onChange={(e) => handleChange('br', e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}
