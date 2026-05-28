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
  primary:   'bg-primary hover:bg-primary-hover text-white border border-transparent',
  secondary: 'bg-surface-panel hover:bg-surface-subtle text-text-primary border border-border-default',
  ghost:     'bg-transparent hover:bg-surface-subtle text-text-secondary border border-transparent',
  danger:    'bg-[#FEF2F2] hover:bg-[#fee2e2] text-danger border border-[#fecaca]',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-9 px-4 text-[13px]',
  sm: 'h-8 px-3 text-xs',
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
        'inline-flex items-center justify-center gap-1.5 rounded-radius-md',
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
