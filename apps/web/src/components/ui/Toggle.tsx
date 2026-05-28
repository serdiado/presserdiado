interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}: ToggleProps) {
  return (
    <label
      className={[
        'inline-flex items-center gap-2.5 cursor-pointer select-none',
        disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={[
          'relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer shrink-0',
          checked ? 'bg-primary' : 'bg-border-default',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white',
            'transition-transform duration-200 shadow-sm',
            checked ? 'translate-x-4' : 'translate-x-0',
          ].join(' ')}
        />
      </span>
      {label && (
        <span className="text-[13px] font-normal text-text-secondary tracking-normal">
          {label}
        </span>
      )}
    </label>
  );
}
