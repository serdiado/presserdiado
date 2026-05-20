export type ProjectStatus = 'draft' | 'completed' | 'ordered';

export interface Project {
  id: string;
  userId: string;
  name: string;
  productTypeId: string;
  status: ProjectStatus;
  canvasData: CanvasData;
  thumbnailUrl: string | null;
  printConfig: Record<string, unknown>;
  autoSavedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CanvasData {
  version: string;
  productTypeId: string;
  theme: CanvasTheme;
  formas: Forma[];
}

export interface CanvasTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: number;
  priceFont: string;
  priceFontSize: number;
  decimalScale: number;
  decimalAlign: 'superscript' | 'baseline';
  slotBackground: string;
  slotBorderRadius: number;
  slotShadow: string;
}

export interface Forma {
  id: string;
  label: string;
  pages: Page[];
}

export interface Page {
  id: string;
  grid: { cols: number; rows: number };
  background: { type: 'color' | 'image'; value: string };
  footer: Footer;
  slots: Slot[];
}

export interface Footer {
  visible: boolean;
  heightPct: number;
  cells: FooterCell[];
}

export interface FooterCell {
  id: string;
  widthPct: number;
  content: {
    type: 'text' | 'image';
    value?: string;
    assetKey?: string;
  };
}

export type SlotRole = 'global' | 'custom' | 'free' | 'footer';

export interface Slot {
  id: string;
  gridPosition: {
    col: number;
    row: number;
    colSpan: number;
    rowSpan: number;
  };
  role: SlotRole;
  content: SlotContent | null;
  styleOverride: SlotStyle | null;
}

export interface SlotContent {
  type: 'product' | 'free';
  productId?: string;
  productData?: {
    name: string;
    price: number;
    currency: string;
    imageUrl: string;
    badge?: string;
    unit?: string;
    originalPrice?: number;
  };
  layers?: CanvasLayer[];
  layoutOverrides?: Record<string, unknown>;
}

export interface CanvasLayer {
  type: 'image' | 'text' | 'shape';
  assetKey?: string;
  value?: string;
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  fontSize?: number;
  color?: string;
}

export interface SlotStyle {
  background?: string;
  borderRadius?: number;
  shadow?: string;
  fontFamily?: string;
  fontSize?: number;
  priceFont?: string;
  priceFontSize?: number;
}
