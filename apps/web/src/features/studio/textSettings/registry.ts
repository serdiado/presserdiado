// Metin ayarları MERKEZİ — çekirdek registry girişleri.
// Tek kaynak: ayar eklemek = buraya bir giriş. apply/read SAF (React/DOM-id/store-commit YOK);
// run dalı motoru (richText) çağırır, cell dalı typography patch döner. Sanitize+commit çağıranın işi.
//
// Cell↔run köprüsü (foldlanan düzeltme #1): TypographyData'da italic/underline/lineThrough alanı YOK.
//  - underline/lineThrough → cell-level `textDecoration` enum'ına köprülenir (none|underline|line-through;
//    tek enum ikisini birden tutamaz → "hücrede U+S aynı anda" Faz 4'te tip genişletmesiyle gelir).
//  - italic → cell-level alan yok → bu tur RUN-ONLY (cell apply no-op, read undefined).

import { applyRunStyle, readRunStyle } from '../modules/richText';
import type { ReadResult, RunProperty, RunValue } from '../modules/richText';
import type { CellProperty, ControlKind, TextSettingCtx, TextSettingDef } from './types';
import type { TypographyData } from '@matbaapro/shared';

/** Apply için run dalı geçerli mi? (collapsed seçim → cell-level'a düşülür.) */
function runApplicable(ctx: TextSettingCtx): boolean {
  return !!(ctx.cellEl && ctx.range && !ctx.range.collapsed);
}

/** Read için run dalı geçerli mi? (collapsed → caret okuması anlamlı.) */
function runReadable(ctx: TextSettingCtx): boolean {
  return !!(ctx.cellEl && ctx.range);
}

function runApply(ctx: TextSettingCtx, property: RunProperty, value: RunValue): Range {
  return applyRunStyle(ctx.cellEl!, ctx.range!, { property, value });
}

function runRead(ctx: TextSettingCtx, property: RunProperty): ReadResult {
  return readRunStyle(ctx.cellEl!, ctx.range!, property);
}

/** Cell-only giriş (run karşılığı YOK): apply daima typography patch, read daima cell font değeri.
 *  Sağ Panel tam görünümünün run'sız ayarları (Satır/Harf Aralığı/Küsurat/Yatay/Dikey) — Faz 4. */
function cellEntry(
  id: string,
  label: string,
  control: ControlKind,
  property: CellProperty,
): TextSettingDef {
  return {
    id,
    label,
    control,
    property,
    runCapable: false,
    apply: (_ctx, value) => ({ [property]: value }) as Partial<TypographyData>,
    read: (ctx) => ctx.font?.[property],
  };
}

