// Görünüm ayarları MERKEZİ — çekirdek registry girişleri.
// Tek kaynak: ayar eklemek = buraya bir giriş. apply/read SAF — DOM/store-commit YOK, patch döner.
// Hızlı Bar (AppearanceControls layout="bar") ve Sağ Panel (layout="panel") AYNI girişleri kullanır.

import type { BorderData, BorderRadiusData, ColorValue } from '@matbaapro/shared';
import type { AppearanceSettingDef } from './types';

export const appearanceSettingsRegistry: AppearanceSettingDef[] = [
  {
    id: 'bg',
    label: 'Zemin',
    control: 'color',
    quickBar: true,
    apply: (_ctx, value) => ({ bg: value as ColorValue }),
    read: (ctx) => ctx.appearance.bg,
  },
  {
    id: 'borderColor',
    label: 'Çerçeve Rengi',
    control: 'border-color',
    quickBar: true,
    apply: (ctx, value) => {
      const v = value as ColorValue;
      if (v.type !== 'solid') return {};
      return { border: { ...ctx.appearance.border, color: { c: v.color, o: v.opacity } } };
    },
    read: (ctx) => ({
      type: 'solid',
      color: ctx.appearance.border.color.c,
      opacity: ctx.appearance.border.color.o,
    }),
  },
  {
    id: 'borderWidth',
    label: 'Kalınlık',
    control: 'thickness',
    quickBar: true,
    apply: (ctx, value) => {
      const n = value as number;
      return { border: { ...ctx.appearance.border, t: n, r: n, b: n, l: n } };
    },
    read: (ctx) => ctx.appearance.border.t,
  },
  {
    id: 'borderStyle',
    label: 'Çizgi Stili',
    control: 'style',
    quickBar: false,
    apply: (ctx, value) => ({ border: { ...ctx.appearance.border, style: value as BorderData['style'] } }),
    read: (ctx) => ctx.appearance.border.style,
  },
  {
    id: 'radius',
    label: 'Köşe',
    control: 'radius',
    quickBar: true,
    apply: (_ctx, value) => ({ radius: value as BorderRadiusData }),
    read: (ctx) => ctx.appearance.radius,
  },
];

export const appearanceSettingById: Record<string, AppearanceSettingDef> = Object.fromEntries(
  appearanceSettingsRegistry.map((d) => [d.id, d]),
);

export const QUICK_BAR_APPEARANCE_IDS = appearanceSettingsRegistry
  .filter((d) => d.quickBar)
  .map((d) => d.id);

export const FULL_APPEARANCE_IDS = appearanceSettingsRegistry.map((d) => d.id);
