// Compact 4-mode contextual bar. Faithful to reference behaviour, simplified UI.

import { useEffect, useRef, useState } from 'react';
import { AlignCenter, AlignLeft, AlignRight, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, AlignVerticalJustifyStart, Check, Clipboard, Copy, CopyPlus, Image, Move, PackageOpen, Palette, Settings, Square, Trash2, Upload, ZoomIn, Pencil, Table2, Tag, Box, GitMerge, Scissors } from 'lucide-react';
import type { CatalogSettings, ColorValue, DeepPartial, TypographyData, BorderRadiusData } from '@matbaapro/shared';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import api from '@/lib/api';
import {
  ColorOpacityPicker,
  BorderRadiusPicker,
} from '../pickers';
import { deepMerge } from '../util/style';
import { CornerRadiusIcon } from '@/components/icons/CornerRadiusIcon';

const DEFAULT_COLOR: ColorValue = { type: 'solid', color: '#ffffff', opacity: 100 };

const Divider = () => <div className="w-px h-5 bg-border-default mx-2" />;

function ColorSwatchTrigger({
  color,
  opacity,
  label = 'Renk',
}: {
  color: string;
  opacity: number;
  label?: string;
}) {
  return (
    <>
      <span
        className="relative h-5 w-8 shrink-0 overflow-hidden rounded-md border border-border-strong shadow-sm"
        aria-hidden="true"
      >
        <span
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
          }}
        />
        <span
          className="absolute inset-0"
          style={{ backgroundColor: color, opacity: opacity / 100 }}
        />
      </span>
      <span>{label}</span>
    </>
  );
}

