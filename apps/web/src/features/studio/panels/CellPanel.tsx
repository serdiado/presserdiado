import { useEffect, useRef, useState } from 'react';
import { useUIStore, useCatalogStore } from '@/stores/studio';
import { ChevronDown, Square, Layers, Image, Type, Tag, Link2, X, PanelBottom } from 'lucide-react';
import { Button, SegmentedControl, Toggle } from '@/components/ui';
import { uploadImage } from '@/lib/upload';
import type { BannerCellData, BannerModuleData } from '../modules';
import { materializeFractions, FRACTION_MIN, BANNER_DIM_MIN, BANNER_DIM_MAX } from '../modules/fractions';
import { resolveModuleSlot } from '@/stores/studio/footerSlot';
import { ColorOpacityPicker, BorderRadiusPicker, SpacingPicker, ShadowPicker, TypographyPicker } from '../pickers';
import { clearRunForSurface } from '../textSettings/cellApply';
import type { RunProperty } from '../modules/richText';
import type {
  BadgeConfig,
  BadgePosition,
  BadgeShape,
  BorderData,
  BorderRadiusData,
  ColorValue,
  PageFooterMode,
  ShadowData,
  SpacingData,
  StudioFooterCell,
  StudioSlotImageSettings,
  TypographyData,
  TextElementSettings,
} from '@matbaapro/shared';


function AccordionItem({
  title, icon, open, onToggle, children, disabled, badge,
}: {
  id?: string; title: string; icon: React.ReactNode; open: boolean;
  onToggle: () => void; children: React.ReactNode; disabled?: boolean; badge?: string;
}) {
  return (
    <div className="flex flex-col border border-border-default rounded-md overflow-hidden bg-surface-panel">
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`flex items-center justify-between p-3 transition-colors ${
          disabled
            ? 'bg-surface-subtle opacity-40 cursor-not-allowed'
            : open
            ? 'bg-blue-50'
            : 'bg-surface-subtle hover:bg-surface-subtle'
        }`}
      >
        <div className={`flex items-center gap-2 ${open ? 'text-blue-700 border-l-2 border-blue-500 pl-2' : 'text-text-secondary'}`}>
          {icon}
          <span className={`text-xs font-medium ${open ? 'text-blue-700' : 'text-text-primary'}`}>{title}</span>
          {badge && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-surface-subtle text-text-secondary border border-border-default">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`transition-all duration-300 ${open ? 'rotate-180 text-blue-500' : 'text-text-muted'}`}
        />
      </button>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${open ? 'max-h-500 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 border-t border-border-default bg-surface-panel">
          {children}
        </div>
      </div>
    </div>
  );
}

interface AppearanceValues {
  cellBg: ColorValue;
  cellBorderColor: string;
  cellBorderOpacity: number;
  borderWidth: number;
  radius: BorderRadiusData;
  spacing: SpacingData;
  shadow: ShadowData;
}

interface AppearanceHandlers {
  onCellBgChange: (v: ColorValue) => void;
  onCellBorderChange: (color: string, opacity: number) => void;
  onBorderWidthChange: (v: number) => void;
  onRadiusChange: (v: BorderRadiusData) => void;
  onSpacingChange: (v: SpacingData) => void;
  onShadowChange: (v: ShadowData) => void;
}

function AppearanceContent({ values, handlers }: { values: AppearanceValues; handlers: AppearanceHandlers }) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">Zemin Rengi</span>
          <ColorOpacityPicker value={values.cellBg} onChange={handlers.onCellBgChange} />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border-default">
          <span className="text-xs font-medium text-text-secondary">Kenarlık Rengi</span>
          <ColorOpacityPicker
            solidOnly
            value={{ type: 'solid', color: values.cellBorderColor, opacity: values.cellBorderOpacity }}
            onChange={(v) => { if (v.type !== 'solid') return; handlers.onCellBorderChange(v.color, v.opacity); }}
          />
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-border-default">
          <span className="text-[11px] font-medium text-text-secondary w-16">Kalınlık</span>
          <input
            type="range" min={0} max={10} step={1} value={values.borderWidth}
            onChange={(e) => handlers.onBorderWidthChange(parseInt(e.target.value))}
            className="flex-1 studio-slider"
          />
          <input
            type="number" value={values.borderWidth}
            onChange={(e) => handlers.onBorderWidthChange(parseInt(e.target.value) || 0)}
            className="w-12 text-xs font-normal text-text-primary text-center border border-border-default rounded p-0.5"
          />
        </div>
      </div>
      <div className="pt-1 border-t border-border-default">
        <BorderRadiusPicker
          title="Köşe ovalliği"
          value={values.radius}
          onChange={handlers.onRadiusChange}
        />
      </div>
      <div className="pt-1 border-t border-border-default">
        <SpacingPicker
          title="İç Boşluk"
          value={values.spacing}
          onChange={handlers.onSpacingChange}
        />
      </div>
      <div className="pt-1 border-t border-border-default">
        <ShadowPicker
          title="Gölge"
          value={values.shadow}
          onChange={handlers.onShadowChange}
        />
      </div>
    </div>
  );
}

function VisualContent({
  imageSettings,
  hasSelection,
  onUpdate,
}: {
  imageSettings: StudioSlotImageSettings | undefined;
  hasSelection: boolean;
  onUpdate: (v: Partial<StudioSlotImageSettings>) => void;
}) {
  const editMode = imageSettings?.editMode ?? false;
  const scale = imageSettings?.scale ?? 100;

  return (
    <div className="space-y-3">
      <Toggle
        checked={editMode}
        onChange={(v) => onUpdate({ editMode: v })}
        disabled={!hasSelection}
        label="Görsel serbest konum"
      />

      <div className={`space-y-2 ${editMode ? '' : 'opacity-40 pointer-events-none'}`}>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-text-secondary w-16">Büyütme</span>
          <input
            type="range" min={10} max={300} value={scale}
            onChange={(e) => onUpdate({ scale: parseInt(e.target.value) })}
            className="flex-1 studio-slider"
          />
          <input
            type="number" value={scale}
            onChange={(e) => onUpdate({ scale: parseInt(e.target.value) || 10 })}
            className="w-12 text-xs font-normal text-text-primary text-right border border-border-default rounded p-0.5"
          />
          <span className="text-[11px] text-text-muted">%</span>
        </div>
        <Button variant="secondary" size="sm" fullWidth onClick={() => onUpdate({ scale: 100, posX: 0, posY: 0, editMode: false })}>
          Konumu sıfırla
        </Button>
      </div>
    </div>
  );
}

function TextContent({
  productName,
  onProductNameChange,
  onClearRun,
  nameSettings,
  onNameSettingsChange,
}: {
  productName: TypographyData;
  onProductNameChange: (v: TypographyData) => void;
  onClearRun?: (property: string) => void;
  nameSettings?: TextElementSettings;
  onNameSettingsChange?: (v: Partial<TextElementSettings>) => void;
}) {
  return (
    <div className="space-y-3">
      <TypographyPicker
        inline
        title="Ürün Adı"
        value={productName}
        onChange={onProductNameChange}
        onClearRun={onClearRun}
      />

      {nameSettings && onNameSettingsChange && (
        <>
          <div className="space-y-2 pt-2 border-t border-border-default">
            <span className="text-xs font-medium text-text-secondary block">Boyut</span>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-text-secondary w-16">Genişlik</span>
              <input
                type="range"
                min={10}
                max={100}
                step={1}
                value={nameSettings.width ?? 100}
                onChange={(e) => onNameSettingsChange({ width: parseInt(e.target.value) })}
                className="flex-1 studio-slider"
              />
              <input
                type="number"
                value={nameSettings.width ?? ''}
                placeholder="Auto"
                onChange={(e) => {
                  const val = e.target.value === '' ? undefined : parseInt(e.target.value);
                  onNameSettingsChange({ width: val });
                }}
                className="w-12 text-xs font-normal text-text-primary text-center border border-border-default rounded p-0.5"
              />
              <span className="text-[11px] text-text-muted">%</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-text-secondary w-16">Yükseklik</span>
              <input
                type="range"
                min={3}
                max={30}
                step={1}
                value={nameSettings.height ?? 0}
                onChange={(e) => onNameSettingsChange({ height: parseInt(e.target.value) })}
                className="flex-1 studio-slider"
              />
              <input
                type="number"
                value={nameSettings.height ?? ''}
                placeholder="Auto"
                onChange={(e) => {
                  const val = e.target.value === '' ? undefined : parseInt(e.target.value);
                  onNameSettingsChange({ height: val });
                }}
                className="w-12 text-xs font-normal text-text-primary text-center border border-border-default rounded p-0.5"
              />
              <span className="text-[11px] text-text-muted">mm</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border-default">
            <span className="text-xs font-medium text-text-secondary">Zemin Rengi</span>
            <ColorOpacityPicker
              value={{
                type: 'solid',
                color: nameSettings.bgColor ?? '#ffffff',
                opacity: nameSettings.bgOpacity ?? 0,
              }}
              onChange={(v) => {
                if (v.type === 'solid') {
                  onNameSettingsChange({ bgColor: v.color, bgOpacity: v.opacity });
                }
              }}
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border-default">
            <span className="text-xs font-medium text-text-secondary">Çerçeve</span>
            <ColorOpacityPicker
              solidOnly
              type="border"
              value={{
                type: 'solid',
                color: nameSettings.borderColor ?? '#e2e8f0',
                opacity: nameSettings.borderOpacity ?? 0,
              }}
              thickness={nameSettings.borderWidth ?? 0}
              onChange={(v) => {
                if (v.type === 'solid') {
                  onNameSettingsChange({ borderColor: v.color, borderOpacity: v.opacity });
                }
              }}
              onThicknessChange={(v) => onNameSettingsChange({ borderWidth: v })}
            />
          </div>

          <div className="pt-2 border-t border-border-default">
            <BorderRadiusPicker
              title="Köşe ovalliği"
              value={{
                tl: nameSettings.borderRadius ?? 0,
                tr: nameSettings.borderRadius ?? 0,
                bl: nameSettings.borderRadius ?? 0,
                br: nameSettings.borderRadius ?? 0,
                linked: true,
              }}
              onChange={(v) => onNameSettingsChange({ borderRadius: v.tl })}
            />
          </div>
        </>
      )}
    </div>
  );
}

