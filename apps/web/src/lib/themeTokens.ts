import {
  defaultDarkTheme,
  defaultLightTheme,
  type UIThemeTokens,
} from '@matbaapro/shared';
import type { ThemeMode } from '@/stores/theme.store';

type DeepPartialTheme = Partial<{
  colors: Partial<UIThemeTokens['colors']>;
  typography: Partial<
    Omit<UIThemeTokens['typography'], 'fontFamilySans'> & {
      fontFamilySans: string;
    }
  >;
  radii: Partial<UIThemeTokens['radii']>;
  shadows: Partial<UIThemeTokens['shadows']>;
  buttons: Partial<UIThemeTokens['buttons']>;
}>;

export function cloneTheme(tokens: UIThemeTokens): UIThemeTokens {
  return JSON.parse(JSON.stringify(tokens)) as UIThemeTokens;
}

export function defaultThemeForMode(mode: ThemeMode): UIThemeTokens {
  return cloneTheme(mode === 'dark' ? defaultDarkTheme : defaultLightTheme);
}

export function normalizeThemeTokens(
  tokens: unknown,
  mode: ThemeMode = 'light',
): UIThemeTokens {
  const base = defaultThemeForMode(mode);
  const partial = (tokens ?? {}) as DeepPartialTheme;

  return {
    colors: { ...base.colors, ...(partial.colors ?? {}) },
    typography: {
      ...base.typography,
      ...(partial.typography ?? {}),
      headingXl: { ...base.typography.headingXl, ...(partial.typography?.headingXl ?? {}) },
      navLabel: { ...base.typography.navLabel, ...(partial.typography?.navLabel ?? {}) },
      headingMd: { ...base.typography.headingMd, ...(partial.typography?.headingMd ?? {}) },
      headingSm: { ...base.typography.headingSm, ...(partial.typography?.headingSm ?? {}) },
      bodyMd: { ...base.typography.bodyMd, ...(partial.typography?.bodyMd ?? {}) },
      bodySm: { ...base.typography.bodySm, ...(partial.typography?.bodySm ?? {}) },
      bodyXs: { ...base.typography.bodyXs, ...(partial.typography?.bodyXs ?? {}) },
      labelMd: { ...base.typography.labelMd, ...(partial.typography?.labelMd ?? {}) },
      labelSm: { ...base.typography.labelSm, ...(partial.typography?.labelSm ?? {}) },
      iconLabel: { ...base.typography.iconLabel, ...(partial.typography?.iconLabel ?? {}) },
    },
    radii: { ...base.radii, ...(partial.radii ?? {}) },
    shadows: { ...base.shadows, ...(partial.shadows ?? {}) },
    buttons: { ...base.buttons, ...(partial.buttons ?? {}) },
  };
}