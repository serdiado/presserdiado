import type { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'md' | 'sm';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  onClick?: () => void;
  children: ReactNode;
  type?: 'button' | 'submit';
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-primary hover:bg-primary-hover text-white border border-transparent h-10',
  secondary: 'bg-surface-panel hover:bg-surface-subtle text-text-primary border border-border-default h-10',
  ghost:     'bg-transparent hover:bg-surface-subtle text-text-secondary border border-transparent h-8',
  danger:    'bg-[#FEF2F2] hover:bg-[#fee2e2] text-danger border border-[#fecaca] h-10',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'text-sm',
  sm: 'h-8 text-xs',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  leftIcon,
  onClick,
  children,
  type = 'button',
  className = '',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 px-4 rounded-md',
        'font-medium tracking-normal transition-colors active:scale-[0.98]',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {leftIcon}
      {children}
    </button>
  );
}
