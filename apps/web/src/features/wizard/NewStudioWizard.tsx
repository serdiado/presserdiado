// Stüdyo öncesi seçim sihirbazı — tamamen wizard.config.json'a göre render edilir.

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalogStore, useUIStore } from '@/stores/studio';
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

function SvgWrap({ children }: { children: React.ReactNode }) {
  return <svg viewBox="0 0 96 96" className="w-14 h-12" fill="none">{children}</svg>;
}

function ProductIcon({ id }: { id: string }) {
  if (id === 'brochure') {
    return (
      <SvgWrap>
        <polygon points="33.93,25.57 62.07,25.57 62.07,79.57 33.93,79.57" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
        <polygon points="10.00,16.43 33.93,25.57 33.93,79.57 10.00,70.43" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
        <polygon points="62.07,25.57 86.00,16.43 86.00,70.43 62.07,79.57" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
        <polygon points="38.15,29.89 57.85,29.89 57.85,48.25 38.15,48.25" fill="#d6d3d1" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round" />
        <line x1="38.15" y1="55.27" x2="57.85" y2="55.27" stroke="#1e293b" strokeWidth="1.3" strokeLinecap="round" opacity="1" />
        <line x1="38.15" y1="61.21" x2="53.63" y2="61.21" stroke="#1e293b" strokeWidth="1.3" strokeLinecap="round" opacity="1" />
        <line x1="38.15" y1="67.15" x2="57.85" y2="67.15" stroke="#1e293b" strokeWidth="1.3" strokeLinecap="round" opacity="1" />
        <line x1="38.15" y1="73.09" x2="51.38" y2="73.09" stroke="#1e293b" strokeWidth="1.3" strokeLinecap="round" opacity="1" />
        <line x1="15.98" y1="28.43" x2="30.58" y2="34.01" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />
        <line x1="15.98" y1="34.91" x2="27.23" y2="39.21" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />
        <line x1="15.98" y1="43.01" x2="30.58" y2="48.59" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />
        <line x1="15.98" y1="49.49" x2="28.66" y2="54.34" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />
        <line x1="15.98" y1="55.97" x2="30.58" y2="61.55" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />
        <line x1="15.98" y1="62.45" x2="25.79" y2="66.20" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />
        <line x1="65.42" y1="34.01" x2="80.02" y2="28.43" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />
        <line x1="65.42" y1="40.49" x2="76.91" y2="36.10" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />
        <line x1="65.42" y1="48.59" x2="80.02" y2="43.01" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />
        <line x1="65.42" y1="55.07" x2="75.23" y2="51.32" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />
        <line x1="65.42" y1="61.55" x2="80.02" y2="55.97" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />
        <line x1="65.42" y1="68.03" x2="72.84" y2="65.20" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />
      </SvgWrap>
    );
  }
  if (id === 'catalog') {
    return (
      <SvgWrap>
        <polygon points="11.50,78.22 48.00,67.77 48.00,69.57 11.50,80.02" fill="#ffffff" stroke="#1e293b" strokeWidth="1.1" strokeLinejoin="round" />
        <polygon points="11.50,78.22 48.00,67.77 48.00,71.37 11.50,81.82" fill="#ffffff" stroke="#1e293b" strokeWidth="1.1" strokeLinejoin="round" />
        <polygon points="11.50,78.22 48.00,67.77 48.00,73.17 11.50,83.63" fill="#ffffff" stroke="#1e293b" strokeWidth="1.1" strokeLinejoin="round" />
        <polygon points="48.00,67.77 84.50,78.22 84.50,80.02 48.00,69.57" fill="#ffffff" stroke="#1e293b" strokeWidth="1.1" strokeLinejoin="round" />
        <polygon points="48.00,67.77 84.50,78.22 84.50,81.82 48.00,71.37" fill="#ffffff" stroke="#1e293b" strokeWidth="1.1" strokeLinejoin="round" />
        <polygon points="48.00,67.77 84.50,78.22 84.50,83.63 48.00,73.17" fill="#ffffff" stroke="#1e293b" strokeWidth="1.1" strokeLinejoin="round" />
        <polygon points="10.00,28.22 48.00,17.77 48.00,67.77 10.00,78.22" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
        <polygon points="48.00,17.77 86.00,28.22 86.00,78.22 48.00,67.77" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
        <polygon points="15.70,31.66 43.44,24.03 43.44,38.03 15.70,45.66" fill="#d6d3d1" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round" />
        <line x1="15.70" y1="52.66" x2="43.44" y2="45.03" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" opacity="1" />
        <line x1="15.70" y1="58.66" x2="38.50" y2="52.39" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" opacity="1" />
        <line x1="15.70" y1="64.66" x2="43.44" y2="57.03" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" opacity="1" />
        <line x1="15.70" y1="70.66" x2="34.70" y2="65.43" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" opacity="1" />
        <polygon points="52.56,24.03 80.30,31.66 80.30,45.66 52.56,38.03" fill="#d6d3d1" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round" />
        <line x1="52.56" y1="45.03" x2="80.30" y2="52.66" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" opacity="1" />
        <line x1="52.56" y1="51.03" x2="75.36" y2="57.30" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" opacity="1" />
        <line x1="52.56" y1="57.03" x2="80.30" y2="64.66" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" opacity="1" />
        <line x1="52.56" y1="63.03" x2="71.56" y2="68.25" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" opacity="1" />
      </SvgWrap>
    );
  }
  if (id === 'label') {
    return (
      <SvgWrap>
        <path d="M33 14H63V19Q63 21.5 60.5 22H35.5Q33 21.5 33 19Z" fill="#d6d3d1" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M25 28Q25 22.5 31 22H65Q71 22.5 71 28V81Q71 86.5 65 87H31Q25 86.5 25 81Z" fill="#fff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M22 44Q48 41.5 74 44V70Q48 72.5 22 70Z" fill="#fff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />
      </SvgWrap>
    );
  }
  if (id === 'businesscard') {
    return (
      <SvgWrap>
        <g transform="rotate(20 22 64)"><rect x="17" y="30" width="62" height="36" rx="3" fill="#fff" stroke="#1e293b" strokeWidth="1.4" /></g>
        <g transform="rotate(10 22 64)"><rect x="17" y="30" width="62" height="36" rx="3" fill="#fff" stroke="#1e293b" strokeWidth="1.4" /></g>
        <rect x="17" y="30" width="62" height="36" rx="3" fill="#fff" stroke="#1e293b" strokeWidth="1.6" />
      </SvgWrap>
    );
  }
  return <div className="text-slate-700 text-xl font-semibold">＋</div>;
}

