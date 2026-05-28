interface SegmentedOption {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  disabled = false,
  className = '',
}: SegmentedControlProps) {
  return (
    <div
      className={[
        'flex rounded-radius-md border border-border-default overflow-hidden',
        disabled ? 'opacity-40 pointer-events-none' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={[
            'flex-1 h-9 px-3 text-[13px] tracking-normal transition-colors cursor-pointer',
            'border-r border-border-default last:border-r-0',
            opt.value === value
              ? 'bg-[#1e293b] text-white font-medium'
              : 'font-normal text-text-secondary bg-surface-panel hover:bg-surface-subtle',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
