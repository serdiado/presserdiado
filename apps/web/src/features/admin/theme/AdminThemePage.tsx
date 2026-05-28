import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { type UITypographyToken, type UIThemeTokens } from '@matbaapro/shared';
import { ThemeInjector, applyTokensToDOM } from '@/components/ThemeInjector';
import { cloneTheme, defaultThemeForMode, normalizeThemeTokens } from '@/lib/themeTokens';
import { type ThemeMode, useThemeStore } from '@/stores/theme.store';

type ThemeDrafts = Record<ThemeMode, UIThemeTokens>;
type ColorKey = keyof UIThemeTokens['colors'];
type RadiusKey = keyof UIThemeTokens['radii'];
type ShadowKey = keyof UIThemeTokens['shadows'];
type TypographyKey = Exclude<keyof UIThemeTokens['typography'], 'fontFamilySans'>;
type ButtonKey = keyof UIThemeTokens['buttons'];
type TypographyField = keyof UITypographyToken;

const COLOR_LABELS: Record<ColorKey, string> = {
  primary: 'Primary',
  primaryHover: 'Primary hover',
  danger: 'Danger',
  success: 'Success',
  warning: 'Warning',
  surfaceApp: 'App yüzeyi',
  surfacePanel: 'Panel yüzeyi',
  surfaceSubtle: 'Subtle yüzey',
  borderDefault: 'Border default',
  borderStrong: 'Border strong',
  borderSelected: 'Border selected',
  textPrimary: 'Text primary',
  textSecondary: 'Text secondary',
  textMuted: 'Text muted',
};

const TYPOGRAPHY_LABELS: Record<TypographyKey, string> = {
  headingXl: 'Modal Başlığı',
  navLabel: 'Panel Bölüm Başlığı',
  headingMd: 'Akordiyon Başlığı',
  headingSm: 'Form Grup Başlığı',
  bodyMd: 'İçerik Metni',
  bodySm: 'Açıklama Metni',
  bodyXs: 'Alt Etiket',
  labelMd: 'Form Etiketi',
  labelSm: 'Sekme Etiketi',
  iconLabel: 'İkon Etiketi',
};