export const textSettingsRegistry: TextSettingDef[] = [
  {
    id: 'color',
    label: 'Renk',
    control: 'color',
    property: 'color',
    runCapable: true,
    apply(ctx, value) {
      if (runApplicable(ctx)) return runApply(ctx, 'color', value);
      const v = value as { color: string; opacity: number };
      return { color: v.color, opacity: v.opacity };
    },
    read(ctx) {
      if (runReadable(ctx)) return runRead(ctx, 'color');
      return ctx.font ? { color: ctx.font.color, opacity: ctx.font.opacity } : undefined;
    },
  },
  {
    id: 'fontFamily',
    label: 'Yazı tipi',
    control: 'font',
    property: 'fontFamily',
    runCapable: true,
    apply(ctx, value) {
      return runApplicable(ctx) ? runApply(ctx, 'fontFamily', value) : { fontFamily: value as string };
    },
    read(ctx) {
      return runReadable(ctx) ? runRead(ctx, 'fontFamily') : ctx.font?.fontFamily;
    },
  },
  {
    id: 'fontSize',
    label: 'Punto',
    control: 'stepper',
    property: 'fontSize',
    runCapable: true,
    apply(ctx, value) {
      return runApplicable(ctx) ? runApply(ctx, 'fontSize', value) : { fontSize: value as number };
    },
    read(ctx) {
      return runReadable(ctx) ? runRead(ctx, 'fontSize') : ctx.font?.fontSize;
    },
  },
  {
    id: 'fontWeight',
    label: 'Kalınlık',
    control: 'select',
    property: 'fontWeight',
    runCapable: true,
    apply(ctx, value) {
      return runApplicable(ctx) ? runApply(ctx, 'fontWeight', value) : { fontWeight: value as string };
    },
    read(ctx) {
      return runReadable(ctx) ? runRead(ctx, 'fontWeight') : ctx.font?.fontWeight;
    },
  },
  {
    id: 'italic',
    label: 'İtalik',
    control: 'toggle',
    property: 'italic',
    runCapable: true,
    // Cell: TypographyData.fontStyle (Faz 4.1 additive) → italik cell-capable.
    apply(ctx, value) {
      if (runApplicable(ctx)) return runApply(ctx, 'italic', value);
      return { fontStyle: value ? 'italic' : 'normal' };
    },
    read(ctx) {
      if (runReadable(ctx)) return runRead(ctx, 'italic');
      return ctx.font ? ctx.font.fontStyle === 'italic' : undefined;
    },
  },
  {
    id: 'underline',
    label: 'Altı çizili',
    control: 'toggle',
    property: 'underline',
    runCapable: true,
    apply(ctx, value) {
      if (runApplicable(ctx)) return runApply(ctx, 'underline', value);
      const td: TypographyData['textDecoration'] = value ? 'underline' : 'none';
      return { textDecoration: td };
    },
    read(ctx) {
      if (runReadable(ctx)) return runRead(ctx, 'underline');
      return ctx.font ? ctx.font.textDecoration === 'underline' : undefined;
    },
  },
  {
    id: 'lineThrough',
    label: 'Üstü çizili',
    control: 'toggle',
    property: 'lineThrough',
    runCapable: true,
    apply(ctx, value) {
      if (runApplicable(ctx)) return runApply(ctx, 'lineThrough', value);
      const td: TypographyData['textDecoration'] = value ? 'line-through' : 'none';
      return { textDecoration: td };
    },
    read(ctx) {
      if (runReadable(ctx)) return runRead(ctx, 'lineThrough');
      return ctx.font ? ctx.font.textDecoration === 'line-through' : undefined;
    },
  },
  {
    id: 'textTransform',
    label: 'Büyük/küçük',
    control: 'case',
    property: 'textTransform',
    runCapable: true,
    apply(ctx, value) {
      if (runApplicable(ctx)) return runApply(ctx, 'textTransform', value);
      return { textTransform: value as TypographyData['textTransform'] };
    },
    read(ctx) {
      return runReadable(ctx) ? runRead(ctx, 'textTransform') : ctx.font?.textTransform;
    },
  },
  {
    id: 'superscript',
    label: 'Üst karakter',
    control: 'toggle',
    property: 'superscript',
    runCapable: true,
    // RUN-ONLY: cell-level karşılığı yok (boyut cell decimalScale'den --sup-scale ile gelir).
    // Seçim varsa run uygula; collapsed/cell → no-op patch.
    apply(ctx, value) {
      return runApplicable(ctx) ? runApply(ctx, 'superscript', value) : {};
    },
    read(ctx) {
      return runReadable(ctx) ? runRead(ctx, 'superscript') : undefined;
    },
  },
  // ── Cell-only (Sağ Panel tam görünümü; run karşılığı yok) ──
  cellEntry('lineHeight', 'Satır', 'slider', 'lineHeight'),
  cellEntry('letterSpacing', 'Harf Aralığı', 'slider', 'letterSpacing'),
  cellEntry('decimalScale', 'Üst Karakter', 'slider', 'decimalScale'),
  cellEntry('decimalOffset', 'Üst Karakter Konumu', 'slider', 'decimalOffset'),
  cellEntry('textAlign', 'Yatay hizalama', 'align', 'textAlign'),
  cellEntry('verticalAlign', 'Dikey hizalama', 'align', 'verticalAlign'),
];

export const textSettingById: Record<string, TextSettingDef> = Object.fromEntries(
  textSettingsRegistry.map((d) => [d.id, d]),
);
