// Metin ayarları MERKEZİ — tip tanımları.
// docs/metin-ayarlari-merkezi-mimari.md §1 ([ÇEKİRDEK]). Her ayar BİR KEZ tanımlanır; Hızlı Bar +
// Sağ Panel + üç yüzey buradan beslenir. Bu turda: tip + çekirdek girişler + apply/read; UI bağlama YOK.

import type { TypographyData } from '@matbaapro/shared';
import type { ReadResult, RunProperty, RunValue } from '../modules/richText';

export type Surface = 'module' | 'product' | 'footer';

/**
 * apply/read bağlamı. `range` + `runCapable` → motor (run-level); aksi → cell-level.
 * `cellEl` motorun düzenleme-anı DOM'u (detached element ile unit-test edilebilir).
 * `font` cell-level okuma/yazma hedefi (modülde `cell.font: TypographyData`).
 */
export interface TextSettingCtx {
  surface: Surface;
  slotId: string;
  cellId: string;
  cellEl?: HTMLElement;
  range?: Range;
  font?: TypographyData;
}

/** UI kontrol tipi — yalnız meta. */
export type ControlKind = 'color' | 'font' | 'stepper' | 'select' | 'toggle' | 'case' | 'slider' | 'align';

/** Cell-only property'ler (run karşılığı YOK; doğrudan TypographyData alanları). Sağ Panel (Faz 4). */
export type CellProperty =
  | 'lineHeight'
  | 'letterSpacing'
  | 'decimalScale'
  | 'textAlign'
  | 'verticalAlign';

export interface TextSettingDef {
  id: string;
  label: string;
  control: ControlKind;
  /** Mantıksal property — run modeli anahtarı (RunProperty) veya cell-only (CellProperty). */
  property: RunProperty | CellProperty;
  /** Seçime (run) uygulanabilir mi? false → yalnız cell-level. */
  runCapable: boolean;
  /** run → Range (restore); cell → typography patch. Sanitize+commit ÇAĞIRANIN işi. */
  apply(ctx: TextSettingCtx, value: RunValue): Range | Partial<TypographyData>;
  /** Kontrol yansıması: değer | MIXED (karışık) | undefined (yok/desteklenmez). */
  read(ctx: TextSettingCtx): ReadResult;
}