const FONT_WEIGHTS = ['300', '400', '500', '600', '700', '800'];
const FONT_SIZES_MAP = {
  '11px': '0.6875rem',
  '12px': '0.75rem',
  '13px': '0.8125rem',
  '14px': '0.875rem',
  '15px': '0.9375rem',
  '16px': '1rem',
  '18px': '1.125rem',
  '20px': '1.25rem',
};
const LINE_HEIGHTS = ['1.0', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.75', '2.0'];
const LETTER_SPACINGS = ['-0.05em', '-0.02em', '0em', '0.01em', '0.02em', '0.05em', '0.08em', '0.12em'];

const COLOR_KEYS = Object.keys(COLOR_LABELS) as ColorKey[];
const TYPOGRAPHY_KEYS = Object.keys(TYPOGRAPHY_LABELS) as TypographyKey[];
const RADIUS_KEYS: RadiusKey[] = ['sm', 'md', 'lg', 'xl', 'full'];
const SHADOW_KEYS: ShadowKey[] = ['dropSm', 'dropMd', 'dropLg'];
const BUTTON_KEYS: ButtonKey[] = ['radius', 'height'];

const RADIUS_LABELS: Record<RadiusKey, { label: string; description: string }> = {
  sm: { label: 'Küçük köşe', description: 'Input içi, küçük badge ve mini kontroller.' },
  md: { label: 'Orta köşe', description: 'Standart buton, select ve form alanları.' },
  lg: { label: 'Büyük köşe', description: 'Kart içi bloklar ve önizleme kutuları.' },
  xl: { label: 'Ekstra büyük köşe', description: 'Panel, modal ve ana kart yüzeyleri.' },
  full: { label: 'Tam yuvarlak', description: 'Pill/badge ve dairesel butonlar.' },
};

function parseNumericToken(value: string, fallback: number) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatNumber(value: number, fractionDigits = 4) {
  return Number(value.toFixed(fractionDigits)).toString();
}

function formatTokenValue(value: number, unit: string, fractionDigits?: number) {
  return `${formatNumber(value, fractionDigits)}${unit}`;
}

async function fetchTheme(mode: ThemeMode): Promise<UIThemeTokens> {
  const res = await fetch(`/api/v1/theme/${mode}`);
  if (!res.ok) throw new Error(`Theme fetch failed: ${res.status}`);
  const data = await res.json() as { mode: ThemeMode; tokens: unknown };
  return normalizeThemeTokens(data.tokens, mode);
}

async function saveTheme(mode: ThemeMode, tokens: UIThemeTokens): Promise<UIThemeTokens> {
  const normalizedTokens = normalizeThemeTokens(tokens, mode);
  const res = await fetch(`/api/v1/theme/${mode}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalizedTokens),
  });
  if (!res.ok) throw new Error(`Theme save failed: ${res.status}`);
  const data = await res.json() as { mode: ThemeMode; tokens: unknown };
  return normalizeThemeTokens(data.tokens, mode);
}

export default function AdminThemePage() {
  const currentMode = useThemeStore((s) => s.mode);
  const setModeLocal = useThemeStore((s) => s.setModeLocal);
  const setTokens = useThemeStore((s) => s.setTokens);
  const [activeMode, setActiveMode] = useState<ThemeMode>(currentMode);
  const [drafts, setDrafts] = useState<ThemeDrafts>(() => ({
    light: defaultThemeForMode('light'),
    dark: defaultThemeForMode('dark'),
  }));
  const [isLoading, setIsLoading] = useState(true);
  const [savingMode, setSavingMode] = useState<ThemeMode | null>(null);

  const activeTokens = drafts[activeMode];

  useEffect(() => {
    let alive = true;
    async function loadThemes() {
      setIsLoading(true);
      try {
        const [light, dark] = await Promise.all([fetchTheme('light'), fetchTheme('dark')]);
        if (!alive) return;
        setDrafts({ light: cloneTheme(light), dark: cloneTheme(dark) });
        const initialActive = activeMode === 'light' ? light : dark;
        setTokens(initialActive);
        applyTokensToDOM(initialActive);
      } catch (error) {
        console.error(error);
        toast.error('Tema tokenları yüklenemedi, varsayılanlar kullanılıyor');
      } finally {
        if (alive) setIsLoading(false);
      }
    }
    loadThemes();
    return () => {
      alive = false;
    };
  }, [activeMode]);

  useEffect(() => {
    applyTokensToDOM(activeTokens);
  }, [activeTokens]);

  async function switchMode(mode: ThemeMode) {
    setActiveMode(mode);
    setModeLocal(mode);
    setTokens(drafts[mode]);
    applyTokensToDOM(drafts[mode]);
  }

  function updateDraft(mutator: (tokens: UIThemeTokens) => void) {
    setDrafts((prev) => {
      const next = cloneTheme(prev[activeMode]);
      mutator(next);
      applyTokensToDOM(next);
      setTokens(next);
      return { ...prev, [activeMode]: next };
    });
  }

  async function handleSave(mode: ThemeMode) {
    setSavingMode(mode);
    try {
      const saved = await saveTheme(mode, drafts[mode]);
      setDrafts((prev) => ({ ...prev, [mode]: cloneTheme(saved) }));
      if (mode === activeMode) setTokens(saved);
      toast.success(`${mode === 'light' ? 'Light' : 'Dark'} tema kaydedildi`);
    } catch (error) {
      console.error(error);
      toast.error('Tema kaydedilemedi');
    } finally {
      setSavingMode(null);
    }
  }

  function handleReset(mode: ThemeMode) {
    const defaults = defaultThemeForMode(mode);
    setDrafts((prev) => ({ ...prev, [mode]: defaults }));
    if (mode === activeMode) {
      applyTokensToDOM(defaults);
      setTokens(defaults);
    }
    toast.success(`${mode === 'light' ? 'Light' : 'Dark'} tema varsayılana döndü`);
  }

  const modeLabel = activeMode === 'light' ? 'Light' : 'Dark';

  return (
    <main className="min-h-screen bg-surface-app text-text-primary" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <ThemeInjector tokens={activeTokens} />
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6">
        <header className="flex flex-col gap-4 rounded-radius-xl border border-border-default bg-surface-panel p-5 shadow-drop-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-label-sm uppercase tracking-[0.14em] text-text-muted">Admin</p>
            <h1 className="text-heading-xl">Theme Editor</h1>
            <p className="mt-1 text-body-sm text-text-secondary">
              UI tokenlarını light/dark tema bazında düzenle, canlı önizle ve API’ye kaydet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['light', 'dark'] as ThemeMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => void switchMode(mode)}
                className={`rounded-radius-md border px-4 py-2 text-label-md transition ${
                  activeMode === mode
                    ? 'border-primary bg-primary text-white'
                    : 'border-border-default bg-surface-subtle text-text-secondary hover:border-border-strong'
                }`}
              >
                {mode === 'light' ? 'Light tema' : 'Dark tema'}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void handleSave(activeMode)}
              disabled={savingMode === activeMode || isLoading}
              className="rounded-radius-md bg-primary px-4 py-2 text-label-md text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingMode === activeMode ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              type="button"
              onClick={() => handleReset(activeMode)}
              disabled={isLoading}
              className="rounded-radius-md border border-border-default bg-surface-panel px-4 py-2 text-label-md text-text-secondary hover:border-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-60"
            >
              Sıfırla
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-6">
            <TokenSection
              title={`${modeLabel} renkleri`}
              description="Renk değerlerini color picker veya HEX alanı ile düzenle."
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {COLOR_KEYS.map((key) => (
                  <ColorField
                    key={key}
                    label={COLOR_LABELS[key]}
                    value={activeTokens.colors[key]}
                    onChange={(value) => updateDraft((tokens) => { tokens.colors[key] = value; })}
                  />
                ))}
              </div>
            </TokenSection>

            <TokenSection
              title="Tipografi"
              description="Tipografi token ayarlarını dropdown menüler aracılığıyla kolayca seçebilirsiniz."
            >
              <label className="block rounded-radius-lg border border-border-default bg-surface-subtle p-3">
                <span className="text-label-sm text-text-secondary">Font ailesi</span>
                <input
                  value={activeTokens.typography.fontFamilySans}
                  onChange={(event) => updateDraft((tokens) => { tokens.typography.fontFamilySans = event.target.value; })}
                  className="mt-2 w-full rounded-radius-md border border-border-default bg-surface-panel px-3 py-2 text-body-sm text-text-primary outline-none focus:border-primary"
                />
              </label>

              <div className="grid gap-3 xl:grid-cols-2">
                {TYPOGRAPHY_KEYS.map((key) => (
                  <TypographyFieldset
                    key={key}
                    label={TYPOGRAPHY_LABELS[key]}
                    token={activeTokens.typography[key]}
                    onChange={(field, value) => updateDraft((tokens) => { tokens.typography[key][field] = value; })}
                  />
                ))}
              </div>
            </TokenSection>

            <TokenSection
              title="Radius"
              description="Arayüz elemanlarının köşe yuvarlama değerleri."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {RADIUS_KEYS.map((key) => (
                  key === 'full' ? (
                    <div key={key} className="block rounded-radius-md border border-border-default bg-surface-panel/60 p-3 sm:col-span-2">
                      <span className="flex items-center justify-between gap-2 text-label-sm text-text-muted">
                        <span>{RADIUS_LABELS[key].label}</span>
                        <span className="font-mono text-text-secondary">9999px</span>
                      </span>
                      <span className="mt-0.5 block text-body-xs text-text-muted">
                        {RADIUS_LABELS[key].description}
                      </span>
                      <input
                        type="text"
                        value="9999px"
                        readOnly
                        className="mt-2 w-full rounded-radius-md border border-border-default bg-surface-subtle px-3 py-2 text-body-sm text-text-muted outline-none cursor-not-allowed"
                      />
                    </div>
                  ) : (
                    <SliderTokenField
                      key={key}
                      label={RADIUS_LABELS[key].label}
                      description={RADIUS_LABELS[key].description}
                      value={activeTokens.radii[key]}
                      min={0}
                      max={32}
                      step={1}
                      unit="px"
                      fallback={parseNumericToken(defaultThemeForMode(activeMode).radii[key], 8)}
                      onChange={(value) => updateDraft((tokens) => { tokens.radii[key] = value; })}
                    />
                  )
                ))}
              </div>
            </TokenSection>

            <TokenSection
              title="Shadow ve Button"
              description="Gölge derinlikleri ve butonların görsel özellikleri."
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-heading-sm mb-3">Gölge Ayarları</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    {SHADOW_KEYS.map((key) => {
                      const shadowLabels: Record<ShadowKey, string> = {
                        dropSm: 'Küçük gölge',
                        dropMd: 'Orta gölge',
                        dropLg: 'Büyük gölge',
                      };
                      return (
                        <ShadowField
                          key={key}
                          label={shadowLabels[key]}
                          value={activeTokens.shadows[key]}
                          onChange={(value) => updateDraft((tokens) => { tokens.shadows[key] = value; })}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-border-default pt-6">
                  <h3 className="text-heading-sm mb-3">Buton Ayarları</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {BUTTON_KEYS.map((key) => (
                      <SliderTokenField
                        key={key}
                        label={key === 'radius' ? 'Buton köşesi' : 'Buton yüksekliği'}
                        description={key === 'radius' ? 'Birincil/ikincil butonların köşe değeri.' : 'Standart buton yüksekliği.'}
                        value={activeTokens.buttons[key]}
                        min={key === 'radius' ? 0 : 28}
                        max={key === 'radius' ? 20 : 56}
                        step={1}
                        unit="px"
                        fallback={parseNumericToken(defaultThemeForMode(activeMode).buttons[key], key === 'radius' ? 8 : 36)}
                        onChange={(value) => updateDraft((tokens) => { tokens.buttons[key] = value; })}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </TokenSection>
          </section>

          <ThemePreview tokens={activeTokens} mode={activeMode} />
        </div>
      </div>
    </main>
  );
}

function TokenSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-radius-xl border border-border-default bg-surface-panel p-5 shadow-drop-sm">
      <div className="mb-4">
        <h2 className="text-nav-label">{title}</h2>
        <p className="text-body-sm text-text-secondary">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const pickerValue = value.startsWith('#') ? value : '#000000';
  return (
    <label className="rounded-radius-lg border border-border-default bg-surface-subtle p-3">
      <span className="text-label-sm text-text-secondary">{label}</span>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="color"
          value={pickerValue}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-10 cursor-pointer rounded-radius-md border border-border-default bg-transparent p-0"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 rounded-radius-md border border-border-default bg-surface-panel px-3 py-2 font-mono text-body-sm text-text-primary outline-none focus:border-primary"
        />
      </div>
    </label>
  );
}

function TypographyFieldset({
  label,
  token,
  onChange,
}: {
  label: string;
  token: UITypographyToken;
  onChange: (field: TypographyField, value: string) => void;
}) {
  const currentSizePx = Object.entries(FONT_SIZES_MAP).find(
    ([_, val]) => val === token.fontSize
  )?.[0] || '14px';

  return (
    <fieldset className="rounded-radius-lg border border-border-default bg-surface-subtle p-3">
      <legend className="px-1 text-label-sm text-text-secondary">{label}</legend>
      <div className="grid grid-cols-4 gap-2">
        <label className="block">
          <span className="text-label-sm text-text-muted block truncate">Boyut</span>
          <select
            value={currentSizePx}
            onChange={(event) => onChange('fontSize', FONT_SIZES_MAP[event.target.value as keyof typeof FONT_SIZES_MAP])}
            className="mt-1 w-full rounded-radius-md border border-border-default bg-surface-panel px-1.5 py-1.5 text-body-sm text-text-primary outline-none focus:border-primary"
          >
            {Object.keys(FONT_SIZES_MAP).map((px) => <option key={px} value={px}>{px}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-label-sm text-text-muted block truncate">Ağırlık</span>
          <select
            value={token.fontWeight}
            onChange={(event) => onChange('fontWeight', event.target.value)}
            className="mt-1 w-full rounded-radius-md border border-border-default bg-surface-panel px-1.5 py-1.5 text-body-sm text-text-primary outline-none focus:border-primary"
          >
            {FONT_WEIGHTS.map((weight) => <option key={weight}>{weight}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-label-sm text-text-muted block truncate">S. Yükseklik</span>
          <select
            value={token.lineHeight}
            onChange={(event) => onChange('lineHeight', event.target.value)}
            className="mt-1 w-full rounded-radius-md border border-border-default bg-surface-panel px-1.5 py-1.5 text-body-sm text-text-primary outline-none focus:border-primary"
          >
            {LINE_HEIGHTS.map((lh) => <option key={lh} value={lh}>{lh}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-label-sm text-text-muted block truncate">H. Aralığı</span>
          <select
            value={token.letterSpacing}
            onChange={(event) => onChange('letterSpacing', event.target.value)}
            className="mt-1 w-full rounded-radius-md border border-border-default bg-surface-panel px-1.5 py-1.5 text-body-sm text-text-primary outline-none focus:border-primary"
          >
            {LETTER_SPACINGS.map((ls) => <option key={ls} value={ls}>{ls}</option>)}
          </select>
        </label>
      </div>
    </fieldset>
  );
}

function TextTokenField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return <MiniInput label={label} description={description} value={value} onChange={onChange} mono />;
}

interface ParsedShadow {
  offset: number;
  blur: number;
  spread: number;
  opacity: number;
}

function parseShadow(shadowStr: string): ParsedShadow {
  const fallback: ParsedShadow = { offset: 0, blur: 4, spread: 0, opacity: 10 };
  if (!shadowStr) return fallback;

  // Find rgba(...) or rgb(...) in the entire string first to avoid split problems
  let colorPart = '';
  const rgbMatch = shadowStr.match(/(rgba?|hsla?)\([^)]+\)/);
  if (rgbMatch) {
    colorPart = rgbMatch[0];
  } else {
    const hexMatch = shadowStr.match(/#[0-9a-fA-F]+/);
    if (hexMatch) {
      colorPart = hexMatch[0];
    }
  }

  let rest = shadowStr;
  if (colorPart) {
    rest = shadowStr.replace(colorPart, '').trim();
  }

  const numbers = rest.match(/(-?\d+(\.\d+)?)(px|em|rem)?/g);
  if (!numbers || numbers.length < 2) return fallback;

  // CSS box-shadow: offset-x offset-y blur spread — her zaman pozisyonel oku
  const offset = parseFloat(numbers[1]);          // Y (X ile eşit yazıyoruz)
  const blur   = numbers[2] ? parseFloat(numbers[2]) : 0;
  const spread = numbers[3] ? parseFloat(numbers[3]) : 0;

  let opacity = 10;
  if (colorPart) {
    const slashMatch = colorPart.match(/\/[-.\d]+/);
    const commaMatch = colorPart.match(/,\s*([-.\d]+)\s*\)/);
    if (slashMatch) {
      const val = parseFloat(slashMatch[0].replace('/', '').trim());
      if (!isNaN(val)) opacity = Math.round(val * 100);
    } else if (commaMatch) {
      const val = parseFloat(commaMatch[1]);
      if (!isNaN(val)) opacity = Math.round(val * 100);
    }
  }

  return {
    offset: isNaN(offset) ? 0 : offset,
    blur: isNaN(blur) ? 0 : blur,
    spread: isNaN(spread) ? 0 : spread,
    opacity: isNaN(opacity) ? 10 : opacity,
  };
}

function stringifyShadow(parsed: ParsedShadow): string {
  const { offset, blur, spread, opacity } = parsed;
  return `${offset}px ${offset}px ${blur}px ${spread}px rgba(0,0,0,${opacity / 100})`;
}

function ShadowField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const parsed = useMemo(() => parseShadow(value), [value]);

  function handleChange(field: keyof ParsedShadow, numValue: number) {
    const next = { ...parsed, [field]: numValue };
    onChange(stringifyShadow(next));
  }

  return (
    <fieldset className="rounded-radius-lg border border-border-default bg-surface-subtle p-3">
      <legend className="px-1 text-label-sm text-text-secondary font-medium">{label}</legend>
      <div className="mt-2 space-y-3">
        <div>
          <div className="flex justify-between text-body-xs text-text-muted">
            <span>X/Y offset</span>
            <span className="font-mono">{parsed.offset}px</span>
          </div>
          <input
            type="range"
            min={-20}
            max={20}
            step={1}
            value={parsed.offset}
            onChange={(e) => handleChange('offset', parseInt(e.target.value, 10))}
            className="mt-1 w-full accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between text-body-xs text-text-muted">
            <span>Blur</span>
            <span className="font-mono">{parsed.blur}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={40}
            step={1}
            value={parsed.blur}
            onChange={(e) => handleChange('blur', parseInt(e.target.value, 10))}
            className="mt-1 w-full accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between text-body-xs text-text-muted">
            <span>Spread</span>
            <span className="font-mono">{parsed.spread}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            step={1}
            value={parsed.spread}
            onChange={(e) => handleChange('spread', parseInt(e.target.value, 10))}
            className="mt-1 w-full accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between text-body-xs text-text-muted">
            <span>Opaklık</span>
            <span className="font-mono">{parsed.opacity}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={parsed.opacity}
            onChange={(e) => handleChange('opacity', parseInt(e.target.value, 10))}
            className="mt-1 w-full accent-primary"
          />
        </div>
      </div>
    </fieldset>
  );
}

function SliderTokenField({
  label,
  description,
  value,
  min,
  max,
  step,
  unit,
  fallback,
  onChange,
}: {
  label: string;
  description?: string;
  value: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  fallback: number;
  onChange: (value: string) => void;
}) {
  const numericValue = Math.min(max, Math.max(min, parseNumericToken(value, fallback)));
  const fractionDigits = step < 0.01 ? 3 : step < 1 ? 4 : 0;

  function handleSliderChange(nextValue: string) {
    onChange(formatTokenValue(Number(nextValue), unit, fractionDigits));
  }

  return (
    <label className="block rounded-radius-md border border-border-default bg-surface-panel/60 p-2">
      <span className="flex items-center justify-between gap-2 text-label-sm text-text-muted">
        <span>{label}</span>
        <span className="font-mono text-text-secondary">{value}</span>
      </span>
      {description && <span className="mt-0.5 block text-body-xs text-text-muted">{description}</span>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={numericValue}
        onChange={(event) => handleSliderChange(event.target.value)}
        className="mt-2 w-full accent-primary"
      />
      <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-text-muted">
        <span>{formatTokenValue(min, unit, fractionDigits)}</span>
        <span>{formatTokenValue(max, unit, fractionDigits)}</span>
      </div>
    </label>
  );
}

function MiniInput({
  label,
  description,
  value,
  onChange,
  mono = false,
}: {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-label-sm text-text-muted">{label}</span>
      {description && <span className="mt-0.5 block text-body-xs text-text-muted">{description}</span>}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1 w-full rounded-radius-md border border-border-default bg-surface-panel px-2 py-2 text-body-sm text-text-primary outline-none focus:border-primary ${mono ? 'font-mono' : ''}`}
      />
    </label>
  );
}

