// Document layer system — InDesign-like layers spanning pages/spreads/document.

export type LayerType = 'image' | 'solid' | 'text' | 'shape';
export type LayerFitMode =
  | 'cover'
  | 'contain'
  | 'repeat'
  | 'stretch'
  | 'fit-width'
  | 'fit-height';
export type LayerMaskScope = 'page' | 'spread' | 'document';

export interface LayerBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayerTransform {
  rotation: number;
  scale: number;
  flipX: boolean;
  flipY: boolean;
  offsetX: number;
  offsetY: number;
}

export interface LayerMask {
  type: LayerMaskScope;
  targetIds: string[];
  excludeGaps?: boolean;
}

export interface LayerGradientStop {
  color: string;
  opacity?: number; // 0-100, default 100
  position: number; // 0-100
}

export interface LayerGradientConfig {
  type: 'linear' | 'radial' | 'radial-star';
  angle?: number; // deg, linear only
  stops: LayerGradientStop[];
}

export interface LayerProperties {
  opacity?: number; // 0-100
  blendMode?: string;
  fitMode?: LayerFitMode;
  color?: string;
  gradient?: 'none' | 'linear' | 'radial';
  gradientConfig?: LayerGradientConfig;
  imageUrl?: string;
  text?: string;
  font?: string;
  fontSize?: number;
  [key: string]: unknown;
}

export interface Layer {
  id: string;
  name?: string;
  type: LayerType;
  bounds: LayerBounds;
  transform: LayerTransform;
  mask?: LayerMask;
  zIndex: number;
  visible?: boolean;
  locked?: boolean;
  properties: LayerProperties;
}