function PaperIcon({ id }: { id: string }) {
  const map: Record<string, { x: number; y: number; w: number; h: number; t: string; fs: number }> = {
    A3: { x: 21.13, y: 10, w: 53.74, h: 76, t: 'A3', fs: 22 },
    A4: { x: 25.43, y: 16.08, w: 45.14, h: 63.84, t: 'A4', fs: 21 },
    A5: { x: 29.73, y: 22.16, w: 36.54, h: 51.68, t: 'A5', fs: 20 },
    A6: { x: 34.03, y: 28.24, w: 27.94, h: 39.52, t: 'A6', fs: 18 },
  };
  const v = map[id] ?? map.A4;
  return (
    <svg viewBox="0 0 96 96" className="w-11 h-11" fill="none">
      <rect x={v.x} y={v.y} width={v.w} height={v.h} rx="1.5" fill="#fff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />
      <text x="48" y="48" textAnchor="middle" dominantBaseline="central" fontFamily="Inter, sans-serif" fontWeight="700" fontSize={v.fs} fill="#0f172a">{v.t}</text>
    </svg>
  );
}

function FoldIcon({ id }: { id: string }) {
  if (id === 'none') return <SvgWrap><polygon points="29.5,16 66.5,19.5 66.5,80 29.5,76.5" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></SvgWrap>;
  if (id === 'half-fold') return <SvgWrap><polygon points="10.00,13.69 48.00,28.31 48.00,82.31 10.00,67.69" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /><polygon points="48.00,28.31 86.00,13.69 86.00,67.69 48.00,82.31" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></SvgWrap>;
  if (id === 'roll-fold') return <SvgWrap><polygon points="10 15.4 34.8 26.6 34.8 80.6 10 69.4 10 15.4" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /><polygon points="34.8 26.6 61.2 26.6 61.2 80.6 34.8 80.6 34.8 26.6" fill="none" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /><polygon points="61.2 26.6 86 15.4 86 69.4 61.2 80.6 61.2 26.6" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></SvgWrap>;
  if (id === 'map-fold') return <SvgWrap><polygon points="10,16.47 35.33,25.53 35.33,79.53 10,70.47" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="35.33,25.53 60.67,16.47 60.67,70.47 35.33,79.53" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="60.67,16.47 86,25.53 86,79.53 60.67,70.47" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /></SvgWrap>;
  if (id === 'z-fold') return <SvgWrap><polygon points="10.00,16.47 35.33,25.53 35.33,79.53 10.00,70.47" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /><polygon points="35.33,25.53 60.67,16.47 60.67,70.47 35.33,79.53" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /><polygon points="60.67,16.47 86.00,25.53 86.00,79.53 60.67,70.47" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></SvgWrap>;
  if (id === 'triple-fold') return <SvgWrap><polygon points="10,24.40 29,17.60 29,71.60 10,78.40" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="29,17.60 48,24.40 48,78.40 29,71.60" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="48,24.40 67,17.60 67,71.60 48,78.40" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="67,17.60 86,24.40 86,78.40 67,71.60" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /></SvgWrap>;
  if (id === 'accordion-fold') return <SvgWrap><polygon points="10,24.40 29,17.60 29,71.60 10,78.40" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="29,17.60 48,24.40 48,78.40 29,71.60" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="48,24.40 67,17.60 67,71.60 48,78.40" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="67,17.60 86,24.40 86,78.40 67,71.60" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /></SvgWrap>;
  return <div className="text-slate-700 text-xl font-semibold">＋</div>;
}

