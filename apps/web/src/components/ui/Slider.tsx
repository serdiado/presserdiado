interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  label,
  disabled = false,
  className = '',
}: SliderProps) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  return (
    <div
      className={[
        disabled ? 'opacity-40 pointer-events-none' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label && (
        <span className="block mb-2 text-xs font-normal text-text-secondary tracking-normal">
          {label}
        </span>
      )}

      <div className="flex items-center gap-2">
        {/* Track */}
        <div className="relative h-5 flex items-center flex-1 group">
          {/* Track background */}
          <div className="absolute inset-0 h-1 top-1/2 -translate-y-1/2 rounded-full bg-border-default overflow-hidden">
            {/* Fill */}
            <div
              className="absolute left-0 h-full bg-primary rounded-full pointer-events-none"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Native range — invisible but interactive */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(parseFloat(parseFloat(e.target.value).toFixed(2)))}
            className={[
              'absolute inset-0 w-full h-full opacity-0 z-10',
              disabled ? 'cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          />

          {/* Custom thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none
              w-4 h-4 rounded-full bg-white border-2 border-primary
              transition-transform duration-150 group-hover:scale-110"
            style={{ left: `${pct}%` }}
          />
        </div>

        {/* Value input */}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(parseFloat(e.target.value).toFixed(2)))}
          onBlur={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(parseFloat(clamp(v).toFixed(2)));
          }}
          className="w-13 h-8 text-center text-xs font-medium
            border border-border-default rounded-[6px]
            bg-surface-panel text-text-primary
            focus:border-primary outline-none transition-colors
            [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        {unit && (
          <span className="text-[11px] text-text-muted min-w-4 tracking-normal">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
