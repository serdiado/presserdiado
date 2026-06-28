// Compact 4-mode contextual bar. Faithful to reference behaviour, simplified UI.

import { useEffect, useRef, useState } from 'react';
import { AlignCenter, AlignLeft, AlignRight, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, AlignVerticalJustifyStart, Check, CopyPlus, Image, Move, PackageOpen, Settings, Trash2, ZoomIn, Pencil, Table2, Box, Combine, Slice, Frame, ChevronDown, Ruler as RulerIcon, Shapes, ShoppingBag } from 'lucide-react';
import type { CatalogSettings, ColorValue, DeepPartial, TypographyData, BorderRadiusData, BadgeConfig, BadgeShape, BadgePosition, TextElementSettings } from '@matbaapro/shared';
import { useCatalogStore, useUIStore, useHistoryStore } from '@/stores/studio';
import {
  ColorOpacityPicker,
  BorderRadiusPicker,
  ImagePickerPopover,
} from '../pickers';
import { deepMerge, colorValueBackground, colorOpacityToCss } from '../util/style';
import { CornerRadiusIcon } from '@/components/icons/CornerRadiusIcon';
import {
  getActiveSession,
  setActiveRange,
  sanitizeRichText,
  isRangeWithinElement,
  richTextToPlain,
  type RunValue,
  type RunProperty,
  type RichTextSession,
} from '../modules/richText';
import { BANNER_DIM_MIN, BANNER_DIM_MAX } from '../modules/fractions';
import { cellDomId } from '../modules/bannerDom';
import { resolveModuleSlot, isFooterSlotId, synthFooterSlot, footerPageNumber } from '@/stores/studio/footerSlot';
import { resolveMenuContext } from '../contextMenu/menuContext';
import { TextStyleSection } from './TextStyleSection';
import { SlotProductImages } from '../panels/SlotProductImages';
import { clearRunForSurface } from '../textSettings/cellApply';
import type { TextSettingCtx, TextSettingDef } from '../textSettings/types';

const DEFAULT_COLOR: ColorValue = { type: 'solid', color: '#ffffff', opacity: 100 };

const Divider = () => <div className="w-px h-5 bg-border-default mx-2" />;

// ── Metin ayarı uygulama — TEK KAYNAK dispatcher (modül + ürün ortak) ─────────
// Ortak mantık (yakalanmış+canlı seçim uzlaşması, ctx kur, registry.apply, Range→commit+restore /
// patch→cell) burada; yüzey farkı (resolveCellEl / commitRun / applyCell) adapter'da. Paralel kopya YOK.
interface RunApplyAdapter {
  surface: 'module' | 'product';
  slotId: string;
  font: TypographyData;
  matchesSession: (s: RichTextSession) => boolean;
  resolveCellEl: (s: RichTextSession) => HTMLElement | null;
  commitRun: (s: RichTextSession, html: string) => void;
  applyCell: (patch: Partial<TypographyData>) => void;
  /** Cell-level (Faz 4.1): bu hücrenin run-bearing HTML'inden `property`'yi sil (tek-kaynak clearRunForSurface). */
  clearRun?: (property: RunProperty) => void;
  fallbackCellId: string;
}

function dispatchTextSetting(a: RunApplyAdapter, def: TextSettingDef, value: RunValue): void {
  const sess = getActiveSession();
  const ce = sess && a.matchesSession(sess) ? a.resolveCellEl(sess) : null;
  // Fold-#2 canlı uzlaşma: bayat singleton'ı ele — hem YAKALANMIŞ hem CANLI seçim non-collapsed +
  // bu editable içinde olmalı (guard editörü blur etmediğinden picker açıkken de geçerli).
  const live = window.getSelection();
  const liveRange = live && live.rangeCount > 0 ? live.getRangeAt(0) : null;
  const inSel = !!(
    sess &&
    ce &&
    !sess.range.collapsed &&
    isRangeWithinElement(sess.range, ce) &&
    liveRange &&
    !liveRange.collapsed &&
    isRangeWithinElement(liveRange, ce)
  );
  const ctx: TextSettingCtx = {
    surface: a.surface,
    slotId: a.slotId,
    cellId: inSel ? sess!.cellId : a.fallbackCellId,
    cellEl: inSel ? ce! : undefined,
    range: inSel ? sess!.range : undefined,
    font: a.font,
  };
  const res = def.apply(ctx, value);
  if (res instanceof Range) {
    a.commitRun(sess!, sanitizeRichText(ce!.innerHTML)); // RUN → yüzeye özel commit
    setActiveRange(a.slotId, sess!.cellId, res);
    ce!.focus();
    const selApi = window.getSelection();
    selApi?.removeAllRanges();
    selApi?.addRange(res);
  } else if (def.runCapable && a.clearRun) {
    // CELL property-scoped (Faz 4.1): container patch + bu hücrede X'in run-override'larını temizle.
    // ATOMİK (Fold 1): iki yazım TEK undo adımı → tek Ctrl+Z tam orijinale.
    useHistoryStore.getState().withHistoryBatch(() => {
      a.applyCell(res);
      a.clearRun!(def.property as RunProperty);
    });
  } else {
    a.applyCell(res); // CELL → yalnız container (cell-only property veya run-bearing olmayan yüzey)
  }
}

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
      if (target.closest('[data-color-picker-popup], [data-image-picker-popup]')) return;
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

