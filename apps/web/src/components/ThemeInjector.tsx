import { useEffect } from 'react';
import type { UIThemeTokens } from '@matbaapro/shared';
import { useThemeStore } from '@/stores/theme.store';
import { normalizeThemeTokens } from '@/lib/themeTokens';

export function applyTokensToDOM(tokens: UIThemeTokens, element?: HTMLElement | null) {
  const safeTokens = normalizeThemeTokens(tokens);
  const r = document.documentElement;
  const preview = element !== undefined ? element : document.getElementById('preview-panel');
  const targets: HTMLElement[] = preview ? [r, preview] : [r];

  for (const t of targets) {

  t.style.setProperty('--color-primary',          safeTokens.colors.primary);
  t.style.setProperty('--color-primary-hover',    safeTokens.colors.primaryHover);
  t.style.setProperty('--color-danger',           safeTokens.colors.danger);
  t.style.setProperty('--color-success',          safeTokens.colors.success);
  t.style.setProperty('--color-warning',          safeTokens.colors.warning);
  t.style.setProperty('--color-surface-app',      safeTokens.colors.surfaceApp);
  t.style.setProperty('--color-surface-panel',    safeTokens.colors.surfacePanel);
  t.style.setProperty('--color-surface-subtle',   safeTokens.colors.surfaceSubtle);
  t.style.setProperty('--color-border-default',   safeTokens.colors.borderDefault);
  t.style.setProperty('--color-border-strong',    safeTokens.colors.borderStrong);
  t.style.setProperty('--color-border-selected',  safeTokens.colors.borderSelected);
  t.style.setProperty('--color-text-primary',     safeTokens.colors.textPrimary);
  t.style.setProperty('--color-text-secondary',   safeTokens.colors.textSecondary);
  t.style.setProperty('--color-text-muted',       safeTokens.colors.textMuted);

  t.style.setProperty('--radius-radius-sm',   safeTokens.radii.sm);
  t.style.setProperty('--radius-radius-md',   safeTokens.radii.md);
  t.style.setProperty('--radius-radius-lg',   safeTokens.radii.lg);
  t.style.setProperty('--radius-radius-xl',   safeTokens.radii.xl);
  t.style.setProperty('--radius-radius-full', safeTokens.radii.full);

  t.style.setProperty('--shadow-drop-sm', safeTokens.shadows.dropSm);
  t.style.setProperty('--shadow-drop-md', safeTokens.shadows.dropMd);
  t.style.setProperty('--shadow-drop-lg', safeTokens.shadows.dropLg);

  t.style.setProperty('--font-sans', safeTokens.typography.fontFamilySans);

  t.style.setProperty('--heading-xl-size',   safeTokens.typography.headingXl.fontSize);
  t.style.setProperty('--heading-xl-weight', safeTokens.typography.headingXl.fontWeight);
  t.style.setProperty('--heading-xl-lh',     safeTokens.typography.headingXl.lineHeight);
  t.style.setProperty('--heading-xl-ls',     safeTokens.typography.headingXl.letterSpacing);

  t.style.setProperty('--nav-label-size',   safeTokens.typography.navLabel.fontSize);
  t.style.setProperty('--nav-label-weight', safeTokens.typography.navLabel.fontWeight);
  t.style.setProperty('--nav-label-lh',     safeTokens.typography.navLabel.lineHeight);
  t.style.setProperty('--nav-label-ls',     safeTokens.typography.navLabel.letterSpacing);

  t.style.setProperty('--heading-md-size',   safeTokens.typography.headingMd.fontSize);
  t.style.setProperty('--heading-md-weight', safeTokens.typography.headingMd.fontWeight);
  t.style.setProperty('--heading-md-lh',     safeTokens.typography.headingMd.lineHeight);
  t.style.setProperty('--heading-md-ls',     safeTokens.typography.headingMd.letterSpacing);

  t.style.setProperty('--heading-sm-size',   safeTokens.typography.headingSm.fontSize);
  t.style.setProperty('--heading-sm-weight', safeTokens.typography.headingSm.fontWeight);
  t.style.setProperty('--heading-sm-lh',     safeTokens.typography.headingSm.lineHeight);
  t.style.setProperty('--heading-sm-ls',     safeTokens.typography.headingSm.letterSpacing);

  t.style.setProperty('--body-md-size',   safeTokens.typography.bodyMd.fontSize);
  t.style.setProperty('--body-md-weight', safeTokens.typography.bodyMd.fontWeight);
  t.style.setProperty('--body-md-lh',     safeTokens.typography.bodyMd.lineHeight);
  t.style.setProperty('--body-md-ls',     safeTokens.typography.bodyMd.letterSpacing);

  t.style.setProperty('--body-sm-size',   safeTokens.typography.bodySm.fontSize);
  t.style.setProperty('--body-sm-weight', safeTokens.typography.bodySm.fontWeight);
  t.style.setProperty('--body-sm-lh',     safeTokens.typography.bodySm.lineHeight);
  t.style.setProperty('--body-sm-ls',     safeTokens.typography.bodySm.letterSpacing);

  t.style.setProperty('--body-xs-size',   safeTokens.typography.bodyXs.fontSize);
  t.style.setProperty('--body-xs-weight', safeTokens.typography.bodyXs.fontWeight);
  t.style.setProperty('--body-xs-lh',     safeTokens.typography.bodyXs.lineHeight);
  t.style.setProperty('--body-xs-ls',     safeTokens.typography.bodyXs.letterSpacing);

  t.style.setProperty('--label-md-size',   safeTokens.typography.labelMd.fontSize);
  t.style.setProperty('--label-md-weight', safeTokens.typography.labelMd.fontWeight);
  t.style.setProperty('--label-md-lh',     safeTokens.typography.labelMd.lineHeight);
  t.style.setProperty('--label-md-ls',     safeTokens.typography.labelMd.letterSpacing);

  t.style.setProperty('--label-sm-size',   safeTokens.typography.labelSm.fontSize);
  t.style.setProperty('--label-sm-weight', safeTokens.typography.labelSm.fontWeight);
  t.style.setProperty('--label-sm-lh',     safeTokens.typography.labelSm.lineHeight);
  t.style.setProperty('--label-sm-ls',     safeTokens.typography.labelSm.letterSpacing);

  t.style.setProperty('--icon-label-size',   safeTokens.typography.iconLabel.fontSize);
  t.style.setProperty('--icon-label-weight', safeTokens.typography.iconLabel.fontWeight);
  t.style.setProperty('--icon-label-lh',     safeTokens.typography.iconLabel.lineHeight);
  t.style.setProperty('--icon-label-ls',     safeTokens.typography.iconLabel.letterSpacing);

  t.style.setProperty('--button-radius', safeTokens.buttons.radius);
  t.style.setProperty('--button-height', safeTokens.buttons.height);
  }
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
    const previewPanel = document.getElementById('preview-panel');
    applyTokensToDOM(tokens, previewPanel);
  }, [tokens]);

  return null;
}
