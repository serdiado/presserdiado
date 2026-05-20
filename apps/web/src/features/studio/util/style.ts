// Shared style helpers used by Slot, FooterRenderer and panels.

import type {
  BorderRadiusData,
  ColorOpacity,
  ShadowData,
  SpacingData,
  TypographyData,
} from '@matbaapro/shared';

export const MM_TO_PX = 96 / 25.4;

export function hexToRgba(hex: string, opacity: number): string {
  if (!hex || hex.length < 7) return `rgba(255,255,255,${opacity / 100})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

export function colorOpacityToCss(c: ColorOpacity): string {
  return c.o < 100 ? hexToRgba(c.c, c.o) : c.c;
}

export function radiusStyle(r?: BorderRadiusData): string {
  return r ? `${r.tl}px ${r.tr}px ${r.br}px ${r.bl}px` : '0px';
}

export function paddingStyle(s?: SpacingData): string {
  return s ? `${s.t}px ${s.r}px ${s.b}px ${s.l}px` : '0px';
}

export function shadowStyle(s?: ShadowData): string {
  if (!s || !s.active) return 'none';
  return `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${hexToRgba(s.color, s.opacity)}`;
}

export function fontStyle(font: TypographyData): React.CSSProperties {
  if (!font) return {};
  return {
    fontFamily: font.fontFamily,
    fontWeight: font.fontWeight,
    fontSize: `${font.fontSize}px`,
    lineHeight: font.lineHeight,
    letterSpacing: `${font.letterSpacing}px`,
    textAlign: font.textAlign,
    textTransform: font.textTransform,
    textDecoration: font.textDecoration,
    color: hexToRgba(font.color, font.opacity),
    display: 'flex',
    justifyContent:
      font.textAlign === 'center'
        ? 'center'
        : font.textAlign === 'right'
          ? 'flex-end'
          : 'flex-start',
    alignItems:
      font.verticalAlign === 'top'
        ? 'flex-start'
        : font.verticalAlign === 'bottom'
          ? 'flex-end'
          : 'center',
  };
}

export function splitPrice(price: unknown): { main: string; decimal: string } {
  if (price == null || price === '') return { main: '0', decimal: '00' };
  const str = String(price).replace('.', ',');
  const parts = str.split(',');
  return {
    main: parts[0] || '0',
    decimal: parts[1] ? parts[1].padEnd(2, '0').slice(0, 2) : '00',
  };
}

export function parsePrice(price: unknown): number {
  if (!price) return 0;
  return parseFloat(String(price).replace(',', '.'));
}

export function deepMerge<T>(target: T, source: Partial<T>): T {
  if (!target) return source as T;
  if (!source) return target;
  const output: Record<string, unknown> = { ...(target as Record<string, unknown>) };
  for (const key of Object.keys(source)) {
    const srcVal = (source as Record<string, unknown>)[key];
    const tgtVal = (target as Record<string, unknown>)[key];
    if (
      srcVal &&
      typeof srcVal === 'object' &&
      !Array.isArray(srcVal) &&
      tgtVal &&
      typeof tgtVal === 'object' &&
      !Array.isArray(tgtVal)
    ) {
      output[key] = deepMerge(tgtVal, srcVal as Record<string, unknown>);
    } else {
      output[key] = srcVal;
    }
  }
  return output as T;
}
