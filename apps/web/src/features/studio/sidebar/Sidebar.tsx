import { useState } from 'react';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import { getTerm } from '@matbaapro/shared';
import { GlobalGridSettings } from '../panels/GlobalGridSettings';
import { CellPanel } from '../panels/CellPanel';
import { BackgroundSettings } from '../panels/BackgroundSettings';
import { GlobalCellSettings } from '../panels/GlobalCellSettings';
import { GlobalPriceSettings } from '../panels/GlobalPriceSettings';
import { TemplateSettingsPanel } from '../panels/TemplateSettingsPanel';
import { ProductInfoSettings } from '../panels/ProductInfoSettings';
import { ProductManagement } from '../panels/ProductManagement';
import { BannerSettingsPanel, PizzaSettingsPanel } from '../modules';
import {
  USER_MODULES_EVENT,
  deleteUserModule,
  listUserModules,
  saveUserModule,
  type UserModule,
} from '../modules/userModules';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import type { AnyModuleData } from '../modules';
import { LayoutTemplate, Grid3X3, Layers, ChevronDown } from 'lucide-react';

type NewPanel = 'products' | 'design' | 'grid' | 'modules' | 'cell' | 'price' | 'product-info' | 'template';

const NEW_TABS: { key: NewPanel; label: string; icon: React.ReactNode }[] = [
  { 
    key: 'products', 
    label: 'ÜRÜNLER', 
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
    label: 'TASARIM', 
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
    label: 'HÜCRE', 
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
    label: 'MODÜLLER', 
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
    <div className="w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
      
      {/* 4'LÜ MENÜ İSKELETİ */}
      <div className="grid grid-cols-4 shrink-0 bg-slate-50 border-b border-slate-200">
        {NEW_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex flex-col items-center justify-center py-3.5 gap-1.5 transition-all duration-200 ${
              activeTab === t.key
                ? 'text-slate-900 bg-white border-b-2 border-b-blue-600 shadow-[0_-1px_0_0_#e2e8f0]'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border-b-2 border-b-transparent'
            }`}
          >
            {t.icon}
            <span className="text-[9px] font-extrabold tracking-widest">{t.label}</span>
          </button>
        ))}
      </div>

      {/* İÇERİK ALANI */}
      <div className="flex-1 overflow-auto p-5 bg-white">
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'design' && <DesignPanel />}
        {activeTab === 'grid' && <CellPanel />}
        {activeTab === 'modules' && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">🧩</div>
            <p className="text-xs font-medium">Modüller ve Bileşenler (Yapım Aşamasında)</p>
          </div>
        )}

        {/* --- ESKİ İŞLEVSEL KODLAR (Geçici Olarak Gizlendi) --- */}
        <div className="hidden">
          {activeTab === 'modules' && <ModulesPanel />}
          {activeTab === 'grid' && <GlobalGridSettings />}
          {activeTab === 'cell' && <GlobalCellSettings />}
          {activeTab === 'price' && <GlobalPriceSettings />}
          {activeTab === 'product-info' && <ProductInfoSettings />}
          {activeTab === 'template' && <TemplateSettingsPanel />}
        </div>
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
      <div className="flex flex-col border border-slate-200 rounded-md overflow-hidden bg-white">
        <button
          onClick={() => toggleSection('template')}
          className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className={`flex items-center gap-2 transition-colors ${openSection === 'template' ? 'text-slate-800' : 'text-slate-500'}`}>
            <LayoutTemplate size={18} />
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">ŞABLON</span>
          </div>
          <ChevronDown
            size={18}
            className={`transition-all duration-300 ${openSection === 'template' ? 'rotate-180 text-slate-800' : 'text-slate-500'}`}
          />
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            openSection === 'template' ? 'max-h-125 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-4 flex flex-col gap-4 border-t border-slate-200 bg-white">
            {/* A) Şablon Seç Butonu */}
            <button
              onClick={() => useUIStore.getState().setSetupModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium py-2.5 rounded-lg transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
              Şablon Seç
            </button>

            {/* B) Şablon Bilgileri */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center py-1 text-sm border-b border-slate-100 last:border-0">
                <span className="text-slate-500">Tasarım Tipi</span> 
                <span className="font-medium text-slate-800">{activeTemplate?.designType ? getTerm('print', activeTemplate.designType) : 'Seçilmedi'}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-sm border-b border-slate-100 last:border-0">
                <span className="text-slate-500">Mod</span> 
                <span className="font-medium text-slate-800">{activeTemplate?.mode ? getTerm('print', activeTemplate.mode) : '-'}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-sm border-b border-slate-100 last:border-0">
                <span className="text-slate-500">Kağıt</span> 
                <span className="font-medium text-slate-800">{activeTemplate?.paperSize ? getTerm('print', activeTemplate.paperSize) : '-'}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-sm border-b border-slate-100 last:border-0">
                <span className="text-slate-500">Katlama</span> 
                <span className="font-medium text-slate-800">
                  {activeTemplate?.foldType ? getTerm('print', activeTemplate.foldType) : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 text-sm border-b border-slate-100 last:border-0">
                <span className="text-slate-500">Sayfa</span> 
                <span className="font-medium text-slate-800">{activeTemplate?.pageCount || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-sm border-b border-slate-100 last:border-0">
                <span className="text-slate-500">Açık Ölçü</span> 
                <span className="font-medium text-slate-800">
                  {activeTemplate ? `${activeTemplate.openWidthMm}×${activeTemplate.openHeightMm} mm` : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 text-sm border-b border-slate-100 last:border-0">
                <span className="text-slate-500">Kapalı Ölçü</span> 
                <span className="font-medium text-slate-800">
                  {activeTemplate ? `${activeTemplate.openWidthMm / activeTemplate.pageCount}×${activeTemplate.openHeightMm} mm` : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IZGARA */}
      <div className="flex flex-col border border-slate-200 rounded-md overflow-hidden bg-white">
        <button
          onClick={() => toggleSection('grid')}
          className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className={`flex items-center gap-2 transition-colors ${openSection === 'grid' ? 'text-slate-800' : 'text-slate-500'}`}>
            <Grid3X3 size={18} />
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">IZGARA</span>
          </div>
          <ChevronDown
            size={18}
            className={`transition-all duration-300 ${openSection === 'grid' ? 'rotate-180 text-slate-800' : 'text-slate-500'}`}
          />
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            openSection === 'grid' ? 'max-h-275 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-4 border-t border-slate-200 bg-white">
            <GlobalGridSettings />
          </div>
        </div>
      </div>

      {/* ARKAPLAN */}
      <div className="flex flex-col border border-slate-200 rounded-md overflow-hidden bg-white">
        <button
          onClick={() => toggleSection('background')}
          className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className={`flex items-center gap-2 transition-colors ${openSection === 'background' ? 'text-slate-800' : 'text-slate-500'}`}>
            <Layers size={18} />
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">ARKAPLAN</span>
          </div>
          <ChevronDown
            size={18}
            className={`transition-all duration-300 ${openSection === 'background' ? 'rotate-180 text-slate-800' : 'text-slate-500'}`}
          />
        </button>
        <div
          className={`transition-all duration-300 ease-in-out ${
            openSection === 'background'
              ? 'max-h-300 opacity-100 overflow-y-auto'
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="p-4 border-t border-slate-200 bg-white">
            <BackgroundSettings />
          </div>
        </div>
      </div>
    </div>
  );
}

function ModulesPanel() {
  const selectedSlotIds = useUIStore((s) => s.selectedSlotIds);
  const getActivePages = useCatalogStore((s) => s.getActivePages);

  const slot =
    selectedSlotIds.length > 0
      ? getActivePages()
          .flatMap((p) => p.slots)
          .find((s) => s.id === selectedSlotIds[0])
      : null;
  const moduleType = (slot?.moduleData as { type?: string } | null)?.type;

  const onDragStart = (e: React.DragEvent, type: 'banner' | 'pizza') => {
    e.dataTransfer.setData('newModuleType', type);
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-slate-500 font-bold">
        Modülü serbest alana sürükleyin (boş hücreyi otomatik serbest alana çevirir).
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div
          draggable
          onDragStart={(e) => onDragStart(e, 'banner')}
          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded p-3 cursor-grab active:cursor-grabbing flex flex-col items-center"
        >
          <span className="text-2xl mb-1">📢</span>
          <span className="text-[10px] font-bold text-slate-700">Banner</span>
          <span className="text-[8px] text-slate-500">8×4 grid</span>
        </div>
        <div
          draggable
          onDragStart={(e) => onDragStart(e, 'pizza')}
          className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded p-3 cursor-grab active:cursor-grabbing flex flex-col items-center"
        >
          <span className="text-2xl mb-1">🍕</span>
          <span className="text-[10px] font-bold text-orange-700">Pizza</span>
          <span className="text-[8px] text-slate-500">menü tablosu</span>
        </div>
      </div>

      {moduleType === 'banner' && (
        <div className="pt-3 border-t border-slate-200">
          <h4 className="text-[10px] font-black text-slate-500 mb-2">
            BANNER AYARLARI (Seçili)
          </h4>
          <BannerSettingsPanel />
        </div>
      )}
      {moduleType === 'pizza' && (
        <div className="pt-3 border-t border-slate-200">
          <h4 className="text-[10px] font-black text-slate-500 mb-2">
            PIZZA AYARLARI (Seçili)
          </h4>
          <PizzaSettingsPanel />
        </div>
      )}

      {!!slot?.moduleData && (moduleType === 'banner' || moduleType === 'pizza') && (
        <SaveCurrentModule slotData={slot.moduleData as AnyModuleData} />
      )}

      <UserModulesList />
    </div>
  );
}

function SaveCurrentModule({ slotData }: { slotData: AnyModuleData }) {
  const handleSave = () => {
    const name = window.prompt('Modülü adlandır:', `${slotData.type} ${new Date().toLocaleDateString('tr-TR')}`);
    if (!name?.trim()) return;
    const saved = saveUserModule(name, slotData);
    toast.success(`"${saved.name}" kaydedildi`);
  };
  return (
    <div className="pt-3 border-t border-slate-200">
      <button
        onClick={handleSave}
        className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded border border-emerald-200"
      >
        💾 Bu Modülü Kaydet (Şablon Yap)
      </button>
    </div>
  );
}

function UserModulesList() {
  const [modules, setModules] = useState<UserModule[]>(listUserModules());

  useEffect(() => {
    const refresh = () => setModules(listUserModules());
    window.addEventListener(USER_MODULES_EVENT, refresh);
    return () => window.removeEventListener(USER_MODULES_EVENT, refresh);
  }, []);

  if (modules.length === 0) {
    return (
      <div className="pt-3 border-t border-slate-200">
        <h4 className="text-[10px] font-black text-slate-500 mb-2">
          KULLANICI MODÜLLERİ
        </h4>
        <p className="text-[10px] text-slate-400 italic">
          Henüz kayıtlı modül yok. Bir banner/pizza yerleştirip "Bu Modülü Kaydet" ile şablon yapabilirsin.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-3 border-t border-slate-200">
      <h4 className="text-[10px] font-black text-slate-500 mb-2">
        KULLANICI MODÜLLERİ ({modules.length})
      </h4>
      <div className="space-y-1.5">
        {modules.map((m) => (
          <div
            key={m.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('newUserModuleData', JSON.stringify(m.data));
            }}
            className="group flex items-center gap-2 px-2 py-1.5 bg-white hover:bg-slate-50 rounded border border-slate-200 cursor-grab active:cursor-grabbing"
          >
            <span className="text-base">{m.type === 'banner' ? '📢' : '🍕'}</span>
            <span className="flex-1 text-[10px] font-semibold text-slate-700 truncate">
              {m.name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`"${m.name}" silinecek.`)) deleteUserModule(m.id);
              }}
              className="text-[10px] text-red-600 opacity-0 group-hover:opacity-100"
              title="Sil"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

