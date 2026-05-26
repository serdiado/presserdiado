import { Moon, Sun } from 'lucide-react';
import { useThemeStore, type ThemeMode } from '@/stores/theme.store';

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const nextMode: ThemeMode = mode === 'light' ? 'dark' : 'light';

  return (
    <button
      type="button"
      onClick={() => void setMode(nextMode)}
      title={mode === 'light' ? 'Dark temaya geç' : 'Light temaya geç'}
      className={`inline-flex items-center justify-center gap-2 rounded-radius-md border border-border-default bg-surface-subtle text-text-secondary transition hover:border-border-strong hover:text-text-primary ${
        compact ? 'h-8 px-2 text-label-sm' : 'h-9 px-3 text-label-md'
      }`}
    >
      {mode === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {!compact && <span>{mode === 'light' ? 'Light' : 'Dark'}</span>}
    </button>
  );
}