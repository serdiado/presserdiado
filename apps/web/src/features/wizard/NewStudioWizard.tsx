// Stüdyo öncesi seçim sihirbazı — tamamen wizard.config.json'a göre render edilir.

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalogStore } from '@/stores/studio';
import { buildTemplateFromWizard } from './buildTemplate';
import rawConfig from './wizard.config.json';
import type {
  BaseOption,
  FoldTypeOption,
  ModeOption,
  PaperSizeOption,
  WizardConfig,
  WizardSelection,
} from './wizard.types';

const config = rawConfig as unknown as WizardConfig;

function OptionCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative text-left p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-indigo-500 bg-indigo-50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm'
      }`}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center">
          ✓
        </div>
      )}
      {children}
    </button>
  );
}

function Step({
  number,
  label,
  cols,
  children,
}: {
  number: number;
  label: string;
  cols: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-sm font-bold text-slate-800 mb-3">
        {number}. {label}
      </h2>
      <div className={`grid gap-3 ${cols}`}>{children}</div>
    </section>
  );
}

const compactBody = (o: BaseOption) => (
  <div className="flex flex-col items-center text-center gap-1">
    {o.icon && <div className="text-2xl">{o.icon}</div>}
    <div className="text-xs font-bold text-slate-800">{o.title}</div>
    {o.hint && <div className="text-[10px] text-slate-500 leading-tight">{o.hint}</div>}
  </div>
);

const modeBody = (o: ModeOption) => (
  <div className="flex items-start gap-3">
    {o.icon && <div className="text-3xl text-emerald-600">{o.icon}</div>}
    <div className="flex-1">
      <div className="font-bold text-slate-800 mb-1">{o.title}</div>
      {o.hint && <div className="text-xs text-slate-600 leading-snug">{o.hint}</div>}
      {o.features && (
        <ul className="mt-2 space-y-0.5">
          {o.features.map((f) => (
            <li key={f} className="text-[11px] text-slate-600 flex items-center gap-1">
              <span className="text-emerald-500">✓</span> {f}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

const paperBody = (o: PaperSizeOption) => (
  <div className="text-center">
    <div className="text-2xl font-black text-slate-800">{o.title}</div>
    {o.hint && <div className="text-xs text-slate-500">{o.hint}</div>}
  </div>
);

export default function NewStudioWizard() {
  const navigate = useNavigate();
  const applyTemplate = useCatalogStore((s) => s.applyTemplate);

  const [sel, setSel] = useState<WizardSelection>(() => ({
    category: config.steps.category.default,
    mode: config.steps.mode.default,
    paperSize: config.steps.paperSize.default,
    foldType: config.steps.foldType.default,
  }));

  const set = <K extends keyof WizardSelection>(k: K, v: WizardSelection[K]) =>
    setSel((p) => ({ ...p, [k]: v }));

  const summary = useMemo(() => {
    const paper = config.steps.paperSize.options.find((p) => p.id === sel.paperSize);
    const fold = config.steps.foldType.options.find((f) => f.id === sel.foldType);
    const mode = config.steps.mode.options.find((m) => m.id === sel.mode);
    return { paper, fold, mode };
  }, [sel]);

  const handleConfirm = () => {
    const tpl = buildTemplateFromWizard(sel, config);
    applyTemplate(tpl);
    navigate('/studio');
  };

  const handleCancel = () => navigate('/dashboard');

  const openWidth = summary.paper && summary.fold ? summary.paper.widthMm * summary.fold.pageCount : 0;

  return (
    <div className="min-h-screen w-full bg-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xl">
              📐
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
              <p className="text-sm text-slate-500">{config.subtitle}</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
            title="Kapat"
          >
            ×
          </button>
        </div>

        <div className="px-8 py-6 space-y-8 max-h-[calc(100vh-220px)] overflow-y-auto">
          <Step
            number={1}
            label={config.steps.category.label}
            cols="grid-cols-2 sm:grid-cols-4 lg:grid-cols-7"
          >
            {config.steps.category.options.map((o) => (
              <OptionCard
                key={o.id}
                selected={sel.category === o.id}
                onClick={() => set('category', o.id)}
              >
                {compactBody(o)}
              </OptionCard>
            ))}
          </Step>

          <Step number={2} label={config.steps.mode.label} cols="grid-cols-1 md:grid-cols-2">
            {config.steps.mode.options.map((o) => (
              <OptionCard
                key={o.id}
                selected={sel.mode === o.id}
                onClick={() => set('mode', o.id)}
              >
                {modeBody(o)}
              </OptionCard>
            ))}
          </Step>

          <Step
            number={3}
            label={config.steps.paperSize.label}
            cols="grid-cols-2 sm:grid-cols-4"
          >
            {config.steps.paperSize.options.map((o) => (
              <OptionCard
                key={o.id}
                selected={sel.paperSize === o.id}
                onClick={() => set('paperSize', o.id)}
              >
                {paperBody(o)}
              </OptionCard>
            ))}
          </Step>

          <Step
            number={4}
            label={config.steps.foldType.label}
            cols="grid-cols-2 sm:grid-cols-4"
          >
            {config.steps.foldType.options.map((o: FoldTypeOption) => (
              <OptionCard
                key={o.id}
                selected={sel.foldType === o.id}
                onClick={() => set('foldType', o.id)}
              >
                {compactBody(o)}
              </OptionCard>
            ))}
          </Step>

          {summary.paper && summary.fold && (
            <section className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="text-3xl">📐</div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  <div className="font-bold text-slate-800 col-span-full mb-1">
                    {summary.fold.title} Özellikleri
                  </div>
                  <div className="text-slate-600">
                    <strong className="text-slate-800">{summary.fold.pageCount}</strong> sayfa{' '}
                    {summary.fold.pageCount > 1 ? '(katlamalı)' : ''}
                  </div>
                  <div className="text-slate-600">
                    Kapalı ölçü:{' '}
                    <strong className="text-slate-800">
                      {summary.paper.widthMm} × {summary.paper.heightMm} mm
                    </strong>
                  </div>
                  <div className="text-slate-600">
                    Açık ölçü:{' '}
                    <strong className="text-slate-800">
                      {openWidth} × {summary.paper.heightMm} mm
                    </strong>
                  </div>
                  <div className="text-slate-600">
                    Mod: <strong className="text-slate-800">{summary.mode?.title}</strong>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="px-8 py-4 border-t border-slate-200 flex items-center justify-between bg-white">
          <button
            onClick={handleCancel}
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            İptal
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md flex items-center gap-2"
          >
            Tasarım Stüdyosunu Aç →
          </button>
        </div>
      </div>
    </div>
  );
}
