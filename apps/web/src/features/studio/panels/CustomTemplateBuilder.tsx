// Kullanıcı özel BrochureTemplate üretir, localStorage'a kaydeder.
// Şablon panelinde "Yeni Şablon" altında çağrılır.

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { BrochureTemplate, FoldType, PageTemplateConfig } from '@matbaapro/shared';
import { useCatalogStore } from '@/stores/studio';
import { listCustomTemplates, saveCustomTemplate } from './customTemplates';

const FOLD_TYPES: { value: FoldType; label: string }[] = [
  { value: 'none', label: 'Kırımsız' },
  { value: 'half-fold', label: 'Yarım Kırım' },
  { value: 'z-fold', label: 'Z Kırım' },
  { value: 'roll-fold', label: 'İçeri Kırım (Roll)' },
];

interface BuilderState {
  name: string;
  pageCount: number;
  foldType: FoldType;
  openHeightMm: number;
  pageWidthMm: number;
  bleedMm: number;
}

export function CustomTemplateBuilder({ onSaved }: { onSaved: () => void }) {
  const applyTemplate = useCatalogStore((s) => s.applyTemplate);

  const [s, setS] = useState<BuilderState>({
    name: '',
    pageCount: 4,
    foldType: 'half-fold',
    openHeightMm: 297,
    pageWidthMm: 210,
    bleedMm: 3,
  });

  const set = <K extends keyof BuilderState>(key: K, val: BuilderState[K]) =>
    setS((p) => ({ ...p, [key]: val }));

  const save = () => {
    if (!s.name.trim()) {
      toast.error('Şablon adı gerekli');
      return;
    }
    if (s.pageCount < 1 || s.pageCount > 16) {
      toast.error('Sayfa sayısı 1-16 arası olmalı');
      return;
    }

    const id = `custom-${Date.now().toString(36)}`;
    const pages: PageTemplateConfig[] = Array.from({ length: s.pageCount }, (_, i) => ({
      pageNumber: i + 1,
      widthMm: s.pageWidthMm,
      safeZone: [5, 5, 5, 5],
    }));

    const tpl: BrochureTemplate = {
      id,
      name: s.name.trim(),
      pageCount: s.pageCount,
      foldCount: Math.max(0, s.pageCount - 1),
      foldType: s.foldType,
      openWidthMm: s.pageWidthMm * s.pageCount,
      openHeightMm: s.openHeightMm,
      bleedMm: s.bleedMm,
      pages,
    };

    saveCustomTemplate(tpl);
    toast.success(`"${tpl.name}" kaydedildi`);
    applyTemplate(tpl);
    onSaved();
  };

  const customCount = listCustomTemplates().length;

  return (
    <div className="space-y-3 bg-surface-panel p-3 rounded border border-border-default shadow-drop-sm">
      <h4 className="text-[10px] font-black text-text-muted">YENİ ŞABLON</h4>

      <label className="block">
        <span className="text-[9px] font-bold text-text-muted">Şablon Adı</span>
        <input
          type="text"
          value={s.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Örn: A4 8 Sayfa Z-Fold"
          className="w-full mt-1 text-xs border border-border-default rounded p-1.5 focus:border-border-strong outline-none"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label>
          <span className="text-[9px] font-bold text-text-muted">Sayfa Sayısı</span>
          <input
            type="number"
            min={1}
            max={16}
            value={s.pageCount}
            onChange={(e) => set('pageCount', parseInt(e.target.value) || 1)}
            className="w-full mt-1 text-xs border border-border-default rounded p-1.5"
          />
        </label>
        <label>
          <span className="text-[9px] font-bold text-text-muted">Kırım Tipi</span>
          <select
            value={s.foldType}
            onChange={(e) => set('foldType', e.target.value as FoldType)}
            className="w-full mt-1 text-xs border border-border-default rounded p-1.5"
          >
            {FOLD_TYPES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <label>
          <span className="text-[9px] font-bold text-text-muted">Sayfa Genişlik mm</span>
          <input
            type="number"
            min={50}
            max={500}
            value={s.pageWidthMm}
            onChange={(e) => set('pageWidthMm', parseFloat(e.target.value) || 210)}
            className="w-full mt-1 text-xs border border-border-default rounded p-1.5"
          />
        </label>
        <label>
          <span className="text-[9px] font-bold text-text-muted">Yükseklik mm</span>
          <input
            type="number"
            min={50}
            max={500}
            value={s.openHeightMm}
            onChange={(e) => set('openHeightMm', parseFloat(e.target.value) || 297)}
            className="w-full mt-1 text-xs border border-border-default rounded p-1.5"
          />
        </label>
        <label>
          <span className="text-[9px] font-bold text-text-muted">Bleed mm</span>
          <input
            type="number"
            min={0}
            max={10}
            step={0.5}
            value={s.bleedMm}
            onChange={(e) => set('bleedMm', parseFloat(e.target.value) || 3)}
            className="w-full mt-1 text-xs border border-border-default rounded p-1.5"
          />
        </label>
      </div>

      <div className="text-[10px] text-text-muted bg-surface-subtle p-2 rounded">
        Açık ölçü: <strong>{s.pageWidthMm * s.pageCount}×{s.openHeightMm}mm</strong>
        {' · '}
        Bleed dahil: <strong>{s.pageWidthMm * s.pageCount + s.bleedMm * 2}×
        {s.openHeightMm + s.bleedMm * 2}mm</strong>
      </div>

      <button
        onClick={save}
        className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded shadow-drop-sm"
      >
        Şablonu Kaydet ve Uygula
      </button>

      {customCount > 0 && (
        <p className="text-[9px] text-text-muted text-center">
          {customCount} özel şablon kayıtlı
        </p>
      )}
    </div>
  );
}
