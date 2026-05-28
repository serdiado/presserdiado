import { useState } from 'react';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import { getTerm } from '@matbaapro/shared';
import { GlobalGridSettings } from '../panels/GlobalGridSettings';
import { CellPanel } from '../panels/CellPanel';
import { BackgroundSettings } from '../panels/BackgroundSettings';
import { ProductManagement } from '../panels/ProductManagement';
import { LayoutTemplate, Grid3X3, Layers, ChevronDown, Bookmark, Table2, Frame, PanelBottom } from 'lucide-react';

type NewPanel = 'products' | 'design' | 'grid' | 'modules' | 'cell' | 'price' | 'template';

const NEW_TABS: { key: NewPanel; label: string; icon: React.ReactNode }[] = [
  {
    key: 'products',
    label: 'Ürünler',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    )
  },
  {
    key: 'design',
    label: 'Tasarım',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
      </svg>
    )
  },
  {
    key: 'grid',
    label: 'Hücre',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="3" y1="15" x2="21" y2="15"></line>
        <line x1="9" y1="3" x2="9" y2="21"></line>
        <line x1="15" y1="3" x2="15" y2="21"></line>
      </svg>
    )
  },
  {
    key: 'modules',
    label: 'Modüller',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="8" height="8" rx="1"></rect>
        <rect x="13" y="3" width="8" height="8" rx="1"></rect>
        <rect x="3" y="13" width="8" height="8" rx="1"></rect>
        <path d="M13 13h8v8h-8z"></path>
      </svg>
    )
  },
];

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<NewPanel>('products');

  return (
    <div className="w-96 bg-surface-panel border-l border-border-default flex flex-col h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">

      {/* 4'LÜ MENÜ İSKELETİ */}
      <div className="grid grid-cols-4 shrink-0 bg-surface-subtle border-b border-border-default">
        {NEW_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex flex-col items-center justify-center py-2.5 gap-1 transition-all duration-200 ${
              activeTab === t.key
                ? 'text-text-primary bg-surface-panel border-b-2 border-b-primary shadow-[0_-1px_0_0_var(--color-border-default)]'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle border-b-2 border-b-transparent'
            }`}
          >
            {t.icon}
            <span className="text-nav-label">{t.label}</span>
          </button>
        ))}
      </div>

      {/* İÇERİK ALANI */}
      <div className="flex-1 overflow-auto p-5 bg-surface-panel">
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'design' && <DesignPanel />}
        {activeTab === 'grid' && <CellPanel />}
        {activeTab === 'modules' && <ModulesPanel />}
      </div>
    </div>
  );
}

function DesignPanel() {
  const [openSection, setOpenSection] = useState<string | null>('template');
  const activeTemplate = useCatalogStore((s) => s.activeTemplate);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="flex flex-col w-full h-full space-y-2">
      {/* ŞABLON */}
      <div className="flex flex-col border border-border-default rounded-radius-md overflow-hidden bg-surface-panel shadow-drop-sm">
        <button
          onClick={() => toggleSection('template')}
          className="flex items-center justify-between px-3 py-2.5 bg-surface-subtle hover:bg-surface-app transition-colors"
        >
          <div className={`flex items-center gap-2 transition-colors ${openSection === 'template' ? 'text-text-primary' : 'text-text-secondary'}`}>
            <LayoutTemplate size={18} />
            <span className="text-heading-md text-text-primary">Şablon</span>
          </div>
          <ChevronDown
            size={18}
            className={`transition-all duration-300 ${openSection === 'template' ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}
          />
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            openSection === 'template' ? 'max-h-125 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-3 py-3.5 flex flex-col gap-4 border-t border-border-default bg-surface-panel">
            {/* A) Şablon Seç Butonu */}
            <button
              onClick={() => useUIStore.getState().setSetupModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 border border-border-strong bg-surface-panel hover:bg-surface-subtle text-text-secondary text-body-md py-2.5 rounded-radius-lg transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
              Şablon Seç
            </button>

            {/* B) Şablon Bilgileri */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center py-1 text-sm border-b border-border-default last:border-0">
                <span className="text-label-md text-text-secondary">Tasarım Tipi</span>
                <span className="text-body-sm text-text-primary">{activeTemplate?.designType ? getTerm('print', activeTemplate.designType) : 'Seçilmedi'}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-sm border-b border-border-default last:border-0">
                <span className="text-label-md text-text-secondary">Mod</span>
                <span className="text-body-sm text-text-primary">{activeTemplate?.mode ? getTerm('print', activeTemplate.mode) : '-'}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-sm border-b border-border-default last:border-0">
                <span className="text-label-md text-text-secondary">Kağıt</span>
                <span className="text-body-sm text-text-primary">{activeTemplate?.paperSize ? getTerm('print', activeTemplate.paperSize) : '-'}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-sm border-b border-border-default last:border-0">
                <span className="text-label-md text-text-secondary">Katlama</span>
                <span className="text-body-sm text-text-primary">
                  {activeTemplate?.foldType ? getTerm('print', activeTemplate.foldType) : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 text-sm border-b border-border-default last:border-0">
                <span className="text-label-md text-text-secondary">Sayfa</span>
                <span className="text-body-sm text-text-primary">{activeTemplate?.pageCount || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-sm border-b border-border-default last:border-0">
                <span className="text-label-md text-text-secondary">Açık Ölçü</span>
                <span className="text-body-sm text-text-primary">
                  {activeTemplate ? `${activeTemplate.openWidthMm}×${activeTemplate.openHeightMm} mm` : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 text-sm border-b border-border-default last:border-0">
                <span className="text-label-md text-text-secondary">Kapalı Ölçü</span>
                <span className="text-body-sm text-text-primary">
                  {activeTemplate ? `${activeTemplate.openWidthMm / activeTemplate.pageCount}×${activeTemplate.openHeightMm} mm` : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IZGARA */}
      <div className="flex flex-col border border-border-default rounded-radius-md overflow-hidden bg-surface-panel shadow-drop-sm">
        <button
          onClick={() => toggleSection('grid')}
          className="flex items-center justify-between px-3 py-2.5 bg-surface-subtle hover:bg-surface-app transition-colors"
        >
          <div className={`flex items-center gap-2 transition-colors ${openSection === 'grid' ? 'text-text-primary' : 'text-text-secondary'}`}>
            <Grid3X3 size={18} />
            <span className="text-heading-md text-text-primary">Izgara</span>
          </div>
          <ChevronDown
            size={18}
            className={`transition-all duration-300 ${openSection === 'grid' ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}
          />
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            openSection === 'grid' ? 'max-h-275 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-3 py-3.5 border-t border-border-default bg-surface-panel">
            <GlobalGridSettings />
          </div>
        </div>
      </div>

      {/* ARKAPLAN */}
      <div className="flex flex-col border border-border-default rounded-radius-md overflow-hidden bg-surface-panel shadow-drop-sm">
        <button
          onClick={() => toggleSection('background')}
          className="flex items-center justify-between px-3 py-2.5 bg-surface-subtle hover:bg-surface-app transition-colors"
        >
          <div className={`flex items-center gap-2 transition-colors ${openSection === 'background' ? 'text-text-primary' : 'text-text-secondary'}`}>
            <Layers size={18} />
            <span className="text-heading-md text-text-primary">Arka plan</span>
          </div>
          <ChevronDown
            size={18}
            className={`transition-all duration-300 ${openSection === 'background' ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}
          />
        </button>
        <div
          className={`transition-all duration-300 ease-in-out ${
            openSection === 'background'
              ? 'max-h-300 opacity-100 overflow-y-auto'
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="px-3 py-3.5 border-t border-border-default bg-surface-panel">
            <BackgroundSettings />
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({
  icon,
  title,
  description,
  moduleType,
  draggable: isDraggable,
  className = '',
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  moduleType: string;
  draggable: boolean;
  className?: string;
}) {
  return (
    <div
      draggable={isDraggable}
      onDragStart={isDraggable ? (e) => e.dataTransfer.setData('newModuleType', moduleType) : undefined}
      className={`flex flex-col gap-2 p-3 border border-border-default rounded-radius-md bg-surface-subtle hover:bg-surface-app hover:border-border-strong transition-colors select-none ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${className}`}
    >
      <div className="flex items-center gap-2 text-text-primary">
        {icon}
        <span className="text-label-md">{title}</span>
      </div>
      <p className="text-[10px] text-text-muted leading-relaxed">{description}</p>
    </div>
  );
}

function ModulesPanel() {
  const [readyOpen, setReadyOpen] = useState(true);
  const [mineOpen, setMineOpen] = useState(false);

  return (
    <div className="flex flex-col w-full gap-2">
      {/* Hazır modüller */}
      <div className="flex flex-col border border-border-default rounded-radius-md overflow-hidden bg-surface-panel shadow-drop-sm">
        <button
          onClick={() => setReadyOpen((v) => !v)}
          className="flex items-center justify-between px-3 py-2.5 bg-surface-subtle hover:bg-surface-app transition-colors"
        >
          <div className={`flex items-center gap-2 transition-colors ${readyOpen ? 'text-text-primary' : 'text-text-secondary'}`}>
            <Layers size={18} />
            <span className="text-heading-md text-text-primary">Hazır Modüller</span>
          </div>
          <ChevronDown
            size={16}
            className={`transition-all duration-300 ${readyOpen ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}
          />
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            readyOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-3 py-3.5 border-t border-border-default bg-surface-panel flex flex-col gap-2">
            <ModuleCard
              icon={<Table2 size={16} />}
              title="Tablo Alanı"
              description="Izgara düzeninde ürün görselleri ve bilgiler içeren tablo modülü."
              moduleType="banner"
              draggable
            />
            <ModuleCard
              icon={<Frame size={16} />}
              title="Serbest Tasarım Alanı"
              description="Metin, görsel ve şekilleri özgürce konumlandırabileceğin kanvas alanı."
              moduleType="free-design"
              draggable
              className="opacity-40 pointer-events-none"
            />
            <ModuleCard
              icon={<PanelBottom size={16} />}
              title="Alt Bilgi Alanı"
              description="Hücreden bağımsız, sayfanın altında sabit kalan bilgi alanı."
              moduleType="footer-area"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* Modüllerim */}
      <div className="flex flex-col border border-border-default rounded-radius-md overflow-hidden bg-surface-panel shadow-drop-sm">
        <button
          onClick={() => setMineOpen((v) => !v)}
          className="flex items-center justify-between px-3 py-2.5 bg-surface-subtle hover:bg-surface-app transition-colors"
        >
          <div className={`flex items-center gap-2 transition-colors ${mineOpen ? 'text-text-primary' : 'text-text-secondary'}`}>
            <Bookmark size={18} />
            <span className="text-heading-md text-text-primary">Modüllerim</span>
          </div>
          <ChevronDown
            size={16}
            className={`transition-all duration-300 ${mineOpen ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}
          />
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            mineOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-3 py-3.5 border-t border-border-default bg-surface-panel flex flex-col gap-1">
            <p className="text-[10px] text-text-muted">Henüz kayıtlı modülün yok.</p>
            <p className="text-[10px] text-text-muted">Bir modül tasarlayıp kaydet butonuyla buraya ekleyebilirsin.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
