import type { BorderRadiusData } from '@matbaapro/shared';

interface Props {
  title?: string;
  value: BorderRadiusData;
  onChange: (val: BorderRadiusData) => void;
}

export function BorderRadiusPicker({ title = 'Köşe Ovalliği', value, onChange }: Props) {
  const setLinked = (v: number) => onChange({ tl: v, tr: v, bl: v, br: v, linked: true });
  const setCorner = (k: keyof BorderRadiusData, v: number) =>
    onChange({ ...value, [k]: v, linked: false });
  const toggleLink = () => {
    if (!value.linked) onChange({ tl: value.tl, tr: value.tl, bl: value.tl, br: value.tl, linked: true });
    else onChange({ ...value, linked: false });
  };

  return (
    <div className="pt-2 border-t border-border-default">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-text-secondary">{title}</span>
        <button
          onClick={toggleLink}
          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
            value.linked
              ? 'bg-surface-subtle text-text-primary'
              : 'bg-surface-subtle text-text-muted hover:bg-border-default'
          }`}
        >
          {value.linked ? 'BAĞLI' : 'AYRI'}
        </button>
      </div>
      {value.linked ? (
        <div className="bg-surface-subtle p-3 rounded border border-border-default text-center space-y-2">
          <span className="text-[10px] font-medium text-text-muted block">Tüm Köşeler</span>
          <input
            type="number"
            value={value.tl}
            onChange={(e) => setLinked(parseInt(e.target.value) || 0)}
            className="w-30 mx-auto block text-[10px] font-bold text-text-secondary text-center border border-border-default rounded p-1.5 outline-none focus:border-border-strong"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ['tl', 'TL'],
              ['tr', 'TR'],
              ['bl', 'BL'],
              ['br', 'BR'],
            ] as const
          ).map(([k, label]) => (
            <div key={k} className="bg-surface-subtle p-2 rounded border border-border-default space-y-1.5">
              <span className="text-[10px] font-bold text-text-muted">{label}</span>
              <input
                type="number"
                value={value[k] as number}
                onChange={(e) => setCorner(k, parseInt(e.target.value) || 0)}
                className="w-full text-[10px] font-bold text-text-secondary text-center border border-border-default rounded p-1.5 outline-none focus:border-border-strong"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
