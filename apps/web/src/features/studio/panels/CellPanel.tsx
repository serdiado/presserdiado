import { useState } from 'react';
import { useUIStore, useCatalogStore } from '@/stores/studio';
import { ChevronDown, Square, Layers, Image, Type, Tag } from 'lucide-react';
import { ColorOpacityPicker, BorderRadiusPicker, SpacingPicker, ShadowPicker, TypographyPicker } from '../pickers';
import type {
  BadgeConfig,
  BadgePosition,
  BadgeShape,
  BorderRadiusData,
  ColorValue,
  ShadowData,
  SpacingData,
  StudioSlotImageSettings,
  TypographyData,
} from '@matbaapro/shared';

type CellSection =
  | 'general-appearance' | 'general-visual' | 'general-product-info' | 'general-price'
  | 'custom-appearance' | 'custom-visual' | 'custom-product-info' | 'custom-price' | 'custom-badge';

function AccordionItem({
  id, title, icon, open, onToggle, children, disabled, badge,
}: {
  id: CellSection; title: string; icon: React.ReactNode; open: boolean;
  onToggle: () => void; children: React.ReactNode; disabled?: boolean; badge?: string;
}) {
  return (
    <div className="flex flex-col border border-slate-200 rounded-md overflow-hidden bg-white">
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`flex items-center justify-between p-3 transition-colors ${
          disabled ? 'bg-slate-50 opacity-40 cursor-not-allowed' : 'bg-slate-50 hover:bg-slate-100'
        }`}
      >
        <div className={`flex items-center gap-2 ${open ? 'text-slate-800' : 'text-slate-500'}`}>
          {icon}
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">{title}</span>
          {badge && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`transition-all duration-300 ${open ? 'rotate-180 text-slate-800' : 'text-slate-400'}`}
        />
      </button>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${open ? 'max-h-500 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 border-t border-slate-200 bg-white">
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
          <span className="text-[10px] font-bold text-slate-600">Zemin Rengi</span>
          <ColorOpacityPicker value={values.cellBg} onChange={handlers.onCellBgChange} />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-600">Kenarlık Rengi</span>
          <ColorOpacityPicker
            solidOnly
            value={{ type: 'solid', color: values.cellBorderColor, opacity: values.cellBorderOpacity }}
            onChange={(v) => { if (v.type !== 'solid') return; handlers.onCellBorderChange(v.color, v.opacity); }}
          />
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[9px] font-medium text-slate-500 w-16">Kalınlık</span>
          <input
            type="range" min={0} max={10} step={0.5} value={values.borderWidth}
            onChange={(e) => handlers.onBorderWidthChange(parseFloat(e.target.value))}
            className="flex-1 studio-slider"
          />
          <input
            type="number" value={values.borderWidth}
            onChange={(e) => handlers.onBorderWidthChange(parseFloat(e.target.value) || 0)}
            className="w-12 text-[10px] font-bold text-slate-600 text-center border border-slate-200 rounded p-0.5"
          />
        </div>
      </div>
      <div className="pt-1 border-t border-slate-100">
        <BorderRadiusPicker
          title="Köşe Yuvarlaklığı"
          value={values.radius}
          onChange={handlers.onRadiusChange}
        />
      </div>
      <div className="pt-1 border-t border-slate-100">
        <SpacingPicker
          title="İç Boşluk"
          value={values.spacing}
          onChange={handlers.onSpacingChange}
        />
      </div>
      <div className="pt-1 border-t border-slate-100">
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
      <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200">
        <span className="text-[10px] font-bold text-slate-700">Görsel Serbest Konum</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            disabled={!hasSelection}
            checked={editMode}
            onChange={(e) => onUpdate({ editMode: e.target.checked })}
          />
          <div className="w-8 h-4 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-900 shadow-inner" />
        </label>
      </div>

      <div className={`space-y-2 ${editMode ? '' : 'opacity-40 pointer-events-none'}`}>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-medium text-slate-500 w-16">Büyütme</span>
          <input
            type="range" min={10} max={300} value={scale}
            onChange={(e) => onUpdate({ scale: parseInt(e.target.value) })}
            className="flex-1 studio-slider"
          />
          <input
            type="number" value={scale}
            onChange={(e) => onUpdate({ scale: parseInt(e.target.value) || 10 })}
            className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5"
          />
          <span className="text-[9px] text-slate-400">%</span>
        </div>
        <button
          onClick={() => onUpdate({ scale: 100, posX: 0, posY: 0, editMode: false })}
          className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[9px] font-bold rounded border border-slate-200"
        >
          Konumu Sıfırla
        </button>
      </div>
    </div>
  );
}