interface PriceValues {
  pricePosition: 'left' | 'center' | 'right';
  priceWidth: number;
  priceHeight: number;
  priceBg: ColorValue;
  priceBorderColor: string;
  priceBorderOpacity: number;
  priceBorderWidth: number;
  priceRadius: BorderRadiusData;
  priceFont: TypographyData;
  priceSettings?: TextElementSettings;
}

interface PriceHandlers {
  onPositionChange: (v: 'left' | 'center' | 'right') => void;
  onWidthChange: (v: number) => void;
  onHeightChange: (v: number) => void;
  onPriceBgChange: (v: ColorValue) => void;
  onPriceBorderChange: (color: string, opacity: number) => void;
  onPriceBorderWidthChange: (v: number) => void;
  onPriceRadiusChange: (v: BorderRadiusData) => void;
  onPriceFontChange: (v: TypographyData) => void;
  onPriceSettingsChange?: (v: Partial<TextElementSettings>) => void;
}

function PriceContent({ values: v, handlers: h }: { values: PriceValues; handlers: PriceHandlers }) {
  return (
    <div className="space-y-3">
      {v.priceSettings && h.onPriceSettingsChange && (
        <div className="space-y-3 pb-3 border-b border-border-default">
          <Toggle
            checked={v.priceSettings.isFreePosition}
            onChange={(val) => h.onPriceSettingsChange!({ isFreePosition: val })}
            label="Fiyat serbest konum"
          />
          {v.priceSettings.isFreePosition && (
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => h.onPriceSettingsChange!({ isFreePosition: false, posX: 50, posY: 50 })}
            >
              Konumu sıfırla
            </Button>
          )}
        </div>
      )}

      <div className={v.priceSettings?.isFreePosition ? 'opacity-40 pointer-events-none select-none' : ''}>
        <span className="text-xs font-medium text-text-secondary block mb-1.5">Konum</span>
        <div className="flex bg-surface-subtle rounded p-1 gap-1 border border-border-default">
          {(['left', 'center', 'right'] as const).map((pos) => (
            <button
              key={pos}
              disabled={v.priceSettings?.isFreePosition}
              onClick={() => h.onPositionChange(pos)}
              className={`flex-1 py-1.5 text-[10px] font-medium rounded transition-colors ${
                v.pricePosition === pos
                  ? 'bg-surface-panel shadow border border-border-default text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {pos === 'left' ? 'Sol' : pos === 'center' ? 'Orta' : 'Sağ'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-border-default">
        <span className="text-xs font-medium text-text-secondary block">Boyut</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-text-secondary w-16">Genişlik</span>
          <input type="range" min={10} max={100} value={v.priceWidth}
            onChange={(e) => h.onWidthChange(parseInt(e.target.value))}
            className="flex-1 studio-slider" />
          <input type="number" value={v.priceWidth}
            onChange={(e) => h.onWidthChange(parseInt(e.target.value) || 0)}
            className="w-12 text-xs font-normal text-text-primary text-right border border-border-default rounded p-0.5" />
          <span className="text-[11px] text-text-muted">%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-text-secondary w-16">Yükseklik</span>
          <input type="range" min={5} max={30} value={v.priceHeight}
            onChange={(e) => h.onHeightChange(parseInt(e.target.value))}
            className="flex-1 studio-slider" />
          <input type="number" value={v.priceHeight}
            onChange={(e) => h.onHeightChange(parseInt(e.target.value) || 0)}
            className="w-12 text-xs font-normal text-text-primary text-right border border-border-default rounded p-0.5" />
          <span className="text-[11px] text-text-muted">mm</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border-default">
        <span className="text-xs font-medium text-text-secondary">Zemin Rengi</span>
        <ColorOpacityPicker value={v.priceBg} onChange={h.onPriceBgChange} />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border-default">
        <span className="text-xs font-medium text-text-secondary">Kenarlık</span>
        <ColorOpacityPicker
          solidOnly
          type="border"
          value={{ type: 'solid', color: v.priceBorderColor, opacity: v.priceBorderOpacity }}
          thickness={v.priceBorderWidth}
          onChange={(val) => { if (val.type !== 'solid') return; h.onPriceBorderChange(val.color, val.opacity); }}
          onThicknessChange={h.onPriceBorderWidthChange}
        />
      </div>

      <div className="pt-2 border-t border-border-default">
        <BorderRadiusPicker title="Köşe ovalliği" value={v.priceRadius} onChange={h.onPriceRadiusChange} />
      </div>

      <div className="pt-2 border-t border-border-default">
        <TypographyPicker inline title="Fiyat Fontu" value={v.priceFont} onChange={h.onPriceFontChange} />
      </div>
    </div>
  );
}

const SHAPE_ITEMS = [
  {
    value: 'rectangle' as const,
    label: 'Dikdörtgen',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="6" width="18" height="12" rx="1" />
      </svg>
    ),
  },
  {
    value: 'pill' as const,
    label: 'Kapsül',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="8" width="18" height="8" rx="4" />
      </svg>
    ),
  },
  {
    value: 'circle' as const,
    label: 'Daire',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="8" />
      </svg>
    ),
  },
  {
    value: 'banner' as const,
    label: 'Şerit',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 15V4h16v11l-8-3-8 3z" />
      </svg>
    ),
  },
  {
    value: 'burst' as const,
    label: 'Yıldız',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    value: 'flama' as const,
    label: 'Flama',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 21V4h16l-4 5 4 5H4" />
      </svg>
    ),
  },
];

function BadgeContent({
  badge,
  onUpdate,
}: {
  badge: BadgeConfig;
  onUpdate: (v: Partial<BadgeConfig>) => void;
}) {
  return (
    <div className="space-y-3">
      {/* [toggle] Etiketi göster — en üstte, ayraç yok */}
      <Toggle
        checked={badge.active}
        onChange={(v) => onUpdate({ active: v })}
        label="Etiketi göster"
      />

      <div className={`space-y-3 ${!badge.active ? 'opacity-40 pointer-events-none' : ''}`}>
        {/* <hr> ayraç */}
        <hr className="border-border-default" />

        {/* Etiket Metni — tek satır input, badge.text */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-secondary w-20 shrink-0">Etiket Metni</span>
          <input
            type="text"
            value={badge.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Örn: %20 İndirim"
            className="flex-1 text-[10px] border border-border-default rounded p-1.5 text-text-primary bg-surface-panel"
          />
        </div>

        {/* <hr> ayraç */}
        <hr className="border-border-default" />

        {/* Zemin — ColorOpacityPicker (solidOnly) */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">Zemin</span>
          <ColorOpacityPicker
            solidOnly
            value={{ type: 'solid', color: badge.bgColor, opacity: badge.bgOpacity ?? 100 }}
            onChange={(v) => {
              if (v.type === 'solid') {
                onUpdate({ bgColor: v.color, bgOpacity: v.opacity });
              }
            }}
          />
        </div>


        {/* Çerçeve Rengi — aynı pattern */}
        <div className="flex items-center justify-between pt-2 border-t border-border-default">
          <span className="text-xs font-medium text-text-secondary">Çerçeve Rengi</span>
          <ColorOpacityPicker
            solidOnly
            value={{ type: 'solid', color: badge.borderColor, opacity: badge.borderOpacity ?? 100 }}
            onChange={(v) => {
              if (v.type === 'solid') {
                onUpdate({ borderColor: v.color, borderOpacity: v.opacity });
              }
            }}
          />
        </div>

        {/* Çerçeve Kalınlığı — slider min 0, max 10, step 1, badge.borderWidth */}
        <div className="flex items-center gap-2 pt-2 border-t border-border-default">
          <span className="text-[11px] font-medium text-text-secondary shrink-0 w-20">Çerçeve Kalınlığı</span>
          <input
            type="range" min={0} max={10} step={1} value={badge.borderWidth}
            onChange={(e) => onUpdate({ borderWidth: parseInt(e.target.value) })}
            className="flex-1 studio-slider"
          />
          <input
            type="number" value={badge.borderWidth}
            onChange={(e) => onUpdate({ borderWidth: parseInt(e.target.value) || 0 })}
            className="w-12 text-xs font-normal text-text-primary text-center border border-border-default rounded p-0.5"
          />
        </div>

        {/* <hr> ayraç */}
        <hr className="border-border-default" />

        {/* Şekil — kart içinde, başlık "Şekil" */}
        <div className="flex flex-col border border-border-default rounded-md overflow-hidden bg-surface-panel">
          <div className="px-3 py-2 bg-surface-subtle border-b border-border-default font-semibold text-xs text-text-primary">
            Şekil
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-1.5">
              {SHAPE_ITEMS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => onUpdate({ shape: s.value })}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors border ${
                    badge.shape === s.value
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-surface-subtle text-text-secondary border-border-default hover:text-text-primary hover:bg-surface-panel'
                  }`}
                >
                  {s.icon}
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* <hr> ayraç */}
        <hr className="border-border-default" />

        {/* Boyut — tek satır, slider min 50, max 500, step 10, yanında %{badge.size} göster */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-text-secondary shrink-0 w-12">Boyut</span>
          <input
            type="range" min={50} max={500} step={10} value={badge.size}
            onChange={(e) => onUpdate({ size: parseInt(e.target.value) })}
            className="flex-1 studio-slider"
          />
          <span className="text-xs font-semibold text-text-primary min-w-9 text-right">%{badge.size}</span>
        </div>

        {/* Font — TypographyPicker bileşeni, badge.font değeri */}
        <TypographyPicker
          inline
          title="Font"
          value={badge.font}
          onChange={(v) => onUpdate({ font: v })}
        />

        {/* Gölge — ShadowPicker bileşeni, badge.shadow */}
        <ShadowPicker
          title="Gölge"
          value={badge.shadow}
          onChange={(v) => onUpdate({ shadow: v })}
        />
      </div>
    </div>
  );
}

// ─── Footer Panel ────────────────────────────────────────────────────────────

type FooterScope = number | 'global';
type FooterClipboard = { heightMm: number; cells: StudioFooterCell[] };

// Oturum boyunca kopyalanan footer tasarımını tutar
let _footerClipboard: FooterClipboard | null = null;


function FooterPanel() {
  const [cellSectionOpen, setCellSectionOpen] = useState(false);
  const [generalSectionOpen, setGeneralSectionOpen] = useState(true);

  const selection = useUIStore((s) => s.selection);
  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const globalSettings = useCatalogStore((s) => s.globalSettings);
  const setPageFooterMode = useCatalogStore((s) => s.setPageFooterMode);
  const updateFooterSettings = useCatalogStore((s) => s.updateFooterSettings);
  const updateFooterCellStore = useCatalogStore((s) => s.updateFooterCellStore);
  const mergeFooterCellsStore = useCatalogStore((s) => s.mergeFooterCellsStore);
  const unmergeFooterCellStore = useCatalogStore((s) => s.unmergeFooterCellStore);

  const pageNum =
    selection.type === 'footerCell' && selection.parentId
      ? parseInt(selection.parentId.replace('page-', ''), 10)
      : NaN;

  const page = !isNaN(pageNum)
    ? getActivePages().find((p) => p.pageNumber === pageNum) ?? null
    : null;

  const footerMode: PageFooterMode = page?.footerMode ?? 'global';
  const isHidden = footerMode === 'hidden';
  const isCustom = footerMode === 'custom';

  // Yükseklik güncellemesi: custom ise sayfa scope, değilse global
  const heightScope: FooterScope = isCustom ? pageNum : 'global';
  const activeFooter = isCustom ? page?.customFooter : globalSettings.footer;
  const heightMm = activeFooter?.heightMm ?? 15;

  // BG, border and radius fallback definitions
  const rawBgColor = activeFooter?.bgColor ?? { type: 'solid', color: '#ffffff', opacity: 0 };
  const footerBg: ColorValue = ('c' in rawBgColor)
    ? { type: 'solid', color: (rawBgColor as any).c, opacity: (rawBgColor as any).o }
    : rawBgColor as ColorValue;

  const footerBorder = activeFooter?.containerBorder ?? { color: { c: '#e2e8f0', o: 100 }, width: 0 };
  const footerRadius = activeFooter?.radius ?? { tl: 0, tr: 0, bl: 0, br: 0, linked: true };

  // Hücre seçimi
  const selectedCellIds = selection.type === 'footerCell' ? selection.ids : [];
  const cells = activeFooter?.cells ?? [];
  const targetCells = cells.filter((c) => selectedCellIds.includes(c.id));
  const firstCell: StudioFooterCell | null = targetCells[0] ?? null;
  const hasCellSel = selectedCellIds.length > 0 && firstCell != null;
  const isMerged = firstCell != null && (firstCell.colSpan > 1 || firstCell.mergedInto != null);

  useEffect(() => {
    setCellSectionOpen(hasCellSel);
  }, [hasCellSel]);

  const updateCell = (patch: Partial<StudioFooterCell>) => {
    // Hücre güncellemeleri için her zaman page scope veya global
    const cellScope: FooterScope = isCustom ? pageNum : 'global';
    selectedCellIds.forEach((id) => updateFooterCellStore(cellScope, id, patch));
  };

  const updateBorderSide = (side: 't' | 'r' | 'b' | 'l', val: number) => {
    if (!firstCell) return;
    const b = firstCell.border;
    updateCell({ border: b.linked ? { ...b, t: val, r: val, b: val, l: val } : { ...b, [side]: val } });
  };

  const handleVisibility = (show: boolean) => {
    if (isNaN(pageNum)) return;
    if (show) setPageFooterMode(pageNum, isCustom ? 'custom' : 'global');
    else setPageFooterMode(pageNum, 'hidden');
  };

  const handleScope = (custom: boolean) => {
    if (isNaN(pageNum)) return;
    setPageFooterMode(pageNum, custom ? 'custom' : 'global');
  };

  return (
    <div className="flex flex-col w-full gap-3">

      {/* Başlık + Özel rozet */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] font-medium text-text-secondary tracking-normal">Alt Bilgi</span>
        {isCustom && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            Özel
          </span>
        )}
      </div>

      {/* Görünürlük */}
      <Toggle
        checked={!isHidden}
        onChange={(v) => handleVisibility(v)}
        label="Alt bilgi göster"
      />

      {/* Kapsam — sadece visible modda göster */}
      {!isNaN(pageNum) && !isHidden && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-text-secondary">Kapsam</span>
          <SegmentedControl
            options={[
              { label: 'Genel', value: 'global' },
              { label: 'Bu sayfaya özel', value: 'custom' },
            ]}
            value={isCustom ? 'custom' : 'global'}
            onChange={(v) => handleScope(v === 'custom')}
          />
        </div>
      )}

      {/* Alt bilgi Akordiyonu */}
      {!isHidden && (
        <AccordionItem
          id="footer-general"
          title="Alt bilgi"
          icon={<PanelBottom size={16} />}
          open={generalSectionOpen}
          onToggle={() => setGeneralSectionOpen((o) => !o)}
        >
          <div className="space-y-3">
            {/* Yükseklik */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-text-secondary w-20">Yükseklik</span>
              <input
                type="range" min={5} max={40} value={heightMm}
                onChange={(e) => updateFooterSettings(heightScope, { heightMm: parseInt(e.target.value) })}
                className="flex-1 studio-slider"
              />
              <input
                type="number" value={heightMm}
                onChange={(e) => updateFooterSettings(heightScope, { heightMm: parseInt(e.target.value) || 5 })}
                className="w-12 text-xs font-normal text-text-primary text-center border border-border-default rounded p-0.5"
              />
              <span className="text-[11px] text-text-muted">mm</span>
            </div>

            {/* Zemin (ColorOpacityPicker, activeFooter.bgColor) */}
            <div className="flex items-center justify-between pt-2 border-t border-border-default">
              <span className="text-xs font-medium text-text-secondary">Zemin Rengi</span>
              <ColorOpacityPicker
                value={footerBg}
                onChange={(v) => updateFooterSettings(heightScope, { bgColor: v })}
              />
            </div>

            {/* Çerçeve Rengi */}
            <div className="flex items-center justify-between pt-2 border-t border-border-default">
              <span className="text-xs font-medium text-text-secondary">Dış Kenarlık Rengi</span>
              <ColorOpacityPicker
                solidOnly
                value={{ type: 'solid', color: footerBorder.color.c, opacity: footerBorder.color.o }}
                onChange={(v) => {
                  if (v.type !== 'solid') return;
                  updateFooterSettings(heightScope, {
                    containerBorder: { ...footerBorder, color: { c: v.color, o: v.opacity } },
                  });
                }}
              />
            </div>

            {/* Çerçeve Kalınlığı */}
            <div className="flex items-center gap-2 pt-2 border-t border-border-default">
              <span className="text-[11px] font-medium text-text-secondary shrink-0 w-20">Dış Kenarlık Kalınlığı</span>
              <input
                type="range" min={0} max={10} step={0.5} value={footerBorder.width}
                onChange={(e) => updateFooterSettings(heightScope, {
                  containerBorder: { ...footerBorder, width: parseFloat(e.target.value) },
                })}
                className="flex-1 studio-slider"
              />
              <input
                type="number" value={footerBorder.width}
                onChange={(e) => updateFooterSettings(heightScope, {
                  containerBorder: { ...footerBorder, width: parseFloat(e.target.value) || 0 },
                })}
                className="w-12 text-xs font-normal text-text-primary text-center border border-border-default rounded p-0.5"
              />
            </div>

            {/* Köşe Yuvarlaklığı */}
            <div className="pt-2 border-t border-border-default">
              <BorderRadiusPicker
                title="Köşe ovalliği"
                value={footerRadius}
                onChange={(v) => updateFooterSettings(heightScope, { radius: v })}
              />
            </div>
          </div>
        </AccordionItem>
      )}

      <div className="border-t border-border-default" />

      {/* Seçili Hücre — akordiyon, seçili değilken soluk */}
      <div className={!hasCellSel ? 'opacity-40 pointer-events-none' : ''}>
        <AccordionItem
          id="footer-cell"
          title="Seçili Hücre"
          icon={<Tag size={16} />}
          open={cellSectionOpen}
          onToggle={() => setCellSectionOpen((o) => !o)}
        >
          {hasCellSel && firstCell && (
            <div className="space-y-3">
              <p className="text-[10px] text-text-secondary font-medium">{targetCells.length} hücre seçili</p>

              {/* Birleştir / Ayır */}
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={selectedCellIds.length < 2}
                  onClick={() => {
                    const cellScope: FooterScope = isCustom ? pageNum : 'global';
                    mergeFooterCellsStore(cellScope, selectedCellIds);
                  }}
                  className="flex-1"
                >
                  Hücreleri birleştir
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!isMerged}
                  onClick={() => {
                    const cellScope: FooterScope = isCustom ? pageNum : 'global';
                    if (selectedCellIds[0]) unmergeFooterCellStore(cellScope, selectedCellIds[0]);
                  }}
                  className="flex-1"
                >
                  Hücreyi ayır
                </Button>
              </div>

              {/* Zemin */}
              <div className="flex items-center justify-between pt-2 border-t border-border-default">
                <span className="text-xs font-medium text-text-secondary">Zemin Rengi</span>
                <ColorOpacityPicker
                  solidOnly
                  value={{ type: 'solid', color: firstCell.bgColor.c, opacity: firstCell.bgColor.o }}
                  onChange={(v) => {
                    if (v.type !== 'solid') return;
                    updateCell({ bgColor: { c: v.color, o: v.opacity } });
                  }}
                />
              </div>

              {/* Kenarlık */}
              <div className="pt-2 border-t border-border-default space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-secondary">Kenarlık Rengi</span>
                  <ColorOpacityPicker
                    solidOnly
                    value={{ type: 'solid', color: firstCell.border.color.c, opacity: firstCell.border.color.o }}
                    onChange={(v) => {
                      if (v.type !== 'solid') return;
                      updateCell({ border: { ...firstCell.border, color: { c: v.color, o: v.opacity } } });
                    }}
                  />
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    title={firstCell.border.linked ? 'Kilidi aç' : 'Tüm kenarları kilitle'}
                    onClick={() => updateCell({ border: { ...firstCell.border, linked: !firstCell.border.linked } })}
                    className={`p-1 rounded border shrink-0 transition-colors ${
                      firstCell.border.linked
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-surface-subtle text-text-secondary border-border-default hover:bg-surface-subtle'
                    }`}
                  >
                    <Link2 size={10} />
                  </button>
                  {(['t', 'r', 'b', 'l'] as const).map((side) => (
                    <div key={side} className="flex flex-col items-center gap-0.5 flex-1">
                      <span className="text-[10px] text-text-muted">
                        {side === 't' ? 'Üst' : side === 'r' ? 'Sağ' : side === 'b' ? 'Alt' : 'Sol'}
                      </span>
                      <input
                        type="number" min={0} max={10} value={firstCell.border[side]}
                        onChange={(e) => updateBorderSide(side, parseFloat(e.target.value) || 0)}
                        className="w-full text-[10px] text-center border border-border-default rounded p-0.5 bg-surface-subtle"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* İç Boşluk */}
              <div className="pt-2 border-t border-border-default">
                <SpacingPicker title="İç Boşluk" value={firstCell.padding} onChange={(v) => updateCell({ padding: v })} />
              </div>

              {/* Font */}
              <div className="pt-2 border-t border-border-default">
                <TypographyPicker inline title="Font ve Hizalama" value={firstCell.font} onChange={(v) => updateCell({ font: v })} />
              </div>
            </div>
          )}
        </AccordionItem>
      </div>
    </div>
  );
}

// ─── Banner Panel ─────────────────────────────────────────────────────────────

const DEFAULT_BORDER: BorderData = {
  t: 0, r: 0, b: 0, l: 0, linked: true,
  color: { c: '#e2e8f0', o: 100 },
  style: 'solid',
};

function BannerPanel() {
  const [open, setOpen] = useState<string | null>('banner-appearance');
  const [confirmReset, setConfirmReset] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selection = useUIStore((s) => s.selection);
  const selectedSlotIds = useUIStore((s) => s.selectedSlotIds);
  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const updateSlotModuleData = useCatalogStore((s) => s.updateSlotModuleData);
  const setBannerFractions = useCatalogStore((s) => s.setBannerFractions);
  const setBannerGridSize = useCatalogStore((s) => s.setBannerGridSize);
  const globalSettings = useCatalogStore((s) => s.globalSettings);

  const slotId =
    selection.type === 'bannerCell' && selection.parentId
      ? selection.parentId
      : selectedSlotIds[0];

  // Hücre seçimi oluşunca "Seçili Tablo Hücresi" akordiyonunu otomatik aç
  const hasCellSel =
    selection.type === 'bannerCell' && selection.parentId === slotId && selection.ids.length > 0;
  useEffect(() => {
    if (hasCellSel) setOpen('banner-cell');
  }, [hasCellSel]);

  // Footer-farkındalığı resolveModuleSlot'ta (footer-slot → globalSettings.footerModule).
  const resolved = resolveModuleSlot(slotId ?? '', getActivePages(), globalSettings);
  const pageNumber = resolved?.pageNumber ?? 0;
  const module = (resolved?.moduleData as BannerModuleData | null) ?? null;

  if (!module || module.type !== 'banner') return null;

  const toggle = (s: string) => setOpen(open === s ? null : s);

  // — Seviye 1: modül verileri —
  const rows = module.rows ?? 4;
  const cols = module.cols ?? 4;
  const bgColor = module.bgColor ?? { type: 'solid' as const, color: '#ffffff', opacity: 100 };
  const cb = module.containerBorder ?? { color: { c: '#e2e8f0', o: 100 }, width: 0 };
  const radius = module.radius ?? { tl: 0, tr: 0, bl: 0, br: 0, linked: true };

  // Sayısal grid boyutu → merge-aware motor (setBannerGridSize). Clamp store/motorda.
  const resizeGrid = (newRows: number, newCols: number) =>
    setBannerGridSize(slotId, Math.max(BANNER_DIM_MIN, Math.min(BANNER_DIM_MAX, newRows)),
      Math.max(BANNER_DIM_MIN, Math.min(BANNER_DIM_MAX, newCols)));

  // Oransal (fr) kolon/satır boyutları — drag ile aynı store alanını yazar (read-back senkron).
  const colFractions = materializeFractions(module.colFractions, cols);
  const rowFractions = materializeFractions(module.rowFractions, rows);
  const setColFraction = (i: number, v: number) => {
    const next = [...colFractions];
    next[i] = Math.max(FRACTION_MIN, v);
    setBannerFractions(slotId, 'col', next);
  };
  const setRowFraction = (i: number, v: number) => {
    const next = [...rowFractions];
    next[i] = Math.max(FRACTION_MIN, v);
    setBannerFractions(slotId, 'row', next);
  };

  // — Seviye 2: hücre seçimi —
  const selectedCellIds =
    selection.type === 'bannerCell' && selection.parentId === slotId ? selection.ids : [];
  const targetCells = module.cells.filter((c) => selectedCellIds.includes(c.id));
  const firstCell = targetCells[0] ?? null;
  const isMerged = firstCell != null && (firstCell.colSpan > 1 || firstCell.rowSpan > 1);

  const updateCells = (patch: Partial<BannerCellData>) => {
    const cells = module!.cells.map((c) =>
      selectedCellIds.includes(c.id) ? { ...c, ...patch } : c,
    );
    updateSlotModuleData(pageNumber, slotId, { cells });
  };

  const mergeCells = () => {
    const c = module!.cols ?? 4;
    const positions = selectedCellIds.map((id) => {
      const idx = module!.cells.findIndex((cell) => cell.id === id);
      return { id, row: Math.floor(idx / c), col: idx % c };
    });
    const minRow = Math.min(...positions.map((p) => p.row));
    const maxRow = Math.max(...positions.map((p) => p.row));
    const minCol = Math.min(...positions.map((p) => p.col));
    const maxCol = Math.max(...positions.map((p) => p.col));
    const masterId = module!.cells[minRow * c + minCol].id;
    const newCells = module!.cells.map((cell, i) => {
      const row = Math.floor(i / c);
      const col = i % c;
      if (cell.id === masterId)
        return { ...cell, colSpan: maxCol - minCol + 1, rowSpan: maxRow - minRow + 1, hidden: false, mergedInto: null };
      if (row >= minRow && row <= maxRow && col >= minCol && col <= maxCol)
        return { ...cell, colSpan: 1, rowSpan: 1, hidden: true, mergedInto: masterId };
      return cell;
    });
    updateSlotModuleData(pageNumber, slotId, { cells: newCells });
  };

  const splitCell = () => {
    if (!firstCell) return;
    const masterId = firstCell.id;
    const newCells = module!.cells.map((cell) => {
      if (cell.id === masterId) return { ...cell, colSpan: 1, rowSpan: 1 };
      if (cell.mergedInto === masterId) return { ...cell, hidden: false, mergedInto: null };
      return cell;
    });
    updateSlotModuleData(pageNumber, slotId, { cells: newCells });
  };

  const resetCell = () => {
    updateCells({
      bgColor: { type: 'solid', color: '#ffffff', opacity: 0 },
      border: DEFAULT_BORDER,
      padding: { t: 0, r: 0, b: 0, l: 0, linked: true },
    });
    setConfirmReset(false);
  };

  const updateCellBorder = (patch: Partial<BorderData>) => {
    if (!firstCell) return;
    updateCells({ border: { ...firstCell.border, ...patch } });
  };

  const updateBorderSide = (side: 't' | 'r' | 'b' | 'l', val: number) => {
    if (!firstCell) return;
    const b = firstCell.border;
    updateCells({ border: b.linked ? { ...b, t: val, r: val, b: val, l: val } : { ...b, [side]: val } });
  };

  return (
    <div className="flex flex-col w-full gap-2">

      {/* 1 — Genel Görünüm */}
      <AccordionItem id="banner-appearance" title="Genel Görünüm" icon={<Square size={16} />}
        open={open === 'banner-appearance'} onToggle={() => toggle('banner-appearance')}
      >
        <div className="space-y-1">

          {/* Izgara Yapısı Kartı */}
          <div className="flex flex-col border border-border-default rounded-radius-md overflow-hidden bg-surface-panel shadow-drop-sm mb-3">
            <div className="px-3 py-2 bg-surface-subtle border-b border-border-default font-semibold text-xs text-text-primary">
              Izgara Yapısı
            </div>
            <div className="p-3 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 flex-1">
                    <span className="text-[10px] text-text-secondary w-10 shrink-0">Satır</span>
                    <input
                      type="number" min={BANNER_DIM_MIN} max={BANNER_DIM_MAX} value={rows}
                      onChange={(e) => resizeGrid(parseInt(e.target.value) || BANNER_DIM_MIN, cols)}
                      className="w-full text-xs text-center border border-border-default rounded px-1 py-1 bg-surface-subtle focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </label>
                  <span className="text-text-muted text-xs shrink-0">×</span>
                  <label className="flex items-center gap-2 flex-1">
                    <span className="text-[10px] text-text-secondary w-10 shrink-0">Sütun</span>
                    <input
                      type="number" min={BANNER_DIM_MIN} max={BANNER_DIM_MAX} value={cols}
                      onChange={(e) => resizeGrid(rows, parseInt(e.target.value) || BANNER_DIM_MIN)}
                      className="w-full text-xs text-center border border-border-default rounded px-1 py-1 bg-surface-subtle focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </label>
                </div>
                <p className="text-[11px] text-text-muted">En fazla {BANNER_DIM_MAX}×{BANNER_DIM_MAX}</p>
              </div>
            </div>
          </div>

          {/* Kolon/Satır Boyutları (oran) Kartı */}
          <div className="flex flex-col border border-border-default rounded-radius-md overflow-hidden bg-surface-panel shadow-drop-sm mb-3">
            <div className="px-3 py-2 bg-surface-subtle border-b border-border-default font-semibold text-xs text-text-primary">
              Kolon/Satır Boyutları (oran)
            </div>
            <div className="p-3 space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] text-text-secondary">Kolon genişlikleri</span>
                <div className="flex flex-wrap gap-1.5">
                  {colFractions.map((f, i) => (
                    <input
                      key={`colfr-${i}`}
                      type="number" min={FRACTION_MIN} step={0.1} value={Math.round(f * 100) / 100}
                      onChange={(e) => setColFraction(i, parseFloat(e.target.value) || FRACTION_MIN)}
                      title={`Kolon ${i + 1}`}
                      className="w-12 text-xs text-center border border-border-default rounded px-1 py-1 bg-surface-subtle focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-text-secondary">Satır yükseklikleri</span>
                <div className="flex flex-wrap gap-1.5">
                  {rowFractions.map((f, i) => (
                    <input
                      key={`rowfr-${i}`}
                      type="number" min={FRACTION_MIN} step={0.1} value={Math.round(f * 100) / 100}
                      onChange={(e) => setRowFraction(i, parseFloat(e.target.value) || FRACTION_MIN)}
                      title={`Satır ${i + 1}`}
                      className="w-12 text-xs text-center border border-border-default rounded px-1 py-1 bg-surface-subtle focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-text-muted">Oran (fr) — kanvasta sınır sürükleyerek de ayarlanır.</p>
            </div>
          </div>

          {/* Zemin ve Çerçeve Kartı */}
          <div className="flex flex-col border border-border-default rounded-radius-md overflow-hidden bg-surface-panel shadow-drop-sm mb-3">
            <div className="px-3 py-2 bg-surface-subtle border-b border-border-default font-semibold text-xs text-text-primary">
              Zemin ve Çerçeve
            </div>
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-secondary">Zemin Rengi</span>
                <ColorOpacityPicker
                  value={bgColor}
                  onChange={(v) => updateSlotModuleData(pageNumber, slotId, { bgColor: v })}
                />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border-default">
                <span className="text-xs font-medium text-text-secondary">Dış Kenarlık Rengi</span>
                <ColorOpacityPicker
                  solidOnly
                  value={{ type: 'solid', color: cb.color.c, opacity: cb.color.o }}
                  onChange={(v) => {
                    if (v.type !== 'solid') return;
                    updateSlotModuleData(pageNumber, slotId, {
                      containerBorder: { ...cb, color: { c: v.color, o: v.opacity } },
                    });
                  }}
                />
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border-default">
                <span className="text-[11px] font-medium text-text-secondary shrink-0 w-20">Dış Kenarlık Kalınlığı</span>
                <input
                  type="range" min={0} max={10} step={0.5} value={cb.width}
                  onChange={(e) => updateSlotModuleData(pageNumber, slotId, {
                    containerBorder: { ...cb, width: parseFloat(e.target.value) },
                  })}
                  className="flex-1 studio-slider"
                />
                <input
                  type="number" value={cb.width}
                  onChange={(e) => updateSlotModuleData(pageNumber, slotId, {
                    containerBorder: { ...cb, width: parseFloat(e.target.value) || 0 },
                  })}
                  className="w-12 text-xs font-normal text-text-primary text-center border border-border-default rounded p-0.5"
                />
              </div>
              <div className="pt-2 border-t border-border-default">
                <BorderRadiusPicker title="Köşe Yuvarlaklığı" value={radius}
                  onChange={(v) => updateSlotModuleData(pageNumber, slotId, { radius: v })}
                />
              </div>
            </div>
          </div>

        </div>
      </AccordionItem>

      {/* 3 — Seçili Tablo Hücresi */}
      <AccordionItem id="banner-cell" title="Seçili Tablo Hücresi" icon={<Tag size={16} />}
        open={open === 'banner-cell'} onToggle={() => toggle('banner-cell')}
        disabled={!hasCellSel}
      >
        {hasCellSel && firstCell && (
          <div className="space-y-1">

            {/* Hücre Düzeni Kartı */}
            <div className="flex flex-col border border-border-default rounded-radius-md overflow-hidden bg-surface-panel shadow-drop-sm mb-3">
              <div className="px-3 py-2 bg-surface-subtle border-b border-border-default font-semibold text-xs text-text-primary">
                Hücre Düzeni
              </div>
              <div className="p-3 space-y-3">
                <p className="text-[10px] text-text-secondary font-medium">{targetCells.length} hücre seçili</p>

                {/* Birleştir / Ayır */}
                <div className="flex gap-2 pb-1">
                  <Button variant="primary" size="sm" disabled={selectedCellIds.length < 2} onClick={mergeCells} className="flex-1">
                    Hücreleri birleştir
                  </Button>
                  <Button variant="secondary" size="sm" disabled={!isMerged} onClick={splitCell} className="flex-1">
                    Hücreyi ayır
                  </Button>
                </div>

                {/* Sıfırla */}
                <div className="pt-2 border-t border-border-default">
                  {confirmReset ? (
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-red-600 font-medium text-center">Hücre ayarları sıfırlanacak. Emin misiniz?</p>
                      <div className="flex gap-2">
                        <Button variant="danger" size="sm" onClick={resetCell} className="flex-1">Sıfırla</Button>
                        <Button variant="secondary" size="sm" onClick={() => setConfirmReset(false)} className="flex-1">İptal</Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="danger" size="sm" fullWidth onClick={() => setConfirmReset(true)}>
                      Hücre ayarlarını sıfırla
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Hücre İçeriği Kartı — sadece tek hücre seçiliyse */}
            {targetCells.length === 1 && (
              <div className="flex flex-col border border-border-default rounded-radius-md overflow-hidden bg-surface-panel shadow-drop-sm mb-3">
                <div className="px-3 py-2 bg-surface-subtle border-b border-border-default font-semibold text-xs text-text-primary">
                  Hücre İçeriği
                </div>
                <div className="p-3 space-y-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-text-secondary">Metin</span>
                    <textarea
                      value={firstCell.text || ''}
                      onChange={(e) => updateCells({ text: e.target.value })}
                      rows={3}
                      className="w-full text-[10px] border border-border-default rounded p-1.5 text-text-primary resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
                      placeholder="Hücre metni..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-text-secondary">Resim</span>
                    {firstCell.image ? (
                      <div className="relative">
                        <img
                          src={firstCell.image}
                          alt=""
                          className="w-full h-20 object-contain rounded border border-border-default bg-surface-subtle"
                        />
                        <button
                          onClick={() => updateCells({ image: null })}
                          className="absolute top-1 right-1 p-0.5 bg-surface-panel rounded border border-border-default text-red-500 hover:bg-red-50"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <Button variant="secondary" size="sm" fullWidth disabled={imgUploading} onClick={() => fileInputRef.current?.click()}>
                        {imgUploading ? 'Yükleniyor...' : '+ Resim ekle'}
                      </Button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setImgUploading(true);
                        try {
                          const result = await uploadImage(file);
                          updateCells({ image: result.absoluteUrl });
                        } catch {
                          // ignore upload errors silently
                        }
                        setImgUploading(false);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    />
                  </div>

                  {/* Resim modu — sadece resim varsa */}
                  {firstCell.image && (
                    <div className="space-y-2 pt-2 border-t border-border-default">
                      <span className="text-[11px] font-medium text-text-secondary">Resim Modu</span>
                      <div className="flex bg-surface-subtle rounded p-1 gap-1 border border-border-default">
                        {([
                          { value: 'contain', label: 'Sığdır' },
                          { value: 'cover',   label: 'Doldur' },
                          { value: 'free',    label: 'Serbest' },
                        ] as const).map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => updateCells({ imageMode: value, imagePosX: 0, imagePosY: 0, imageScale: 100 })}
                            className={`flex-1 py-1.5 text-[10px] font-medium rounded transition-colors ${
                              (firstCell.imageMode ?? 'contain') === value
                                ? 'bg-surface-panel shadow border border-border-default text-text-primary'
                                : 'text-text-secondary hover:text-text-primary'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {(firstCell.imageMode ?? 'contain') === 'free' && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-medium text-text-secondary w-12">Büyütme</span>
                            <input
                              type="range" min={10} max={300} value={firstCell.imageScale ?? 100}
                              onChange={(e) => updateCells({ imageScale: parseInt(e.target.value) })}
                              className="flex-1 studio-slider"
                            />
                            <input
                              type="number" value={firstCell.imageScale ?? 100}
                              onChange={(e) => updateCells({ imageScale: parseInt(e.target.value) || 10 })}
                              className="w-12 text-xs font-normal text-text-primary text-right border border-border-default rounded p-0.5"
                            />
                            <span className="text-[11px] text-text-muted">%</span>
                          </div>
                          <Button variant="secondary" size="sm" fullWidth onClick={() => updateCells({ imagePosX: 0, imagePosY: 0, imageScale: 100 })}>
                            Konumu sıfırla
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hücre Görünümü Kartı */}
            <div className="flex flex-col border border-border-default rounded-radius-md overflow-hidden bg-surface-panel shadow-drop-sm mb-3">
              <div className="px-3 py-2 bg-surface-subtle border-b border-border-default font-semibold text-xs text-text-primary">
                Hücre Görünümü
              </div>
              <div className="p-3 space-y-3">
                {/* Zemin */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-secondary">Zemin Rengi</span>
                  <ColorOpacityPicker
                    value={firstCell.bgColor}
                    onChange={(v) => updateCells({ bgColor: v })}
                  />
                </div>

                {/* Kenarlık */}
                <div className="pt-2 border-t border-border-default space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-text-secondary">Kenarlık Rengi</span>
                    <ColorOpacityPicker
                      solidOnly
                      value={{ type: 'solid', color: firstCell.border.color.c, opacity: firstCell.border.color.o }}
                      onChange={(v) => {
                        if (v.type !== 'solid') return;
                        updateCellBorder({ color: { c: v.color, o: v.opacity } });
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      title={firstCell.border.linked ? 'Kilidi aç' : 'Tüm kenarları kilitle'}
                      onClick={() => updateCellBorder({ linked: !firstCell.border.linked })}
                      className={`p-1 rounded border shrink-0 transition-colors ${
                        firstCell.border.linked
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-surface-subtle text-text-secondary border-border-default hover:bg-surface-subtle'
                      }`}
                    >
                      <Link2 size={10} />
                    </button>
                    {(['t', 'r', 'b', 'l'] as const).map((side) => (
                      <div key={side} className="flex flex-col items-center gap-0.5 flex-1">
                        <span className="text-[10px] text-text-muted">
                          {side === 't' ? 'Üst' : side === 'r' ? 'Sağ' : side === 'b' ? 'Alt' : 'Sol'}
                        </span>
                        <input
                          type="number" min={0} max={10} value={firstCell.border[side]}
                          onChange={(e) => updateBorderSide(side, parseFloat(e.target.value) || 0)}
                          className="w-full text-[10px] text-center border border-border-default rounded p-0.5 bg-surface-subtle"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* İç boşluk */}
                <div className="pt-2 border-t border-border-default">
                  <SpacingPicker title="İç Boşluk" value={firstCell.padding}
                    onChange={(v) => updateCells({ padding: v })}
                  />
                </div>
              </div>
            </div>

            {/* Font ve Hizalama (TypographyPicker zaten kendi içinde kart yapısına sahip) */}
            <TypographyPicker inline title="Font ve Hizalama" value={firstCell.font}
              onChange={(v) => updateCells({ font: v })}
              onClearRun={(p) => clearRunForSurface('module', slotId, selectedCellIds, p as RunProperty)}
            />
          </div>
        )}
      </AccordionItem>

    </div>
  );
}

export function CellPanel() {
  const [openSection, setOpenSection] = useState<string | null>('general-appearance');

  const selectedSlotIds = useUIStore((s) => s.selectedSlotIds);
  const selection = useUIStore((s) => s.selection);
  const sidebarState = useUIStore((s) => s.sidebarState);

  useEffect(() => {
    if (sidebarState.activeSubTab) {
      setOpenSection(sidebarState.activeSubTab);
    } else if (sidebarState.activeTab) {
      setOpenSection(sidebarState.activeTab);
    }
  }, [sidebarState]);
  const pages = useCatalogStore((s) =>
    s.formas.find((f) => f.id === s.activeFormaId)?.pages ?? []
  );
  const toggleSlotCustomSettings = useCatalogStore((s) => s.toggleSlotCustomSettings);
  const globalSettings = useCatalogStore((s) => s.globalSettings);
  const setGlobalSettings = useCatalogStore((s) => s.setGlobalSettings);
  const updateSlotCustomSettings = useCatalogStore((s) => s.updateSlotCustomSettings);
  const updateSelectedSlotsImageSettings = useCatalogStore((s) => s.updateSelectedSlotsImageSettings);
  const toggleSlotRole = useCatalogStore((s) => s.toggleSlotRole);

  const effectiveSlotId =
    selectedSlotIds[0] ??
    (selection.type === 'textElement'
      ? (selection.parentId ?? undefined)
      : selection.type === 'bannerCell'
      ? (selection.parentId ?? undefined)
      : undefined);

  const selectedSlot = effectiveSlotId
    ? pages.flatMap((p) => p.slots).find((s) => s.id === effectiveSlotId)
    : null;

  const isCustom = selectedSlot?.isCustom ?? false;
  const hasSelection = !!effectiveSlotId;

  const prevIsCustomRef = useRef(isCustom);
  useEffect(() => {
    if (prevIsCustomRef.current !== isCustom) {
      if (isCustom) {
        if (openSection && openSection.startsWith('general-')) {
          setOpenSection(null);
        }
      } else {
        if (openSection && openSection.startsWith('custom-')) {
          setOpenSection(null);
        }
      }
      prevIsCustomRef.current = isCustom;
    }
  }, [isCustom, openSection]);

  const toggle = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleMakeCustom = () => {
    toggleSlotCustomSettings(true);
    setOpenSection('custom-appearance');
  };

  const handleMakeGeneral = () => {
    toggleSlotCustomSettings(false);
    setOpenSection('general-appearance');
  };

  // Genel görünüm
  const globalValues: AppearanceValues = {
    cellBg: globalSettings.colors.cellBg,
    cellBorderColor: globalSettings.colors.cellBorder.c,
    cellBorderOpacity: globalSettings.colors.cellBorder.o,
    borderWidth: globalSettings.borderWidth,
    radius: globalSettings.radiuses.cell,
    spacing: globalSettings.spacings.cell,
    shadow: globalSettings.shadows.cell,
  };

  const globalHandlers: AppearanceHandlers = {
    onCellBgChange: (v) => setGlobalSettings({ colors: { ...globalSettings.colors, cellBg: v } }),
    onCellBorderChange: (c, o) =>
      setGlobalSettings({ colors: { ...globalSettings.colors, cellBorder: { c, o } } }),
    onBorderWidthChange: (v) => setGlobalSettings({ borderWidth: v }),
    onRadiusChange: (v) => setGlobalSettings({ radiuses: { ...globalSettings.radiuses, cell: v } }),
    onSpacingChange: (v) => setGlobalSettings({ spacings: { ...globalSettings.spacings, cell: v } }),
    onShadowChange: (v) => setGlobalSettings({ shadows: { ...globalSettings.shadows, cell: v } }),
  };

  // Özel hücre görünümü — customSettings'ten oku, yoksa globalSettings'e düş
  const cs = selectedSlot?.customSettings;
  const customValues: AppearanceValues = {
    cellBg: (cs?.colors?.cellBg ?? globalSettings.colors.cellBg) as ColorValue,
    cellBorderColor: cs?.colors?.cellBorder?.c ?? globalSettings.colors.cellBorder.c,
    cellBorderOpacity: cs?.colors?.cellBorder?.o ?? globalSettings.colors.cellBorder.o,
    borderWidth: cs?.borderWidth ?? globalSettings.borderWidth,
    radius: (cs?.radiuses?.cell ?? globalSettings.radiuses.cell) as BorderRadiusData,
    spacing: (cs?.spacings?.cell ?? globalSettings.spacings.cell) as SpacingData,
    shadow: (cs?.shadows?.cell ?? globalSettings.shadows.cell) as ShadowData,
  };

  const customHandlers: AppearanceHandlers = {
    onCellBgChange: (v) =>
      updateSlotCustomSettings({ colors: { ...cs?.colors, cellBg: v } }),
    onCellBorderChange: (c, o) =>
      updateSlotCustomSettings({ colors: { ...cs?.colors, cellBorder: { c, o } } }),
    onBorderWidthChange: (v) => updateSlotCustomSettings({ borderWidth: v }),
    onRadiusChange: (v) =>
      updateSlotCustomSettings({ radiuses: { ...cs?.radiuses, cell: v } }),
    onSpacingChange: (v) =>
      updateSlotCustomSettings({ spacings: { ...cs?.spacings, cell: v } }),
    onShadowChange: (v) =>
      updateSlotCustomSettings({ shadows: { ...cs?.shadows, cell: v } }),
  };

  const isBannerSlot =
    selectedSlot?.role === 'free' &&
    (selectedSlot?.moduleData as { type?: string })?.type === 'banner';

  if (isBannerSlot) {
    return <BannerPanel />;
  }

  if (selection.type === 'footerCell') {
    return <FooterPanel />;
  }

  return (
    <div className="flex flex-col w-full space-y-2">

      {/* 📦 Hücre Yapısı Belirleme Kartı */}
      {hasSelection && (
        <div className="flex flex-col border border-border-default rounded-radius-md overflow-hidden bg-surface-panel shadow-drop-sm mb-3 shrink-0">
          <div className="px-3 py-2 bg-surface-subtle border-b border-border-default font-semibold text-xs text-text-primary">
            Hücre Yapısı
          </div>
          <div className="p-3">
            <SegmentedControl
              options={[
                { label: 'Ürün Hücresi', value: 'product' },
                { label: 'Serbest Alan', value: 'free' },
              ]}
              value={selectedSlot?.role === 'free' ? 'free' : 'product'}
              onChange={(val) => {
                if (val === 'free' && selectedSlot?.role !== 'free') {
                  toggleSlotRole('free');
                } else if (val === 'product' && selectedSlot?.role === 'free') {
                  toggleSlotRole('product');
                }
              }}
            />
          </div>
        </div>
      )}

      {/* ── Hücre Boşluğu (gridGap) Slider'ı ── */}
      <div className="flex items-center justify-between gap-2 bg-surface-panel p-2.5 rounded border border-border-default shadow-sm mb-2 shrink-0">
        <span className="text-label-md text-text-secondary w-24">Hücre Boşluğu</span>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={globalSettings.gridGap}
          onChange={(e) => setGlobalSettings({ gridGap: parseFloat(e.target.value) })}
          className="flex-1 studio-slider"
        />
        <input
          type="number"
          value={globalSettings.gridGap}
          onChange={(e) =>
            setGlobalSettings({ gridGap: parseFloat(e.target.value) || 0 })
          }
          className="w-12 text-body-md text-text-secondary text-right border border-border-default rounded p-0.5"
        />
        <span className="text-[11px] text-text-muted">mm</span>
      </div>

      {/* ── Genel hücre ayarları ── */}
      <div className={`flex flex-col gap-1.5 ${hasSelection && isCustom ? 'opacity-40 pointer-events-none select-none' : ''}`}>
        <div className="flex items-center justify-between px-1 py-1">
          <span className="text-[11px] font-medium text-text-secondary tracking-normal">Genel Hücre Ayarları</span>
        </div>

        <AccordionItem
          id="general-appearance" title="Hücre görünümü" icon={<Square size={16} />}
          open={openSection === 'general-appearance'} onToggle={() => toggle('general-appearance')}
        >
          <AppearanceContent values={globalValues} handlers={globalHandlers} />
        </AccordionItem>

        <AccordionItem
          id="general-visual" title="Görsel ayarları" icon={<Image size={16} />}
          open={openSection === 'general-visual'} onToggle={() => toggle('general-visual')}
          disabled={!hasSelection}
        >
          <VisualContent
            imageSettings={selectedSlot?.imageSettings}
            hasSelection={hasSelection}
            onUpdate={updateSelectedSlotsImageSettings}
          />
        </AccordionItem>

        <AccordionItem
          id="general-product-info" title="Metin ayarları" icon={<Type size={16} />}
          open={openSection === 'general-product-info'} onToggle={() => toggle('general-product-info')}
        >
          <TextContent
            productName={globalSettings.fonts.productName}
            onProductNameChange={(v) =>
              setGlobalSettings({ fonts: { ...globalSettings.fonts, productName: v } })
            }
            onClearRun={(p) => {
              if (effectiveSlotId) clearRunForSurface('product', effectiveSlotId, [], p as RunProperty);
            }}
          />
        </AccordionItem>

        <AccordionItem
          id="general-price" title="Fiyat kutusu" icon={<Tag size={16} />}
          open={openSection === 'general-price'} onToggle={() => toggle('general-price')}
        >
          <PriceContent
            values={{
              pricePosition: globalSettings.pricePosition,
              priceWidth: globalSettings.priceWidth,
              priceHeight: globalSettings.priceHeight,
              priceBg: globalSettings.colors.priceBg,
              priceBorderColor: globalSettings.colors.priceBorder.c,
              priceBorderOpacity: globalSettings.colors.priceBorder.o,
              priceBorderWidth: globalSettings.priceBorderWidth,
              priceRadius: globalSettings.radiuses.price,
              priceFont: globalSettings.fonts.price,
            }}
            handlers={{
              onPositionChange: (val) => setGlobalSettings({ pricePosition: val }),
              onWidthChange: (val) => setGlobalSettings({ priceWidth: val }),
              onHeightChange: (val) => setGlobalSettings({ priceHeight: val }),
              onPriceBgChange: (val) => setGlobalSettings({ colors: { ...globalSettings.colors, priceBg: val } }),
              onPriceBorderChange: (c, o) => setGlobalSettings({ colors: { ...globalSettings.colors, priceBorder: { c, o } } }),
              onPriceBorderWidthChange: (val) => setGlobalSettings({ priceBorderWidth: val }),
              onPriceRadiusChange: (val) => setGlobalSettings({ radiuses: { ...globalSettings.radiuses, price: val } }),
              onPriceFontChange: (val) => setGlobalSettings({ fonts: { ...globalSettings.fonts, price: val } }),
            }}
          />
        </AccordionItem>

        {hasSelection && !isCustom && (
          <Button variant="primary" fullWidth onClick={handleMakeCustom}>
            Bu hücreyi özel hücre yap
          </Button>
        )}
      </div>

      {/* ── Özel hücre ayarları ── */}
      {hasSelection && isCustom && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-1 py-1">
            <span className="text-[11px] font-medium text-text-secondary tracking-normal">Özel Hücre Ayarları</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Özel</span>
          </div>

          <AccordionItem
            id="custom-appearance" title="Hücre görünümü" icon={<Square size={16} />}
            open={openSection === 'custom-appearance'} onToggle={() => toggle('custom-appearance')}
          >
            <AppearanceContent values={customValues} handlers={customHandlers} />
          </AccordionItem>

          <AccordionItem
            id="custom-visual" title="Görsel ayarları" icon={<Image size={16} />}
            open={openSection === 'custom-visual'} onToggle={() => toggle('custom-visual')}
          >
            <VisualContent
              imageSettings={selectedSlot?.imageSettings}
              hasSelection={hasSelection}
              onUpdate={updateSelectedSlotsImageSettings}
            />
          </AccordionItem>

          <AccordionItem
            id="custom-product-info" title="Metin ayarları" icon={<Type size={16} />}
            open={openSection === 'custom-product-info'} onToggle={() => toggle('custom-product-info')}
          >
            <TextContent
              productName={
                (cs?.fonts?.productName ?? globalSettings.fonts.productName) as TypographyData
              }
              onProductNameChange={(v) =>
                updateSlotCustomSettings({ fonts: { ...cs?.fonts, productName: v } })
              }
              onClearRun={(p) => {
                if (effectiveSlotId) clearRunForSurface('product', effectiveSlotId, [], p as RunProperty);
              }}
              nameSettings={
                (cs?.nameSettings ?? globalSettings.nameSettings) as TextElementSettings
              }
              onNameSettingsChange={(partial) =>
                updateSlotCustomSettings({
                  nameSettings: {
                    ...(cs?.nameSettings ?? globalSettings.nameSettings),
                    ...partial,
                  },
                })
              }
            />
          </AccordionItem>

          <AccordionItem
            id="custom-price" title="Fiyat kutusu" icon={<Tag size={16} />}
            open={openSection === 'custom-price'} onToggle={() => toggle('custom-price')}
          >
            <PriceContent
              values={{
                pricePosition: (cs?.pricePosition ?? globalSettings.pricePosition) as 'left' | 'center' | 'right',
                priceWidth: cs?.priceWidth ?? globalSettings.priceWidth,
                priceHeight: cs?.priceHeight ?? globalSettings.priceHeight,
                priceBg: (cs?.colors?.priceBg ?? globalSettings.colors.priceBg) as ColorValue,
                priceBorderColor: cs?.colors?.priceBorder?.c ?? globalSettings.colors.priceBorder.c,
                priceBorderOpacity: cs?.colors?.priceBorder?.o ?? globalSettings.colors.priceBorder.o,
                priceBorderWidth: cs?.priceBorderWidth ?? globalSettings.priceBorderWidth,
                priceRadius: (cs?.radiuses?.price ?? globalSettings.radiuses.price) as BorderRadiusData,
                priceFont: (cs?.fonts?.price ?? globalSettings.fonts.price) as TypographyData,
                priceSettings: (cs?.priceSettings ?? globalSettings.priceSettings) as TextElementSettings,
              }}
              handlers={{
                onPositionChange: (val) => updateSlotCustomSettings({ pricePosition: val }),
                onWidthChange: (val) => updateSlotCustomSettings({ priceWidth: val }),
                onHeightChange: (val) => updateSlotCustomSettings({ priceHeight: val }),
                onPriceBgChange: (val) => updateSlotCustomSettings({ colors: { ...cs?.colors, priceBg: val } }),
                onPriceBorderChange: (c, o) => updateSlotCustomSettings({ colors: { ...cs?.colors, priceBorder: { c, o } } }),
                onPriceBorderWidthChange: (val) => updateSlotCustomSettings({ priceBorderWidth: val }),
                onPriceRadiusChange: (val) => updateSlotCustomSettings({ radiuses: { ...cs?.radiuses, price: val } }),
                onPriceFontChange: (val) => updateSlotCustomSettings({ fonts: { ...cs?.fonts, price: val } }),
                onPriceSettingsChange: (partial) =>
                  updateSlotCustomSettings({
                    priceSettings: {
                      ...(cs?.priceSettings ?? globalSettings.priceSettings),
                      ...partial,
                    },
                  }),
              }}
            />
          </AccordionItem>

          <AccordionItem
            id="custom-badge" title="Promosyon etiketi" icon={<Layers size={16} />}
            open={openSection === 'custom-badge'} onToggle={() => toggle('custom-badge')}
          >
            <BadgeContent
              badge={(cs?.badge ?? globalSettings.badge) as BadgeConfig}
              onUpdate={(partial) =>
                updateSlotCustomSettings({
                  badge: { ...(cs?.badge ?? globalSettings.badge), ...partial },
                })
              }
            />
          </AccordionItem>

          <Button variant="secondary" fullWidth onClick={handleMakeGeneral}>
            Genel hücreye dönüştür
          </Button>
        </div>
      )}

      {!hasSelection && (
        <div className="mt-4 p-3 bg-surface-subtle rounded-md border border-border-default text-center">
          <p className="text-[10px] text-text-muted">Bir hücre seçildiğinde özel hücre ayarları buraya gelir.</p>
        </div>
      )}
    </div>
  );
}
