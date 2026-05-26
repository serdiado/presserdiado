import type { SpacingData } from '@matbaapro/shared';

interface Props {
  title?: string;
  value: SpacingData;
  onChange: (v: SpacingData) => void;
}

export function SpacingPicker({ title = 'İç Boşluk', value, onChange }: Props) {
  const setLinked = (v: number) =>
    onChange({ t: v, r: v, b: v, l: v, linked: true });
  const setSide = (k: 't' | 'r' | 'b' | 'l', v: number) =>
    onChange({ ...value, [k]: v, linked: false });
  const toggleLink = () => {
    if (!value.linked)
      onChange({ t: value.t, r: value.t, b: value.t, l: value.t, linked: true });
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
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded border border-slate-200">
          <span className="text-[9px] font-medium text-slate-400 w-8">Tümü</span>
          <input
            type="range"
            min={0}
            max={100}
            value={value.t}
            onChange={(e) => setLinked(Number(e.target.value))}
            className="flex-1 studio-slider"
          />
          <input
            type="number"
            value={value.t}
            onChange={(e) => setLinked(parseInt(e.target.value) || 0)}
            className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {(
            [
              ['t', 'Üst'],
              ['r', 'Sağ'],
              ['b', 'Alt'],
              ['l', 'Sol'],
            ] as const
          ).map(([k, label]) => (
            <div key={k} className="flex items-center justify-between gap-1 bg-slate-50 p-1.5 rounded border border-slate-200">
              <span className="text-[8px] font-medium text-slate-400 w-6">{label}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={value[k]}
                onChange={(e) => setSide(k, Number(e.target.value))}
                className="flex-1 studio-slider"
              />
              <input
                type="number"
                value={value[k]}
                onChange={(e) => setSide(k, parseInt(e.target.value) || 0)}
                className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
