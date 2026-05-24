// Shared style helpers used by Slot, FooterRenderer and panels.

import type {
  BorderRadiusData,
  ColorOpacity,
  ColorValue,
  GradientValue,
  ShadowData,
  SolidValue,
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

// === ColorValue helpers ===========================================

export function makeSolid(color: string, opacity = 100): SolidValue {
  return { type: 'solid', color, opacity };
}

/**
 * Normalize anything that looks like a color value into a ColorValue.
 * Accepts ColorValue, legacy ColorOpacity ({c,o}), or undefined.
 */
export function asColorValue(input: unknown, fallback?: ColorValue): ColorValue {
  if (input && typeof input === 'object') {
    const v = input as Record<string, unknown>;
    if (v.type === 'solid' || v.type === 'gradient') return input as ColorValue;
    if (typeof v.c === 'string' && typeof v.o === 'number') {
      return { type: 'solid', color: v.c as string, opacity: v.o as number };
    }
  }
  return fallback ?? { type: 'solid', color: '#ffffff', opacity: 100 };
}

/** Return the dominant solid color for legacy code paths that need a flat hex/opacity. */
export function colorValueToSolid(v: ColorValue): ColorOpacity {
  if (v.type === 'solid') return { c: v.color, o: v.opacity };
  const first = v.stops[0];
  return first ? { c: first.color, o: first.opacity } : { c: '#ffffff', o: 100 };
}

function stopsCss(g: GradientValue): string {
  const sorted = g.stops.slice().sort((a, b) => a.position - b.position);
  if (sorted.length === 0) return 'transparent, transparent';
  return sorted.map((s) => `${hexToRgba(s.color, s.opacity)} ${s.position}%`).join(', ');
}

/**
 * Convert a GradientValue into a CSS background-image expression.
 * - linear  → linear-gradient(angle, stops)
 * - radial  → radial-gradient(circle, stops)
 * - diamond → two perpendicular linear gradients at 45° / -45°. Combined
 *   with backgroundBlendMode: 'multiply' (set by colorValueBackground),
 *   the intersection of the two gradients produces a true diamond/rhombus
 *   contour. Without the blend mode the second gradient sits underneath
 *   and is partially occluded; consumers that only want the string should
 *   prefer colorValueBackground for diamond mode.
 */
export function gradientToCss(g: GradientValue): string {
  const s = stopsCss(g);
  if (g.gradientType === 'radial') return `radial-gradient(circle at center, ${s})`;
  if (g.gradientType === 'diamond') {
    return `linear-gradient(45deg, ${s}), linear-gradient(-45deg, ${s})`;
  }
  return `linear-gradient(${g.angle ?? 135}deg, ${s})`;
}

/**
 * Convert a ColorValue into a CSS background value. For solid colors this
 * returns a colour string (suitable for backgroundColor); for gradients it
 * returns a `*-gradient(...)` expression (use it on backgroundImage or the
 * shorthand `background`). For diamond gradients, the returned string is
 * two comma-separated linear gradients — pair with backgroundBlendMode:
 * 'multiply' for the proper diamond effect, otherwise use
 * colorValueBackground which sets the blend mode for you.
 */
export function colorValueToCss(v: ColorValue): string {
  if (v.type === 'solid') {
    return v.opacity < 100 ? hexToRgba(v.color, v.opacity) : v.color;
  }
  return gradientToCss(v);
}

/**
 * Style object that paints a ColorValue as a background.
 * Solids set backgroundColor; gradients set backgroundImage so existing
 * backgroundColor isn't fighting with a gradient. Diamond mode also sets
 * backgroundBlendMode: 'multiply' so the two perpendicular linear
 * gradients combine into a rhombus contour.
 */
export function colorValueBackground(v: ColorValue): React.CSSProperties {
  if (v.type === 'solid') {
    return { backgroundColor: colorValueToCss(v) };
  }
  const style: React.CSSProperties = {
    backgroundImage: gradientToCss(v),
    backgroundColor: 'transparent',
  };
  if (v.gradientType === 'diamond') {
    style.backgroundBlendMode = 'multiply';
  }
  return style;
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