function ModeIcon({ id }: { id: string }) {
  if (id === 'cell') {
    return (
      <svg viewBox="18 10 60 76" className="w-full h-full" fill="none">
        <rect x="22" y="14" width="50" height="68" rx="2.5" fill="#fff" stroke="#1e293b" strokeWidth="1.6" />
        <line x1="48" y1="14" x2="48" y2="82" stroke="#1e293b" strokeWidth="1.2" />
        <line x1="22" y1="38" x2="72" y2="38" stroke="#1e293b" strokeWidth="1.2" />
        <line x1="22" y1="58" x2="72" y2="58" stroke="#1e293b" strokeWidth="1.2" />
        <rect x="27" y="43" width="16" height="10" rx="1" fill="#d6d3d1" />
        <rect x="53" y="43" width="14" height="10" rx="1" fill="#d6d3d1" />
        <rect x="27" y="63" width="10" height="10" rx="1" fill="#d6d3d1" />
        <rect x="53" y="63" width="14" height="10" rx="1" fill="#d6d3d1" />
      </svg>
    );
  }
  return (
    <svg viewBox="18 10 60 76" className="w-full h-full" fill="none">
      <rect x="22" y="14" width="50" height="68" rx="2.5" fill="#fff" stroke="#1e293b" strokeWidth="1.6" />
      <rect x="28" y="22" width="20" height="26" rx="1.5" fill="#d6d3d1" stroke="#1e293b" strokeWidth="1.3" />
      <circle cx="60" cy="33" r="9" fill="#fff" stroke="#1e293b" strokeWidth="1.3" />
      <rect x="28" y="58" width="36" height="6" rx="1" fill="#d6d3d1" opacity="0.6" />
      <rect x="28" y="68" width="26" height="6" rx="1" fill="#d6d3d1" opacity="0.4" />
    </svg>
  );
}

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
      className={`relative w-full h-full text-left p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-slate-900 bg-slate-50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">
          ✓
        </div>
      )}
      {children}
    </button>
  );
}

function Step({ label, cols, children }: { label: string; cols: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-slate-100 px-6 py-5">
      <h2 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">{label}</h2>
      <div className={`grid gap-3 ${cols}`}>{children}</div>
    </section>
  );
}

const compactBody = (o: BaseOption, section: 'category' | 'paperSize' | 'foldType') => (
  <div className="flex flex-col items-center text-center gap-1">
    <div className="flex items-center justify-center w-full min-h-13">
      {section === 'category' && <ProductIcon id={o.id} />}
      {section === 'paperSize' && <PaperIcon id={o.id} />}
      {section === 'foldType' && <FoldIcon id={o.id} />}
    </div>
    <div className="text-xs font-bold text-slate-800">{o.title}</div>
    {o.hint && <div className="text-[10px] text-slate-500 leading-tight">{o.hint}</div>}
  </div>
);

const modeBody = (o: ModeOption) => (
  <div className="flex items-center gap-4">
    <div className="w-20 h-20 shrink-0 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl p-2">
      <ModeIcon id={o.id} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-semibold text-slate-800 mb-1">{o.title}</div>
      {o.hint && <div className="text-xs text-slate-500 leading-snug mb-2">{o.hint}</div>}
      {o.features && (
        <div className="flex flex-wrap gap-1.5">
          {o.features.map((f) => (
            <span key={f} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{f}</span>
          ))}
        </div>
      )}
    </div>
  </div>
);

const paperBody = (o: PaperSizeOption) => (
  <div className="text-center">
    <div className="flex items-center justify-center mb-1"><PaperIcon id={o.id} /></div>
    <div className="text-sm font-semibold text-slate-900">{o.title}</div>
    {o.hint && <div className="text-xs text-slate-500">{o.hint}</div>}
  </div>
);

export default function NewStudioWizard() {
  const navigate = useNavigate();
  const applyTemplate = useCatalogStore((s) => s.applyTemplate);
  const isSetupModalOpen = useUIStore((s) => s.isSetupModalOpen);
  const setSetupModalOpen = useUIStore((s) => s.setSetupModalOpen);

  const activeTemplate = useCatalogStore((s) => s.activeTemplate);
  
  const [sel, setSel] = useState<WizardSelection>(() => {
    if (activeTemplate?.wizardSelection) {
      return activeTemplate.wizardSelection as unknown as WizardSelection;
    }
    if (activeTemplate) {
      // Robust fallback mapping of physical attributes to wizard step options
      const matchedPaper = config.steps.paperSize.options.find(
        (p) => p.heightMm === activeTemplate.openHeightMm
      );
      return {
        category: (activeTemplate.designType || config.steps.category.default) as any,
        mode: (activeTemplate.mode || config.steps.mode.default) as any,
        paperSize: (matchedPaper?.id || activeTemplate.paperSize || config.steps.paperSize.default) as any,
        foldType: (activeTemplate.foldType || config.steps.foldType.default) as any,
      };
    }
    return {
      category: config.steps.category.default,
      mode: config.steps.mode.default,
      paperSize: config.steps.paperSize.default,
      foldType: config.steps.foldType.default,
    };
  });
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [otherOpen, setOtherOpen] = useState(false);
  const [paperOtherOpen, setPaperOtherOpen] = useState(false);
  const [foldOtherOpen, setFoldOtherOpen] = useState(false);

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
    if (isSetupModalOpen) {
      setSetupModalOpen(false);
    } else {
      navigate('/studio');
    }
  };

  const handleNext = () => setActiveStep(2);
  const handleBack = () => setActiveStep(1);

  const handleCancel = () => {
    if (isSetupModalOpen) {
      setSetupModalOpen(false);
    } else {
      navigate('/dashboard');
    }
  };

  const openWidth = summary.paper && summary.fold ? summary.paper.widthMm * summary.fold.pageCount : 0;

  const title = activeStep === 1 ? 'Tasarım ayarlarını seçin' : 'Çalışma Biçimini Seçin';
  const subtitle =
    activeStep === 1
      ? 'Ürün türü, kağıt boyutu ve katlama şeklini belirleyin.'
      : 'Ürünleri hücrelere yerleştirerek mi, yoksa serbest düzende mi tasarlamak istediğinizi seçin.';

  return (
    <div className="min-h-screen w-full bg-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-230 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-base font-semibold text-slate-900">{title}</h1>
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span
              className={`px-3 py-1 rounded-full border ${
                activeStep === 1
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              1 · Baskı Ayarları
            </span>
            <span className="text-slate-300">·</span>
            <span
              className={`px-3 py-1 rounded-full border ${
                activeStep === 2
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-transparent text-slate-400 border-transparent'
              }`}
            >
              2 · Çalışma Biçimi
            </span>
          </div>
        </div>

        {activeStep === 1 && (
          <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
            <Step label="Ürün Türü" cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
              {config.steps.category.options
                .filter((o) => ['brochure', 'catalog', 'label', 'businesscard'].includes(o.id))
                .map((o) => (
                  <OptionCard
                    key={o.id}
                    selected={sel.category === o.id}
                    onClick={() => {
                      set('category', o.id);
                      setOtherOpen(false);
                    }}
                  >
                    {compactBody(o, 'category')}
                  </OptionCard>
                ))}

              <div className="relative">
                <OptionCard
                  selected={['other', 'flyer', 'invitation'].includes(sel.category)}
                  onClick={() => setOtherOpen((v) => !v)}
                >
                  <div className="flex flex-col items-center text-center gap-1">
                    <div className="flex items-center justify-center w-full min-h-13">
                      <div className="text-slate-700 text-2xl font-semibold">＋</div>
                    </div>
                    <div className="text-xs font-bold text-slate-800">Diğer</div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      {sel.category === 'flyer'
                        ? 'El İlanı'
                        : sel.category === 'invitation'
                          ? 'Davetiye'
                          : 'Ürün türü seçin'}
                    </div>
                  </div>
                </OptionCard>

                {otherOpen && (
                  <div className="absolute z-30 top-[calc(100%+6px)] left-0 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    {[{ id: 'flyer', title: 'El İlanı' }, { id: 'invitation', title: 'Davetiye' }].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          set('category', item.id);
                          setOtherOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Step>

            <Step label="Sayfa Boyutu" cols="grid-cols-2 sm:grid-cols-4 md:grid-cols-5">
              {config.steps.paperSize.options.map((o) => (
                <OptionCard
                  key={o.id}
                  selected={sel.paperSize === o.id}
                  onClick={() => {
                    set('paperSize', o.id);
                    setPaperOtherOpen(false);
                  }}
                >
                  {paperBody(o)}
                </OptionCard>
              ))}

              <div className="relative">
                <OptionCard
                  selected={['other'].includes(sel.paperSize)}
                  onClick={() => setPaperOtherOpen((v) => !v)}
                >
                  <div className="flex flex-col items-center text-center gap-1">
                    <div className="flex items-center justify-center w-full min-h-11 mb-1">
                      <div className="text-slate-700 text-2xl font-semibold">＋</div>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">Diğer</div>
                    <div className="text-xs text-slate-500 leading-tight">Boyut seçin</div>
                  </div>
                </OptionCard>

                {paperOtherOpen && (
                  <div className="absolute z-30 top-[calc(100%+6px)] left-0 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    {/* İleride diğer seçenekler eklenecek */}
                  </div>
                )}
              </div>
            </Step>

            <Step label="Katlama Şekli" cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
              {config.steps.foldType.options
                .filter((o: FoldTypeOption) => ['none', 'half-fold', 'roll-fold', 'z-fold'].includes(o.id))
                .map((o: FoldTypeOption) => (
                <OptionCard
                  key={o.id}
                  selected={sel.foldType === o.id}
                  onClick={() => {
                    set('foldType', o.id);
                    setFoldOtherOpen(false);
                  }}
                >
                  {compactBody(o, 'foldType')}
                </OptionCard>
              ))}

              <div className="relative">
                <OptionCard
                  selected={['triple-fold', 'accordion-fold', 'map-fold', 'other'].includes(sel.foldType)}
                  onClick={() => setFoldOtherOpen((v) => !v)}
                >
                  <div className="flex flex-col items-center text-center gap-1">
                    <div className="flex items-center justify-center w-full min-h-13">
                      <div className="text-slate-700 text-2xl font-semibold">＋</div>
                    </div>
                    <div className="text-xs font-bold text-slate-800">Diğer</div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      {sel.foldType === 'triple-fold'
                        ? 'Üç Kırım'
                        : sel.foldType === 'accordion-fold'
                          ? 'Akerdiyon'
                          : sel.foldType === 'map-fold'
                            ? 'Harita'
                            : 'Katlama seçin'}
                    </div>
                  </div>
                </OptionCard>

                {foldOtherOpen && (
                  <div className="absolute z-30 top-[calc(100%+6px)] left-0 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    {[
                      { id: 'triple-fold', title: 'Üç Kırım' },
                      { id: 'accordion-fold', title: 'Akerdiyon' },
                      { id: 'map-fold', title: 'Harita' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          set('foldType', item.id);
                          setFoldOtherOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Step>
          </div>
        )}

        {activeStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] border-t border-slate-100">
            <div className="p-6 border-r border-slate-100 flex flex-col">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                Çalışma Modu
              </h2>
              <div className="grid grid-cols-1 auto-rows-fr gap-3 flex-1">
                {config.steps.mode.options.map((o) => (
                  <OptionCard key={o.id} selected={sel.mode === o.id} onClick={() => set('mode', o.id)}>
                    {modeBody(o)}
                  </OptionCard>
                ))}
              </div>
            </div>

            <div className="p-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                Tasarım Özeti
              </h2>
              {summary.paper && summary.fold && (
                <section className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    Baskı Yapısı
                  </div>
                  <div className="px-3 py-2 text-xs flex items-center justify-between border-b border-slate-100">
                    <span className="text-slate-500">Ürün Türü</span>
                    <strong className="text-slate-900">{config.steps.category.options.find((c) => c.id === sel.category)?.title}</strong>
                  </div>
                  <div className="px-3 py-2 text-xs flex items-center justify-between border-b border-slate-100">
                    <span className="text-slate-500">Katlama</span>
                    <strong className="text-slate-900">{summary.fold.title}</strong>
                  </div>
                  <div className="px-3 py-2 text-xs flex items-center justify-between border-b border-slate-100">
                    <span className="text-slate-500">Kağıt Boyutu</span>
                    <strong className="text-slate-900">{summary.paper.title}</strong>
                  </div>
                  <div className="px-3 py-2 text-xs flex items-center justify-between border-b border-slate-100">
                    <span className="text-slate-500">Kapalı Ölçü</span>
                    <strong className="text-slate-900">
                      {summary.paper.widthMm} × {summary.paper.heightMm} mm
                    </strong>
                  </div>
                  <div className="px-3 py-2 text-xs flex items-center justify-between border-b border-slate-100">
                    <span className="text-slate-500">Açık Ölçü</span>
                    <strong className="text-slate-900">
                      {openWidth} × {summary.paper.heightMm} mm
                    </strong>
                  </div>
                  <div className="px-3 py-2 text-xs flex items-center justify-between">
                    <span className="text-slate-500">Sayfa Sayısı</span>
                    <strong className="text-slate-900">{summary.fold.pageCount} sayfa</strong>
                  </div>
                </section>
              )}
            </div>
          </div>
        )}

        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-white">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            İptal
          </button>
          <div className="flex items-center gap-2">
            {activeStep === 2 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                ← Geri
              </button>
            )}
            {activeStep === 1 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Devam Et →
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Tasarıma Başla →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
