// Compact 4-mode contextual bar. Faithful to reference behaviour, simplified UI.

import { useEffect, useRef, useState } from 'react';
import type { CatalogSettings, DeepPartial, TypographyData } from '@matbaapro/shared';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import {
  ColorOpacityPicker,
  TypographyPicker,
  BorderRadiusPicker,
  ShadowPicker,
} from '../pickers';
import { deepMerge } from '../util/style';

const Divider = () => <div className="w-px h-5 bg-slate-200 mx-2" />;

function Popover({
  trigger,
  children,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-slate-600 hover:bg-slate-100"
      >
        {trigger}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-99999 w-72 bg-white border border-slate-200 rounded-lg shadow-xl p-3">
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
      className="h-12 px-3 flex items-center gap-1 text-xs text-slate-600 min-w-175 bg-white"
    >
      {selection.type === 'none' && <DefaultMode />}
      {selection.type === 'slot' && <SlotMode slotIds={selectedSlotIds} />}
      {selection.type === 'textElement' && selectedTextElement && (
        <TextMode
          slotId={selectedTextElement.slotId}
          element={selectedTextElement.elementType}
        />
      )}
      {selection.type === 'footerCell' && <FooterMode />}
    </div>
  );
}

function DefaultMode() {
  const formas = useCatalogStore((s) => s.formas);
  const activeFormaId = useCatalogStore((s) => s.activeFormaId);
  const activeForma = formas.find((f) => f.id === activeFormaId);

  return (
    <span className="text-slate-400 italic px-2">
      {activeForma?.name ?? 'Forma seçili değil'} — bir hücre seçerek düzenleyin
    </span>
  );
}

