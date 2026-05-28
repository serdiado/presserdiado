import { useEffect } from 'react';
import type { UIThemeTokens } from '@matbaapro/shared';
import { useThemeStore } from '@/stores/theme.store';
import { normalizeThemeTokens } from '@/lib/themeTokens';

export function applyTokensToDOM(tokens: UIThemeTokens) {
  const safeTokens = normalizeThemeTokens(tokens);
  const r = document.documentElement;

  r.style.setProperty('--color-primary',          safeTokens.colors.primary);
  r.style.setProperty('--color-primary-hover',    safeTokens.colors.primaryHover);
  r.style.setProperty('--color-danger',           safeTokens.colors.danger);
  r.style.setProperty('--color-success',          safeTokens.colors.success);
  r.style.setProperty('--color-warning',          safeTokens.colors.warning);
  r.style.setProperty('--color-surface-app',      safeTokens.colors.surfaceApp);
  r.style.setProperty('--color-surface-panel',    safeTokens.colors.surfacePanel);
  r.style.setProperty('--color-surface-subtle',   safeTokens.colors.surfaceSubtle);
  r.style.setProperty('--color-border-default',   safeTokens.colors.borderDefault);
  r.style.setProperty('--color-border-strong',    safeTokens.colors.borderStrong);
  r.style.setProperty('--color-border-selected',  safeTokens.colors.borderSelected);
  r.style.setProperty('--color-text-primary',     safeTokens.colors.textPrimary);
  r.style.setProperty('--color-text-secondary',   safeTokens.colors.textSecondary);
  r.style.setProperty('--color-text-muted',       safeTokens.colors.textMuted);

  r.style.setProperty('--radius-radius-sm',   safeTokens.radii.sm);
  r.style.setProperty('--radius-radius-md',   safeTokens.radii.md);
  r.style.setProperty('--radius-radius-lg',   safeTokens.radii.lg);
  r.style.setProperty('--radius-radius-xl',   safeTokens.radii.xl);
  r.style.setProperty('--radius-radius-full', safeTokens.radii.full);

  r.style.setProperty('--shadow-drop-sm', safeTokens.shadows.dropSm);
  r.style.setProperty('--shadow-drop-md', safeTokens.shadows.dropMd);
  r.style.setProperty('--shadow-drop-lg', safeTokens.shadows.dropLg);

  r.style.setProperty('--font-sans', safeTokens.typography.fontFamilySans);

  r.style.setProperty('--heading-xl-size',   safeTokens.typography.headingXl.fontSize);
  r.style.setProperty('--heading-xl-weight', safeTokens.typography.headingXl.fontWeight);
  r.style.setProperty('--heading-xl-lh',     safeTokens.typography.headingXl.lineHeight);
  r.style.setProperty('--heading-xl-ls',     safeTokens.typography.headingXl.letterSpacing);

  r.style.setProperty('--nav-label-size',   safeTokens.typography.navLabel.fontSize);
  r.style.setProperty('--nav-label-weight', safeTokens.typography.navLabel.fontWeight);
  r.style.setProperty('--nav-label-lh',     safeTokens.typography.navLabel.lineHeight);
  r.style.setProperty('--nav-label-ls',     safeTokens.typography.navLabel.letterSpacing);

  r.style.setProperty('--heading-md-size',   safeTokens.typography.headingMd.fontSize);
  r.style.setProperty('--heading-md-weight', safeTokens.typography.headingMd.fontWeight);
  r.style.setProperty('--heading-md-lh',     safeTokens.typography.headingMd.lineHeight);
  r.style.setProperty('--heading-md-ls',     safeTokens.typography.headingMd.letterSpacing);

  r.style.setProperty('--heading-sm-size',   safeTokens.typography.headingSm.fontSize);
  r.style.setProperty('--heading-sm-weight', safeTokens.typography.headingSm.fontWeight);
  r.style.setProperty('--heading-sm-lh',     safeTokens.typography.headingSm.lineHeight);
  r.style.setProperty('--heading-sm-ls',     safeTokens.typography.headingSm.letterSpacing);

  r.style.setProperty('--body-md-size',   safeTokens.typography.bodyMd.fontSize);
  r.style.setProperty('--body-md-weight', safeTokens.typography.bodyMd.fontWeight);
  r.style.setProperty('--body-md-lh',     safeTokens.typography.bodyMd.lineHeight);
  r.style.setProperty('--body-md-ls',     safeTokens.typography.bodyMd.letterSpacing);

  r.style.setProperty('--body-sm-size',   safeTokens.typography.bodySm.fontSize);
  r.style.setProperty('--body-sm-weight', safeTokens.typography.bodySm.fontWeight);
  r.style.setProperty('--body-sm-lh',     safeTokens.typography.bodySm.lineHeight);
  r.style.setProperty('--body-sm-ls',     safeTokens.typography.bodySm.letterSpacing);

  r.style.setProperty('--body-xs-size',   safeTokens.typography.bodyXs.fontSize);
  r.style.setProperty('--body-xs-weight', safeTokens.typography.bodyXs.fontWeight);
  r.style.setProperty('--body-xs-lh',     safeTokens.typography.bodyXs.lineHeight);
  r.style.setProperty('--body-xs-ls',     safeTokens.typography.bodyXs.letterSpacing);

  r.style.setProperty('--label-md-size',   safeTokens.typography.labelMd.fontSize);
  r.style.setProperty('--label-md-weight', safeTokens.typography.labelMd.fontWeight);
  r.style.setProperty('--label-md-lh',     safeTokens.typography.labelMd.lineHeight);
  r.style.setProperty('--label-md-ls',     safeTokens.typography.labelMd.letterSpacing);

  r.style.setProperty('--label-sm-size',   safeTokens.typography.labelSm.fontSize);
  r.style.setProperty('--label-sm-weight', safeTokens.typography.labelSm.fontWeight);
  r.style.setProperty('--label-sm-lh',     safeTokens.typography.labelSm.lineHeight);
  r.style.setProperty('--label-sm-ls',     safeTokens.typography.labelSm.letterSpacing);

  r.style.setProperty('--icon-label-size',   safeTokens.typography.iconLabel.fontSize);
  r.style.setProperty('--icon-label-weight', safeTokens.typography.iconLabel.fontWeight);
  r.style.setProperty('--icon-label-lh',     safeTokens.typography.iconLabel.lineHeight);
  r.style.setProperty('--icon-label-ls',     safeTokens.typography.iconLabel.letterSpacing);

  r.style.setProperty('--button-radius', safeTokens.buttons.radius);
  r.style.setProperty('--button-height', safeTokens.buttons.height);
}

export function ThemeInjector({ tokens: propTokens }: { tokens?: UIThemeTokens }) {
  const { tokens: storeTokens, fetchTheme } = useThemeStore();
  const tokens = propTokens ?? storeTokens;

  useEffect(() => {
    if (!propTokens) {
      fetchTheme();
    }
  }, [propTokens, fetchTheme]);

  useEffect(() => {
    applyTokensToDOM(tokens);
  }, [tokens]);

  return null;
}