function TextContent({
  productName,
  onProductNameChange,
}: {
  productName: TypographyData;
  onProductNameChange: (v: TypographyData) => void;
}) {
  return (
    <div className="space-y-3">
      <TypographyPicker
        title="Ürün Adı"
        value={productName}
        onChange={onProductNameChange}
      />
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
}

function PriceContent({ values: v, handlers: h }: { values: PriceValues; handlers: PriceHandlers }) {
  return (
    <div className="space-y-3">
      <div>
        <span className="text-[10px] font-bold text-slate-500 block mb-1.5">Konum</span>
        <div className="flex bg-slate-50 rounded p-1 gap-1 border border-slate-100">
          {(['left', 'center', 'right'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => h.onPositionChange(pos)}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-colors ${
                v.pricePosition === pos
                  ? 'bg-white shadow border border-slate-200 text-slate-800'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {pos === 'left' ? 'Sol' : pos === 'center' ? 'Orta' : 'Sağ'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-500 block">Boyut</span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-medium text-slate-500 w-16">Genişlik</span>
          <input type="range" min={10} max={100} value={v.priceWidth}
            onChange={(e) => h.onWidthChange(parseInt(e.target.value))}
            className="flex-1 studio-slider" />
          <input type="number" value={v.priceWidth}
            onChange={(e) => h.onWidthChange(parseInt(e.target.value) || 0)}
            className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5" />
          <span className="text-[9px] text-slate-400">%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-medium text-slate-500 w-16">Yükseklik</span>
          <input type="range" min={5} max={30} value={v.priceHeight}
            onChange={(e) => h.onHeightChange(parseInt(e.target.value))}
            className="flex-1 studio-slider" />
          <input type="number" value={v.priceHeight}
            onChange={(e) => h.onHeightChange(parseInt(e.target.value) || 0)}
            className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5" />
          <span className="text-[9px] text-slate-400">mm</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-600">Zemin Rengi</span>
        <ColorOpacityPicker value={v.priceBg} onChange={h.onPriceBgChange} />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-600">Kenarlık</span>
        <ColorOpacityPicker
          solidOnly
          type="border"
          value={{ type: 'solid', color: v.priceBorderColor, opacity: v.priceBorderOpacity }}
          thickness={v.priceBorderWidth}
          onChange={(val) => { if (val.type !== 'solid') return; h.onPriceBorderChange(val.color, val.opacity); }}
          onThicknessChange={h.onPriceBorderWidthChange}
        />
      </div>

      <div className="pt-2 border-t border-slate-100">
        <BorderRadiusPicker title="Ovallik" value={v.priceRadius} onChange={h.onPriceRadiusChange} />
      </div>

      <div className="pt-2 border-t border-slate-100">
        <TypographyPicker title="Fiyat Fontu" value={v.priceFont} onChange={h.onPriceFontChange} />
      </div>
    </div>
  );
}

const POSITIONS: { value: BadgePosition; label: string }[] = [
  { value: 'top-left',     label: 'Sol Üst'  },
  { value: 'top-right',    label: 'Sağ Üst'  },
  { value: 'bottom-left',  label: 'Sol Alt'  },
  { value: 'bottom-right', label: 'Sağ Alt'  },
];

const SHAPES: { value: BadgeShape; label: string }[] = [
  { value: 'circle',    label: 'Yuvarlak'    },
  { value: 'rectangle', label: 'Dikdörtgen'  },
  { value: 'burst',     label: 'Yıldız'      },
  { value: 'flama',     label: 'Bayrak'      },
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
      <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200">
        <span className="text-[10px] font-bold text-slate-700">Etiketi Göster</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={badge.active}
            onChange={(e) => onUpdate({ active: e.target.checked })}
          />
          <div className="w-8 h-4 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-900 shadow-inner" />
        </label>
      </div>

      <div className={`space-y-3 ${!badge.active ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-600 w-20 shrink-0">Etiket Metni</span>
          <input
            type="text"
            value={badge.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Örn: %20 İndirim"
            className="flex-1 text-[10px] border border-slate-200 rounded p-1.5 text-slate-700"
          />
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-600">Zemin Rengi</span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-400 font-mono uppercase">{badge.bgColor}</span>
              <input
                type="color"
                value={badge.bgColor}
                onChange={(e) => onUpdate({ bgColor: e.target.value })}
                className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0.5"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-600">Yazı Rengi</span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-400 font-mono uppercase">{badge.textColor}</span>
              <input
                type="color"
                value={badge.textColor}
                onChange={(e) => onUpdate({ textColor: e.target.value })}
                className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0.5"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 block mb-1.5">Konum</span>
          <div className="grid grid-cols-2 gap-1">
            {POSITIONS.map((p) => (
              <button
                key={p.value}
                onClick={() => onUpdate({ position: p.value })}
                className={`py-1.5 text-[10px] font-bold rounded transition-colors ${
                  badge.position === p.value
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-50 text-slate-500 border border-slate-200 hover:text-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 block mb-1.5">Şekil</span>
          <div className="grid grid-cols-2 gap-1">
            {SHAPES.map((s) => (
              <button
                key={s.value}
                onClick={() => onUpdate({ shape: s.value })}
                className={`py-1.5 text-[10px] font-bold rounded transition-colors ${
                  badge.shape === s.value
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-50 text-slate-500 border border-slate-200 hover:text-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[9px] font-medium text-slate-500 w-12">Boyut</span>
          <input
            type="range" min={50} max={200} value={badge.size}
            onChange={(e) => onUpdate({ size: parseInt(e.target.value) })}
            className="flex-1 studio-slider"
          />
          <input
            type="number" value={badge.size}
            onChange={(e) => onUpdate({ size: parseInt(e.target.value) || 50 })}
            className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5"
          />
          <span className="text-[9px] text-slate-400">%</span>
        </div>
      </div>
    </div>
  );
}

export function CellPanel() {
  const [openSection, setOpenSection] = useState<CellSection | null>('general-appearance');

  const selectedSlotIds = useUIStore((s) => s.selectedSlotIds);
  const pages = useCatalogStore((s) =>
    s.formas.find((f) => f.id === s.activeFormaId)?.pages ?? []
  );
  const toggleSlotCustomSettings = useCatalogStore((s) => s.toggleSlotCustomSettings);
  const globalSettings = useCatalogStore((s) => s.globalSettings);
  const setGlobalSettings = useCatalogStore((s) => s.setGlobalSettings);
  const updateSlotCustomSettings = useCatalogStore((s) => s.updateSlotCustomSettings);
  const updateSelectedSlotsImageSettings = useCatalogStore((s) => s.updateSelectedSlotsImageSettings);

  const selectedSlot = selectedSlotIds.length > 0
    ? pages.flatMap((p) => p.slots).find((s) => s.id === selectedSlotIds[0])
    : null;

  const isCustom = selectedSlot?.isCustom ?? false;
  const hasSelection = selectedSlotIds.length > 0;

  const toggle = (section: CellSection) => {
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

  return (
    <div className="flex flex-col w-full h-full space-y-2">

      {/* ── GENEL HÜCRE AYARLARI ── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between px-1 py-1">
          <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Genel Hücre Ayarları</span>
        </div>

        <AccordionItem
          id="general-appearance" title="Hücre Görünümü" icon={<Square size={16} />}
          open={openSection === 'general-appearance'} onToggle={() => toggle('general-appearance')}
        >
          <AppearanceContent values={globalValues} handlers={globalHandlers} />
        </AccordionItem>

        <AccordionItem
          id="general-visual" title="Görsel Ayarları" icon={<Image size={16} />}
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
          id="general-product-info" title="Metin Ayarları" icon={<Type size={16} />}
          open={openSection === 'general-product-info'} onToggle={() => toggle('general-product-info')}
        >
          <TextContent
            productName={globalSettings.fonts.productName}
            onProductNameChange={(v) =>
              setGlobalSettings({ fonts: { ...globalSettings.fonts, productName: v } })
            }
          />
        </AccordionItem>

        <AccordionItem
          id="general-price" title="Fiyat Kutusu" icon={<Tag size={16} />}
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
          <button
            onClick={handleMakeCustom}
            className="w-full py-2 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
          >
            Bu Hücreyi Özel Hücre Yap
          </button>
        )}
      </div>

      {/* ── ÖZEL HÜCRE AYARLARI ── */}
      {hasSelection && isCustom && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-1 py-1">
            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Özel Hücre Ayarları</span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Özel</span>
          </div>

          <AccordionItem
            id="custom-appearance" title="Hücre Görünümü" icon={<Square size={16} />}
            open={openSection === 'custom-appearance'} onToggle={() => toggle('custom-appearance')}
          >
            <AppearanceContent values={customValues} handlers={customHandlers} />
          </AccordionItem>

          <AccordionItem
            id="custom-visual" title="Görsel Ayarları" icon={<Image size={16} />}
            open={openSection === 'custom-visual'} onToggle={() => toggle('custom-visual')}
          >
            <VisualContent
              imageSettings={selectedSlot?.imageSettings}
              hasSelection={hasSelection}
              onUpdate={updateSelectedSlotsImageSettings}
            />
          </AccordionItem>

          <AccordionItem
            id="custom-product-info" title="Metin Ayarları" icon={<Type size={16} />}
            open={openSection === 'custom-product-info'} onToggle={() => toggle('custom-product-info')}
          >
            <TextContent
              productName={
                (cs?.fonts?.productName ?? globalSettings.fonts.productName) as TypographyData
              }
              onProductNameChange={(v) =>
                updateSlotCustomSettings({ fonts: { ...cs?.fonts, productName: v } })
              }
            />
          </AccordionItem>

          <AccordionItem
            id="custom-price" title="Fiyat Kutusu" icon={<Tag size={16} />}
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
              }}
            />
          </AccordionItem>

          <AccordionItem
            id="custom-badge" title="Promosyon Etiketi" icon={<Layers size={16} />}
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

          <button
            onClick={handleMakeGeneral}
            className="w-full py-2 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors"
          >
            Genel Hücreye Dönüştür
          </button>
        </div>
      )}

      {!hasSelection && (
        <div className="mt-4 p-3 bg-slate-50 rounded-md border border-slate-100 text-center">
          <p className="text-[10px] text-slate-400">Bir hücre seçildiğinde özel hücre ayarları buraya gelir.</p>
        </div>
      )}
    </div>
  );
}
