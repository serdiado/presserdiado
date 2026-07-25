// Görünüm ayarları (zemin/çerçeve/köşe) MERKEZİ — tip tanımları.
// textSettings/types.ts'in (TypographyData için) kardeşi: her ayar BİR KEZ tanımlanır (registry.ts),
// Hızlı Bar (curated: quickBar=true id'ler) + Sağ Panel (tam liste) buradan beslenir.

import type { BorderData, BorderRadiusData, CellAppearance, ColorValue } from '@matbaapro/shared';

export type AppearanceSettingId = 'bg' | 'borderColor' | 'borderWidth' | 'borderStyle' | 'radius';

export type AppearanceValue = ColorValue | BorderData | BorderRadiusData | BorderData['style'] | number;

export interface AppearanceSettingCtx {
  appearance: CellAppearance;
}

export type AppearanceControlKind = 'color' | 'border-color' | 'thickness' | 'style' | 'radius';

export interface AppearanceSettingDef {
  id: AppearanceSettingId;
  label: string;
  control: AppearanceControlKind;
  /** Hızlı Bar bu bayrağı taşıyan id'leri gösterir. Sağ Panel çağıran `ids` listesine göre tamamını gösterebilir. */
  quickBar: boolean;
  apply(ctx: AppearanceSettingCtx, value: AppearanceValue): Partial<CellAppearance>;
  read(ctx: AppearanceSettingCtx): AppearanceValue;
}
