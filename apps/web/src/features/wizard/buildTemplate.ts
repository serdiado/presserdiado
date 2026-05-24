// Wizard seçimlerinden BrochureTemplate üretir. Tüm metrikler config'ten okunur.

import type { BrochureTemplate, FoldType, PageTemplateConfig } from '@matbaapro/shared';
import type { WizardConfig, WizardSelection } from './wizard.types';

// Config'in foldType id'leri shared'taki FoldType ile birebir eşleşmek zorunda
// değil; eşleşmiyorsa 'none' fallback'i ile devam ederiz.
const KNOWN_FOLDS: ReadonlyArray<FoldType> = ['none', 'half-fold', 'roll-fold', 'z-fold'];

const FOLD_NORMALIZE_MAP: Record<string, FoldType> = {
  none: 'none',
  'half-fold': 'half-fold',
  'roll-fold': 'roll-fold',
  'z-fold': 'z-fold',
  'triple-fold': 'roll-fold',
  'accordion-fold': 'roll-fold',
  'map-fold': 'z-fold',
};

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
  const panelsPerSide = Math.max(1, Math.floor(pageCount / 2));
  const pages: PageTemplateConfig[] = Array.from({ length: pageCount }, (_, i) => ({
    pageNumber: fold.pageOrder && fold.pageOrder[i] ? fold.pageOrder[i] : i + 1,
    widthMm: paper.widthMm,
    safeZone: config.defaults.safeZoneMm,
  }));

  const id = `wizard-${sel.category}-${sel.paperSize}-${sel.foldType}-${Date.now().toString(36)}`;

  const foldNameMap: Record<string, string> = {
    none: 'Kırım Yok',
    'half-fold': 'Tek Kırım',
    'roll-fold': 'Çift Kırım',
    'z-fold': 'Z Kırım',
    'triple-fold': 'Üç Kırım',
    'accordion-fold': 'Akerdiyon',
    'map-fold': 'Harita',
  };

  const foldTitle = foldNameMap[sel.foldType] || fold.title;
  const name = `${paper.title} ${foldTitle} ${category?.title ?? ''}`.trim();

  const normalizedFoldType = FOLD_NORMALIZE_MAP[sel.foldType] ?? 'none';
  const foldType: FoldType = (KNOWN_FOLDS as readonly string[]).includes(normalizedFoldType)
    ? normalizedFoldType
    : 'none';

  const mode = config.steps.mode.options.find((m) => m.id === sel.mode);

  return {
    id,
    name,
    designType: category?.title,
    paperSize: paper.title,
    mode: mode?.title,
    pageCount,
    foldCount: Math.max(0, panelsPerSide - 1),
    foldType,
    wizardSelection: sel as unknown as Record<string, string>,
    openWidthMm: paper.widthMm * panelsPerSide,
    openHeightMm: paper.heightMm,
    bleedMm: config.defaults.bleedMm,
    pages,
  };
}
