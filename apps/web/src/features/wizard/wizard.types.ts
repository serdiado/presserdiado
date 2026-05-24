// JSON config'ten beslenen wizard tipleri (statik enum yok).

export interface BaseOption {
  id: string;
  title: string;
  hint?: string;
  icon?: string;
}

export interface CategoryOption extends BaseOption {}

export interface ModeOption extends BaseOption {
  features?: string[];
}

export interface PaperSizeOption extends BaseOption {
  widthMm: number;
  heightMm: number;
}

export interface FoldTypeOption extends BaseOption {
  pageCount: number;
  pageOrder?: number[];
}

export interface WizardConfig {
  title: string;
  subtitle: string;
  steps: {
    category: { label: string; options: CategoryOption[]; default: string };
    mode: { label: string; options: ModeOption[]; default: string };
    paperSize: { label: string; options: PaperSizeOption[]; default: string };
    foldType: { label: string; options: FoldTypeOption[]; default: string };
  };
  defaults: {
    bleedMm: number;
    safeZoneMm: [number, number, number, number];
  };
}

export interface WizardSelection {
  category: string;
  mode: string;
  paperSize: string;
  foldType: string;
}
