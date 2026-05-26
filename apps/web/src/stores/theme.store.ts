import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type UIThemeTokens,
  defaultLightTheme,
  defaultDarkTheme,
} from '@matbaapro/shared';
import { normalizeThemeTokens } from '@/lib/themeTokens';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  tokens: UIThemeTokens;
  isLoaded: boolean;
  setTokens: (tokens: UIThemeTokens) => void;
  setModeLocal: (mode: ThemeMode) => void;
  setMode: (mode: ThemeMode) => Promise<void>;
  fetchTheme: (mode?: ThemeMode) => Promise<void>;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      tokens: defaultLightTheme,
      isLoaded: false,

      setTokens: (tokens) => {
        set({ tokens, isLoaded: true });
      },

      setModeLocal: (mode) => {
        set({ mode });
      },

      setMode: async (mode) => {
        set({ mode });
        await get().fetchTheme(mode);
      },

      fetchTheme: async (mode) => {
        const m = mode ?? get().mode;
        try {
          const res = await fetch(`/api/v1/theme/${m}`);
          if (!res.ok) throw new Error('Theme fetch failed');
          const data = await res.json();
          set({ tokens: normalizeThemeTokens(data.tokens, m), isLoaded: true });
        } catch {
          set({
            tokens: m === 'dark' ? defaultDarkTheme : defaultLightTheme,
            isLoaded: true,
          });
        }
      },
    }),
    {
      name: 'matbaapro-theme-v1',
      partialize: (s) => ({ mode: s.mode }),
    },
  ),
);
