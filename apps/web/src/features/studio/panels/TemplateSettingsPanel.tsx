import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { availableTemplates, type BrochureTemplate } from '@matbaapro/shared';
import { useCatalogStore } from '@/stores/studio';
import {
  deleteCustomTemplate,
  listCustomTemplates,
} from './customTemplates';
import { CustomTemplateBuilder } from './CustomTemplateBuilder';

export function TemplateSettingsPanel() {
  const activeTemplate = useCatalogStore((s) => s.activeTemplate);
  const applyTemplate = useCatalogStore((s) => s.applyTemplate);

  const [customs, setCustoms] = useState<BrochureTemplate[]>(listCustomTemplates());
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    const refresh = () => setCustoms(listCustomTemplates());
    window.addEventListener('matbaapro_custom_templates_updated', refresh);
    return () =>
      window.removeEventListener('matbaapro_custom_templates_updated', refresh);
  }, []);

  const handleSelect = (tpl: BrochureTemplate) => {
    if (tpl.id === activeTemplate.id) return;
    if (
      window.confirm(
        'DİKKAT: Şablon değişiminde mevcut yerleşim sıfırlanır. Onaylıyor musunuz?',
      )
    ) {
      applyTemplate(tpl);
    }
  };

  const handleDelete = (tpl: BrochureTemplate) => {
    if (
      !window.confirm(`"${tpl.name}" silinecek. Devam edilsin mi?`)
    )
      return;
    deleteCustomTemplate(tpl.id);
    toast.success('Şablon silindi');
  };

  const renderTpl = (tpl: BrochureTemplate, isCustom: boolean) => {
    const isActive = activeTemplate.id === tpl.id;
    return (
      <div key={tpl.id} className="relative group">
        <button
          onClick={() => handleSelect(tpl)}
          className={`w-full flex flex-col items-start p-3 rounded-md border ${
            isActive
              ? 'bg-slate-50 border-slate-900 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span
              className={`text-[11px] font-black ${
                isActive ? 'text-slate-900' : 'text-slate-700'
              }`}
            >
              {tpl.name}
              {isCustom && (
                <span className="ml-1.5 text-[8px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                  ÖZEL
                </span>
              )}
            </span>
            {isActive && <span className="w-3 h-3 bg-slate-900 rounded-full" />}
          </div>
          <span className="text-[9px] font-bold text-slate-500">
            {tpl.pageCount} Sayfa •{' '}
            {tpl.foldCount > 0 ? `${tpl.foldCount} Kırımlı` : 'Kırımsız'} •{' '}
            {tpl.openWidthMm}×{tpl.openHeightMm}mm
          </span>
        </button>
        {isCustom && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(tpl);
            }}
            className="absolute top-2 right-2 text-[10px] text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100"
            title="Sil"
          >
            ✕
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-slate-500 font-bold">
        Şablon seçin veya kendi şablonunuzu oluşturun:
      </p>

      <div className="space-y-2">
        {availableTemplates.map((t) => renderTpl(t, false))}
        {customs.map((t) => renderTpl(t, true))}
      </div>

      <button
        onClick={() => setShowBuilder((v) => !v)}
        className="w-full py-2 text-xs font-medium rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
      >
        {showBuilder ? '▲ Yeni Şablon Formunu Kapat' : '+ Yeni Özel Şablon'}
      </button>

      {showBuilder && (
        <CustomTemplateBuilder onSaved={() => setShowBuilder(false)} />
      )}

      <div className="bg-amber-50 border border-amber-200 p-2 rounded">
        <p className="text-[9px] font-bold text-amber-700 leading-tight">
          ⚠ Şablon değiştirildiğinde mevcut tasarım sıfırlanır.
        </p>
      </div>
    </div>
  );
}