function Popover({
  trigger,
  children,
  width = 'w-72',
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.closest('[data-color-picker-popup]')) return;
      if (ref.current && !ref.current.contains(target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-text-secondary hover:bg-border-default"
      >
        {trigger}
      </button>
      {open && (
        <div className={`absolute top-full left-0 mt-1 z-99999 ${width} bg-surface-panel border border-border-default rounded-radius-lg shadow-xl p-4`}>
          {children}
        </div>
      )}
    </div>
  );
}

export function ContextualBar() {
  const selection = useUIStore((s) => s.selection);
  const selectedSlotIds = useUIStore((s) => s.selectedSlotIds);
  const selectedTextElement = useUIStore((s) => s.selectedTextElement);

  return (
    <div
      id="contextual-bar"
      className="h-12 px-3 flex items-center gap-1 text-xs text-text-secondary bg-surface-panel"
    >
      {selection.type === 'slot' && <SlotMode slotIds={selectedSlotIds} />}
      {selection.type === 'bannerCell' && <BannerCellMode />}
      {selection.type === 'textElement' && selectedTextElement && (
        <TextMode
          slotId={selectedTextElement.slotId}
          element={selectedTextElement.elementType}
        />
      )}
      {selection.type === 'footerCell' && <FooterMode />}
      {selection.type === 'pageBackground' && (
        <BackgroundMode pageNumber={Number(selection.ids[0])} />
      )}
    </div>
  );
}

function SlotMode({ slotIds }: { slotIds: string[] }) {
  const globalSettings = useCatalogStore((s) => s.globalSettings);
  const formas = useCatalogStore((s) => s.formas); // reaktif bağımlılık — slot değişince re-render tetiklenir
  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const toggleSlotRole = useCatalogStore((s) => s.toggleSlotRole);
  const setGlobalSettings = useCatalogStore((s) => s.setGlobalSettings);
  const updateSlotCustomSettings = useCatalogStore((s) => s.updateSlotCustomSettings);
  const toggleSlotCustomSettings = useCatalogStore((s) => s.toggleSlotCustomSettings);
  const mergeSelected = useCatalogStore((s) => s.mergeSelected);
  const unmergeSlot = useCatalogStore((s) => s.unmergeSlot);
  const clearSlot = useCatalogStore((s) => s.clearSlot);
  const updateSelectedSlotsImageSettings = useCatalogStore((s) => s.updateSelectedSlotsImageSettings);
  const setSidebarState = useUIStore((s) => s.setSidebarState);

  const pages = getActivePages();
  const pageWithSlot = pages.find((p) => p.slots.some((s) => s.id === slotIds[0]));
  const slot = pageWithSlot?.slots.find((s) => s.id === slotIds[0]);
  const pageNumber = pageWithSlot?.pageNumber ?? 0;
  if (!slot) return null;

  const isMerged = slot.rowSpan > 1 || slot.colSpan > 1;

  if ((slot.role as string) === 'free') {
    return <FreeSlotMode slot={slot} pageNumber={pageNumber} slotIds={slotIds} />;
  }

  const isCustom = !!slot.isCustom;
  const isFree = (slot.role as string) === 'free';
  const settings: CatalogSettings = (
    isCustom && slot.customSettings
      ? deepMerge<CatalogSettings>(
          JSON.parse(JSON.stringify(globalSettings)),
          slot.customSettings as Partial<CatalogSettings>,
        )
      : globalSettings
  ) as CatalogSettings;

  const update = (patch: DeepPartial<CatalogSettings>) => {
    if (isCustom) {
      updateSlotCustomSettings(patch);
    } else {
      setGlobalSettings(patch);
    }
  };

  const btnCls = 'h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-xs font-medium whitespace-nowrap hover:bg-border-default transition-colors disabled:opacity-30';

  return (
    <>
      {/* 1 — Global/Özel toggle */}
      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md transition-colors ${isCustom ? 'bg-blue-50' : 'bg-surface-subtle'}`}>
        <span className={`text-xs font-medium whitespace-nowrap transition-colors ${!isCustom ? 'text-text-primary' : 'text-text-muted'}`}>
          Genel Ayar
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isCustom}
            onChange={() => toggleSlotCustomSettings(!isCustom)}
          />
          <div className="w-9 h-5 bg-border-strong rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
        </label>
        <span className={`text-xs font-medium whitespace-nowrap transition-colors ${isCustom ? 'text-blue-700' : 'text-text-muted'}`}>
          Özel Ayar
        </span>
      </div>

      <Divider />

      {/* 3 — Zemin */}
      <ColorOpacityPicker
        trigger={<><Palette size={16} /><span>Zemin</span></>}
        value={settings.colors.cellBg}
        onChange={(v) => update({ colors: { ...settings.colors, cellBg: v } })}
      />

      {/* 4 — Köşe */}
      <Popover trigger={<><CornerRadiusIcon size={16} />Köşe</>} width="w-72">
        <BorderRadiusPicker
          value={settings.radiuses.cell}
          onChange={(val) => update({ radiuses: { ...settings.radiuses, cell: val } })}
        />
      </Popover>

      {/* 5 — Çerçeve */}
      <Popover trigger={<><Square size={16} />Çerçeve</>} width="w-72">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-text-secondary">Kenarlık Rengi</span>
            <ColorOpacityPicker
              solidOnly
              value={{ type: 'solid', color: settings.colors.cellBorder.c, opacity: settings.colors.cellBorder.o }}
              onChange={(v) => {
                if (v.type !== 'solid') return;
                update({ colors: { ...settings.colors, cellBorder: { c: v.color, o: v.opacity } } });
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-medium text-text-secondary">Kalınlık</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={settings.borderWidth}
                onChange={(e) => update({ borderWidth: parseFloat(e.target.value) })}
                className="w-24 studio-slider"
              />
              <span className="text-xs font-medium w-8 text-right">{settings.borderWidth}px</span>
            </div>
          </div>
        </div>
      </Popover>

      {!isFree && <Divider />}

      {/* 6 — Görsel Konum */}
      {!isFree && (
        <button
          onClick={() => updateSelectedSlotsImageSettings({ editMode: !slot.imageSettings?.editMode })}
          className={`${btnCls} ${slot.imageSettings?.editMode ? 'bg-blue-50 text-blue-700' : ''}`}
        >
          <Move size={16} />
          Görseli Taşı
        </button>
      )}

      {/* 7 — Görsel Ölçeği */}
      {!isFree && (
        <div className="inline-flex items-center gap-1.5 h-9 px-2">
          <ZoomIn size={16} className="text-text-secondary shrink-0" />
          <input
            type="number"
            min={10}
            max={300}
            value={slot.imageSettings?.scale ?? 100}
            onChange={(e) => updateSelectedSlotsImageSettings({ scale: Number(e.target.value) })}
            className="w-12 text-xs border border-border-default rounded px-1.5 py-1 text-center"
          />
          <span className="text-xs text-text-secondary">%</span>
        </div>
      )}

      <Divider />

      {/* Birleştir/Ayır Butonu */}
      {slotIds.length === 1 && !isMerged ? (
        <button
          disabled
          className={`${btnCls} opacity-40 pointer-events-none`}
        >
          <GitMerge size={16} />
          Birleştir
        </button>
      ) : slotIds.length === 1 && isMerged ? (
        <button
          onClick={() => unmergeSlot(pageNumber, slot.id)}
          className={btnCls}
        >
          <Scissors size={16} />
          Ayır
        </button>
      ) : slotIds.length >= 2 ? (
        <button
          onClick={() => mergeSelected(pageNumber, slotIds[0])}
          className={btnCls}
        >
          <GitMerge size={16} />
          Birleştir
        </button>
      ) : null}

      <Divider />

      {/* 12 — Rol/Temizle */}
      {isFree ? (
        <button onClick={() => toggleSlotRole('product')} className={btnCls}>
          <PackageOpen size={16} />
          Ürün Yap
        </button>
      ) : (
        <button
          onClick={() => clearSlot(pageNumber, slotIds[0])}
          className={`${btnCls} text-danger hover:bg-red-50`}
        >
          <Trash2 size={16} />
          Temizle
        </button>
      )}

      <Divider />

      {/* 14 — Ayarlar */}
      <button
        onClick={() => setSidebarState('grid', isCustom ? 'custom-appearance' : 'general-appearance')}
        className={btnCls}
      >
        <Settings size={16} />
        Ayarlar
      </button>
    </>
  );
}

const H_ALIGNS = [
  { value: 'left',   label: 'Sola',   Icon: AlignLeft   },
  { value: 'center', label: 'Ortala', Icon: AlignCenter  },
  { value: 'right',  label: 'Sağa',   Icon: AlignRight   },
] as const;

function TextAlignDropdown({
  font,
  updateFont,
}: {
  font: TypographyData;
  updateFont: (v: TypographyData) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Element)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const active = H_ALIGNS.find((a) => a.value === font.textAlign) ?? H_ALIGNS[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-9 px-2 inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-text-secondary whitespace-nowrap hover:bg-border-default transition-colors"
      >
        <active.Icon size={16} />
        {active.label}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-99999 w-32 bg-surface-panel border border-border-default rounded-lg shadow-xl overflow-hidden">
          {H_ALIGNS.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => {
                updateFont({ ...font, textAlign: value });
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                font.textAlign === value
                  ? 'bg-surface-subtle text-text-primary'
                  : 'text-text-secondary hover:bg-border-default'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const V_ALIGNS = [
  { value: 'top',    label: 'Üst',  Icon: AlignVerticalJustifyStart  },
  { value: 'middle', label: 'Orta', Icon: AlignVerticalJustifyCenter },
  { value: 'bottom', label: 'Alt',  Icon: AlignVerticalJustifyEnd    },
] as const;

function TextVerticalAlignDropdown({
  font,
  updateFont,
}: {
  font: TypographyData;
  updateFont: (v: TypographyData) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Element)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const active = V_ALIGNS.find((a) => a.value === font.verticalAlign) ?? V_ALIGNS[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-9 px-2 inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-text-secondary whitespace-nowrap hover:bg-border-default transition-colors"
      >
        <active.Icon size={16} />
        {active.label}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-99999 w-32 bg-surface-panel border border-border-default rounded-lg shadow-xl overflow-hidden">
          {V_ALIGNS.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => {
                updateFont({ ...font, verticalAlign: value });
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                font.verticalAlign === value
                  ? 'bg-surface-subtle text-text-primary'
                  : 'text-text-secondary hover:bg-border-default'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TextMode({
  slotId,
  element,
}: {
  slotId: string;
  element: 'name' | 'price' | 'badge';
}) {
  const globalSettings = useCatalogStore((s) => s.globalSettings);
  const formas = useCatalogStore((s) => s.formas); // reaktif bağımlılık
  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const setGlobalSettings = useCatalogStore((s) => s.setGlobalSettings);
  const updateSlotCustomSettings = useCatalogStore((s) => s.updateSlotCustomSettings);
  const setSidebarState = useUIStore((s) => s.setSidebarState);
  const selection = useUIStore((s) => s.selection);

  void formas;

  const slot = getActivePages()
    .flatMap((p) => p.slots)
    .find((s) => s.id === slotId);
  if (!slot) return null;

  const isCustom = !!slot.isCustom;

  const settings: CatalogSettings = (
    slot.isCustom && slot.customSettings
      ? deepMerge<CatalogSettings>(
          JSON.parse(JSON.stringify(globalSettings)),
          slot.customSettings as Partial<CatalogSettings>,
        )
      : globalSettings
  ) as CatalogSettings;

  const fontKey = element === 'price' ? 'price' : 'productName';
  const font: TypographyData = settings.fonts[fontKey];

  const updateFont = (next: TypographyData) => {
    const patch = { fonts: { ...settings.fonts, [fontKey]: next } } as DeepPartial<CatalogSettings>;
    if (slot.isCustom) {
      updateSlotCustomSettings(patch);
    } else {
      setGlobalSettings(patch);
    }
  };

  const updatePrice = (patch: DeepPartial<CatalogSettings>) => {
    if (slot.isCustom) {
      updateSlotCustomSettings(patch);
    } else {
      setGlobalSettings(patch);
    }
  };

  const btnCls = 'h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-xs font-medium whitespace-nowrap hover:bg-border-default transition-colors';

  return (
    <>
      {/* 1 — Yazı tipi */}
      <select
        value={font.fontFamily}
        onChange={(e) => updateFont({ ...font, fontFamily: e.target.value })}
        className="text-xs border border-border-default rounded-md px-2 py-1.5 bg-surface-panel"
      >
        {['Inter', 'Roboto', 'Arial', 'Oswald', 'Helvetica', 'Georgia'].map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      {/* 2 — Font boyutu */}
      <input
        type="number"
        min={6}
        max={120}
        value={font.fontSize}
        onChange={(e) => updateFont({ ...font, fontSize: parseInt(e.target.value) || 12 })}
        className="w-14 text-center text-xs border border-border-default rounded-md px-1 py-1.5"
      />

      {/* 3 — Font kalınlığı */}
      <select
        value={font.fontWeight}
        onChange={(e) => updateFont({ ...font, fontWeight: e.target.value })}
        className="text-xs border border-border-default rounded-md px-2 py-1.5 bg-surface-panel"
      >
        <option value="400">Normal</option>
        <option value="500">Orta</option>
        <option value="700">Kalın</option>
        <option value="900">Siyah</option>
      </select>

      {/* 4 */}
      <Divider />

      {/* 7 — Renk */}
      <ColorOpacityPicker
        solidOnly
        trigger={<ColorSwatchTrigger color={font.color} opacity={font.opacity} />}
        value={{ type: 'solid', color: font.color, opacity: font.opacity }}
        onChange={(v) => {
          if (v.type !== 'solid') return;
          updateFont({ ...font, color: v.color, opacity: v.opacity });
        }}
      />

      {/* 10 */}
      <Divider />

      {/* 5 — Yatay hizalama */}
      <TextAlignDropdown font={font} updateFont={updateFont} />

      <Divider />

      {/* 5b — Dikey hizalama */}
      <TextVerticalAlignDropdown font={font} updateFont={updateFont} />

      {/* 6 */}
      <Divider />

      {/* Fiyat kutusu hızlı ayarları */}
      {element === 'price' && (
        <>
          <ColorOpacityPicker
            trigger={<><Palette size={16} /><span>Zemin</span></>}
            value={settings.colors.priceBg}
            onChange={(v) => updatePrice({ colors: { ...settings.colors, priceBg: v } })}
          />

          <ColorOpacityPicker
            solidOnly
            type="border"
            trigger={<><Square size={16} /><span>Çerçeve</span></>}
            value={{ type: 'solid', color: settings.colors.priceBorder.c, opacity: settings.colors.priceBorder.o }}
            thickness={settings.priceBorderWidth}
            onChange={(v) => {
              if (v.type !== 'solid') return;
              updatePrice({ colors: { ...settings.colors, priceBorder: { c: v.color, o: v.opacity } } });
            }}
            onThicknessChange={(v) => updatePrice({ priceBorderWidth: v })}
          />

          <Popover trigger={<><CornerRadiusIcon size={16} />Köşe</>} width="w-72">
            <BorderRadiusPicker
              value={settings.radiuses.price}
              onChange={(v) => updatePrice({ radiuses: { ...settings.radiuses, price: v } })}
            />
          </Popover>

          <Divider />
        </>
      )}

      {/* 11 — Ayarlar */}
      <button
        onClick={() => {
          const isName = selection.textElementType === 'name';
          const section = slot.isCustom
            ? (isName ? 'custom-product-info' : 'custom-price')
            : (isName ? 'general-product-info' : 'general-price');
          setSidebarState('grid', section);
        }}
        className={btnCls}
      >
        <Settings size={16} />
        Ayarlar
      </button>
    </>
  );
}

type ImageSizeType = 'fit' | 'fill' | 'stretch' | 'tile';

function BackgroundMode({ pageNumber }: { pageNumber: number }) {
  const formas = useCatalogStore((s) => s.formas);
  const activeFormaId = useCatalogStore((s) => s.activeFormaId);
  const updatePagesBackground = useCatalogStore((s) => s.updatePagesBackground);
  const applyBackgroundGlobally = useCatalogStore((s) => s.applyBackgroundGlobally);
  const setSidebarState = useUIStore((s) => s.setSidebarState);

  const currentPage = formas
    .find((f) => f.id === activeFormaId)
    ?.pages.find((p) => p.pageNumber === pageNumber);

  const [bgType, setBgType] = useState<'color' | 'image'>('color');
  const [colorValue, setColorValue] = useState<ColorValue>(DEFAULT_COLOR);
  const [imageUrl, setImageUrl] = useState('');
  const [imageSize, setImageSize] = useState<ImageSizeType>('fill');
  const [imageOpacity, setImageOpacity] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const bg = currentPage?.background;
    if (!bg) {
      setBgType('color');
      setColorValue(DEFAULT_COLOR);
      setImageUrl('');
      setImageSize('fill');
      setImageOpacity(100);
      return;
    }
    setBgType(bg.type);
    if (bg.value) setColorValue(bg.value);
    setImageUrl(bg.imageUrl ?? '');
    setImageSize(bg.imageSize ?? 'fill');
    setImageOpacity(bg.imageOpacity ?? 100);
  }, [pageNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<{ url: string }>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(data.url);
      setBgType('image');
      updatePagesBackground([pageNumber], {
        type: 'image',
        imageUrl: data.url,
        imageSize,
        imageOpacity,
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const currentBg = currentPage?.background;

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const isImageMode = bgType === 'image';
  const activeOpacity = bgType === 'color' 
    ? (colorValue.type === 'solid' ? colorValue.opacity : 100) 
    : imageOpacity;

  return (
    <>
      {/* 1. RENK BUTONU */}
      <ColorOpacityPicker
        className={`h-9 px-3 flex items-center gap-1.5 rounded text-xs cursor-pointer ${
          bgType === 'color' ? 'bg-surface-subtle text-text-primary font-medium' : 'text-text-secondary hover:bg-border-default'
        }`}
        trigger={<><Palette size={16} /><span>Renk</span></>}
        value={colorValue}
        onChange={(v) => {
          setBgType('color');
          setColorValue(v);
          updatePagesBackground([pageNumber], { type: 'color', value: v });
        }}
      />

      {/* 2. GÖRSEL BUTONU */}
      <button
        onClick={handleImageButtonClick}
        className={`h-9 px-3 flex items-center gap-1.5 rounded text-xs cursor-pointer ${
          bgType === 'image' ? 'bg-surface-subtle text-text-primary font-medium' : 'text-text-secondary hover:bg-border-default'
        }`}
      >
        <Image size={16} />
        Görsel
      </button>

      <Divider />

      {/* 3. HİZALAMA BUTONLARI (Sığdır, Doldur, Uzat, Döşe) */}
      {(
        [
          { value: 'fit', label: 'Sığdır' },
          { value: 'fill', label: 'Doldur' },
          { value: 'stretch', label: 'Uzat' },
          { value: 'tile', label: 'Döşe' },
        ] as { value: ImageSizeType; label: string }[]
      ).map(({ value, label }) => (
        <button
          key={value}
          disabled={!isImageMode}
          onClick={() => {
            setImageSize(value);
            updatePagesBackground([pageNumber], { type: 'image', imageUrl: imageUrl || undefined, imageSize: value, imageOpacity });
          }}
          className={`h-9 px-3 rounded text-xs transition-all ${
            !isImageMode
              ? 'opacity-40 pointer-events-none text-text-secondary'
              : imageSize === value
              ? 'bg-surface-subtle text-text-primary font-medium'
              : 'text-text-secondary hover:bg-border-default'
          }`}
        >
          {label}
        </button>
      ))}

      <Divider />

      {/* 4. SAYDAMLIK SLIDER (Her zaman aktif, moduna göre değeri kontrol eder) */}
      <span className="text-xs text-text-secondary shrink-0">Saydamlık</span>
      <input
        type="range"
        min={0}
        max={100}
        value={activeOpacity}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (bgType === 'color') {
            if (colorValue.type === 'solid') {
              const nextColor = { ...colorValue, opacity: v };
              setColorValue(nextColor);
              updatePagesBackground([pageNumber], { type: 'color', value: nextColor });
            } else {
              const nextColor = {
                ...colorValue,
                stops: colorValue.stops.map((s) => ({ ...s, opacity: v })),
              };
              setColorValue(nextColor);
              updatePagesBackground([pageNumber], { type: 'color', value: nextColor });
            }
          } else {
            setImageOpacity(v);
            updatePagesBackground([pageNumber], { type: 'image', imageUrl: imageUrl || undefined, imageSize, imageOpacity: v });
          }
        }}
        className="w-24 studio-slider"
      />
      <span className="text-xs text-text-secondary tabular-nums shrink-0">%{activeOpacity}</span>

      <Divider />

      <button
        onClick={() => { if (currentBg) applyBackgroundGlobally(currentBg); }}
        disabled={!currentBg}
        className="h-9 px-3 flex items-center gap-1.5 rounded text-xs text-text-secondary hover:bg-border-default disabled:opacity-30 whitespace-nowrap"
      >
        <CopyPlus size={16} />
        Hepsine Uygula
      </button>

      <Divider />

      <button
        onClick={() => setSidebarState('design', 'background')}
        className="h-9 px-3 flex items-center gap-1.5 rounded text-xs text-text-secondary hover:bg-border-default"
      >
        <Settings size={16} />
        Ayarlar
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </>
  );
}

function FooterMode() {
  const selection = useUIStore((s) => s.selection);
  const updateFooterCellStore = useCatalogStore((s) => s.updateFooterCellStore);
  const mergeFooterCellsStore = useCatalogStore((s) => s.mergeFooterCellsStore);
  const unmergeFooterCellStore = useCatalogStore((s) => s.unmergeFooterCellStore);

  const pageNum = selection.parentId
    ? parseInt(selection.parentId.replace('page-', ''), 10)
    : NaN;
  const scope: number | 'global' = isNaN(pageNum) ? 'global' : pageNum;

  return (
    <>
      <span className="font-semibold text-text-secondary px-2">Footer</span>
      <span className="text-[10px] text-text-muted">{selection.ids.length} hücre</span>

      <Divider />

      <button
        onClick={() => mergeFooterCellsStore(scope, selection.ids)}
        disabled={selection.ids.length < 2}
        className="px-2 py-1 hover:bg-border-default rounded text-xs disabled:opacity-30"
      >
        Birleştir
      </button>
      <button
        onClick={() => selection.ids[0] && unmergeFooterCellStore(scope, selection.ids[0])}
        className="px-2 py-1 hover:bg-border-default rounded text-xs"
      >
        Ayır
      </button>

      <Divider />

      <Popover trigger={<>🎨 Zemin</>}>
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-text-secondary block">Hücre Zemin Rengi</span>
          <input
            type="color"
            onChange={(e) =>
              selection.ids.forEach((id) =>
                updateFooterCellStore(scope, id, {
                  bgColor: { c: e.target.value, o: 100 },
                }),
              )
            }
            className="w-full h-8 rounded cursor-pointer"
          />
        </div>
      </Popover>
    </>
  );
}

// ─── Serbest Hücre Seçildiğinde Hızlı Erişim Barı ─────────────────────────────
interface FreeSlotProps {
  slot: any;
  pageNumber: number;
  slotIds: string[];
}

function FreeSlotMode({ slot, pageNumber, slotIds }: FreeSlotProps) {
  const toggleSlotRole = useCatalogStore((s) => s.toggleSlotRole);
  const updateSlotModuleData = useCatalogStore((s) => s.updateSlotModuleData);
  const setSidebarState = useUIStore((s) => s.setSidebarState);

  const moduleData = slot.moduleData;
  const hasModule = !!moduleData;
  const isBanner = hasModule && moduleData.type === 'banner';

  const btnCls = 'h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-xs font-medium whitespace-nowrap hover:bg-border-default transition-colors disabled:opacity-30';

  // 1. Modül Eklenmemişse (Boş Serbest Hücre)
  if (!hasModule) {
    return (
      <>
        <span className="font-semibold text-text-primary px-2 flex items-center gap-1.5">
          <PackageOpen size={16} className="text-text-secondary" />
          Boş Serbest Hücre
        </span>
        <Divider />
        <button
          onClick={() => {
            if (slot.role !== 'free') toggleSlotRole('free');
            useCatalogStore.getState().setSlotModule(pageNumber, slot.id, 'banner');
          }}
          className={btnCls}
        >
          <Table2 size={16} />
          Tablo Alanı Ekle
        </button>
        <Divider />
        <button onClick={() => toggleSlotRole('product')} className={btnCls}>
          <Box size={16} />
          Ürün Hücresi Yap
        </button>
      </>
    );
  }

  // 2. Tablo Modülü Ekliyse (Banner)
  if (isBanner) {
    const rows = moduleData.rows ?? 4;
    const cols = moduleData.cols ?? 4;
    const bgColor = moduleData.bgColor ?? { type: 'solid', color: '#ffffff', opacity: 100 };
    const cb = moduleData.containerBorder ?? { color: { c: '#e2e8f0', o: 100 }, width: 0 };
    const radius = moduleData.radius ?? { tl: 0, tr: 0, bl: 0, br: 0, linked: true };

    const resizeGrid = (newRows: number, newCols: number) => {
      const r = Math.max(1, Math.min(10, newRows));
      const c = Math.max(1, Math.min(10, newCols));
      const newCount = r * c;
      const existing = moduleData.cells ?? [];
      const ref = existing[0] ?? {
        id: 'banner-inst-0',
        text: '',
        colSpan: 1,
        rowSpan: 1,
        hidden: false,
        mergedInto: null,
        font: { fontFamily: 'Inter', fontSize: 12, fontWeight: '400', color: '#000000', opacity: 100, textAlign: 'center', verticalAlign: 'middle' },
        padding: { t: 0, r: 0, b: 0, l: 0, linked: true },
        bgColor: { type: 'solid', color: '#ffffff', opacity: 0 },
        border: { t: 0, r: 0, b: 0, l: 0, linked: true, color: { c: '#e2e8f0', o: 100 }, style: 'solid' },
        image: null,
        imageMode: 'contain',
        imagePosX: 0,
        imagePosY: 0,
        imageScale: 100,
      };
      const newCells: any[] =
        newCount >= existing.length
          ? [
              ...existing,
              ...Array.from({ length: newCount - existing.length }, (_, i) => ({
                ...ref,
                id: `banner-inst-${existing.length + i}`,
                text: '',
                colSpan: 1,
                rowSpan: 1,
                hidden: false,
                mergedInto: null,
              })),
            ]
          : existing.slice(0, newCount);
      updateSlotModuleData(pageNumber, slot.id, { rows: r, cols: c, cells: newCells });
    };

    const handleEditModule = () => {
      const firstCellId = moduleData.cells?.[0]?.id;
      useUIStore.getState().setEditingContent({ slotId: slot.id, contentType: 'banner' });
      if (firstCellId) {
        useUIStore.getState().toggleElementSelection('bannerCell', firstCellId, false, slot.id);
      }
    };

    return (
      <>
        <span className="font-semibold text-text-primary px-2 flex items-center gap-1.5">
          <Table2 size={16} className="text-text-secondary" />
          Tablo Alanı
        </span>
        <Divider />

        {/* Satır & Sütun Sayısı */}
        <div className="flex items-center gap-1 bg-surface-subtle border border-border-default rounded p-1">
          <span className="text-[10px] text-text-secondary px-1">Satır:</span>
          <input
            type="number" min={1} max={10} value={rows}
            onChange={(e) => resizeGrid(parseInt(e.target.value) || 1, cols)}
            className="w-8 text-center text-xs font-semibold bg-transparent border-0 outline-none"
          />
          <span className="text-text-muted">×</span>
          <span className="text-[10px] text-text-secondary px-1">Sütun:</span>
          <input
            type="number" min={1} max={10} value={cols}
            onChange={(e) => resizeGrid(rows, parseInt(e.target.value) || 1)}
            className="w-8 text-center text-xs font-semibold bg-transparent border-0 outline-none"
          />
        </div>

        <Divider />

        {/* Zemin Rengi */}
        <ColorOpacityPicker
          trigger={<><Palette size={16} /><span>Zemin</span></>}
          value={bgColor}
          onChange={(v) => updateSlotModuleData(pageNumber, slot.id, { bgColor: v })}
        />

        {/* Çerçeve Popover'ı */}
        <Popover trigger={<><Square size={16} />Çerçeve</>} width="w-72">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-text-secondary">Dış Kenarlık</span>
              <ColorOpacityPicker
                solidOnly
                value={{ type: 'solid', color: cb.color.c, opacity: cb.color.o }}
                onChange={(v) => {
                  if (v.type !== 'solid') return;
                  updateSlotModuleData(pageNumber, slot.id, {
                    containerBorder: { ...cb, color: { c: v.color, o: v.opacity } },
                  });
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-3 pt-1 border-t border-border-default">
              <span className="text-[10px] font-medium text-text-secondary">Kalınlık</span>
              <div className="flex items-center gap-2">
                <input
                  type="range" min={0} max={10} step={0.5} value={cb.width}
                  onChange={(e) => updateSlotModuleData(pageNumber, slot.id, {
                    containerBorder: { ...cb, width: parseFloat(e.target.value) },
                  })}
                  className="w-24 studio-slider"
                />
                <span className="text-xs font-medium w-8 text-right">{cb.width}mm</span>
              </div>
            </div>
          </div>
        </Popover>

        {/* Köşe Yuvarlaklığı Popover'ı */}
        <Popover trigger={<><CornerRadiusIcon size={16} />Köşe</>} width="w-72">
          <BorderRadiusPicker
            value={radius}
            onChange={(v) => updateSlotModuleData(pageNumber, slot.id, { radius: v })}
          />
        </Popover>

        <Divider />

        {/* Modülü Düzenle Aksiyonu */}
        <button
          onClick={handleEditModule}
          className={btnCls}
        >
          <Pencil size={16} />
          Modülü Düzenle
        </button>

        <button onClick={() => toggleSlotRole('product')} className={btnCls}>
          <Box size={16} />
          Ürün Hücresi Yap
        </button>
        <button
          onClick={() => updateSlotModuleData(pageNumber, slot.id, null)}
          className={`${btnCls} text-danger hover:bg-red-50`}
        >
          <Trash2 size={16} />
          Kaldır
        </button>
      </>
    );
  }

  // 3. Diğer Modüller (Varsayılan)
  return (
    <>
      <span className="font-semibold text-text-primary px-2">📦 Serbest Hücre</span>
      <Divider />
      <button onClick={() => toggleSlotRole('product')} className={btnCls}>
        Ürün Hücresi Yap
      </button>
      <button
        onClick={() => useCatalogStore.getState().clearSlot(pageNumber, slot.id)}
        className={`${btnCls} text-danger hover:bg-red-50`}
      >
        <Trash2 size={16} />
        Temizle
      </button>
    </>
  );
}


// ─── Tablo Modülü Düzenle Modunda Hücre Hızlı Erişim Barı ───────────────────
function BannerCellMode() {
  const selection = useUIStore((s) => s.selection);
  const selectedCellIds = selection.type === 'bannerCell' ? selection.ids : [];
  const slotId = selection.parentId;

  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const updateSlotModuleData = useCatalogStore((s) => s.updateSlotModuleData);
  const formas = useCatalogStore((s) => s.formas); // Reaktif tetikleme için bağımlılık eklendi

  let pageNumber = 0;
  let moduleData: any = null;
  for (const p of getActivePages()) {
    const slot = p.slots.find((s) => s.id === slotId);
    if (slot && slot.role === 'free' && (slot.moduleData as any)?.type === 'banner') {
      moduleData = slot.moduleData;
      pageNumber = p.pageNumber;
      break;
    }
  }

  if (!moduleData || selectedCellIds.length === 0) return null;

  const targetCells = moduleData.cells.filter((c: any) => selectedCellIds.includes(c.id));
  const firstCell = targetCells[0] ?? null;
  const isMerged = firstCell != null && (firstCell.colSpan > 1 || firstCell.rowSpan > 1);

  const updateCells = (patch: Partial<any>) => {
    const cells = moduleData.cells.map((c: any) =>
      selectedCellIds.includes(c.id) ? { ...c, ...patch } : c,
    );
    updateSlotModuleData(pageNumber, slotId!, { cells });
  };

  const mergeCells = () => {
    const c = moduleData.cols ?? 4;
    const positions = selectedCellIds.map((id) => {
      const idx = moduleData.cells.findIndex((cell: any) => cell.id === id);
      return { id, row: Math.floor(idx / c), col: idx % c };
    });
    const minRow = Math.min(...positions.map((p) => p.row));
    const maxRow = Math.max(...positions.map((p) => p.row));
    const minCol = Math.min(...positions.map((p) => p.col));
    const maxCol = Math.max(...positions.map((p) => p.col));
    const masterId = moduleData.cells[minRow * c + minCol].id;
    const newCells = moduleData.cells.map((cell: any, i: number) => {
      const row = Math.floor(i / c);
      const col = i % c;
      if (cell.id === masterId)
        return { ...cell, colSpan: maxCol - minCol + 1, rowSpan: maxRow - minRow + 1, hidden: false, mergedInto: null };
      if (row >= minRow && row <= maxRow && col >= minCol && col <= maxCol)
        return { ...cell, colSpan: 1, rowSpan: 1, hidden: true, mergedInto: masterId };
      return cell;
    });
    updateSlotModuleData(pageNumber, slotId!, { cells: newCells });
  };

  const splitCell = () => {
    if (!firstCell) return;
    const masterId = firstCell.id;
    const newCells = moduleData.cells.map((cell: any) => {
      if (cell.id === masterId) return { ...cell, colSpan: 1, rowSpan: 1 };
      if (cell.mergedInto === masterId) return { ...cell, hidden: false, mergedInto: null };
      return cell;
    });
    updateSlotModuleData(pageNumber, slotId!, { cells: newCells });
  };

  const resetCell = () => {
    updateCells({
      bgColor: { type: 'solid', color: '#ffffff', opacity: 0 },
      border: { t: 0, r: 0, b: 0, l: 0, linked: true, color: { c: '#e2e8f0', o: 100 }, style: 'solid' },
      padding: { t: 0, r: 0, b: 0, l: 0, linked: true },
    });
  };

  const btnCls = 'h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-xs font-medium whitespace-nowrap hover:bg-border-default transition-colors disabled:opacity-30';

  return (
    <>
      {/* Birleştir / Ayır Butonları */}
      <button
        onClick={mergeCells}
        disabled={selectedCellIds.length < 2}
        className={btnCls}
      >
        Hücreleri Birleştir
      </button>
      <button
        onClick={splitCell}
        disabled={!isMerged}
        className={btnCls}
      >
        Hücreyi Ayır
      </button>

      <Divider />

      {firstCell && (
        <>
          {/* Hücre Zemin Rengi */}
          <ColorOpacityPicker
            trigger={<><Palette size={16} /><span>Zemin</span></>}
            value={firstCell.bgColor}
            onChange={(v) => updateCells({ bgColor: v })}
          />

          {/* Hücre Çerçeve Ayarı Popover'ı */}
          <Popover trigger={<><Square size={16} />Çerçeve</>} width="w-72">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-text-secondary">Kenarlık Rengi</span>
                <ColorOpacityPicker
                  solidOnly
                  value={{ type: 'solid', color: firstCell.border.color.c, opacity: firstCell.border.color.o }}
                  onChange={(v) => {
                    if (v.type !== 'solid') return;
                    updateCells({ border: { ...firstCell.border, color: { c: v.color, o: v.opacity } } });
                  }}
                />
              </div>
              <div className="flex items-center justify-between gap-3 pt-1 border-t border-border-default">
                <span className="text-[10px] font-medium text-text-secondary">Kalınlık</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range" min={0} max={10} step={1} value={firstCell.border.t}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      updateCells({ border: { ...firstCell.border, t: val, r: val, b: val, l: val } });
                    }}
                    className="w-24 studio-slider"
                  />
                  <span className="text-xs font-medium w-8 text-right">{firstCell.border.t}px</span>
                </div>
              </div>
            </div>
          </Popover>

          <Divider />

          {/* Yazı Tipi Boyutu ve Kalınlığı */}
          <input
            type="number" min={6} max={120} value={firstCell.font.fontSize}
            onChange={(e) => updateCells({ font: { ...firstCell.font, fontSize: parseInt(e.target.value) || 12 } })}
            className="w-14 text-center text-xs border border-border-default rounded-md px-1 py-1.5"
          />

          <select
            value={firstCell.font.fontWeight}
            onChange={(e) => updateCells({ font: { ...firstCell.font, fontWeight: e.target.value } })}
            className="text-xs border border-border-default rounded-md px-2 py-1.5 bg-surface-panel"
          >
            <option value="400">Normal</option>
            <option value="500">Orta</option>
            <option value="700">Kalın</option>
            <option value="900">Siyah</option>
          </select>

          {/* Yazı Rengi */}
          <ColorOpacityPicker
            solidOnly
            trigger={<ColorSwatchTrigger color={firstCell.font.color} opacity={firstCell.font.opacity} />}
            value={{ type: 'solid', color: firstCell.font.color, opacity: firstCell.font.opacity }}
            onChange={(v) => {
              if (v.type !== 'solid') return;
              updateCells({ font: { ...firstCell.font, color: v.color, opacity: v.opacity } });
            }}
          />

          <Divider />

          {/* Yatay Hizalama */}
          <div className="flex bg-slate-100 rounded border border-slate-200 p-0.5 gap-0.5">
            {H_ALIGNS.map((ha) => {
              const Icon = ha.Icon;
              return (
                <button
                  key={ha.value}
                  onClick={() => updateCells({ font: { ...firstCell.font, textAlign: ha.value } })}
                  className={`p-1.5 rounded-sm transition-colors ${
                    firstCell.font.textAlign === ha.value ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon size={12} />
                </button>
              );
            })}
          </div>

          {/* Dikey Hizalama */}
          <div className="flex bg-slate-100 rounded border border-slate-200 p-0.5 gap-0.5">
            {V_ALIGNS.map((va) => {
              const Icon = va.Icon;
              return (
                <button
                  key={va.value}
                  onClick={() => updateCells({ font: { ...firstCell.font, verticalAlign: va.value } })}
                  className={`p-1.5 rounded-sm transition-colors ${
                    firstCell.font.verticalAlign === va.value ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon size={12} />
                </button>
              );
            })}
          </div>
        </>
      )}

      <Divider />

      <button onClick={resetCell} className={`${btnCls} text-danger hover:bg-red-50`}>
        Hücreyi Sıfırla
      </button>
    </>
  );
}