function AddModuleDropdown({
  slot,
  pageNumber,
  setSlotModule,
}: {
  slot: any;
  pageNumber: number;
  setSlotModule: (pageNumber: number, slotId: string, moduleType: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Element)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const btnCls = 'h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-xs font-medium whitespace-nowrap hover:bg-border-default transition-colors disabled:opacity-30';

  const handleSelect = (moduleType: string) => {
    // Rol dönüşümünü setSlotModule kendisi yapar (tek forced saveState) — toggleSlotRole çağrılmaz.
    setSlotModule(pageNumber, slot.id, moduleType);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`${btnCls} ${open ? 'bg-blue-50 text-blue-700' : ''}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="8" height="8" rx="1" />
          <rect x="13" y="3" width="8" height="8" rx="1" />
          <rect x="3" y="13" width="8" height="8" rx="1" />
          <path d="M13 13h8v8h-8z" />
        </svg>
        <span>Modül Ekle</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-surface-panel border border-border-default rounded-radius-md shadow-drop-md min-w-45 overflow-hidden">
          <button
            onClick={() => handleSelect('banner')}
            className="w-full flex items-center gap-2 px-3 py-2 text-body-sm text-text-secondary hover:bg-surface-subtle cursor-pointer text-left transition-colors"
          >
            <Table2 size={16} />
            <span>Tablo Alanı</span>
          </button>
          <button
            onClick={() => handleSelect('free-design')}
            className="w-full flex items-center gap-2 px-3 py-2 text-body-sm text-text-secondary hover:bg-surface-subtle cursor-pointer text-left transition-colors"
          >
            <Frame size={16} />
            <span>Serbest Tasarım Alanı</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function ContextualBar() {
  const selection = useUIStore((s) => s.selection);
  const selectedSlotIds = useUIStore((s) => s.selectedSlotIds);
  const selectedTextElement = useUIStore((s) => s.selectedTextElement);
  const editingContent = useUIStore((s) => s.editingContent);
  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const globalSettings = useCatalogStore((s) => s.globalSettings);

  // İzolasyon (free modül) bağlamı — editingContent⟺isoSession (eşleşme). Aktifse Hızlı Bar
  // YALNIZ "modül izole" kolunu gösterir (mevcut arkaplan/slot/footer kollarının kardeşi).
  const isModuleIsolated =
    !!editingContent && editingContent.contentType === 'banner';

  // Seçim geçerliliği TEK KAYNAK: resolveMenuContext (sağ tık menüsüyle ORTAK resolver → doc §4 dil/
  // karar ortaklığı kod düzeyinde; iki yüzey ıraksamaz). kind!=='none' = geçerli seçim. copiedSlotStyle/
  // copiedBg kind'i ETKİLEMEZ (yalnız slot/pageBg hasCopied* alanları) → false geçilir. Footer-edit
  // bannerCell'de kind=bannerCell olsa da aşağıdaki gate'i zaten isModuleIsolated taşır (davranış-nötr).
  const menuCtx = resolveMenuContext({
    selection,
    pages: getActivePages(),
    globalSettings,
    copiedSlotStyle: false,
    copiedBg: false,
  });
  const hasValidSelection = menuCtx.kind !== 'none';

  if (!hasValidSelection && !isModuleIsolated) return null;

  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 inline-flex justify-center bg-surface-panel shadow-drop-md rounded-b-lg border-b border-x border-border-default overflow-visible z-1000 transition-all duration-150 visible opacity-100">
      <div
        id="contextual-bar"
        className="h-12 px-3 flex items-center gap-1 text-xs text-text-secondary bg-surface-panel rounded-b-lg"
      >
        {isModuleIsolated ? (
          // Modül izole bağlamı — TEK kol. Çerçeve + "Bitti" (exitIsolation). Banner hücre araçları
          // (BannerCellMode; modül ayarları "Ayarlar"→sağ panel) altında akar. Panel UI'ı taşınmaz (I7).
          <>
            <span className="font-semibold text-text-primary px-2 flex items-center gap-1.5">
              <Pencil size={16} className="text-text-secondary" />
              Tablo Alanı düzenleniyor
            </span>
            <button
              onClick={() => useUIStore.getState().exitIsolation()}
              className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-xs font-semibold whitespace-nowrap bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Check size={16} />
              Bitti
            </button>
            {selection.type === 'bannerCell' && (
              <>
                <Divider />
                <BannerCellMode />
              </>
            )}
          </>
        ) : (
          <>
            {selection.type === 'slot' && <SlotMode slotIds={selectedSlotIds} />}
            {selection.type === 'bannerCell' && <BannerCellMode />}
            {selection.type === 'textElement' && selectedTextElement && (
              selectedTextElement.elementType === 'badge' ? (
                <BadgeMode />
              ) : (
                <TextMode
                  slotId={selectedTextElement.slotId}
                  element={selectedTextElement.elementType}
                />
              )
            )}
            {selection.type === 'pageBackground' && (
              <BackgroundMode pageNumber={Number(selection.ids[0])} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ImageScaleDropdown({
  scale,
  onChange,
}: {
  scale: number;
  onChange: (value: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Element)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const btnCls = 'h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-xs font-medium whitespace-nowrap hover:bg-border-default transition-colors';

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`${btnCls} ${open ? 'bg-blue-50 text-blue-700' : 'text-text-secondary'}`}
      >
        <ZoomIn size={16} />
        <span>Görsel Boyutu</span>
        <ChevronDown size={14} className="opacity-60" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-surface-panel border border-border-default rounded-radius-md shadow-drop-md p-3 min-w-48 flex items-center gap-3">
          <input
            type="range"
            min={10}
            max={300}
            step={1}
            value={scale}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full studio-slider"
          />
          <span className="text-body-sm text-text-secondary text-right shrink-0">
            % {scale}
          </span>
        </div>
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
  const clearSlotToPool = useCatalogStore((s) => s.clearSlotToPool);
  const updateSelectedSlotsImageSettings = useCatalogStore((s) => s.updateSelectedSlotsImageSettings);
  const setSidebarState = useUIStore((s) => s.setSidebarState);
  const setSlotModule = useCatalogStore((s) => s.setSlotModule);
  const updateSlotProduct = useCatalogStore((s) => s.updateSlotProduct);

  const pages = getActivePages();
  const isFooter = isFooterSlotId(slotIds[0]);
  // Footer-slot page.slots'ta değil → synthFooterSlot ile tam-slot şekli (globalSettings.footerModule).
  const pageWithSlot = isFooter ? undefined : pages.find((p) => p.slots.some((s) => s.id === slotIds[0]));
  const slot = isFooter
    ? synthFooterSlot(footerPageNumber(slotIds[0]), pages, globalSettings)
    : pageWithSlot?.slots.find((s) => s.id === slotIds[0]);
  const pageNumber = isFooter ? footerPageNumber(slotIds[0]) : (pageWithSlot?.pageNumber ?? 0);
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
        trigger={
          <>
            <div
              className="w-3.5 h-3.5 rounded-sm shrink-0"
              style={{
                ...colorValueBackground(settings.colors.cellBg),
                border: '1px solid rgba(0,0,0,0.15)',
                borderRadius: '4px',
              }}
            />
            <span>Zemin</span>
          </>
        }
        value={settings.colors.cellBg}
        onChange={(v) => update({ colors: { ...settings.colors, cellBg: v } })}
      />

      {/* 5 — Çerçeve */}
      <ColorOpacityPicker
        solidOnly
        type="border"
        trigger={
          <>
            <div
              className="w-3.5 h-3.5 rounded-sm shrink-0"
              style={{
                backgroundColor: 'transparent',
                border: `2px solid ${colorOpacityToCss(settings.colors.cellBorder)}`,
                borderRadius: '4px',
              }}
            />
            <span>Çerçeve</span>
          </>
        }
        value={{ type: 'solid', color: settings.colors.cellBorder.c, opacity: settings.colors.cellBorder.o }}
        thickness={settings.borderWidth}
        onChange={(v) => {
          if (v.type !== 'solid') return;
          update({ colors: { ...settings.colors, cellBorder: { c: v.color, o: v.opacity } } });
        }}
        onThicknessChange={(v) => {
          update({ borderWidth: v });
        }}
      />

      {/* 4 — Köşe */}
      <Popover trigger={<><CornerRadiusIcon size={16} />Köşe</>} width="w-72">
        <BorderRadiusPicker
          value={settings.radiuses.cell}
          onChange={(val) => update({ radiuses: { ...settings.radiuses, cell: val } })}
        />
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
        <ImageScaleDropdown
          scale={slot.imageSettings?.scale ?? 100}
          onChange={(value) => updateSelectedSlotsImageSettings({ scale: value })}
        />
      )}

      <Divider />

      {/* Birleştir/Ayır Butonu */}
      {slotIds.length === 1 && !isMerged ? (
        <button
          disabled
          className={`${btnCls} opacity-40 pointer-events-none`}
        >
          <Combine size={16} />
          Birleştir
        </button>
      ) : slotIds.length === 1 && isMerged ? (
        <button
          onClick={() => unmergeSlot(pageNumber, slot.id)}
          className={btnCls}
        >
          <Slice size={16} />
          Ayır
        </button>
      ) : slotIds.length >= 2 ? (
        <button
          onClick={() => mergeSelected(pageNumber, slotIds[0])}
          className={btnCls}
        >
          <Combine size={16} />
          Birleştir
        </button>
      ) : null}

      <AddModuleDropdown
        slot={slot}
        pageNumber={pageNumber}
        setSlotModule={setSlotModule}
      />

      <Divider />

      {/* Ürün Bilgisi Butonu ve Popover */}
      {slot.product && (
        <>
          <Popover
            trigger={
              <>
                <ShoppingBag size={16} />
                <span>Ürün Bilgisi</span>
              </>
            }
            width="w-96"
          >
            <div className="flex flex-col gap-3 font-sans text-text-primary text-left">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-surface-subtle border border-border-default rounded flex items-center justify-center overflow-hidden shrink-0">
                  {slot.product.image ? (
                    <img
                      src={slot.product.image}
                      alt={richTextToPlain(slot.product.name ?? '')}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-text-muted">Görsel Yok</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider">SKU</div>
                  <div className="text-body-xs font-mono text-text-secondary truncate">{slot.product.sku}</div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Ürün Adı</label>
                <input
                  type="text"
                  defaultValue={richTextToPlain(slot.product.name ?? '')}
                  key={`name-${slot.product.name}`}
                  onBlur={(e) => {
                    // Düz-metin rename → ad düz metne döner (formatting reset; kabul). Render tespiti güvenli gösterir.
                    updateSlotProduct(pageNumber, slot.id, { name: e.target.value });
                  }}
                  className="w-full text-body-xs border border-border-default rounded px-2 py-1 focus:border-border-strong outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Fiyat</label>
                <input
                  type="text"
                  defaultValue={slot.product.price ?? ''}
                  key={`price-${slot.product.price}`}
                  onBlur={(e) => {
                    updateSlotProduct(pageNumber, slot.id, { price: e.target.value });
                  }}
                  className="w-full text-body-xs border border-border-default rounded px-2 py-1 focus:border-border-strong outline-none"
                />
              </div>

              {/* Kütüphane resim yönetimi (sıralama/birincil/ekle/sil) — yalnız SKU'lu üründe. */}
              {slot.product.sku?.trim() && (
                <div className="pt-3 mt-1 border-t border-border-default">
                  <SlotProductImages sku={slot.product.sku} />
                </div>
              )}

              <button
                onClick={() => setSidebarState('products')}
                className="mt-1 w-full h-8 inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-semibold bg-surface-subtle border border-border-default hover:bg-border-default transition-colors text-text-secondary cursor-pointer"
              >
                <ShoppingBag size={14} />
                Ürünü Değiştir
              </button>
            </div>
          </Popover>
          <Divider />
        </>
      )}

      {/* 12 — Rol/Temizle */}
      {isFree ? (
        <button onClick={() => toggleSlotRole('product')} className={btnCls}>
          <PackageOpen size={16} />
          Ürün Yap
        </button>
      ) : (
        <button
          onClick={() => clearSlotToPool(pageNumber, slotIds[0])}
          className={`${btnCls} text-danger hover:bg-red-50`}
        >
          <Trash2 size={16} />
          Hücreyi Boşalt
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

function BadgeMode() {
  const selection = useUIStore((s) => s.selection);
  const selectedTextElement = useUIStore((s) => s.selectedTextElement);
  const setSelectedTextElement = useUIStore((s) => s.setSelectedTextElement);
  const globalSettings = useCatalogStore((s) => s.globalSettings);
  const formas = useCatalogStore((s) => s.formas); // reaktif bağımlılık
  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const setSidebarState = useUIStore((s) => s.setSidebarState);

  const activeBadgeMoveSlotId = useUIStore((s) => s.activeBadgeMoveSlotId);
  const setActiveBadgeMoveSlotId = useUIStore((s) => s.setActiveBadgeMoveSlotId);

  // Reaktif tetikleme
  void formas;

  if (!selectedTextElement) return null;
  const slotId = selectedTextElement.slotId;

  const slot = getActivePages()
    .flatMap((p) => p.slots)
    .find((s) => s.id === slotId);
  if (!slot) return null;

  const isCustom = !!slot.isCustom;
  const cs = slot.customSettings;
  const badge = (isCustom && cs?.badge ? cs.badge : globalSettings.badge) as BadgeConfig;

  const isMoveActive = activeBadgeMoveSlotId === slotId;

  const updateBadge = (partial: Partial<BadgeConfig>) => {
    const pages = JSON.parse(JSON.stringify(getActivePages()));
    for (const p of pages) {
      for (const s of p.slots) {
        if (s.id === slotId) {
          if (!s.isCustom) {
            s.isCustom = true;
            s.customSettings = JSON.parse(JSON.stringify(globalSettings)) as DeepPartial<CatalogSettings>;
          }
          s.customSettings = deepMerge(
            (s.customSettings ?? {}) as Record<string, unknown>,
            { badge: partial } as unknown as Record<string, unknown>
          ) as DeepPartial<CatalogSettings>;
        }
      }
    }
    useCatalogStore.getState().setActivePages(pages);
  };

  const handleToggleMove = () => {
    if (isMoveActive) {
      setActiveBadgeMoveSlotId(null);
    } else {
      if (!badge.isFreePosition) {
        updateBadge({ isFreePosition: true });
      }
      setActiveBadgeMoveSlotId(slotId);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!isMoveActive) return;
      const target = e.target as Element;

      const isBadge = target.closest('[data-badge-drag="true"]');
      const isContextualBar = target.closest('#contextual-bar');
      const isColorPicker = target.closest('[data-color-picker-popup], [data-image-picker-popup]');

      if (!isBadge && !isContextualBar && !isColorPicker) {
        setActiveBadgeMoveSlotId(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick, true);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true);
    };
  }, [isMoveActive, slotId, setActiveBadgeMoveSlotId]);

  const bgVal: ColorValue = { type: 'solid', color: badge.bgColor || '#ffffff', opacity: badge.bgOpacity ?? 100 };
  const textVal: ColorValue = { type: 'solid', color: badge.textColor || '#000000', opacity: badge.textOpacity ?? 100 };
  const borderVal: ColorValue = { type: 'solid', color: badge.borderColor || '#cbd5e1', opacity: badge.borderOpacity ?? 100 };

  const btnCls = 'h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-xs font-medium whitespace-nowrap hover:bg-border-default transition-colors';

  const shapes: { value: BadgeShape; label: string }[] = [
    { value: 'rectangle', label: 'Dikdörtgen' },
    { value: 'pill', label: 'Kapsül' },
    { value: 'circle', label: 'Daire' },
    { value: 'banner', label: 'Şerit' },
    { value: 'burst', label: 'Yıldız' },
    { value: 'flama', label: 'Flama' },
  ];

  return (
    <>
      {/* 2. Zemin */}
      <ColorOpacityPicker
        solidOnly
        trigger={
          <>
            <div
              className="w-3.5 h-3.5 rounded-sm shrink-0"
              style={{
                backgroundColor: badge.bgColor || '#ffffff',
                border: '1px solid rgba(0,0,0,0.15)',
                borderRadius: '4px',
                opacity: (badge.bgOpacity ?? 100) / 100,
              }}
            />
            <span>Zemin</span>
          </>
        }
        value={bgVal}
        onChange={(v) => {
          if (v.type === 'solid') {
            updateBadge({ bgColor: v.color, bgOpacity: v.opacity });
          }
        }}
      />

      {/* Çerçeve Popover'ı */}
      <Popover
        trigger={
          <>
            <div
              className="w-3.5 h-3.5 rounded-sm shrink-0"
              style={{
                backgroundColor: 'transparent',
                border: `2px solid ${badge.borderColor || '#cbd5e1'}`,
                borderRadius: '4px',
                opacity: (badge.borderOpacity ?? 100) / 100,
              }}
            />
            <span>Çerçeve</span>
          </>
        }
        width="w-72"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-text-secondary">Kenarlık Rengi</span>
            <ColorOpacityPicker
              solidOnly
              value={borderVal}
              onChange={(v) => {
                if (v.type === 'solid') {
                  updateBadge({ borderColor: v.color, borderOpacity: v.opacity });
                }
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-border-default">
            <span className="text-[10px] font-medium text-text-secondary">Kalınlık</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={badge.borderWidth ?? 0}
                onChange={(e) => updateBadge({ borderWidth: parseInt(e.target.value) || 0 })}
                className="w-24 studio-slider"
              />
              <span className="text-xs font-medium w-8 text-right">{(badge.borderWidth ?? 0)}px</span>
            </div>
          </div>
        </div>
      </Popover>

      {/* 3. Yazı */}
      <ColorOpacityPicker
        solidOnly
        trigger={
          <>
            <div
              className="w-3.5 h-3.5 rounded-sm shrink-0"
              style={{
                backgroundColor: badge.textColor || '#000000',
                border: '1px solid rgba(0,0,0,0.15)',
                borderRadius: '4px',
                opacity: (badge.textOpacity ?? 100) / 100,
              }}
            />
            <span>Yazı</span>
          </>
        }
        value={textVal}
        onChange={(v) => {
          if (v.type === 'solid') {
            updateBadge({ textColor: v.color, textOpacity: v.opacity });
          }
        }}
      />

      {/* 4. Şekil */}
      <Popover
        trigger={
          <>
            <Shapes size={16} />
            <span>Etiket Şekli</span>
          </>
        }
        width="w-56"
      >
        <div className="grid grid-cols-2 gap-1.5">
          {shapes.map((s) => (
            <button
              key={s.value}
              onClick={() => updateBadge({ shape: s.value })}
              className={`py-1.5 text-[10px] font-medium rounded transition-colors ${
                badge.shape === s.value
                  ? 'bg-slate-800 text-white'
                  : 'bg-surface-subtle text-text-secondary border border-border-default hover:text-text-primary'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Popover>

      {/* 5. Etiketi Taşı */}
      <button
        disabled={!isCustom}
        onClick={handleToggleMove}
        className={`${btnCls} ${isMoveActive ? 'bg-blue-50 text-blue-700' : ''} disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <Move size={16} />
        <span>Etiketi Taşı</span>
      </button>

      <Divider />

      {/* 6. Boyut */}
      <Popover
        trigger={
          <>
            <RulerIcon size={16} />
            <span>Boyut</span>
          </>
        }
        width="w-52"
      >
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-text-secondary">Boyut (%)</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={50}
              max={500}
              step={10}
              value={badge.size}
              onChange={(e) => updateBadge({ size: parseInt(e.target.value) })}
              className="flex-1 studio-slider"
            />
            <input
              type="number"
              value={badge.size}
              onChange={(e) => updateBadge({ size: parseInt(e.target.value) || 50 })}
              className="w-12 text-xs font-normal text-text-primary text-center border border-border-default rounded p-0.5"
            />
            <span className="text-[11px] text-text-muted">%</span>
          </div>
        </div>
      </Popover>

      <Divider />

      {/* 7. Sil */}
      <button
        onClick={() => {
          updateBadge({ active: false });
          setSelectedTextElement(null);
        }}
        className={`${btnCls} text-danger hover:bg-red-50`}
      >
        <Trash2 size={16} />
        <span>Sil</span>
      </button>

      {/* 8. Ayarlar */}
      <button
        onClick={() => setSidebarState('grid', 'cell', 'custom-badge')}
        className={btnCls}
      >
        <Settings size={16} />
        Ayarlar
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
  const formas = useCatalogStore((s) => s.formas); // reaktif bağımlılık
  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const setGlobalSettings = useCatalogStore((s) => s.setGlobalSettings);
  const updateSlotCustomSettings = useCatalogStore((s) => s.updateSlotCustomSettings);
  const updateSlotProduct = useCatalogStore((s) => s.updateSlotProduct);
  const setSidebarState = useUIStore((s) => s.setSidebarState);
  void formas;

  const slot = getActivePages()
    .flatMap((p) => p.slots)
    .find((s) => s.id === slotId);
  if (!slot) return null;

  const isCustom = !!slot.isCustom;
  const cs = slot.customSettings;

  const settings: CatalogSettings = (
    slot.isCustom && slot.customSettings
      ? deepMerge<CatalogSettings>(
          JSON.parse(JSON.stringify(globalSettings)),
          slot.customSettings as Partial<CatalogSettings>,
        )
      : globalSettings
  ) as CatalogSettings;

  const isName = element === 'name';
  const nameSettings = (isCustom && cs?.nameSettings ? cs.nameSettings : globalSettings.nameSettings) as TextElementSettings;

  const updateSettings = (patch: DeepPartial<CatalogSettings>) => {
    if (isCustom) {
      updateSlotCustomSettings(patch);
    } else {
      setGlobalSettings(patch);
    }
  };

  const updateNameSettings = (partial: Partial<TextElementSettings>) => {
    updateSettings({
      nameSettings: {
        ...nameSettings,
        ...partial,
      },
    });
  };

  const nameBgValue = {
    type: 'solid' as const,
    color: nameSettings.bgColor || '#ffffff',
    opacity: nameSettings.bgOpacity ?? 100,
  };
  const nameBorderValue = {
    c: nameSettings.borderColor || '#cbd5e1',
    o: nameSettings.borderOpacity ?? 100,
  };
  const nameRadiusValue: BorderRadiusData = {
    tl: nameSettings.borderRadius ?? 0,
    tr: nameSettings.borderRadius ?? 0,
    bl: nameSettings.borderRadius ?? 0,
    br: nameSettings.borderRadius ?? 0,
    linked: true,
  };

  const bgValue: ColorValue = isName ? nameBgValue : settings.colors.priceBg;
  const borderValue = isName ? nameBorderValue : settings.colors.priceBorder;
  const borderWidth = isName ? (nameSettings.borderWidth ?? 0) : settings.priceBorderWidth;
  const radiusValue = isName ? nameRadiusValue : settings.radiuses.price;

  const bgTriggerStyle: React.CSSProperties = isName
    ? {
        backgroundColor: nameBgValue.color,
        border: '1px solid rgba(0,0,0,0.15)',
        borderRadius: '4px',
        opacity: nameBgValue.opacity / 100,
      }
    : {
        ...colorValueBackground(settings.colors.priceBg),
        border: '1px solid rgba(0,0,0,0.15)',
        borderRadius: '4px',
      };

  const updateBackground = (value: ColorValue) => {
    if (isName) {
      if (value.type !== 'solid') return;
      updateNameSettings({
        bgColor: value.color,
        bgOpacity: value.opacity,
      });
      return;
    }

    updateSettings({
      colors: {
        ...settings.colors,
        priceBg: value,
      },
    });
  };

  const updateBorderColor = (value: ColorValue) => {
    if (value.type !== 'solid') return;
    if (isName) {
      updateNameSettings({
        borderColor: value.color,
        borderOpacity: value.opacity,
      });
      return;
    }

    updateSettings({
      colors: {
        ...settings.colors,
        priceBorder: { c: value.color, o: value.opacity },
      },
    });
  };

  const updateBorderWidth = (value: number) => {
    if (isName) {
      updateNameSettings({ borderWidth: value });
      return;
    }

    updateSettings({ priceBorderWidth: value });
  };

  const updateRadius = (value: BorderRadiusData) => {
    if (isName) {
      updateNameSettings({ borderRadius: value.tl });
      return;
    }

    updateSettings({
      radiuses: {
        ...settings.radiuses,
        price: value,
      },
    });
  };

  const fontKey = element === 'price' ? 'price' : 'productName';
  const font: TypographyData = settings.fonts[fontKey];

  const updateFont = (next: TypographyData) => {
    const patch = { fonts: { ...settings.fonts, [fontKey]: next } } as DeepPartial<CatalogSettings>;
    updateSettings(patch);
  };

  // Run-level metin (yalnız ürün ADI) — ortak dispatchTextSetting + ÜRÜN adapter'ı:
  // run→updateSlotProduct(name HTML) (clone-izole + global saveState), cell→updateFont(fonts.productName).
  const pageNumber =
    getActivePages().find((p) => p.slots.some((s) => s.id === slotId))?.pageNumber ?? 0;
  const applyTextSetting = (def: TextSettingDef, value: RunValue) =>
    dispatchTextSetting(
      {
        surface: 'product',
        slotId,
        font,
        matchesSession: (s) => s.slotId === slotId && s.cellId === 'name',
        resolveCellEl: () =>
          document.getElementById(`product-name-${slotId}`) as HTMLElement | null,
        commitRun: (_s, html) => updateSlotProduct(pageNumber, slotId, { name: html }),
        applyCell: (patch) => updateFont({ ...font, ...patch }),
        clearRun: (property) => clearRunForSurface('product', slotId, [], property),
        fallbackCellId: 'name',
      },
      def,
      value,
    );

  const btnCls = 'h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-xs font-medium whitespace-nowrap hover:bg-border-default transition-colors';

  return (
    <>
      {isName ? (
        /* Ürün adı: registry'den render run-level biçimlendirme (Faz 3). */
        <TextStyleSection
          surface="product"
          slotId={slotId}
          cellId="name"
          font={font}
          onApply={applyTextSetting}
          getAvoidRect={() => {
            const s = getActiveSession();
            return s && s.slotId === slotId && s.cellId === 'name' && !s.range.collapsed
              ? s.range.getBoundingClientRect()
              : null;
          }}
        />
      ) : (
        /* Fiyat: cell-level native kontroller (run-level göç sonraki tur). */
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
        </>
      )}


      {/* 10 */}
      <Divider />

      {/* 5 — Yatay hizalama */}
      <TextAlignDropdown font={font} updateFont={updateFont} />

      <Divider />

      {/* 5b — Dikey hizalama */}
      <TextVerticalAlignDropdown font={font} updateFont={updateFont} />


      {/* 6 */}
      <Divider />

      {/* Zemin */}
      <div>
        <ColorOpacityPicker
          solidOnly={isName}
          trigger={
            <>
              <div
                className="w-3.5 h-3.5 rounded-sm shrink-0"
                style={bgTriggerStyle}
              />
              <span>Zemin</span>
            </>
          }
          value={bgValue}
          onChange={updateBackground}
        />
      </div>

      {/* Çerçeve */}
      <div>
        <ColorOpacityPicker
          solidOnly
          type="border"
          trigger={
            <>
              <div
                className="w-3.5 h-3.5 rounded-sm shrink-0"
                style={{
                  backgroundColor: 'transparent',
                  border: `2px solid ${colorOpacityToCss(borderValue)}`,
                  borderRadius: '4px',
                }}
              />
              <span>Çerçeve</span>
            </>
          }
          value={{ type: 'solid', color: borderValue.c, opacity: borderValue.o }}
          thickness={borderWidth}
          onChange={updateBorderColor}
          onThicknessChange={updateBorderWidth}
        />
      </div>

      {/* Köşe */}
      <div>
        <Popover trigger={<><CornerRadiusIcon size={16} />Köşe</>} width="w-72">
          <BorderRadiusPicker
            value={radiusValue}
            onChange={updateRadius}
          />
        </Popover>
      </div>

      <Divider />

      {/* 11 — Ayarlar */}
      <button
        onClick={() => {
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
type ImagePositionType =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

function BackgroundMode({ pageNumber }: { pageNumber: number }) {
  const formas = useCatalogStore((s) => s.formas);
  const activeFormaId = useCatalogStore((s) => s.activeFormaId);
  const updatePagesBackground = useCatalogStore((s) => s.updatePagesBackground);
  const applyBackgroundGlobally = useCatalogStore((s) => s.applyBackgroundGlobally);
  const setSidebarState = useUIStore((s) => s.setSidebarState);
  // Zemin sağ-tık "Renk"/"Görsel" köprüsü: registry openBgPicker doldurur → uygun picker açılır.
  const bgPickerToOpen = useUIStore((s) => s.bgPickerToOpen);
  const clearBgPicker = useUIStore((s) => s.clearBgPicker);

  const currentPage = formas
    .find((f) => f.id === activeFormaId)
    ?.pages.find((p) => p.pageNumber === pageNumber);

  const [bgType, setBgType] = useState<'color' | 'image'>('color');
  const [colorValue, setColorValue] = useState<ColorValue>(DEFAULT_COLOR);
  const [imageUrl, setImageUrl] = useState('');
  const [imageSize, setImageSize] = useState<ImageSizeType>('fill');
  const [imagePosition, setImagePosition] = useState<ImagePositionType>('center');
  const [imageOpacity, setImageOpacity] = useState(100);

  useEffect(() => {
    const bg = currentPage?.background;
    if (!bg) {
      setBgType('color');
      setColorValue(DEFAULT_COLOR);
      setImageUrl('');
      setImageSize('fill');
      setImagePosition('center');
      setImageOpacity(100);
      return;
    }
    setBgType(bg.type);
    // Replace semantiği: Görsel zemine geçildiğinde colorValue korunur; sadece gerçek
    // renk background'ı geldiğinde güncellenir. Böylece "Kaldır" eski renge döner.
    if (bg.value) setColorValue(bg.value);
    setImageUrl(bg.imageUrl ?? '');
    setImageSize(bg.imageSize ?? 'fill');
    setImagePosition(bg.imagePosition ?? 'center');
    setImageOpacity(bg.imageOpacity ?? 100);
  }, [pageNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentBg = currentPage?.background;

  return (
    <>
      {/* 1. RENK BUTONU */}
      <ColorOpacityPicker
        className={`h-9 px-3 flex items-center gap-1.5 rounded text-xs cursor-pointer ${
          bgType === 'color' ? 'bg-surface-subtle text-text-primary font-medium' : 'text-text-secondary hover:bg-border-default'
        }`}
        trigger={
          <>
            <div
              className="w-3.5 h-3.5 rounded-sm shrink-0"
              style={{
                ...colorValueBackground(colorValue),
                border: '1px solid rgba(0,0,0,0.15)',
                borderRadius: '4px',
              }}
            />
            <span>Renk</span>
          </>
        }
        value={colorValue}
        onChange={(v) => {
          setBgType('color');
          setColorValue(v);
          updatePagesBackground([pageNumber], { type: 'color', value: v });
        }}
        openSignal={bgPickerToOpen === 'color'}
        onConsumeOpen={clearBgPicker}
      />

      {/* 2. GÖRSEL BUTONU */}
      <ImagePickerPopover
        openSignal={bgPickerToOpen === 'image'}
        onConsumeOpen={clearBgPicker}
        className={`h-9 px-3 flex items-center gap-1.5 rounded text-xs cursor-pointer ${
          bgType === 'image' ? 'bg-surface-subtle text-text-primary font-medium' : 'text-text-secondary hover:bg-border-default'
        }`}
        trigger={<><Image size={16} /><span>Görsel</span></>}
        imageUrl={imageUrl}
        imageSize={imageSize}
        imagePosition={imagePosition}
        imageOpacity={imageOpacity}
        onImageSelected={(payload) => {
          setBgType('image');
          setImageUrl(payload.imageUrl);
          setImageSize(payload.imageSize);
          setImagePosition(payload.imagePosition);
          setImageOpacity(payload.imageOpacity);
          updatePagesBackground([pageNumber], {
            type: 'image',
            imageUrl: payload.imageUrl,
            imageSize: payload.imageSize,
            imagePosition: payload.imagePosition,
            imageOpacity: payload.imageOpacity,
          });
        }}
        onSettingsChange={(patch) => {
          const nextImageSize = patch.imageSize ?? imageSize;
          const nextImagePosition = patch.imagePosition ?? imagePosition;
          const nextImageOpacity = patch.imageOpacity ?? imageOpacity;
          setImageSize(nextImageSize);
          setImagePosition(nextImagePosition);
          setImageOpacity(nextImageOpacity);
          if (!imageUrl) return;
          updatePagesBackground([pageNumber], {
            type: 'image',
            imageUrl,
            imageSize: nextImageSize,
            imagePosition: nextImagePosition,
            imageOpacity: nextImageOpacity,
          });
        }}
        onImageCleared={() => {
          setBgType('color');
          setImageUrl('');
          updatePagesBackground([pageNumber], { type: 'color', value: colorValue });
        }}
      />

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
            // Rol dönüşümünü setSlotModule kendisi yapar (tek forced saveState) — toggleSlotRole çağrılmaz.
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
    // Footer host-slot: "Ürün Hücresi Yap" + "Kaldır" footer'a uymaz (slot-grid'e özgü). Gizle.
    const isFooter = isFooterSlotId(slot.id);
    const rows = moduleData.rows ?? 4;
    const cols = moduleData.cols ?? 4;
    const bgColor = moduleData.bgColor ?? { type: 'solid', color: '#ffffff', opacity: 100 };
    const cb = moduleData.containerBorder ?? { color: { c: '#e2e8f0', o: 100 }, width: 0 };
    const radius = moduleData.radius ?? { tl: 0, tr: 0, bl: 0, br: 0, linked: true };

    // Sayısal grid boyutu → merge-aware motor (setBannerGridSize). Clamp burada.
    const resizeGrid = (newRows: number, newCols: number) =>
      useCatalogStore.getState().setBannerGridSize(
        slot.id,
        Math.max(BANNER_DIM_MIN, Math.min(BANNER_DIM_MAX, newRows)),
        Math.max(BANNER_DIM_MIN, Math.min(BANNER_DIM_MAX, newCols)),
      );

    const handleEditModule = () => {
      const firstCellId = moduleData.cells?.[0]?.id;
      useUIStore.getState().enterIsolation(slot);
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
            type="number" min={BANNER_DIM_MIN} max={BANNER_DIM_MAX} value={rows}
            onChange={(e) => resizeGrid(parseInt(e.target.value) || BANNER_DIM_MIN, cols)}
            className="w-8 text-center text-xs font-semibold bg-transparent border-0 outline-none"
          />
          <span className="text-text-muted">×</span>
          <span className="text-[10px] text-text-secondary px-1">Sütun:</span>
          <input
            type="number" min={BANNER_DIM_MIN} max={BANNER_DIM_MAX} value={cols}
            onChange={(e) => resizeGrid(rows, parseInt(e.target.value) || BANNER_DIM_MIN)}
            className="w-8 text-center text-xs font-semibold bg-transparent border-0 outline-none"
          />
        </div>

        <Divider />

        {/* Zemin Rengi */}
        <ColorOpacityPicker
          trigger={
            <>
              <div
                className="w-3.5 h-3.5 rounded-sm shrink-0"
                style={{
                  ...colorValueBackground(bgColor),
                  border: '1px solid rgba(0,0,0,0.15)',
                  borderRadius: '4px',
                }}
              />
              <span>Zemin</span>
            </>
          }
          value={bgColor}
          onChange={(v) => updateSlotModuleData(pageNumber, slot.id, { bgColor: v })}
        />

        {/* Çerçeve Popover'ı */}
        <Popover
          trigger={
            <>
              <div
                className="w-3.5 h-3.5 rounded-sm shrink-0"
                style={{
                  backgroundColor: 'transparent',
                  border: `2px solid ${colorOpacityToCss(cb.color)}`,
                  borderRadius: '4px',
                }}
              />
              <span>Çerçeve</span>
            </>
          }
          width="w-72"
        >
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

        {!isFooter && (
          <>
            <button onClick={() => toggleSlotRole('product')} className={btnCls}>
              <Box size={16} />
              Ürün Hücresi Yap
            </button>
            <button
              onClick={() => updateSlotModuleData(pageNumber, slot.id, null, 'discrete')}
              className={`${btnCls} text-danger hover:bg-red-50`}
            >
              <Trash2 size={16} />
              Kaldır
            </button>
          </>
        )}

        <Divider />

        <button
          onClick={() => setSidebarState('grid', 'banner-appearance')}
          className={btnCls}
        >
          <Settings size={16} />
          Ayarlar
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
        onClick={() => useCatalogStore.getState().clearSlotToPool(pageNumber, slot.id)}
        className={`${btnCls} text-danger hover:bg-red-50`}
      >
        <Trash2 size={16} />
        Hücreyi Boşalt
      </button>
    </>
  );
}


function BannerTextAlignDropdown({
  textAlign,
  onChange,
}: {
  textAlign: 'left' | 'center' | 'right';
  onChange: (v: 'left' | 'center' | 'right') => void;
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

  const active = H_ALIGNS.find((a) => a.value === textAlign) ?? H_ALIGNS[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-text-secondary whitespace-nowrap hover:bg-border-default transition-colors"
      >
        <active.Icon size={16} />
        <span>{active.label}</span>
        <ChevronDown size={14} className="text-text-muted shrink-0" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-32 bg-surface-panel border border-border-default rounded-radius-md shadow-drop-md overflow-hidden">
          {H_ALIGNS.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => {
                onChange(value);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-body-sm transition-colors text-left ${
                textAlign === value
                  ? 'bg-surface-subtle text-text-primary font-medium'
                  : 'text-text-secondary hover:bg-surface-subtle'
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BannerTextVerticalAlignDropdown({
  verticalAlign,
  onChange,
}: {
  verticalAlign: 'top' | 'middle' | 'bottom';
  onChange: (v: 'top' | 'middle' | 'bottom') => void;
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

  const active = V_ALIGNS.find((a) => a.value === verticalAlign) ?? V_ALIGNS[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-text-secondary whitespace-nowrap hover:bg-border-default transition-colors"
      >
        <active.Icon size={16} />
        <span>{active.label}</span>
        <ChevronDown size={14} className="text-text-muted shrink-0" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-32 bg-surface-panel border border-border-default rounded-radius-md shadow-drop-md overflow-hidden">
          {V_ALIGNS.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => {
                onChange(value);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-body-sm transition-colors text-left ${
                verticalAlign === value
                  ? 'bg-surface-subtle text-text-primary font-medium'
                  : 'text-text-secondary hover:bg-surface-subtle'
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tablo Modülü Düzenle Modunda Hücre Hızlı Erişim Barı ───────────────────
function BannerCellMode() {
  const selection = useUIStore((s) => s.selection);
  const selectedCellIds = selection.type === 'bannerCell' ? selection.ids : [];
  const slotId = selection.parentId;

  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const updateSlotModuleData = useCatalogStore((s) => s.updateSlotModuleData);
  const globalSettings = useCatalogStore((s) => s.globalSettings);
  const formas = useCatalogStore((s) => s.formas); // Reaktif tetikleme için bağımlılık eklendi
  const setSidebarState = useUIStore((s) => s.setSidebarState);

  // Footer-farkındalığı resolveModuleSlot'ta (footer-slot → globalSettings.footerModule).
  const resolved = resolveModuleSlot(slotId ?? '', getActivePages(), globalSettings);
  const pageNumber = resolved?.pageNumber ?? 0;
  const moduleData: any = resolved?.moduleData ?? null;

  if (!moduleData || moduleData.type !== 'banner' || selectedCellIds.length === 0) return null;

  const targetCells = moduleData.cells.filter((c: any) => selectedCellIds.includes(c.id));
  const firstCell = targetCells[0] ?? null;
  const isMerged = firstCell != null && (firstCell.colSpan > 1 || firstCell.rowSpan > 1);

  const updateCells = (patch: Partial<any>) => {
    const cells = moduleData.cells.map((c: any) =>
      selectedCellIds.includes(c.id) ? { ...c, ...patch } : c,
    );
    updateSlotModuleData(pageNumber, slotId!, { cells });
  };

  // Metin ayarı uygula — ortak dispatchTextSetting + MODÜL adapter'ı (run→updateSlotModuleData /
  // cell→updateCells). Mantık tek kaynakta; burada yalnız yüzey farkları.
  const applyTextSetting = (def: TextSettingDef, value: RunValue) =>
    dispatchTextSetting(
      {
        surface: 'module',
        slotId: slotId!,
        font: firstCell.font,
        matchesSession: (s) => s.slotId === slotId,
        resolveCellEl: (s) =>
          document
            .getElementById(cellDomId(s.slotId, s.cellId))
            ?.querySelector('[contenteditable]') as HTMLElement | null,
        commitRun: (s, html) => {
          const cells = moduleData.cells.map((c: any) =>
            c.id === s.cellId ? { ...c, text: html } : c,
          );
          updateSlotModuleData(pageNumber, slotId!, { cells });
        },
        applyCell: (patch) => updateCells({ font: { ...firstCell.font, ...patch } }),
        clearRun: (property) => clearRunForSurface('module', slotId!, selectedCellIds, property),
        fallbackCellId: selectedCellIds[0] ?? '',
      },
      def,
      value,
    );

  // Merge/split → merge-aware motor (store action). withHistoryBatch ile tek Ctrl+Z (izolasyon içi+dışı).
  const mergeCells = () => useCatalogStore.getState().mergeBannerCells(slotId!, selectedCellIds);
  const splitCell = () => {
    if (!firstCell) return;
    useCatalogStore.getState().splitBannerCell(slotId!, firstCell.id);
  };

  const resetCell = () => {
    updateCells({
      bgColor: { type: 'solid', color: '#ffffff', opacity: 100 },
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
          {/* Görsel — sayfa zemini ile aynı birleşik picker (yükleme + boyut + konum + saydamlık) */}
          <ImagePickerPopover
            className={`${btnCls} cursor-pointer`}
            trigger={
              <>
                <Image size={16} />
                <span>Görsel</span>
              </>
            }
            imageUrl={firstCell.image ?? undefined}
            imageSize={firstCell.imageSize ?? 'fit'}
            imagePosition={firstCell.imagePosition ?? 'center'}
            imageOpacity={firstCell.imageOpacity ?? 100}
            onImageSelected={(p) =>
              updateCells({
                image: p.imageUrl,
                imageSize: p.imageSize,
                imagePosition: p.imagePosition,
                imageOpacity: p.imageOpacity,
              })
            }
            onSettingsChange={(patch) => updateCells(patch)}
            onImageCleared={() => updateCells({ image: null })}
          />

          {/* Hücre Zemin Rengi */}
          <ColorOpacityPicker
            trigger={
              <>
                <div
                  className="w-3.5 h-3.5 rounded-sm shrink-0"
                  style={{
                    ...colorValueBackground(firstCell.bgColor),
                    border: '1px solid rgba(0,0,0,0.15)',
                    borderRadius: '4px',
                  }}
                />
                <span>Zemin</span>
              </>
            }
            value={firstCell.bgColor}
            onChange={(v) => updateCells({ bgColor: v })}
          />

          {/* Hücre Çerçeve Ayarı Popover'ı */}
          <Popover
            trigger={
              <>
                <div
                  className="w-3.5 h-3.5 rounded-sm shrink-0"
                  style={{
                    backgroundColor: 'transparent',
                    border: `2px solid ${colorOpacityToCss(firstCell.border.color)}`,
                    borderRadius: '4px',
                  }}
                />
                <span>Çerçeve</span>
              </>
            }
            width="w-72"
          >
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

          {/* Metin biçimlendirme — registry'den render, run-level (Faz 2). Renk dahil tüm kontroller
              applyTextSetting tek-yolundan geçer (run→motor / cell→patch). */}
          <TextStyleSection
            surface="module"
            slotId={slotId!}
            cellId={selectedCellIds[0] ?? firstCell.id}
            font={firstCell.font}
            onApply={applyTextSetting}
            getAvoidRect={() => {
              const s = getActiveSession();
              return s && s.slotId === slotId && !s.range.collapsed
                ? s.range.getBoundingClientRect()
                : null;
            }}
          />

          <Divider />

          {/* Yatay Hizalama */}
          <BannerTextAlignDropdown
            textAlign={firstCell.font.textAlign || 'center'}
            onChange={(v) => updateCells({ font: { ...firstCell.font, textAlign: v } })}
          />

          {/* Dikey Hizalama */}
          <BannerTextVerticalAlignDropdown
            verticalAlign={firstCell.font.verticalAlign || 'middle'}
            onChange={(v) => updateCells({ font: { ...firstCell.font, verticalAlign: v } })}
          />
        </>
      )}

      <Divider />

      <button onClick={resetCell} className={`${btnCls} text-danger hover:bg-red-50`}>
        Hücreyi Sıfırla
      </button>

      <Divider />

      <button
        onClick={() => setSidebarState('grid', 'banner-cell')}
        className={btnCls}
      >
        <Settings size={16} />
        Ayarlar
      </button>
    </>
  );
}
