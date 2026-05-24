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
    <div className="pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-slate-600">{title}</span>
        <button
          onClick={toggleLink}
          className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
            value.linked
              ? 'bg-slate-100 text-slate-800'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          }`}
        >
          {value.linked ? 'BAĞLI' : 'AYRI'}
        </button>
      </div>
      {value.linked ? (
        <div className="bg-slate-50 p-3 rounded border border-slate-200 text-center space-y-2">
          <span className="text-[10px] font-medium text-slate-500 block">Tüm Köşeler</span>
          <input
            type="number"
            value={value.tl}
            onChange={(e) => setLinked(parseInt(e.target.value) || 0)}
            className="w-30 mx-auto block text-[10px] font-bold text-slate-600 text-center border border-slate-200 rounded p-1.5 outline-none focus:border-slate-400"
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
            <div key={k} className="bg-slate-50 p-2 rounded border border-slate-200 space-y-1.5">
              <span className="text-[8px] font-bold text-slate-500">{label}</span>
              <input
                type="number"
                value={value[k] as number}
                onChange={(e) => setCorner(k, parseInt(e.target.value) || 0)}
                className="w-full text-[10px] font-bold text-slate-600 text-center border border-slate-200 rounded p-1.5 outline-none focus:border-slate-400"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