function ThemePreview({ tokens, mode }: { tokens: UIThemeTokens; mode: ThemeMode }) {
  const swatches = useMemo(() => COLOR_KEYS.slice(0, 8), []);
  return (
    <aside className="sticky top-6 h-fit rounded-radius-xl border border-border-default bg-surface-panel p-5 shadow-drop-lg">
      <p className="text-label-sm uppercase tracking-[0.14em] text-text-muted">Canlı önizleme</p>
      <h2 className="mt-1 text-nav-label">{mode === 'light' ? 'Light' : 'Dark'} tema</h2>
      <p className="mt-1 text-body-sm text-text-secondary">
        Bu kart aktif tokenları kullanır; değişiklikler anında DOM’a uygulanır.
      </p>

      <div className="mt-4 rounded-radius-lg border border-border-default bg-surface-subtle p-4">
        <h3 className="text-heading-md">Katalog ayarları</h3>
        <p className="mt-1 text-body-sm text-text-secondary">Panel, metin, border, radius ve shadow örnekleri.</p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {swatches.map((key) => (
            <div key={key} title={key} className="h-10 rounded-radius-md border border-border-default" style={{ backgroundColor: tokens.colors[key] }} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="bg-primary text-white hover:bg-primary-hover" style={{ borderRadius: tokens.buttons.radius, height: tokens.buttons.height, paddingInline: 16 }}>
            Birincil aksiyon
          </button>
          <button className="border border-border-default bg-surface-panel px-4 text-text-secondary" style={{ borderRadius: tokens.buttons.radius, height: tokens.buttons.height }}>
            İkincil
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3 rounded-radius-lg border border-border-default bg-surface-panel p-4 shadow-drop-sm">
        <p className="text-heading-sm mb-2">Tipografi ölçeği</p>
        <div className="space-y-2 divide-y divide-border-default">
          <div className="pt-2"><span className="text-body-xs text-text-muted block mb-1">text-heading-xl:</span><p className="text-heading-xl">Modal Başlığı</p></div>
          <div className="pt-2"><span className="text-body-xs text-text-muted block mb-1">text-nav-label:</span><p className="text-nav-label">Panel Bölüm Başlığı</p></div>
          <div className="pt-2"><span className="text-body-xs text-text-muted block mb-1">text-heading-md:</span><p className="text-heading-md">Akordiyon Başlığı</p></div>
          <div className="pt-2"><span className="text-body-xs text-text-muted block mb-1">text-heading-sm:</span><p className="text-heading-sm">Form Grup Başlığı</p></div>
          <div className="pt-2"><span className="text-body-xs text-text-muted block mb-1">text-body-md:</span><p className="text-body-md">İçerik Metni</p></div>
          <div className="pt-2"><span className="text-body-xs text-text-muted block mb-1">text-body-sm:</span><p className="text-body-sm">Açıklama Metni</p></div>
          <div className="pt-2"><span className="text-body-xs text-text-muted block mb-1">text-body-xs:</span><p className="text-body-xs">Alt Etiket</p></div>
          <div className="pt-2"><span className="text-body-xs text-text-muted block mb-1">text-label-md:</span><p className="text-label-md">Form Etiketi</p></div>
          <div className="pt-2"><span className="text-body-xs text-text-muted block mb-1">text-label-sm:</span><p className="text-label-sm">Sekme Etiketi</p></div>
          <div className="pt-2"><span className="text-body-xs text-text-muted block mb-1">text-icon-label:</span><p className="text-icon-label">İkon Etiketi</p></div>
        </div>
      </div>

      <div className="mt-4 rounded-radius-lg border border-border-default bg-surface-panel p-4 shadow-drop-md">
        <p className="text-heading-sm">Gölge örneği</p>
        <p className="mt-1 text-body-sm text-text-secondary">Shadow tokenlarının genel kart etkisi.</p>
      </div>
    </aside>
  );
}