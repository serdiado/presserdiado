// Design token primitives shared across studio settings, contextual bars, and pickers.

export interface ColorOpacity {
  c: string;
  o: number; // 0-100
}

export interface TypographyData {
  fontFamily: string;
  fontWeight: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  verticalAlign: 'top' | 'middle' | 'bottom';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration: 'none' | 'underline' | 'line-through';
  color: string;
  opacity: number; // 0-100
  decimalScale: number; // 0-200, % of base size for decimal portion of prices
}

export interface BorderRadiusData {
  tl: number;
  tr: number;
  bl: number;
  br: number;
  linked: boolean;
}

export interface SpacingData {
  t: number;
  r: number;
  b: number;
  l: number;
  linked: boolean;
}

export interface ShadowData {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number; // 0-100
  active: boolean;
}

export interface BorderData {
  t: number;
  r: number;
  b: number;
  l: number;
  linked: boolean;
  color: ColorOpacity;
  style: 'solid' | 'dashed' | 'dotted';
}

// Default factories — keep in sync with reference defaults.
export const defaultTypography: TypographyData = {
  fontFamily: 'Inter',
  fontWeight: '400',
  fontSize: 12,
  lineHeight: 1.2,
  letterSpacing: 0,
  textAlign: 'left',
  verticalAlign: 'middle',
  textTransform: 'none',
  textDecoration: 'none',
  color: '#000000',
  opacity: 100,
  decimalScale: 100,
};

export const defaultRadius: BorderRadiusData = {
  tl: 8,
  tr: 8,
  bl: 8,
  br: 8,
  linked: true,
};

export const defaultSpacing: SpacingData = {
  t: 8,
  r: 8,
  b: 8,
  l: 8,
  linked: true,
};

export const defaultShadow: ShadowData = {
  x: 0,
  y: 4,
  blur: 6,
  spread: -1,
  color: '#000000',
  opacity: 10,
  active: false,
};

export const defaultBorder: BorderData = {
  t: 0,
  r: 0,
  b: 0,
  l: 0,
  linked: true,
  color: { c: '#e2e8f0', o: 100 },
  style: 'solid',
};
