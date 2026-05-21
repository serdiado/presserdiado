// Wizard seçimlerinden BrochureTemplate üretir. Tüm metrikler config'ten okunur.

import type { BrochureTemplate, FoldType, PageTemplateConfig } from '@matbaapro/shared';
import type { WizardConfig, WizardSelection } from './wizard.types';

// Config'in foldType id'leri shared'taki FoldType ile birebir eşleşmek zorunda
// değil; eşleşmiyorsa 'none' fallback'i ile devam ederiz.
const KNOWN_FOLDS: ReadonlyArray<FoldType> = ['none', 'half-fold', 'roll-fold', 'z-fold'];

export function buildTemplateFromWizard(
  sel: WizardSelection,
  config: WizardConfig,
): BrochureTemplate {
  const paper = config.steps.paperSize.options.find((p) => p.id === sel.paperSize);
  const fold = config.steps.foldType.options.find((f) => f.id === sel.foldType);
  const category = config.steps.category.options.find((c) => c.id === sel.category);

  if (!paper || !fold) {
    throw new Error('Geçersiz wizard seçimi (paper veya fold bulunamadı)');
  }

  const pageCount = Math.max(1, fold.pageCount);
  const pages: PageTemplateConfig[] = Array.from({ length: pageCount }, (_, i) => ({
    pageNumber: i + 1,
    widthMm: paper.widthMm,
    safeZone: config.defaults.safeZoneMm,
  }));

  const id = `wizard-${sel.category}-${sel.paperSize}-${sel.foldType}-${Date.now().toString(36)}`;

  const foldNameMap: Record<string, string> = {
    'none': 'Katlamasız',
    'half-fold': 'Tek Kırım',
    'z-fold': 'Z Kırım',
    'roll-fold': 'İçe Kırım',
    'accordion-fold': 'Akordeon Kırım',
    'gate-fold': 'Pencere Kırım'
  };

  const foldTitle = foldNameMap[sel.foldType] || fold.title;
  const name = `${paper.title} ${foldTitle} ${category?.title ?? ''}`.trim();

  const foldType: FoldType = (KNOWN_FOLDS as readonly string[]).includes(sel.foldType)
    ? (sel.foldType as FoldType)
    : 'none';

  const mode = config.steps.mode.options.find((m) => m.id === sel.mode);

  return {
    id,
    name,
    designType: category?.title,
    paperSize: paper.title,
    mode: mode?.title,
    pageCount,
    foldCount: Math.max(0, pageCount - 1),
    foldType,
    openWidthMm: paper.widthMm * pageCount,
    openHeightMm: paper.heightMm,
    bleedMm: config.defaults.bleedMm,
    pages,
  };
}