function SlotMode({ slotIds }: { slotIds: string[] }) {
  const globalSettings = useCatalogStore((s) => s.globalSettings);
  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const toggleSlotRole = useCatalogStore((s) => s.toggleSlotRole);
  const updateSlotCustomSettings = useCatalogStore((s) => s.updateSlotCustomSettings);
  const toggleSlotCustomSettings = useCatalogStore((s) => s.toggleSlotCustomSettings);
  const copySlotSettings = useCatalogStore((s) => s.copySlotSettings);
  const pasteSlotSettings = useCatalogStore((s) => s.pasteSlotSettings);
  const clearSlotSettings = useCatalogStore((s) => s.clearSlotSettings);
  const copiedSlotSettings = useCatalogStore((s) => s.copiedSlotSettings);

  const slot = getActivePages()
    .flatMap((p) => p.slots)
    .find((s) => s.id === slotIds[0]);
  if (!slot) return null;

  const isCustom = !!slot.isCustom;
  const settings: CatalogSettings = (
    isCustom && slot.customSettings
      ? deepMerge<CatalogSettings>(
          JSON.parse(JSON.stringify(globalSettings)),
          slot.customSettings as Partial<CatalogSettings>,
        )
      : globalSettings
  ) as CatalogSettings;

  const update = (patch: DeepPartial<CatalogSettings>) => {
    if (!isCustom) toggleSlotCustomSettings(true);
    updateSlotCustomSettings(patch);
  };

  return (
    <>
      <span className="font-semibold text-slate-700 px-2">
        {slotIds.length} hücre
      </span>
      <Divider />

      <Popover trigger={<>🎨 Zemin</>}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-600">Zemin Rengi</span>
            <ColorOpacityPicker
              value={settings.colors.cellBg}
              onChange={(v) =>
                update({ colors: { ...settings.colors, cellBg: v } })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-600">Kenarlık</span>
            <ColorOpacityPicker
              solidOnly
              type="border"
              value={{
                type: 'solid',
                color: settings.colors.cellBorder.c,
                opacity: settings.colors.cellBorder.o,
              }}
              thickness={settings.borderWidth}
              onChange={(v) => {
                if (v.type !== 'solid') return;
                update({
                  colors: {
                    ...settings.colors,
                    cellBorder: { c: v.color, o: v.opacity },
                  },
                });
              }}
              onThicknessChange={(t) => update({ borderWidth: t })}
            />
          </div>
        </div>
      </Popover>

      <Popover trigger={<>⌒ Köşe</>}>
        <BorderRadiusPicker
          value={settings.radiuses.cell}
          onChange={(val) =>
            update({ radiuses: { ...settings.radiuses, cell: val } })
          }
        />
      </Popover>

      <Popover trigger={<>☁ Gölge</>}>
        <ShadowPicker
          value={settings.shadows.cell}
          onChange={(val) =>
            update({ shadows: { ...settings.shadows, cell: val } })
          }
        />
      </Popover>

      <Divider />

      <button
        onClick={() => toggleSlotRole(slot.role === 'free' ? 'product' : 'free')}
        className="px-2 py-1 hover:bg-slate-100 rounded text-xs"
      >
        {slot.role === 'free' ? '→ Ürün' : '→ Serbest'}
      </button>

      <Divider />

      <button
        onClick={copySlotSettings}
        disabled={slotIds.length !== 1}
        className="px-2 py-1 hover:bg-slate-100 rounded text-xs disabled:opacity-30"
        title="Stili Kopyala"
      >
        📋 Kopyala
      </button>
      <button
        onClick={pasteSlotSettings}
        disabled={!copiedSlotSettings}
        className="px-2 py-1 hover:bg-slate-100 rounded text-xs disabled:opacity-30"
        title="Stili Yapıştır"
      >
        📥 Yapıştır
      </button>
      <button
        onClick={() => toggleSlotCustomSettings(!isCustom)}
        className={`px-2 py-1 rounded text-xs ${
          isCustom
            ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            : 'hover:bg-slate-100'
        }`}
      >
        {isCustom ? '★ Özel' : '☆ Globalden'}
      </button>
      <button
        onClick={clearSlotSettings}
        className="px-2 py-1 hover:bg-red-50 text-red-600 rounded text-xs"
      >
        🗑 Temizle
      </button>
    </>
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
  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const updateSlotCustomSettings = useCatalogStore((s) => s.updateSlotCustomSettings);
  const toggleSlotCustomSettings = useCatalogStore((s) => s.toggleSlotCustomSettings);

  const slot = getActivePages()
    .flatMap((p) => p.slots)
    .find((s) => s.id === slotId);
  if (!slot) return null;

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
    if (!slot.isCustom) toggleSlotCustomSettings(true);
    updateSlotCustomSettings({
      fonts: { ...settings.fonts, [fontKey]: next },
    } as DeepPartial<CatalogSettings>);
  };

  return (
    <>
      <span className="font-semibold text-slate-700 px-2 capitalize">{element}</span>
      <Divider />

      <select
        value={font.fontFamily}
        onChange={(e) => updateFont({ ...font, fontFamily: e.target.value })}
        className="text-xs border border-slate-200 rounded px-1.5 py-1 bg-white"
      >
        {['Inter', 'Roboto', 'Arial', 'Oswald', 'Helvetica', 'Georgia'].map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
      <select
        value={font.fontWeight}
        onChange={(e) => updateFont({ ...font, fontWeight: e.target.value })}
        className="text-xs border border-slate-200 rounded px-1.5 py-1 bg-white"
      >
        <option value="400">Normal</option>
        <option value="500">Medium</option>
        <option value="700">Bold</option>
        <option value="900">Black</option>
      </select>
      <input
        type="number"
        min={6}
        max={120}
        value={font.fontSize}
        onChange={(e) =>
          updateFont({ ...font, fontSize: parseInt(e.target.value) || 12 })
        }
        className="w-12 text-xs border border-slate-200 rounded px-1.5 py-1 text-center"
      />

      <Divider />

      <div className="flex bg-slate-100 rounded p-0.5">
        {(['left', 'center', 'right'] as const).map((a) => (
          <button
            key={a}
            onClick={() => updateFont({ ...font, textAlign: a })}
            className={`px-2 py-1 text-[10px] font-bold rounded ${
              font.textAlign === a ? 'bg-white shadow text-slate-800' : 'text-slate-500'
            }`}
          >
            {a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}
          </button>
        ))}
      </div>

      <Divider />

      <Popover trigger={<>🎨 Renk</>}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-600">Yazı Rengi</span>
          <ColorOpacityPicker
            solidOnly
            value={{ type: 'solid', color: font.color, opacity: font.opacity }}
            onChange={(v) => {
              if (v.type !== 'solid') return;
              updateFont({ ...font, color: v.color, opacity: v.opacity });
            }}
          />
        </div>
      </Popover>

      <Popover trigger={<>📐 Detay</>}>
        <TypographyPicker title={element.toUpperCase()} value={font} onChange={updateFont} />
      </Popover>
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
      <span className="font-semibold text-slate-700 px-2">Footer</span>
      <span className="text-[10px] text-slate-500">{selection.ids.length} hücre</span>

      <Divider />

      <button
        onClick={() => mergeFooterCellsStore(scope, selection.ids)}
        disabled={selection.ids.length < 2}
        className="px-2 py-1 hover:bg-slate-100 rounded text-xs disabled:opacity-30"
      >
        Birleştir
      </button>
      <button
        onClick={() => selection.ids[0] && unmergeFooterCellStore(scope, selection.ids[0])}
        className="px-2 py-1 hover:bg-slate-100 rounded text-xs"
      >
        Ayır
      </button>

      <Divider />

      <Popover trigger={<>🎨 Zemin</>}>
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-600 block">Hücre Zemin Rengi</span>
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
